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
                List<Venta> ventas = ventaRepository.findAllByOrderByFechaVentaDesc();
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

        @Override
        public byte[] generarReportePdf(Integer ventaId) {
                Venta venta = ventaRepository.findById(ventaId)
                                .orElseThrow(() -> new RuntimeException("Venta no encontrada ID: " + ventaId));

                try (java.io.ByteArrayOutputStream out = new java.io.ByteArrayOutputStream()) {
                        com.lowagie.text.Document document = new com.lowagie.text.Document(
                                        com.lowagie.text.PageSize.A4);
                        com.lowagie.text.pdf.PdfWriter.getInstance(document, out);
                        document.open();

                        // Brand Colors
                        java.awt.Color brandColor = new java.awt.Color(14, 165, 233); // #0ea5e9
                        java.awt.Color lightGray = new java.awt.Color(241, 245, 249);

                        // Fonts
                        com.lowagie.text.Font fontTitle = com.lowagie.text.FontFactory
                                        .getFont(com.lowagie.text.FontFactory.HELVETICA_BOLD, 22, brandColor);
                        com.lowagie.text.Font fontSubTitle = com.lowagie.text.FontFactory.getFont(
                                        com.lowagie.text.FontFactory.HELVETICA_BOLD, 14, java.awt.Color.DARK_GRAY);
                        com.lowagie.text.Font fontHeader = com.lowagie.text.FontFactory
                                        .getFont(com.lowagie.text.FontFactory.HELVETICA_BOLD, 11, java.awt.Color.WHITE);
                        com.lowagie.text.Font fontNormal = com.lowagie.text.FontFactory
                                        .getFont(com.lowagie.text.FontFactory.HELVETICA, 10, java.awt.Color.BLACK);
                        com.lowagie.text.Font fontBold = com.lowagie.text.FontFactory
                                        .getFont(com.lowagie.text.FontFactory.HELVETICA_BOLD, 10, java.awt.Color.BLACK);

                        // Header Table (Logo and Invoice Info)
                        com.lowagie.text.pdf.PdfPTable headerTable = new com.lowagie.text.pdf.PdfPTable(2);
                        headerTable.setWidthPercentage(100);
                        headerTable.setSpacingAfter(20);

                        // Try to add Logo
                        try {
                                // Try absolute path resolution
                                String userDir = System.getProperty("user.dir");
                                // If running from root standard spring boot directory
                                java.nio.file.Path logoPath = java.nio.file.Paths.get(userDir, "frontend", "public",
                                                "logo.png");

                                if (!java.nio.file.Files.exists(logoPath)) {
                                        // Fallback for some IDE configs
                                        logoPath = java.nio.file.Paths.get(userDir, "src", "main", "resources",
                                                        "static", "logo.png");
                                }

                                if (java.nio.file.Files.exists(logoPath)) {
                                        com.lowagie.text.Image logo = com.lowagie.text.Image
                                                        .getInstance(logoPath.toAbsolutePath().toString());
                                        logo.scaleToFit(120, 60);
                                        com.lowagie.text.pdf.PdfPCell logoCell = new com.lowagie.text.pdf.PdfPCell(
                                                        logo);
                                        logoCell.setBorder(com.lowagie.text.Rectangle.NO_BORDER);
                                        headerTable.addCell(logoCell);
                                } else {
                                        throw new java.io.FileNotFoundException("Logo not found at " + logoPath);
                                }
                        } catch (Exception e) {
                                com.lowagie.text.pdf.PdfPCell titleCell = new com.lowagie.text.pdf.PdfPCell(
                                                new com.lowagie.text.Phrase("LIBRERIA MARÍA Y JOSÉ", fontTitle));
                                titleCell.setBorder(com.lowagie.text.Rectangle.NO_BORDER);
                                headerTable.addCell(titleCell);
                        }

                        com.lowagie.text.pdf.PdfPCell infoCell = new com.lowagie.text.pdf.PdfPCell();
                        infoCell.setBorder(com.lowagie.text.Rectangle.NO_BORDER);
                        infoCell.setHorizontalAlignment(com.lowagie.text.Element.ALIGN_RIGHT);
                        infoCell.addElement(new com.lowagie.text.Paragraph("FACTURA DE VENTA", fontSubTitle));
                        infoCell.addElement(new com.lowagie.text.Paragraph("No. de Factura: #" + venta.getVentaId(),
                                        fontBold));
                        infoCell.addElement(
                                        new com.lowagie.text.Paragraph(
                                                        "Fecha: " + venta.getFechaVenta()
                                                                        .format(java.time.format.DateTimeFormatter
                                                                                        .ofPattern("dd/MM/yyyy HH:mm")),
                                                        fontNormal));
                        headerTable.addCell(infoCell);

                        document.add(headerTable);

                        // Horizontal Line
                        com.lowagie.text.pdf.draw.LineSeparator line = new com.lowagie.text.pdf.draw.LineSeparator();
                        line.setLineColor(brandColor);
                        document.add(line);
                        document.add(new com.lowagie.text.Paragraph(" ")); // Spacer

                        // Client and Info
                        document.add(new com.lowagie.text.Paragraph("DATOS DEL CLIENTE", fontBold));
                        document.add(new com.lowagie.text.Paragraph("Nombre: " + venta.getCliente().getNombreCompleto(),
                                        fontNormal));
                        document.add(new com.lowagie.text.Paragraph("NIT: "
                                        + (venta.getCliente().getNit() != null ? venta.getCliente().getNit() : "C/F"),
                                        fontNormal));
                        document.add(new com.lowagie.text.Paragraph(" "));

                        document.add(new com.lowagie.text.Paragraph("DATOS DE LA VENTA", fontBold));
                        document.add(new com.lowagie.text.Paragraph(
                                        "Vendedor: " + venta.getUsuario().getNombreCompleto(), fontNormal));
                        document.add(new com.lowagie.text.Paragraph("Método de Pago: " + venta.getMetodoPago(),
                                        fontNormal));
                        document.add(new com.lowagie.text.Paragraph(" "));

                        // Table
                        com.lowagie.text.pdf.PdfPTable table = new com.lowagie.text.pdf.PdfPTable(4);
                        table.setWidthPercentage(100);
                        table.setWidths(new float[] { 5, 1, 2, 2 });
                        table.setSpacingBefore(10);

                        // Table Headers
                        addTableHeader(table, "Producto", fontHeader, brandColor);
                        addTableHeader(table, "Cant.", fontHeader, brandColor);
                        addTableHeader(table, "Precio U.", fontHeader, brandColor);
                        addTableHeader(table, "Subtotal", fontHeader, brandColor);

                        // Table Data
                        boolean alternate = false;
                        for (DetalleVenta detalle : venta.getDetalles()) {
                                java.awt.Color bgColor = alternate ? lightGray : java.awt.Color.WHITE;
                                addTableCell(table, detalle.getProducto().getNombre(), fontNormal, bgColor);
                                addTableCell(table, String.valueOf(detalle.getCantidad()), fontNormal, bgColor);
                                addTableCell(table, String.format("Q %.2f", detalle.getPrecioUnitario()), fontNormal,
                                                bgColor);
                                addTableCell(table, String.format("Q %.2f", detalle.getSubtotal()), fontNormal,
                                                bgColor);
                                alternate = !alternate;
                        }

                        document.add(table);
                        document.add(new com.lowagie.text.Paragraph(" ")); // Spacer

                        // Total
                        com.lowagie.text.pdf.PdfPTable totalTable = new com.lowagie.text.pdf.PdfPTable(2);
                        totalTable.setWidthPercentage(40);
                        totalTable.setHorizontalAlignment(com.lowagie.text.Element.ALIGN_RIGHT);

                        com.lowagie.text.pdf.PdfPCell labelCell = new com.lowagie.text.pdf.PdfPCell(
                                        new com.lowagie.text.Phrase("TOTAL:", fontHeader));
                        labelCell.setBackgroundColor(brandColor);
                        labelCell.setPadding(8);
                        labelCell.setBorder(com.lowagie.text.Rectangle.NO_BORDER);
                        totalTable.addCell(labelCell);

                        com.lowagie.text.pdf.PdfPCell valueCell = new com.lowagie.text.pdf.PdfPCell(
                                        new com.lowagie.text.Phrase(String.format("Q %.2f", venta.getMontoTotal()),
                                                        fontSubTitle));
                        valueCell.setPadding(8);
                        valueCell.setBorder(com.lowagie.text.Rectangle.NO_BORDER);
                        valueCell.setHorizontalAlignment(com.lowagie.text.Element.ALIGN_RIGHT);
                        totalTable.addCell(valueCell);

                        document.add(totalTable);

                        // Footer
                        document.add(new com.lowagie.text.Paragraph(" "));
                        com.lowagie.text.Paragraph footer = new com.lowagie.text.Paragraph(
                                        "¡Gracias por su compra en Librería María y José!", fontNormal);
                        footer.setAlignment(com.lowagie.text.Element.ALIGN_CENTER);
                        document.add(footer);

                        document.close();
                        return out.toByteArray();
                } catch (Exception e) {
                        throw new RuntimeException("Error al generar PDF", e);
                }
        }

        private void addTableHeader(com.lowagie.text.pdf.PdfPTable table, String headerTitle,
                        com.lowagie.text.Font font, java.awt.Color bgColor) {
                com.lowagie.text.pdf.PdfPCell header = new com.lowagie.text.pdf.PdfPCell();
                header.setBackgroundColor(bgColor);
                header.setPadding(8);
                header.setPhrase(new com.lowagie.text.Phrase(headerTitle, font));
                table.addCell(header);
        }

        private void addTableCell(com.lowagie.text.pdf.PdfPTable table, String text, com.lowagie.text.Font font,
                        java.awt.Color bgColor) {
                com.lowagie.text.pdf.PdfPCell cell = new com.lowagie.text.pdf.PdfPCell(
                                new com.lowagie.text.Phrase(text, font));
                cell.setBackgroundColor(bgColor);
                cell.setPadding(8);
                cell.setBorderColor(new java.awt.Color(226, 232, 240));
                table.addCell(cell);
        }
}
