import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText, Search, PlusCircle, MoreVertical, Copy, Archive,
  CheckCircle, Trash2, Download, Edit2, Filter
} from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';
import {
  getInvoices, updateInvoice, deleteInvoice, createInvoice, logActivity
} from '../firebase/firestore';
import { formatCurrency, formatDate } from '../utils/formatters';
import { calcTotal, getEffectiveStatus, generateInvoiceNumber } from '../utils/invoiceHelpers';
import { exportInvoicePDF } from '../utils/pdfExport';
import toast from 'react-hot-toast';

const TABS = ['All', 'Draft', 'Pending', 'Paid', 'Archived'];

export default function InvoiceList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('All');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [menuOpen, setMenuOpen] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);

  const load = () => {
    if (!user) return;
    getInvoices(user.uid).then(invs => { setInvoices(invs); setLoading(false); });
  };

  useEffect(() => { load(); }, [user]);

  const filtered = invoices
    .filter(inv => {
      const status = getEffectiveStatus(inv);
      if (tab !== 'All' && status !== tab.toLowerCase()) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          inv.invoiceNumber?.toLowerCase().includes(q) ||
          inv.client?.name?.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'amount') return calcTotal(b) - calcTotal(a);
      if (sortBy === 'client') return (a.client?.name || '').localeCompare(b.client?.name || '');
      const ad = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
      const bd = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
      return bd - ad;
    });

  const handleAction = async (action, inv) => {
    setMenuOpen(null);
    try {
      switch (action) {
        case 'edit': navigate(`/invoices/${inv.id}?mode=manual`); break;
        case 'duplicate': {
          const { id, createdAt, updatedAt, ...rest } = inv;
          await createInvoice(user.uid, { ...rest, invoiceNumber: generateInvoiceNumber(), status: 'draft' });
          await logActivity(user.uid, { type: 'duplicated', invoiceId: id, description: `Duplicated invoice ${inv.invoiceNumber}` });
          toast.success('Invoice duplicated'); load(); break;
        }
        case 'markPaid': {
          await updateInvoice(user.uid, inv.id, { status: 'paid' });
          await logActivity(user.uid, { type: 'paid', invoiceId: inv.id, description: `Marked ${inv.invoiceNumber} as paid` });
          toast.success('Marked as paid'); load(); break;
        }
        case 'archive': {
          await updateInvoice(user.uid, inv.id, { status: 'archived' });
          toast.success('Archived'); load(); break;
        }
        case 'pdf':
          await exportInvoicePDF(inv, {});
          toast.success('PDF downloaded'); break;
        case 'delete': setDeleteModal(inv); break;
      }
    } catch { toast.error('Action failed'); }
  };

  const confirmDelete = async () => {
    if (!deleteModal) return;
    await deleteInvoice(user.uid, deleteModal.id);
    toast.success('Invoice deleted');
    setDeleteModal(null);
    load();
  };

  const tabCounts = TABS.reduce((acc, t) => {
    acc[t] = t === 'All' ? invoices.length : invoices.filter(i => getEffectiveStatus(i) === t.toLowerCase()).length;
    return acc;
  }, {});

  return (
    <AppLayout>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#0F1115]">Invoices</h1>
            <p className="text-sm text-[#6B7280] mt-0.5">{invoices.length} total invoice{invoices.length !== 1 ? 's' : ''}</p>
          </div>
          <Link to="/new-invoice">
            <button id="btn-create-invoice" className="btn-primary">
              <PlusCircle size={16} /> New Invoice
            </button>
          </Link>
        </div>

        <div className="card overflow-hidden">
          {/* Filter tabs */}
          <div className="flex items-center gap-1 px-4 pt-4 pb-0 border-b border-[#E5E7EB] overflow-x-auto">
            {TABS.map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                  tab === t
                    ? 'border-[#1A998F] text-[#1A998F]'
                    : 'border-transparent text-[#6B7280] hover:text-[#0F1115]'
                }`}
              >
                {t}
                {tabCounts[t] > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    tab === t ? 'bg-[#E6F4F3] text-[#1A998F]' : 'bg-[#F3F4F6] text-[#9CA3AF]'
                  }`}>
                    {tabCounts[t]}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search + sort bar */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-[#E5E7EB]">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                id="invoice-search"
                className="input-field !pl-8 !py-2 text-sm"
                placeholder="Search by invoice # or client..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-1.5">
              <Filter size={14} className="text-[#9CA3AF]" />
              <select
                className="input-field !py-2 !px-3 text-sm w-auto"
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
              >
                <option value="date">Sort: Date</option>
                <option value="amount">Sort: Amount</option>
                <option value="client">Sort: Client</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="p-6 flex flex-col gap-3">
              {[...Array(5)].map((_, i) => <div key={i} className="h-14 shimmer rounded-lg" />)}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={FileText}
              title={search ? 'No matching invoices' : 'No invoices yet'}
              description={search ? 'Try a different search term' : 'Create your first invoice to get started'}
              action={!search && (
                <Link to="/new-invoice" className="w-full">
                  <button className="btn-primary w-full justify-center">
                    <PlusCircle size={16} /> Create Invoice
                  </button>
                </Link>
              )}
            />
          ) : (
            <>
              {/* Column headers */}
              <div className="grid grid-cols-[auto_1fr_140px_120px_110px_48px] gap-4 px-5 py-2 bg-[#F9FAFB] border-b border-[#E5E7EB]">
                {['', 'Invoice / Client', 'Amount', 'Due Date', 'Status', ''].map((h, i) => (
                  <span key={i} className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">{h}</span>
                ))}
              </div>
              {filtered.map(inv => {
                const status = getEffectiveStatus(inv);
                return (
                  <div
                    key={inv.id}
                    className="grid grid-cols-[auto_1fr_140px_120px_110px_48px] gap-4 items-center px-5 py-3.5 border-b border-[#F3F4F6] last:border-0 hover:bg-[#FAFAFA] transition-colors group cursor-pointer"
                    onClick={() => navigate(`/invoices/${inv.id}`)}
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#E6F4F3] flex items-center justify-center">
                      <FileText size={15} className="text-[#1A998F]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#0F1115]">{inv.invoiceNumber}</p>
                      <p className="text-xs text-[#6B7280]">{inv.client?.name || '—'}</p>
                    </div>
                    <p className="text-sm font-semibold text-[#0F1115]">{formatCurrency(calcTotal(inv), inv.currency)}</p>
                    <p className="text-xs text-[#6B7280]">{formatDate(inv.dueDate)}</p>
                    <Badge status={status} />
                    <div className="relative" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => setMenuOpen(menuOpen === inv.id ? null : inv.id)}
                        className="p-1.5 rounded-lg hover:bg-[#E5E7EB] text-[#9CA3AF] hover:text-[#6B7280] transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <MoreVertical size={16} />
                      </button>
                      {menuOpen === inv.id && (
                        <div className="absolute right-0 top-8 z-20 bg-white border border-[#E5E7EB] rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.12)] overflow-hidden min-w-[160px]">
                          {[
                            { action: 'edit', icon: Edit2, label: 'Edit' },
                            { action: 'duplicate', icon: Copy, label: 'Duplicate' },
                            { action: 'markPaid', icon: CheckCircle, label: 'Mark as Paid' },
                            { action: 'pdf', icon: Download, label: 'Download PDF' },
                            { action: 'archive', icon: Archive, label: 'Archive' },
                            { action: 'delete', icon: Trash2, label: 'Delete', danger: true },
                          ].map(({ action, icon: Icon, label, danger }) => (
                            <button
                              key={action}
                              onClick={() => handleAction(action, inv)}
                              className={`flex items-center gap-2.5 w-full px-4 py-2.5 text-sm transition-colors text-left ${
                                danger
                                  ? 'text-[#DC2626] hover:bg-[#FEE2E2]'
                                  : 'text-[#0F1115] hover:bg-[#F7F9FC]'
                              }`}
                            >
                              <Icon size={14} />
                              {label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>

      {/* Delete confirmation */}
      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title="Delete Invoice">
        <p className="text-sm text-[#6B7280] mb-5">
          Are you sure you want to delete invoice <strong>{deleteModal?.invoiceNumber}</strong>? This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <button className="btn-secondary" onClick={() => setDeleteModal(null)}>Cancel</button>
          <button className="btn-danger" onClick={confirmDelete}>
            <Trash2 size={15} /> Delete
          </button>
        </div>
      </Modal>
    </AppLayout>
  );
}
