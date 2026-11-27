package com.libreria.libreria.service.impl;

import com.libreria.libreria.dto.DetalleVentaDTO;
import com.libreria.libreria.dto.VentaDTO;
import com.libreria.libreria.exception.StockInsuficienteException;
import com.libreria.libreria.model.*;
import com.libreria.libreria.model.enums.EstadoSesion;
import com.libreria.libreria.model.enums.EstadoVenta;
import com.libreria.libreria.model.enums.MetodoPago;
import com.libreria.libreria.model.enums.NivelPrecio;
import com.libreria.libreria.repository.*;
import com.libreria.libreria.service.AuditLogService;
import com.libreria.libreria.service.FacturaPdfService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VentaServiceImplTest {

    @Mock private VentaRepository ventaRepository;
    @Mock private ProductoRepository productoRepository;
    @Mock private ClienteRepository clienteRepository;
    @Mock private UsuarioRepository usuarioRepository;
    @Mock private SesionCajaRepository sesionCajaRepository;
    @Mock private AuditLogService auditLogService;
    @Mock private FacturaPdfService facturaPdfService;

    @InjectMocks
    private VentaServiceImpl ventaService;

    private Cliente clientePublico;
    private Usuario vendedor;
    private SesionCaja sesionAbierta;
    private Producto producto;

    @BeforeEach
    void setUp() {
        clientePublico = Cliente.builder()
                .clienteId(1)
                .nombreCompleto("Consumidor Final")
                .nivelPrecioAsignado(NivelPrecio.Publico)
                .build();

        vendedor = Usuario.builder()
                .usuarioId(1)
                .nombreCompleto("Vendedor Prueba")
                .username("vendedor")
                .rol(Rol.builder().rolId(2).nombre("Vendedor").build())
                .build();

        sesionAbierta = SesionCaja.builder()
                .sesionId(10)
                .estado(EstadoSesion.Abierta)
                .usuarioApertura(vendedor)
                .montoInicial(new BigDecimal("100.00"))
                .build();

        producto = Producto.builder()
                .productoId(5)
                .nombre("Cuaderno 100 hojas")
                .precioVenta(new BigDecimal("25.00"))
                .precioMayorista(new BigDecimal("20.00"))
                .precioCosto(new BigDecimal("12.00"))
                .cantidadStock(10)
                .build();
    }

    @Test
    void crearVenta_exitosa_calculaTotalYDescuentaStock() {
        when(clienteRepository.findById(1)).thenReturn(Optional.of(clientePublico));
        when(usuarioRepository.findById(1)).thenReturn(Optional.of(vendedor));
        when(sesionCajaRepository.findById(10)).thenReturn(Optional.of(sesionAbierta));
        when(productoRepository.findByIdForUpdate(5)).thenReturn(Optional.of(producto));
        when(ventaRepository.save(any(Venta.class))).thenAnswer(inv -> {
            Venta v = inv.getArgument(0);
            v.setVentaId(99);
            return v;
        });

        VentaDTO request = VentaDTO.builder()
                .clienteId(1)
                .usuarioId(1)
                .sesionId(10)
                .metodoPago(MetodoPago.Efectivo)
                .detalles(List.of(DetalleVentaDTO.builder()
                        .productoId(5)
                        .cantidad(2)
                        .descuento(new BigDecimal("5.00"))
                        .build()))
                .build();

        VentaDTO result = ventaService.crearVenta(request);

        assertEquals(99, result.getVentaId());
        assertEquals(new BigDecimal("45.00"), result.getMontoTotal());
        assertEquals(8, producto.getCantidadStock());
        verify(productoRepository).findByIdForUpdate(5);
    }

    @Test
    void crearVenta_stockInsuficiente_lanzaExcepcion() {
        when(clienteRepository.findById(1)).thenReturn(Optional.of(clientePublico));
        when(usuarioRepository.findById(1)).thenReturn(Optional.of(vendedor));
        when(sesionCajaRepository.findById(10)).thenReturn(Optional.of(sesionAbierta));
        when(productoRepository.findByIdForUpdate(5)).thenReturn(Optional.of(producto));

        VentaDTO request = VentaDTO.builder()
                .clienteId(1)
                .usuarioId(1)
                .sesionId(10)
                .metodoPago(MetodoPago.Efectivo)
                .detalles(List.of(DetalleVentaDTO.builder().productoId(5).cantidad(20).build()))
                .build();

        assertThrows(StockInsuficienteException.class, () -> ventaService.crearVenta(request));
        assertEquals(10, producto.getCantidadStock());
    }

    @Test
    void crearVenta_descuentoMayorQueSubtotal_lanzaIllegalArgumentException() {
        when(clienteRepository.findById(1)).thenReturn(Optional.of(clientePublico));
        when(usuarioRepository.findById(1)).thenReturn(Optional.of(vendedor));
        when(sesionCajaRepository.findById(10)).thenReturn(Optional.of(sesionAbierta));
        when(productoRepository.findByIdForUpdate(5)).thenReturn(Optional.of(producto));

        VentaDTO request = VentaDTO.builder()
                .clienteId(1)
                .usuarioId(1)
                .sesionId(10)
                .metodoPago(MetodoPago.Efectivo)
                .detalles(List.of(DetalleVentaDTO.builder()
                        .productoId(5)
                        .cantidad(1)
                        .descuento(new BigDecimal("30.00"))
                        .build()))
                .build();

        assertThrows(IllegalArgumentException.class, () -> ventaService.crearVenta(request));
    }

    @Test
    void anularVenta_restauraStockYMarcaAnulada() {
        DetalleVenta detalle = DetalleVenta.builder()
                .detalleId(1)
                .producto(producto)
                .cantidad(3)
                .precioUnitario(new BigDecimal("25.00"))
                .descuento(BigDecimal.ZERO)
                .subtotal(new BigDecimal("75.00"))
                .build();

        Venta venta = Venta.builder()
                .ventaId(50)
                .cliente(clientePublico)
                .usuario(vendedor)
                .sesion(sesionAbierta)
                .estado(EstadoVenta.Completada)
                .metodoPago(MetodoPago.Efectivo)
                .montoTotal(new BigDecimal("75.00"))
                .detalles(new ArrayList<>(List.of(detalle)))
                .build();

        when(ventaRepository.findById(50)).thenReturn(Optional.of(venta));
        when(usuarioRepository.findById(1)).thenReturn(Optional.of(vendedor));
        when(productoRepository.findByIdForUpdate(5)).thenReturn(Optional.of(producto));
        when(ventaRepository.save(any(Venta.class))).thenAnswer(inv -> inv.getArgument(0));

        VentaDTO result = ventaService.anularVenta(50, 1, "Error de cobro");

        assertEquals(EstadoVenta.Anulada, result.getEstado());
        assertEquals(13, producto.getCantidadStock());
    }
}
