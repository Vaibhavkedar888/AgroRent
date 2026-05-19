package com.farming.rental.service;

import com.farming.rental.entity.Booking;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.*;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
public class InvoiceService {

    private static final Color PRIMARY_COLOR = new Color(16, 185, 129); // Emerald-600 (AgroRent Green)
    private static final Color TEXT_DARK = new Color(31, 41, 55); // Gray-800
    private static final Color TEXT_LIGHT = new Color(107, 114, 128); // Gray-500
    private static final Color BG_LIGHT = new Color(249, 250, 251); // Gray-50

    public byte[] generateInvoicePdf(Booking booking) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 36, 36, 36, 36);

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Font styles
            Font logoFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 28, PRIMARY_COLOR);
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 24, TEXT_DARK);
            Font subHeaderFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, TEXT_DARK);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 11, TEXT_DARK);
            Font smallFont = FontFactory.getFont(FontFactory.HELVETICA, 10, TEXT_LIGHT);
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, TEXT_DARK);
            Font whiteBoldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, Color.WHITE);

            // --- HEADER SECTION ---
            PdfPTable headerTable = new PdfPTable(2);
            headerTable.setWidthPercentage(100);
            headerTable.setWidths(new float[] { 2, 1 });

            // Branding
            PdfPCell brandingCell = new PdfPCell();
            brandingCell.setBorder(Rectangle.NO_BORDER);
            brandingCell.addElement(new Paragraph("AgroRent", logoFont));
            brandingCell.addElement(new Paragraph("Growing Together", smallFont));
            headerTable.addCell(brandingCell);

            // Invoice Info
            PdfPCell invInfoCell = new PdfPCell();
            invInfoCell.setBorder(Rectangle.NO_BORDER);
            invInfoCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            Paragraph invTitle = new Paragraph("INVOICE", headerFont);
            invTitle.setAlignment(Element.ALIGN_RIGHT);
            invInfoCell.addElement(invTitle);
            Paragraph invNo = new Paragraph("#INV-" + booking.getId().substring(0, 8).toUpperCase(), boldFont);
            invNo.setAlignment(Element.ALIGN_RIGHT);
            invInfoCell.addElement(invNo);
            headerTable.addCell(invInfoCell);

            document.add(headerTable);
            addHorizontalLine(document);
            document.add(new Paragraph(" "));

            // --- INFO SECTION (Farmer & Owner) ---
            PdfPTable infoTable = new PdfPTable(2);
            infoTable.setWidthPercentage(100);
            infoTable.setSpacingAfter(20);

            // Left: Farmer
            PdfPCell farmerCell = new PdfPCell();
            farmerCell.setBorder(Rectangle.NO_BORDER);
            farmerCell.addElement(new Paragraph("BILL TO:", smallFont));
            farmerCell.addElement(new Paragraph(booking.getFarmer().getFullName(), subHeaderFont));
            farmerCell.addElement(new Paragraph(booking.getFarmer().getEmail(), normalFont));
            infoTable.addCell(farmerCell);

            // Right: Date & Status
            PdfPCell dateCell = new PdfPCell();
            dateCell.setBorder(Rectangle.NO_BORDER);
            dateCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            Paragraph datePara = new Paragraph(
                    "Date: " + java.time.LocalDate.now().format(DateTimeFormatter.ofPattern("dd MMM yyyy")),
                    normalFont);
            datePara.setAlignment(Element.ALIGN_RIGHT);
            dateCell.addElement(datePara);

            Paragraph statusPara = new Paragraph("Status: APPROVED", boldFont);
            statusPara.setAlignment(Element.ALIGN_RIGHT);
            dateCell.addElement(statusPara);
            infoTable.addCell(dateCell);

            document.add(infoTable);

            // --- RENTAL DETAILS TABLE ---
            PdfPTable detailsTable = new PdfPTable(4);
            detailsTable.setWidthPercentage(100);
            detailsTable.setWidths(new float[] { 2, 1, 1, 1 });

            // Table Header
            addStyledHeader(detailsTable, "Equipment Description", whiteBoldFont);
            addStyledHeader(detailsTable, "Rental Type", whiteBoldFont);
            addStyledHeader(detailsTable, "Duration", whiteBoldFont);
            addStyledHeader(detailsTable, "Amount", whiteBoldFont);

            // Table Row
            addStyledRow(detailsTable, booking.getEquipment().getName(), normalFont);
            addStyledRow(detailsTable, booking.getRentalType().toString(), normalFont);
            addStyledRow(detailsTable, booking.getTotalDuration() + " " + getUnit(booking), normalFont);
            addStyledRow(detailsTable, "₹ " + booking.getTotalAmount(), boldFont);

            document.add(detailsTable);
            document.add(new Paragraph(" "));

            // --- TOTAL SECTION ---
            PdfPTable totalTable = new PdfPTable(2);
            totalTable.setWidthPercentage(40);
            totalTable.setHorizontalAlignment(Element.ALIGN_RIGHT);

            PdfPCell totalLabel = new PdfPCell(new Paragraph("Total Payable", boldFont));
            totalLabel.setBorder(Rectangle.NO_BORDER);
            totalLabel.setPadding(10);
            totalTable.addCell(totalLabel);

            PdfPCell totalVal = new PdfPCell(new Paragraph("₹ " + booking.getTotalAmount(), subHeaderFont));
            totalVal.setBorder(Rectangle.NO_BORDER);
            totalVal.setHorizontalAlignment(Element.ALIGN_RIGHT);
            totalVal.setPadding(10);
            totalTable.addCell(totalVal);

            document.add(totalTable);

            // --- FOOTER ---
            Paragraph footer = new Paragraph("\n\nThank you for choosing AgroRent for your farming needs.\n" +
                    "For support, contact: support@agrorent.com | +91 9876543210-AGRO-RENT", smallFont);
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Error generating designer PDF", e);
        }

        return out.toByteArray();
    }

    private String getUnit(Booking booking) {
        if (booking.getRentalType() == Booking.RentalType.HOURLY)
            return "Hours";
        if (booking.getRentalType() == Booking.RentalType.WEEKLY)
            return "Weeks";
        return "Days";
    }

    private void addHorizontalLine(Document document) throws DocumentException {
        Paragraph p = new Paragraph("");
        p.setSpacingBefore(10);
        p.setSpacingAfter(10);
        document.add(p);

        PdfPTable table = new PdfPTable(1);
        table.setWidthPercentage(100);
        PdfPCell cell = new PdfPCell();
        cell.setBorder(Rectangle.BOTTOM);
        cell.setBorderWidth(1f);
        cell.setBorderColor(new Color(229, 231, 235)); // Gray-200
        table.addCell(cell);
        document.add(table);
    }

    private void addStyledHeader(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Paragraph(text, font));
        cell.setBackgroundColor(PRIMARY_COLOR);
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setPadding(10);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        table.addCell(cell);
    }

    private void addStyledRow(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Paragraph(text, font));
        cell.setBorder(Rectangle.BOTTOM);
        cell.setBorderColor(new Color(243, 244, 246)); // Gray-100
        cell.setPadding(10);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        table.addCell(cell);
    }
}
