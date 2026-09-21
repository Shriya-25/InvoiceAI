import React from 'react';
import { createRoot } from 'react-dom/client';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import InvoicePreview from '../components/invoice/InvoicePreview';
import { InvoiceProvider } from '../context/InvoiceContext';

async function createPDF(invoice, profile = {}) {
  // Create an off-screen container
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.top = '-9999px';
  container.style.left = '-9999px';
  // A4 paper dimensions at 96 DPI for accurate rendering
  container.style.width = '794px'; 
  document.body.appendChild(container);

  const root = createRoot(container);
  
  await new Promise(resolve => {
    root.render(
      <InvoiceProvider initialInvoice={invoice}>
        <InvoicePreview profile={profile} />
      </InvoiceProvider>
    );
    // Give React time to mount and render the DOM
    setTimeout(resolve, 250);
  });

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
    backgroundColor: '#ffffff'
  });

  // Restore original styles
  element.style.boxShadow = originalShadow;
  element.style.border = originalBorder;
  element.style.borderRadius = originalBorderRadius;

  const imgData = canvas.toDataURL('image/png');
  
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
  pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
  heightLeft -= pageHeight;

  // Add subsequent pages if the invoice is long
  while (heightLeft > 0) {
    position = position - pageHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
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
