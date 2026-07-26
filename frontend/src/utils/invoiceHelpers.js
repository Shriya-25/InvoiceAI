export const generateInvoiceNumber = () => {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const rand = Math.floor(Math.random() * 900) + 100;
  return `INV-${year}${month}-${rand}`;
};

export const calcSubtotal = (items = []) =>
  items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.rate) || 0), 0);

export const calcTax = (subtotal, taxPercent) =>
  subtotal * (Number(taxPercent) || 0) / 100;

export const calcDiscount = (subtotal, discount) =>
  subtotal * (Number(discount) || 0) / 100;

export const calcTotal = (invoice) => {
  const subtotal = calcSubtotal(invoice.items);
  const tax = calcTax(subtotal, invoice.taxPercent);
  const discount = calcDiscount(subtotal, invoice.discount);
  return subtotal + tax - discount;
};

export const getStatusColor = (status) => ({
  paid: 'badge-paid',
  pending: 'badge-pending',
  overdue: 'badge-overdue',
  draft: 'badge-draft',
  archived: 'badge-archived',
}[status] || 'badge-draft');

export const isOverdue = (invoice) => {
  if (invoice.status === 'paid' || invoice.status === 'archived') return false;
  if (!invoice.dueDate) return false;
  return new Date(invoice.dueDate) < new Date();
};

export const getEffectiveStatus = (invoice) => {
  if (isOverdue(invoice) && invoice.status === 'pending') return 'overdue';
  return invoice.status || 'draft';
};

export const invoiceToFirestore = (invoice, userId) => ({
  invoiceNumber: invoice.invoiceNumber,
  client: invoice.client,
  clientId: invoice.clientId || null,
  items: invoice.items.map(({ id, ...rest }) => rest),
  taxPercent: Number(invoice.taxPercent) || 0,
  discount: Number(invoice.discount) || 0,
  currency: invoice.currency || 'INR',
  dueDate: invoice.dueDate,
  paymentTerms: invoice.paymentTerms || '',
  notes: invoice.notes || '',
  status: invoice.status || 'draft',
  source: invoice.source || 'manual',
  userId,
});
