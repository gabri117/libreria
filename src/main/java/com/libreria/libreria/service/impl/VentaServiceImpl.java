package com.libreria.libreria.service.impl;

import com.libreria.libreria.dto.DetalleVentaDTO;
import com.libreria.libreria.dto.VentaDTO;
import com.libreria.libreria.exception.StockInsuficienteException;
import com.libreria.libreria.model.*;
import com.libreria.libreria.model.enums.EstadoVenta;
import com.libreria.libreria.model.enums.NivelPrecio;
import com.libreria.libreria.repository.*;
import com.libreria.libreria.service.VentaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class VentaServiceImpl implements VentaService {

        private final VentaRepository ventaRepository;
        private final ProductoRepository productoRepository;
        private final ClienteRepository clienteRepository;
        private final UsuarioRepository usuarioRepository;
        private final SesionCajaRepository sesionCajaRepository;

        @Autowired
        public VentaServiceImpl(VentaRepository ventaRepository,
                        ProductoRepository productoRepository,
                        ClienteRepository clienteRepository,
                        UsuarioRepository usuarioRepository,
                        SesionCajaRepository sesionCajaRepository) {
                this.ventaRepository = ventaRepository;
                this.productoRepository = productoRepository;
                this.clienteRepository = clienteRepository;
                this.usuarioRepository = usuarioRepository;
                this.sesionCajaRepository = sesionCajaRepository;
        }

        @Override
        @Transactional
        public VentaDTO crearVenta(VentaDTO ventaDTO) {
                // 1. Fetch Related Entities
                Cliente cliente = clienteRepository.findById(ventaDTO.getClienteId())
                                .orElseThrow(() -> new RuntimeException(
                                                "Cliente no encontrado ID: " + ventaDTO.getClienteId()));

                Usuario usuario = usuarioRepository.findById(ventaDTO.getUsuarioId())
                                .orElseThrow(() -> new RuntimeException(
                                                "Usuario no encontrado ID: " + ventaDTO.getUsuarioId()));

                SesionCaja sesion = sesionCajaRepository.findById(ventaDTO.getSesionId())
                                .orElseThrow(() -> new RuntimeException(
                                                "Sesion no encontrada ID: " + ventaDTO.getSesionId()));

                if (sesion.getEstado() != com.libreria.libreria.model.enums.EstadoSesion.Abierta) {
                        throw new RuntimeException("La sesión de caja no está abierta.");
                }

                // 2. Initialize Venta
                Venta venta = Venta.builder()
                                .cliente(cliente)
                                .usuario(usuario)
                                .sesion(sesion)
                                .fechaVenta(LocalDateTime.now())
                                .metodoPago(ventaDTO.getMetodoPago())
                                .estado(EstadoVenta.Completada)
                                .detalles(new ArrayList<>())
                                .build();

                // 3. Process Details
                BigDecimal montoTotalCalculado = BigDecimal.ZERO;

                for (DetalleVentaDTO detDTO : ventaDTO.getDetalles()) {
                        Producto producto = productoRepository.findById(detDTO.getProductoId())
                                        .orElseThrow(() -> new RuntimeException(
                                                        "Producto no encontrado ID: " + detDTO.getProductoId()));

                        // A. Validate Stock
                        if (producto.getCantidadStock() < detDTO.getCantidad()) {
                                throw new StockInsuficienteException(
                                                "Stock insuficiente para producto: " + producto.getNombre() +
                                                                ". Disponible: " + producto.getCantidadStock()
                                                                + ", Requerido: " + detDTO.getCantidad());
                        }

                        // B. Select Price based on Cliente Level
                        BigDecimal precioUnitario = determinarPrecio(producto, cliente.getNivelPrecioAsignado());

                        // C. Calculate Subtotal (Backend logic)
                        BigDecimal subtotal = precioUnitario.multiply(BigDecimal.valueOf(detDTO.getCantidad()));

                        // Apply Manual Discount if any (assuming logic allows passing discount,
                        // otherwise default 0)
                        BigDecimal descuento = detDTO.getDescuento() != null ? detDTO.getDescuento() : BigDecimal.ZERO;
                        subtotal = subtotal.subtract(descuento);

                        // D. Deduct Stock
                        producto.setCantidadStock(producto.getCantidadStock() - detDTO.getCantidad());
                        productoRepository.save(producto); // Update stock immediately or let transaction handle it

                        // E. Create Detalle Entity
                        DetalleVenta detalle = DetalleVenta.builder()
                                        .venta(venta)
                                        .producto(producto)
                                        .cantidad(detDTO.getCantidad())
                                        .precioUnitario(precioUnitario)
                                        .descuento(descuento)
                                        .subtotal(subtotal)
                                        .build();

                        venta.getDetalles().add(detalle);
                        montoTotalCalculado = montoTotalCalculado.add(subtotal);
                }

                // 4. Set Total and Save
                venta.setMontoTotal(montoTotalCalculado);
                Venta savedVenta = ventaRepository.save(venta);

                return mapToDTO(savedVenta);
        }

        private BigDecimal determinarPrecio(Producto producto, NivelPrecio nivelPrecio) {
                switch (nivelPrecio) {
                        case Mayorista:
                                return producto.getPrecioMayorista();
                        case Costo:
                                // Caution: Usually 'Costo' is internal, but if business allows selling at cost:
                                return producto.getPrecioCosto() != null ? producto.getPrecioCosto() : BigDecimal.ZERO;
                        case Publico:
                        default:
                                return producto.getPrecioVenta();
                }
        }

        private VentaDTO mapToDTO(Venta venta) {
                List<DetalleVentaDTO> detallesDTO = venta.getDetalles().stream()
                                .map(d -> DetalleVentaDTO.builder()
                                                .detalleId(d.getDetalleId())
                                                .productoId(d.getProducto().getProductoId())
                                                .productoNombre(d.getProducto().getNombre())
                                                .cantidad(d.getCantidad())
                                                .precioUnitario(d.getPrecioUnitario())
                                                .descuento(d.getDescuento())
                                                .subtotal(d.getSubtotal())
                                                .build())
                                .collect(Collectors.toList());

                return VentaDTO.builder()
                                .ventaId(venta.getVentaId())
                                .sesionId(venta.getSesion().getSesionId())
                                .usuarioId(venta.getUsuario().getUsuarioId())
                                .usuarioNombre(venta.getUsuario().getNombreCompleto())
                                .clienteId(venta.getCliente().getClienteId())
                                .clienteNombre(venta.getCliente().getNombreCompleto())
                                .fechaVenta(venta.getFechaVenta())
                                .montoTotal(venta.getMontoTotal())
                                .metodoPago(venta.getMetodoPago())
                                .estado(venta.getEstado())
                                .detalles(detallesDTO)
                                .build();
        }
}
