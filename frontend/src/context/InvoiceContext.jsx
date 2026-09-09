import { createContext, useContext, useState } from 'react';
import { generateInvoiceNumber } from '../utils/invoiceHelpers';

const InvoiceContext = createContext(null);

const DEFAULT_INVOICE = {
  invoiceNumber: '',
  client: { name: '', email: '', address: '', phone: '', gstNumber: '' },
  items: [{ id: 1, description: '', quantity: 1, rate: 0 }],
  taxPercent: 18,
  discount: 0,
  currency: 'INR',
  dueDate: '',
  paymentTerms: 'Net 30',
  notes: '',
  status: 'draft',
  source: 'manual',
};

export function InvoiceProvider({ children, initialInvoice }) {
  const [invoice, setInvoice] = useState(() => {
    if (initialInvoice) {
      return {
        ...DEFAULT_INVOICE,
        ...initialInvoice,
        items: (initialInvoice.items || []).map((item, i) => ({ id: i + 1, ...item })),
      };
    }
    return {
      ...DEFAULT_INVOICE,
      invoiceNumber: generateInvoiceNumber(),
      dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    };
  });

  const updateInvoice = (patch) => setInvoice(prev => ({ ...prev, ...patch }));
  const updateClient = (patch) => setInvoice(prev => ({ ...prev, client: { ...prev.client, ...patch } }));

  const addItem = () => setInvoice(prev => ({
    ...prev,
    items: [...prev.items, { id: Date.now(), description: '', quantity: 1, rate: 0 }]
  }));

  const removeItem = (id) => setInvoice(prev => ({
    ...prev,
    items: prev.items.filter(i => i.id !== id)
  }));

  const updateItem = (id, patch) => setInvoice(prev => ({
    ...prev,
    items: prev.items.map(i => i.id === id ? { ...i, ...patch } : i)
  }));

  const resetInvoice = () => setInvoice({
    ...DEFAULT_INVOICE,
    invoiceNumber: generateInvoiceNumber(),
    dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
  });

  const loadInvoice = (data) => setInvoice({
    ...DEFAULT_INVOICE,
    ...data,
    items: (data.items || []).map((item, i) => ({ id: i + 1, ...item })),
  });

  return (
    <InvoiceContext.Provider value={{ invoice, updateInvoice, updateClient, addItem, removeItem, updateItem, resetInvoice, loadInvoice }}>
      {children}
    </InvoiceContext.Provider>
  );
}

export const useInvoice = () => useContext(InvoiceContext);
