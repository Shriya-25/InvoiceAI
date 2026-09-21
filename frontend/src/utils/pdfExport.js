import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

async function createPDF() {
  const element = document.getElementById('invoice-preview');
  
  if (!element) {
    throw new Error('Invoice preview element not found');
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
    const pdf = await createPDF();
    pdf.save(`${invoice.invoiceNumber || 'invoice'}.pdf`);
  } catch (error) {
    console.error('Failed to generate PDF', error);
    throw error;
  }
}

export async function getInvoicePDFBase64(invoice, profile = {}) {
  try {
    const pdf = await createPDF();
    return pdf.output('datauristring');
  } catch (error) {
    console.error('Failed to generate PDF base64', error);
    throw error;
  }
}
