package com.libreria.libreria.service;

import com.libreria.libreria.model.DetalleVenta;
import com.libreria.libreria.model.Venta;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Image;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.lowagie.text.pdf.draw.LineSeparator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.time.format.DateTimeFormatter;

@Service
public class FacturaPdfService {

    private static final Logger log = LoggerFactory.getLogger(FacturaPdfService.class);
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    public byte[] generarFacturaVenta(Venta venta) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, out);
            document.open();

            Color brandColor = new Color(14, 165, 233);
            Color lightGray = new Color(241, 245, 249);

            Font fontTitle = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, brandColor);
            Font fontSubTitle = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, Color.DARK_GRAY);
            Font fontHeader = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, Color.WHITE);
            Font fontNormal = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.BLACK);
            Font fontBold = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.BLACK);

            PdfPTable headerTable = new PdfPTable(2);
            headerTable.setWidthPercentage(100);
            headerTable.setSpacingAfter(20);

            headerTable.addCell(buildLogoOrTitleCell(fontTitle));

            PdfPCell infoCell = new PdfPCell();
            infoCell.setBorder(Rectangle.NO_BORDER);
            infoCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            infoCell.addElement(new Paragraph("FACTURA DE VENTA", fontSubTitle));
            infoCell.addElement(new Paragraph("No. de Factura: #" + venta.getVentaId(), fontBold));
            infoCell.addElement(new Paragraph("Fecha: " + venta.getFechaVenta().format(DATE_FORMATTER), fontNormal));
            headerTable.addCell(infoCell);

            document.add(headerTable);

            LineSeparator line = new LineSeparator();
            line.setLineColor(brandColor);
            document.add(line);
            document.add(new Paragraph(" "));

            document.add(new Paragraph("DATOS DEL CLIENTE", fontBold));
            document.add(new Paragraph("Nombre: " + venta.getCliente().getNombreCompleto(), fontNormal));
            document.add(new Paragraph("NIT: " + (venta.getCliente().getNit() != null ? venta.getCliente().getNit() : "C/F"), fontNormal));
            document.add(new Paragraph(" "));

            document.add(new Paragraph("DATOS DE LA VENTA", fontBold));
            document.add(new Paragraph("Vendedor: " + venta.getUsuario().getNombreCompleto(), fontNormal));
            document.add(new Paragraph("Método de Pago: " + venta.getMetodoPago(), fontNormal));
            document.add(new Paragraph(" "));

            PdfPTable table = new PdfPTable(4);
            table.setWidthPercentage(100);
            table.setWidths(new float[] { 5, 1, 2, 2 });
            table.setSpacingBefore(10);

            addTableHeader(table, "Producto", fontHeader, brandColor);
            addTableHeader(table, "Cant.", fontHeader, brandColor);
            addTableHeader(table, "Precio U.", fontHeader, brandColor);
            addTableHeader(table, "Subtotal", fontHeader, brandColor);

            boolean alternate = false;
            for (DetalleVenta detalle : venta.getDetalles()) {
                Color bgColor = alternate ? lightGray : Color.WHITE;
                addTableCell(table, detalle.getProducto().getNombre(), fontNormal, bgColor);
                addTableCell(table, String.valueOf(detalle.getCantidad()), fontNormal, bgColor);
                addTableCell(table, String.format("Q %.2f", detalle.getPrecioUnitario()), fontNormal, bgColor);
                addTableCell(table, String.format("Q %.2f", detalle.getSubtotal()), fontNormal, bgColor);
                alternate = !alternate;
            }

            document.add(table);
            document.add(new Paragraph(" "));

            PdfPTable totalTable = new PdfPTable(2);
            totalTable.setWidthPercentage(40);
            totalTable.setHorizontalAlignment(Element.ALIGN_RIGHT);

            PdfPCell labelCell = new PdfPCell(new Phrase("TOTAL:", fontHeader));
            labelCell.setBackgroundColor(brandColor);
            labelCell.setPadding(8);
            labelCell.setBorder(Rectangle.NO_BORDER);
            totalTable.addCell(labelCell);

            PdfPCell valueCell = new PdfPCell(new Phrase(String.format("Q %.2f", venta.getMontoTotal()), fontSubTitle));
            valueCell.setPadding(8);
            valueCell.setBorder(Rectangle.NO_BORDER);
            valueCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            totalTable.addCell(valueCell);

            document.add(totalTable);

            document.add(new Paragraph(" "));
            Paragraph footer = new Paragraph("¡Gracias por su compra en Librería María y José!", fontNormal);
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error al generar PDF", e);
        }
    }

    private PdfPCell buildLogoOrTitleCell(Font fontTitle) {
        try {
            ClassPathResource logoResource = new ClassPathResource("static/logo.png");
            if (logoResource.exists()) {
                try (InputStream is = logoResource.getInputStream()) {
                    Image logo = Image.getInstance(is.readAllBytes());
                    logo.scaleToFit(120, 60);
                    PdfPCell logoCell = new PdfPCell(logo);
                    logoCell.setBorder(Rectangle.NO_BORDER);
                    return logoCell;
                }
            }
        } catch (Exception e) {
            log.warn("No se pudo cargar el logo desde classpath:static/logo.png, usando texto alternativo", e);
        }

        PdfPCell titleCell = new PdfPCell(new Phrase("LIBRERIA MARÍA Y JOSÉ", fontTitle));
        titleCell.setBorder(Rectangle.NO_BORDER);
        return titleCell;
    }

    private void addTableHeader(PdfPTable table, String headerTitle, Font font, Color bgColor) {
        PdfPCell header = new PdfPCell();
        header.setBackgroundColor(bgColor);
        header.setPadding(8);
        header.setPhrase(new Phrase(headerTitle, font));
        table.addCell(header);
    }

    private void addTableCell(PdfPTable table, String text, Font font, Color bgColor) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(bgColor);
        cell.setPadding(8);
        cell.setBorderColor(new Color(226, 232, 240));
        table.addCell(cell);
    }
}
