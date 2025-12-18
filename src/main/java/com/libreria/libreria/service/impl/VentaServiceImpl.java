package com.libreria.libreria.service.impl;

import com.libreria.libreria.dto.DetalleVentaDTO;
import com.libreria.libreria.dto.VentaDTO;
import com.libreria.libreria.exception.StockInsuficienteException;
import com.libreria.libreria.model.*;
import com.libreria.libreria.model.enums.EstadoVenta;
import com.libreria.libreria.model.enums.NivelPrecio;
import com.libreria.libreria.model.enums.MetodoPago;
import com.libreria.libreria.model.enums.TipoAccion;
import com.libreria.libreria.repository.*;
import com.libreria.libreria.service.AuditLogService;
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
        private final AuditLogService auditLogService;

        @Autowired
        public VentaServiceImpl(VentaRepository ventaRepository,
                        ProductoRepository productoRepository,
                        ClienteRepository clienteRepository,
                        UsuarioRepository usuarioRepository,
                        SesionCajaRepository sesionCajaRepository,
                        AuditLogService auditLogService) {
                this.ventaRepository = ventaRepository;
                this.productoRepository = productoRepository;
                this.clienteRepository = clienteRepository;
                this.usuarioRepository = usuarioRepository;
                this.sesionCajaRepository = sesionCajaRepository;
                this.auditLogService = auditLogService;
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

                // Audit log
                try {
                        String detalles = String.format("Venta creada: ID %d, Cliente: %s, Monto: %s",
                                        savedVenta.getVentaId(), cliente.getNombreCompleto(), montoTotalCalculado);
                        auditLogService.logAccion(usuario.getUsuarioId(), TipoAccion.CREATE, "Venta",
                                        savedVenta.getVentaId(), detalles);
                } catch (Exception e) {
                        // Continue even if audit fails
                }

                return mapToDTO(savedVenta);
        }

        @Override
        public List<VentaDTO> listarVentas() {
                List<Venta> ventas = ventaRepository.findAll();
                return ventas.stream().map(this::mapToDTO).collect(Collectors.toList());
        }

        @Override
        public VentaDTO obtenerVentaPorId(Integer ventaId) {
                Venta venta = ventaRepository.findById(ventaId)
                                .orElseThrow(() -> new RuntimeException("Venta no encontrada ID: " + ventaId));
                return mapToDTO(venta);
        }

        @Override
        public List<VentaDTO> filtrarVentas(LocalDateTime fechaInicio, LocalDateTime fechaFin,
                        Integer clienteId, MetodoPago metodoPago, EstadoVenta estado) {
                List<Venta> ventas = ventaRepository.filtrarVentas(fechaInicio, fechaFin, clienteId, metodoPago,
                                estado);
                return ventas.stream().map(this::mapToDTO).collect(Collectors.toList());
        }

        @Override
        @Transactional
        public VentaDTO anularVenta(Integer ventaId, Integer usuarioId, String motivo) {
                // 1. Fetch Venta
                Venta venta = ventaRepository.findById(ventaId)
                                .orElseThrow(() -> new RuntimeException("Venta no encontrada ID: " + ventaId));

                // 2. Validate state
                if (venta.getEstado() == EstadoVenta.Anulada) {
                        throw new RuntimeException("La venta ya está anulada.");
                }

                // 3. Fetch Usuario
                Usuario usuarioAnulo = usuarioRepository.findById(usuarioId)
                                .orElseThrow(() -> new RuntimeException("Usuario no encontrado ID: " + usuarioId));

                // 4. Restore Stock
                for (DetalleVenta detalle : venta.getDetalles()) {
                        Producto producto = detalle.getProducto();
                        producto.setCantidadStock(producto.getCantidadStock() + detalle.getCantidad());
                        productoRepository.save(producto);
                }

                // 5. Update Venta
                venta.setEstado(EstadoVenta.Anulada);
                venta.setMotivoAnulacion(motivo);
                venta.setFechaAnulacion(LocalDateTime.now());
                venta.setUsuarioAnulo(usuarioAnulo);

                Venta ventaAnulada = ventaRepository.save(venta);

                // Audit log
                try {
                        String detalles = String.format("Venta anulada: ID %d, Motivo: %s", ventaId, motivo);
                        auditLogService.logAccion(usuarioId, TipoAccion.ANULAR_VENTA, "Venta", ventaId, detalles);
                } catch (Exception e) {
                        // Continue even if audit fails
                }

                return mapToDTO(ventaAnulada);
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
                                .motivoAnulacion(venta.getMotivoAnulacion())
                                .fechaAnulacion(venta.getFechaAnulacion())
                                .usuarioAnuloId(venta.getUsuarioAnulo() != null ? venta.getUsuarioAnulo().getUsuarioId()
                                                : null)
                                .detalles(detallesDTO)
                                .build();
        }

        @Override
        public com.libreria.libreria.dto.EstadisticasVentasDTO obtenerEstadisticas(LocalDateTime fechaInicio,
                        LocalDateTime fechaFin) {
                BigDecimal totalVentas = ventaRepository.calcularTotalVentas(fechaInicio, fechaFin);
                Long numeroTransacciones = ventaRepository.contarTransacciones(fechaInicio, fechaFin);

                BigDecimal ticketPromedio = BigDecimal.ZERO;
                if (numeroTransacciones > 0) {
                        ticketPromedio = totalVentas.divide(BigDecimal.valueOf(numeroTransacciones), 2,
                                        java.math.RoundingMode.HALF_UP);
                }

                // Calculate previous period for comparison
                long daysDiff = java.time.Duration.between(fechaInicio, fechaFin).toDays();
                LocalDateTime prevInicio = fechaInicio.minusDays(daysDiff);
                LocalDateTime prevFin = fechaInicio.minusSeconds(1);

                BigDecimal totalVentasPrev = ventaRepository.calcularTotalVentas(prevInicio, prevFin);
                BigDecimal comparacion = BigDecimal.ZERO;

                if (totalVentasPrev.compareTo(BigDecimal.ZERO) > 0) {
                        comparacion = totalVentas.subtract(totalVentasPrev)
                                        .divide(totalVentasPrev, 4, java.math.RoundingMode.HALF_UP)
                                        .multiply(BigDecimal.valueOf(100));
                }

                return com.libreria.libreria.dto.EstadisticasVentasDTO.builder()
                                .totalVentas(totalVentas)
                                .numeroTransacciones(numeroTransacciones.intValue())
                                .ticketPromedio(ticketPromedio)
                                .comparacionPeriodoAnterior(comparacion)
                                .build();
        }

        @Override
        public List<com.libreria.libreria.dto.ProductoMasVendidoDTO> obtenerProductosMasVendidos(
                        LocalDateTime fechaInicio, LocalDateTime fechaFin, Integer limite) {
                List<Object[]> resultados = ventaRepository.obtenerProductosMasVendidos(fechaInicio, fechaFin);

                return resultados.stream()
                                .limit(limite != null ? limite : 10)
                                .map(row -> com.libreria.libreria.dto.ProductoMasVendidoDTO.builder()
                                                .productoId((Integer) row[0])
                                                .nombreProducto((String) row[1])
                                                .cantidadVendida(((Long) row[2]).intValue())
                                                .montoTotal((BigDecimal) row[3])
                                                .build())
                                .collect(Collectors.toList());
        }

        @Override
        public List<com.libreria.libreria.dto.VentasPorMetodoDTO> obtenerVentasPorMetodo(LocalDateTime fechaInicio,
                        LocalDateTime fechaFin) {
                List<Object[]> resultados = ventaRepository.obtenerVentasPorMetodo(fechaInicio, fechaFin);

                return resultados.stream()
                                .map(row -> com.libreria.libreria.dto.VentasPorMetodoDTO.builder()
                                                .metodoPago((MetodoPago) row[0])
                                                .numeroVentas(((Long) row[1]).intValue())
                                                .montoTotal((BigDecimal) row[2])
                                                .build())
                                .collect(Collectors.toList());
        }
}
