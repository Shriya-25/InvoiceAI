import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, MapPin, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import Badge from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';
import { getClient, getInvoices } from '../firebase/firestore';
import { formatCurrency, formatDate } from '../utils/formatters';
import { calcTotal, getEffectiveStatus } from '../utils/invoiceHelpers';

export default function ClientDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !id) return;
    Promise.all([
      getClient(user.uid, id),
      getInvoices(user.uid)
    ]).then(([clientData, allInvoices]) => {
      setClient(clientData);
      // Filter invoices for this client
      // Note: We match by client name or ID if available
      const clientInvoices = allInvoices.filter(inv => 
        inv.clientId === id || inv.client?.name === clientData?.name
      );
      setInvoices(clientInvoices);
      setLoading(false);
    }).catch((e) => {
      console.error(e);
      setLoading(false);
    });
  }, [user, id]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-[#E6F4F3] border-t-[#1A998F] rounded-full animate-spin-slow" />
        </div>
      </AppLayout>
    );
  }

  if (!client) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-sm font-semibold text-[#6B7280]">Client not found</p>
          <button onClick={() => navigate('/clients')} className="btn-primary mt-4">
            Back to Clients
          </button>
        </div>
      </AppLayout>
    );
  }

  // Calculate client-specific stats
  const clientStats = invoices.reduce((acc, inv) => {
    const status = getEffectiveStatus(inv);
    const total = calcTotal(inv);
    acc.total += total;
    if (status === 'paid') acc.paid += total;
    else if (status === 'pending') acc.pending += total;
    else if (status === 'overdue') acc.overdue += total;
    return acc;
  }, { total: 0, paid: 0, pending: 0, overdue: 0 });

  return (
    <AppLayout>
      <div className="animate-fade-in">
        {/* Back Link & Title */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/clients')} className="p-2 rounded-lg hover:bg-[#F7F9FC] text-[#6B7280] hover:text-[#0F1115] transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[#0F1115]">{client.name}</h1>
            <p className="text-sm text-[#6B7280]">Client Profile & History</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Details Card */}
          <div className="card p-6 flex flex-col gap-6 h-fit">
            <div>
              <h2 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-4">Contact Info</h2>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 text-sm text-[#0F1115]">
                  <Mail size={16} className="text-[#6B7280]" />
                  <span className="truncate">{client.email || 'No email provided'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-[#0F1115]">
                  <Phone size={16} className="text-[#6B7280]" />
                  <span>{client.phone || 'No phone number'}</span>
                </div>
                {client.gstNumber && (
                  <div className="flex items-center gap-3 text-sm text-[#0F1115]">
                    <span className="text-[10px] font-bold text-[#6B7280] uppercase border border-[#E5E7EB] px-1 rounded">GST</span>
                    <span>{client.gstNumber}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-[#E5E7EB] pt-4">
              <h2 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2">Address</h2>
              <div className="flex gap-2.5 items-start text-sm text-[#6B7280]">
                <MapPin size={16} className="mt-0.5 shrink-0" />
                <p className="whitespace-pre-line leading-relaxed">{client.address || 'No billing address provided'}</p>
              </div>
            </div>
          </div>

          {/* Stats & History Invoices */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="card p-4">
                <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wide mb-1">Total Invoiced</p>
                <p className="text-lg font-bold text-[#0F1115]">{formatCurrency(clientStats.total)}</p>
              </div>
              <div className="card p-4 border-l-4 border-l-[#16A34A]">
                <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wide mb-1">Paid Revenue</p>
                <p className="text-lg font-bold text-[#16A34A]">{formatCurrency(clientStats.paid)}</p>
              </div>
              <div className="card p-4 border-l-4 border-l-[#D97706]">
                <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wide mb-1">Outstanding</p>
                <p className="text-lg font-bold text-[#D97706]">{formatCurrency(clientStats.pending + clientStats.overdue)}</p>
              </div>
            </div>

            {/* Invoices List */}
            <div className="card">
              <div className="px-5 py-4 border-b border-[#E5E7EB]">
                <h2 className="text-sm font-bold text-[#0F1115]">Invoice History</h2>
              </div>

              {invoices.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText size={32} className="text-[#D1D5DB] mb-2" />
                  <p className="text-sm font-medium text-[#6B7280]">No invoices for this client</p>
                  <Link to={`/invoices/new?mode=manual`} className="mt-3">
                    <button className="btn-primary text-xs">Create Invoice</button>
                  </Link>
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-[1fr_120px_100px_100px] gap-4 px-5 py-2 bg-[#F9FAFB] border-b border-[#E5E7EB]">
                    {['Invoice Number', 'Amount', 'Due Date', 'Status'].map((h, i) => (
                      <span key={i} className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">{h}</span>
                    ))}
                  </div>

                  {invoices.map(inv => {
                    const status = getEffectiveStatus(inv);
                    return (
                      <Link
                        key={inv.id}
                        to={`/invoices/${inv.id}`}
                        className="grid grid-cols-[1fr_120px_100px_100px] gap-4 items-center px-5 py-3.5 border-b border-[#F3F4F6] last:border-0 hover:bg-[#FAFAFA] transition-colors"
                      >
                        <span className="text-sm font-semibold text-[#1A998F] hover:underline">{inv.invoiceNumber}</span>
                        <span className="text-sm font-bold text-[#0F1115]">{formatCurrency(calcTotal(inv), inv.currency)}</span>
                        <span className="text-xs text-[#6B7280]">{formatDate(inv.dueDate)}</span>
                        <Badge status={status} />
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
