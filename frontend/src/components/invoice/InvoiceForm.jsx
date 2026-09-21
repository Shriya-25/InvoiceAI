import { Plus, Sparkles } from 'lucide-react';
import { useInvoice } from '../../context/InvoiceContext';
import { useAuth } from '../../context/AuthContext';
import { getClients } from '../../firebase/firestore';
import { useState, useEffect } from 'react';
import LineItemRow from './LineItemRow';
import { Select } from '../ui/Input';
import { CURRENCIES } from '../../utils/formatters';
import { calcSubtotal, calcTax, calcDiscount, calcTotal } from '../../utils/invoiceHelpers';
import { formatCurrency } from '../../utils/formatters';
import AIGeneratorModal from '../ui/AIGeneratorModal';
import { suggestTermsAI, generateNotesAI } from '../../utils/api';

export default function InvoiceForm() {
  const { invoice, updateInvoice, updateClient, addItem } = useInvoice();
  const { user } = useAuth();
  const [savedClients, setSavedClients] = useState([]);
  const [aiModal, setAiModal] = useState(null); // 'terms' | 'notes' | null
  
  useEffect(() => {
    if (user) {
      getClients(user.uid).then(res => setSavedClients(res || []));
    }
  }, [user]);

  const subtotal = calcSubtotal(invoice.items);
  const tax = calcTax(subtotal, invoice.taxPercent);
  const discount = calcDiscount(subtotal, invoice.discount);
  const total = calcTotal(invoice);

  const field = (key) => ({
    value: invoice[key] || '',
    onChange: (e) => updateInvoice({ [key]: e.target.value }),
  });
  const clientField = (key) => ({
    value: invoice.client?.[key] || '',
    onChange: (e) => updateClient({ [key]: e.target.value }),
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Invoice meta */}
      <section>
        <h3 className="text-xs font-bold text-[#6B7280] uppercase tracking-widest mb-3">Invoice Details</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Invoice #</label>
            <input className="input-field" {...field('invoiceNumber')} placeholder="INV-001" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Due Date</label>
            <input type="date" className="input-field" {...field('dueDate')} />
          </div>
          <Select label="Currency" value={invoice.currency} onChange={e => updateInvoice({ currency: e.target.value })}>
            {CURRENCIES.map(c => (
              <option key={c.code} value={c.code}>{c.code} — {c.name}</option>
            ))}
          </Select>
          <Select label="Status" {...field('status')}>
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="archived">Archived</option>
          </Select>
        </div>
      </section>

      {/* Billed To */}
      <section>
        <h3 className="text-xs font-bold text-[#1A998F] uppercase tracking-widest mb-3">Billed To</h3>
        <div className="flex flex-col gap-3">
          
          <Select
            label="Select Existing Client"
            className="mb-2"
            value=""
            onChange={(e) => {
              const c = savedClients.find(client => client.id === e.target.value);
              if (c) {
                updateClient({
                  name: c.name || '',
                  email: c.email || '',
                  address: c.address || '',
                  phone: c.phone || '',
                  gstNumber: c.gstNumber || ''
                });
              }
            }}
          >
            <option value="" disabled>-- Select a client to auto-fill --</option>
            {savedClients.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Client Name *</label>
            <input className="input-field" {...clientField('name')} placeholder="Acme Corporation" required />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Email</label>
            <input type="email" className="input-field" {...clientField('email')} placeholder="contact@acme.com" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Address</label>
            <textarea rows={2} className="input-field resize-none" {...clientField('address')} placeholder="123 Main St, City, State" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Phone</label>
              <input className="input-field" {...clientField('phone')} placeholder="+91 98765 43210" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">GST Number</label>
              <input className="input-field" {...clientField('gstNumber')} placeholder="22AAAAA0000A1Z5" />
            </div>
          </div>
        </div>
      </section>

      {/* Line Items */}
      <section>
        <h3 className="text-xs font-bold text-[#1A998F] uppercase tracking-widest mb-3">Line Items</h3>
        {/* Header */}
        <div className="grid grid-cols-[1fr_70px_100px_100px_36px] gap-2 mb-1 px-0">
          {['Description', 'Qty', 'Rate', 'Amount', ''].map((h) => (
            <span key={h} className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wide">{h}</span>
          ))}
        </div>
        <div className="border border-[#E5E7EB] rounded-xl overflow-hidden">
          {invoice.items.map(item => (
            <LineItemRow key={item.id} item={item} />
          ))}
        </div>
        <button
          type="button"
          onClick={addItem}
          id="btn-add-line-item"
          className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-[#1A998F] hover:text-[#187F87] transition-colors"
        >
          <Plus size={16} /> Add Line Item
        </button>
      </section>

      {/* Tax / Discount */}
      <section>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Tax %</label>
            <input
              type="number" min="0" max="100" step="0.1"
              className="input-field"
              value={invoice.taxPercent}
              onChange={e => updateInvoice({ taxPercent: e.target.value })}
              placeholder="18"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Discount %</label>
            <input
              type="number" min="0" max="100" step="0.1"
              className="input-field"
              value={invoice.discount}
              onChange={e => updateInvoice({ discount: e.target.value })}
              placeholder="0"
            />
          </div>
        </div>
      </section>

      {/* Totals */}
      <section className="bg-[#F4F7F6] rounded-xl p-4 border border-[#E5E7EB]">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-sm text-[#6B7280]">
            <span>Subtotal</span>
            <span className="font-medium text-[#0F1115]">{formatCurrency(subtotal, invoice.currency)}</span>
          </div>
          {invoice.taxPercent > 0 && (
            <div className="flex justify-between text-sm text-[#6B7280]">
              <span>Tax ({invoice.taxPercent}%)</span>
              <span className="font-medium text-[#0F1115]">{formatCurrency(tax, invoice.currency)}</span>
            </div>
          )}
          {invoice.discount > 0 && (
            <div className="flex justify-between text-sm text-[#6B7280]">
              <span>Discount ({invoice.discount}%)</span>
              <span className="text-[#DC2626]">−{formatCurrency(discount, invoice.currency)}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t border-[#E5E7EB]">
            <span className="font-bold text-[#0F1115]">Total</span>
            <span className="text-lg font-bold text-[#1A998F]">{formatCurrency(total, invoice.currency)}</span>
          </div>
        </div>
      </section>

      {/* Terms & Notes */}
      <section>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Payment Terms</label>
              <button 
                type="button" 
                onClick={() => setAiModal('terms')}
                className="text-xs font-bold text-[#1A998F] hover:text-[#187F87] flex items-center gap-1"
              >
                <Sparkles size={12} /> Suggest with AI
              </button>
            </div>
            {invoice.paymentTerms && !['Due on Receipt', 'Net 15', 'Net 30', 'Net 45', 'Net 60', '50% Advance'].includes(invoice.paymentTerms) ? (
               <input className="input-field" {...field('paymentTerms')} />
            ) : (
              <Select {...field('paymentTerms')}>
                <option value="">Select terms...</option>
                <option value="Due on Receipt">Due on Receipt</option>
                <option value="Net 15">Net 15</option>
                <option value="Net 30">Net 30</option>
                <option value="Net 45">Net 45</option>
                <option value="Net 60">Net 60</option>
                <option value="50% Advance">50% Advance</option>
              </Select>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Notes</label>
              <button 
                type="button" 
                onClick={() => setAiModal('notes')}
                className="text-xs font-bold text-[#1A998F] hover:text-[#187F87] flex items-center gap-1"
              >
                <Sparkles size={12} /> Generate with AI
              </button>
            </div>
            {invoice.notes && !['Thank you for your business!', 'Payment is due by the specified due date.', 'Please contact us if you have any questions regarding this invoice.'].includes(invoice.notes) ? (
              <textarea rows={2} className="input-field resize-none" {...field('notes')} />
            ) : (
              <Select {...field('notes')}>
                <option value="">None</option>
                <option value="Thank you for your business!">Thank you for your business!</option>
                <option value="Payment is due by the specified due date.">Payment is due by the specified due date.</option>
                <option value="Please contact us if you have any questions regarding this invoice.">Please contact us if you have any questions regarding this invoice.</option>
              </Select>
            )}
          </div>
        </div>
      </section>
      <AIGeneratorModal
        open={aiModal === 'terms'}
        onClose={() => setAiModal(null)}
        title="Suggest Payment Terms"
        promptLabel="Analyzing client details and invoice total to suggest payment terms..."
        contextData={invoice}
        generatorFn={suggestTermsAI}
        onUse={(terms) => updateInvoice({ paymentTerms: terms })}
      />

      <AIGeneratorModal
        open={aiModal === 'notes'}
        onClose={() => setAiModal(null)}
        title="Generate Notes"
        promptLabel="Creating a professional note for your invoice footer..."
        contextData={invoice}
        generatorFn={generateNotesAI}
        onUse={(note) => updateInvoice({ notes: note })}
      />
    </div>
  );
}
