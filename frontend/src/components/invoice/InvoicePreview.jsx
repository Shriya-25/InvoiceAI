import { useInvoice } from '../../context/InvoiceContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { calcSubtotal, calcTax, calcDiscount, calcTotal } from '../../utils/invoiceHelpers';

export default function InvoicePreview({ profile = {} }) {
  const { invoice } = useInvoice();
  const subtotal = calcSubtotal(invoice.items);
  const tax = calcTax(subtotal, invoice.taxPercent);
  const discount = calcDiscount(subtotal, invoice.discount);
  const total = calcTotal(invoice);

  return (
    <div className="invoice-paper bg-white rounded-xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.08)] border border-[#E5E7EB]">
      {/* Header */}
      <div className="bg-[#2563EB] text-white px-8 py-6">
        <div className="flex justify-between items-start">
          <div>
            {profile.logoUrl && (
              <img src={profile.logoUrl} alt="Logo" className="h-10 mb-2 object-contain" />
            )}
            <h1 className="text-xl font-bold">{profile.businessName || 'Your Business'}</h1>
            {profile.address && <p className="text-blue-200 text-xs mt-1 whitespace-pre-line">{profile.address}</p>}
            {profile.gstNumber && <p className="text-blue-200 text-xs">GST: {profile.gstNumber}</p>}
            {profile.email && <p className="text-blue-200 text-xs">{profile.email}</p>}
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-black tracking-tight opacity-90">INVOICE</h2>
            <p className="text-blue-200 text-sm mt-1">#{invoice.invoiceNumber || 'INV-001'}</p>
          </div>
        </div>
      </div>

      {/* Bill To + Details */}
      <div className="px-8 py-5 grid grid-cols-2 gap-6 bg-white">
        <div>
          <p className="text-[9px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1.5">Billed To</p>
          <p className="font-bold text-[#0F1115] text-sm">{invoice.client?.name || <span className="text-[#D1D5DB]">Client Name</span>}</p>
          {invoice.client?.email && <p className="text-xs text-[#6B7280] mt-0.5">{invoice.client.email}</p>}
          {invoice.client?.address && <p className="text-xs text-[#6B7280] mt-0.5 whitespace-pre-line">{invoice.client.address}</p>}
          {invoice.client?.gstNumber && <p className="text-xs text-[#6B7280] mt-0.5">GST: {invoice.client.gstNumber}</p>}
        </div>
        <div className="text-right">
          <p className="text-[9px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1.5">Invoice Details</p>
          {[
            ['Invoice #', invoice.invoiceNumber || '—'],
            ['Date', formatDate(new Date().toISOString().split('T')[0])],
            ['Due Date', formatDate(invoice.dueDate)],
            ['Currency', invoice.currency || 'INR'],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-end gap-3 text-xs mb-1">
              <span className="text-[#9CA3AF]">{label}</span>
              <span className="font-semibold text-[#0F1115] min-w-[80px] text-right">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Line Items */}
      <div className="px-8 pb-4">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-[#F7F9FC] rounded-lg">
              <th className="py-2.5 px-3 text-left text-[9px] font-bold text-[#9CA3AF] uppercase tracking-widest rounded-l-lg">Description</th>
              <th className="py-2.5 px-3 text-center text-[9px] font-bold text-[#9CA3AF] uppercase tracking-widest w-12">Qty</th>
              <th className="py-2.5 px-3 text-right text-[9px] font-bold text-[#9CA3AF] uppercase tracking-widest w-24">Rate</th>
              <th className="py-2.5 px-3 text-right text-[9px] font-bold text-[#9CA3AF] uppercase tracking-widest w-24 rounded-r-lg">Amount</th>
            </tr>
          </thead>
          <tbody>
            {(invoice.items || []).map((item, i) => (
              <tr key={item.id || i} className="border-b border-[#F3F4F6] last:border-0">
                <td className="py-3 px-3 text-[#0F1115]">{item.description || <span className="text-[#D1D5DB]">Service description</span>}</td>
                <td className="py-3 px-3 text-center text-[#6B7280]">{item.quantity || 1}</td>
                <td className="py-3 px-3 text-right text-[#6B7280]">{formatCurrency(item.rate, invoice.currency)}</td>
                <td className="py-3 px-3 text-right font-semibold text-[#0F1115]">
                  {formatCurrency((Number(item.quantity) || 0) * (Number(item.rate) || 0), invoice.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="px-8 pb-6">
        <div className="ml-auto max-w-[220px]">
          <div className="flex justify-between text-xs text-[#6B7280] mb-1.5">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal, invoice.currency)}</span>
          </div>
          {invoice.taxPercent > 0 && (
            <div className="flex justify-between text-xs text-[#6B7280] mb-1.5">
              <span>Tax ({invoice.taxPercent}%)</span>
              <span>{formatCurrency(tax, invoice.currency)}</span>
            </div>
          )}
          {invoice.discount > 0 && (
            <div className="flex justify-between text-xs text-[#6B7280] mb-1.5">
              <span>Discount ({invoice.discount}%)</span>
              <span className="text-[#DC2626]">−{formatCurrency(discount, invoice.currency)}</span>
            </div>
          )}
          <div className="bg-[#2563EB] text-white rounded-lg px-3 py-2.5 flex justify-between items-center mt-2">
            <span className="font-bold text-xs">TOTAL</span>
            <span className="font-black text-base">{formatCurrency(total, invoice.currency)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      {(invoice.paymentTerms || invoice.notes) && (
        <div className="px-8 py-5 border-t border-[#F3F4F6] bg-[#FAFAFA]">
          {invoice.paymentTerms && (
            <div className="mb-3">
              <p className="text-[9px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1">Payment Terms</p>
              <p className="text-xs text-[#0F1115]">{invoice.paymentTerms}</p>
            </div>
          )}
          {invoice.notes && (
            <div>
              <p className="text-[9px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1">Notes</p>
              <p className="text-xs text-[#6B7280]">{invoice.notes}</p>
            </div>
          )}
        </div>
      )}

      {/* Signature */}
      {profile.signatureUrl && (
        <div className="px-8 py-4 border-t border-[#F3F4F6]">
          <img src={profile.signatureUrl} alt="Signature" className="h-12 object-contain" />
          <p className="text-[10px] text-[#9CA3AF] mt-1">Authorized Signature</p>
        </div>
      )}

      {/* Watermark footer */}
      <div className="px-8 py-3 bg-[#F7F9FC] border-t border-[#E5E7EB] flex justify-between items-center">
        <p className="text-[9px] text-[#9CA3AF]">Generated by InvoiceAI</p>
        <span className={`badge text-[9px] ${
          invoice.status === 'paid' ? 'badge-paid' :
          invoice.status === 'overdue' ? 'badge-overdue' :
          invoice.status === 'pending' ? 'badge-pending' : 'badge-draft'
        }`}>
          {(invoice.status || 'draft').toUpperCase()}
        </span>
      </div>
    </div>
  );
}
