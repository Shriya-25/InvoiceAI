import { Trash2, Plus } from 'lucide-react';
import { useInvoice } from '../../context/InvoiceContext';
import { formatCurrency, getCurrencySymbol, CURRENCIES } from '../../utils/formatters';
import { calcSubtotal, calcTax, calcDiscount, calcTotal } from '../../utils/invoiceHelpers';

export default function LineItemRow({ item }) {
  const { updateItem, removeItem, invoice } = useInvoice();
  const symbol = getCurrencySymbol(invoice.currency);
  const amount = (Number(item.quantity) || 0) * (Number(item.rate) || 0);

  return (
    <div className="grid grid-cols-[1fr_70px_100px_100px_36px] gap-2 items-start py-2 border-b border-[#F3F4F6] last:border-b-0">
      <input
        type="text"
        placeholder="Service description"
        value={item.description}
        onChange={e => updateItem(item.id, { description: e.target.value })}
        className="input-field !py-2 text-sm"
      />
      <input
        type="number"
        min="1"
        placeholder="Qty"
        value={item.quantity}
        onChange={e => updateItem(item.id, { quantity: e.target.value })}
        className="input-field !py-2 text-sm text-center"
      />
      <div className="relative">
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[#9CA3AF]">{symbol}</span>
        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="Rate"
          value={item.rate}
          onChange={e => updateItem(item.id, { rate: e.target.value })}
          className="input-field !py-2 text-sm !pl-7"
        />
      </div>
      <div className="input-field !py-2 text-sm bg-[#F7F9FC] text-right font-medium text-[#0F1115] cursor-default">
        {formatCurrency(amount, invoice.currency)}
      </div>
      <button
        type="button"
        onClick={() => removeItem(item.id)}
        className="w-9 h-9 flex items-center justify-center rounded-lg text-[#9CA3AF] hover:text-[#DC2626] hover:bg-[#FEE2E2] transition-colors shrink-0"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}
