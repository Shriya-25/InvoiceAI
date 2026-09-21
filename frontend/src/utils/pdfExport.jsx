import React from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import InvoicePreview from '../components/invoice/InvoicePreview';
import { InvoiceProvider } from '../context/InvoiceContext';

async function createPDF(invoice, profile = {}) {
  // Create an off-screen container in the viewport so html2canvas can capture it
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '0';
  container.style.zIndex = '-9999';
  container.style.opacity = '0';
  container.style.pointerEvents = 'none';
  // A4 paper dimensions at 96 DPI for accurate rendering
  container.style.width = '794px'; 
  document.body.appendChild(container);

  const root = createRoot(container);
  
  // Render synchronously to ensure DOM is ready
  flushSync(() => {
    root.render(
      <InvoiceProvider initialInvoice={invoice}>
        <InvoicePreview profile={profile} />
      </InvoiceProvider>
    );
  });

  // Give the browser a moment to load any images or fonts
  await new Promise(resolve => setTimeout(resolve, 300));

  const element = container.querySelector('#invoice-preview');
  
  if (!element) {
    root.unmount();
    document.body.removeChild(container);
    throw new Error('Invoice preview element failed to render off-screen.');
  }

  // Temporarily remove shadow and border for a clean PDF look
  const originalShadow = element.style.boxShadow;
  const originalBorder = element.style.border;
  const originalBorderRadius = element.style.borderRadius;
  
  element.style.boxShadow = 'none';
  element.style.border = 'none';
  element.style.borderRadius = '0';

  const canvas = await html2canvas(element, {
    scale: 2, // Higher scale for crisp text
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: 794
  });

  // Restore original styles
  element.style.boxShadow = originalShadow;
  element.style.border = originalBorder;
  element.style.borderRadius = originalBorderRadius;

  // Use JPEG instead of PNG to drastically reduce Base64 payload size (prevents 413 error)
  const imgData = canvas.toDataURL('image/jpeg', 0.85);
  
  // Cleanup the off-screen container
  root.unmount();
  document.body.removeChild(container);

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  let heightLeft = pdfHeight;
  let position = 0;

  // Add first page
  pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
  heightLeft -= pageHeight;

  // Add subsequent pages if the invoice is long
  while (heightLeft > 0) {
    position = position - pageHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
    heightLeft -= pageHeight;
  }

  return pdf;
}

export async function exportInvoicePDF(invoice, profile = {}) {
  try {
    const pdf = await createPDF(invoice, profile);
    pdf.save(`${invoice.invoiceNumber || 'invoice'}.pdf`);
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    throw error;
  }
}

export async function getInvoicePDFBase64(invoice, profile = {}) {
  try {
    const pdf = await createPDF(invoice, profile);
    return pdf.output('datauristring');
  } catch (error) {
    console.error('Failed to generate PDF base64:', error);
    throw error;
  }
}
