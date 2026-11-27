package com.libreria.libreria.service.impl;

import com.libreria.libreria.dto.CompraDTO;
import com.libreria.libreria.dto.DetalleCompraDTO;
import com.libreria.libreria.model.*;
import com.libreria.libreria.repository.CompraRepository;
import com.libreria.libreria.repository.ProductoRepository;
import com.libreria.libreria.repository.ProveedorRepository;
import com.libreria.libreria.repository.UsuarioRepository;
import com.libreria.libreria.service.AuditLogService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CompraServiceImplTest {

    @Mock private CompraRepository compraRepository;
    @Mock private ProveedorRepository proveedorRepository;
    @Mock private UsuarioRepository usuarioRepository;
    @Mock private ProductoRepository productoRepository;
    @Mock private AuditLogService auditLogService;

    @InjectMocks
    private CompraServiceImpl compraService;

    @Test
    void registrarCompra_incrementaStockYActualizaPrecioCosto() {
        Proveedor proveedor = Proveedor.builder().proveedorId(1).nombreEmpresa("Distribuidora Escolar").build();
        Usuario admin = Usuario.builder().usuarioId(1).nombreCompleto("Admin").username("admin").build();
        Producto producto = Producto.builder()
                .productoId(10)
                .nombre("Resma Papel Carta")
                .sku("PAP-001")
                .cantidadStock(5)
                .precioCosto(new BigDecimal("30.00"))
                .precioVenta(new BigDecimal("45.00"))
                .build();

        when(proveedorRepository.findById(1)).thenReturn(Optional.of(proveedor));
        when(usuarioRepository.findById(1)).thenReturn(Optional.of(admin));
        when(productoRepository.findByIdForUpdate(10)).thenReturn(Optional.of(producto));
        when(compraRepository.save(any(Compra.class))).thenAnswer(inv -> {
            Compra c = inv.getArgument(0);
            c.setCompraId(77);
            return c;
        });

        CompraDTO dto = CompraDTO.builder()
                .proveedorId(1)
                .numeroFacturaProveedor("FAC-2026-001")
                .detalles(List.of(DetalleCompraDTO.builder()
                        .productoId(10)
                        .cantidad(20)
                        .precioCostoCompra(new BigDecimal("32.50"))
                        .build()))
                .build();

        CompraDTO result = compraService.registrarCompra(dto, 1);

        assertEquals(77, result.getCompraId());
        assertEquals(new BigDecimal("650.00"), result.getTotalCompra());
        assertEquals(25, producto.getCantidadStock());
        assertEquals(new BigDecimal("32.50"), producto.getPrecioCosto());
        verify(productoRepository).findByIdForUpdate(10);
    }

    @Test
    void registrarCompra_sinDetalles_lanzaIllegalArgumentException() {
        CompraDTO dto = CompraDTO.builder().proveedorId(1).detalles(List.of()).build();
        assertThrows(IllegalArgumentException.class, () -> compraService.registrarCompra(dto, 1));
    }
}
