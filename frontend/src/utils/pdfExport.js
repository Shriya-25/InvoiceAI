import jsPDF from 'jspdf';
import { formatCurrency, formatDate, getCurrencySymbol } from './formatters';
import { calcSubtotal, calcTax, calcDiscount, calcTotal } from './invoiceHelpers';

export async function exportInvoicePDF(invoice, profile = {}) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210; // A4 width in mm
  const margin = 16;
  let y = margin;

  const primary = [37, 99, 235];
  const textDark = [15, 17, 21];
  const textMid = [107, 114, 128];
  const borderColor = [229, 231, 235];

  const setFont = (size, style = 'normal', color = textDark) => {
    doc.setFontSize(size);
    doc.setFont('helvetica', style);
    doc.setTextColor(...color);
  };

  const line = (x1, y1, x2, y2, color = borderColor) => {
    doc.setDrawColor(...color);
    doc.line(x1, y1, x2, y2);
  };

  const rect = (x, y, w, h, fillColor) => {
    doc.setFillColor(...fillColor);
    doc.roundedRect(x, y, w, h, 2, 2, 'F');
  };

  // Header bar
  rect(0, 0, W, 38, primary);

  // Business name / brand
  setFont(20, 'bold', [255, 255, 255]);
  doc.text(profile.businessName || 'Your Business', margin, 16);

  setFont(8, 'normal', [191, 219, 254]);
  if (profile.address) doc.text(profile.address, margin, 22);
  if (profile.gstNumber) doc.text(`GST: ${profile.gstNumber}`, margin, 27);
  if (profile.email) doc.text(profile.email, margin, 32);

  // INVOICE label top-right
  setFont(22, 'bold', [255, 255, 255]);
  doc.text('INVOICE', W - margin, 16, { align: 'right' });
  setFont(9, 'normal', [191, 219, 254]);
  doc.text(`#${invoice.invoiceNumber}`, W - margin, 23, { align: 'right' });

  y = 48;

  // Bill To + Invoice Details
  setFont(7, 'bold', textMid);
  doc.text('BILLED TO', margin, y);
  doc.text('INVOICE DETAILS', 130, y);

  y += 5;
  setFont(11, 'bold', textDark);
  doc.text(invoice.client?.name || '—', margin, y);

  setFont(9, 'normal', textDark);
  const details = [
    ['Invoice #', invoice.invoiceNumber],
    ['Date', formatDate(new Date().toISOString().split('T')[0])],
    ['Due Date', formatDate(invoice.dueDate)],
    ['Currency', invoice.currency || 'INR'],
  ];
  details.forEach(([label, value], i) => {
    setFont(8, 'normal', textMid);
    doc.text(label, 130, y + i * 6);
    setFont(8, 'bold', textDark);
    doc.text(String(value || '—'), 165, y + i * 6);
  });

  setFont(8, 'normal', textMid);
  if (invoice.client?.email) doc.text(invoice.client.email, margin, y + 6);
  if (invoice.client?.address) {
    const addr = doc.splitTextToSize(invoice.client.address, 70);
    doc.text(addr, margin, y + 12);
    y += addr.length * 5;
  }

  y += 34;

  // Items table header
  rect(margin, y, W - margin * 2, 8, [248, 250, 252]);
  line(margin, y + 8, W - margin, y + 8, borderColor);
  setFont(7, 'bold', textMid);
  doc.text('DESCRIPTION', margin + 3, y + 5.5);
  doc.text('QTY', 130, y + 5.5, { align: 'right' });
  doc.text('RATE', 155, y + 5.5, { align: 'right' });
  doc.text('AMOUNT', W - margin - 2, y + 5.5, { align: 'right' });

  y += 12;

  // Items
  (invoice.items || []).forEach((item, idx) => {
    const amount = (Number(item.quantity) || 0) * (Number(item.rate) || 0);
    if (idx % 2 === 0) rect(margin, y - 4, W - margin * 2, 9, [249, 250, 251]);
    setFont(8, 'normal', textDark);
    const desc = doc.splitTextToSize(item.description || 'Service', 100);
    doc.text(desc, margin + 3, y + 1);
    doc.text(String(item.quantity || 1), 130, y + 1, { align: 'right' });
    doc.text(formatCurrency(item.rate, invoice.currency), 155, y + 1, { align: 'right' });
    doc.text(formatCurrency(amount, invoice.currency), W - margin - 2, y + 1, { align: 'right' });
    y += desc.length > 1 ? desc.length * 4.5 + 3 : 9;
  });

  line(margin, y, W - margin, y, borderColor);
  y += 6;

  // Totals section
  const subtotal = calcSubtotal(invoice.items);
  const tax = calcTax(subtotal, invoice.taxPercent);
  const discount = calcDiscount(subtotal, invoice.discount);
  const total = calcTotal(invoice);

  const totals = [
    ['Subtotal', subtotal],
    ...(invoice.discount > 0 ? [`Discount (${invoice.discount}%)`, -discount] : []).map ? [] : [],
    ...(invoice.taxPercent > 0 ? [[`Tax (${invoice.taxPercent}%)`, tax]] : []),
    ...(invoice.discount > 0 ? [[`Discount (${invoice.discount}%)`, -discount]] : []),
  ];

  let ty = y;
  totals.forEach(([label, value]) => {
    setFont(8, 'normal', textMid);
    doc.text(label, 150, ty, { align: 'right' });
    setFont(8, 'normal', textDark);
    doc.text(formatCurrency(value, invoice.currency), W - margin - 2, ty, { align: 'right' });
    ty += 7;
  });

  // Total box
  rect(130, ty, W - margin - 130, 11, primary);
  setFont(8, 'bold', [255, 255, 255]);
  doc.text('TOTAL', 140, ty + 7.5);
  setFont(10, 'bold', [255, 255, 255]);
  doc.text(formatCurrency(total, invoice.currency), W - margin - 2, ty + 7.5, { align: 'right' });

  y = Math.max(ty + 20, y + 10);

  // Payment terms & notes
  if (invoice.paymentTerms || invoice.notes) {
    line(margin, y, W - margin, y, borderColor);
    y += 8;
    if (invoice.paymentTerms) {
      setFont(7, 'bold', textMid);
      doc.text('PAYMENT TERMS', margin, y);
      setFont(8, 'normal', textDark);
      doc.text(invoice.paymentTerms, margin, y + 5);
      y += 14;
    }
    if (invoice.notes) {
      setFont(7, 'bold', textMid);
      doc.text('NOTES', margin, y);
      setFont(8, 'normal', textMid);
      const notesLines = doc.splitTextToSize(invoice.notes, W - margin * 2);
      doc.text(notesLines, margin, y + 5);
      y += notesLines.length * 5 + 10;
    }
  }

  // Footer
  const footerY = 282;
  line(margin, footerY - 4, W - margin, footerY - 4, [229, 231, 235]);
  setFont(7, 'normal', textMid);
  doc.text('Generated by InvoiceAI', margin, footerY);
  setFont(7, 'bold', primary);
  doc.text(`Status: ${(invoice.status || 'DRAFT').toUpperCase()}`, W - margin, footerY, { align: 'right' });

  doc.save(`${invoice.invoiceNumber || 'invoice'}.pdf`);
}
