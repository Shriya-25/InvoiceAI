import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp, DollarSign, Clock, CheckCircle, AlertCircle,
  PlusCircle, FileText, Users, ArrowUpRight, Sparkles
} from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import Badge from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';
import { getInvoices, getActivity, getProfile } from '../firebase/firestore';
import { formatCurrency, formatRelativeTime } from '../utils/formatters';
import { calcTotal, getEffectiveStatus } from '../utils/invoiceHelpers';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = { paid: '#16A34A', pending: '#D97706', overdue: '#DC2626', draft: '#9CA3AF' };

export default function Dashboard() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [activity, setActivity] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      getInvoices(user.uid),
      getActivity(user.uid, 8),
      getProfile(user.uid)
    ]).then(([inv, act, prof]) => {
      setInvoices(inv);
      setActivity(act);
      setProfile(prof);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  // Stats
  const stats = invoices.reduce((acc, inv) => {
    const status = getEffectiveStatus(inv);
    const total = calcTotal(inv);
    acc.total += total;
    acc[status] = (acc[status] || 0) + total;
    acc[`${status}Count`] = (acc[`${status}Count`] || 0) + 1;
    return acc;
  }, { total: 0, paid: 0, pending: 0, overdue: 0, draft: 0 });

  const pieData = [
    { name: 'Paid', value: stats.paidCount || 0, color: COLORS.paid },
    { name: 'Pending', value: stats.pendingCount || 0, color: COLORS.pending },
    { name: 'Overdue', value: stats.overdueCount || 0, color: COLORS.overdue },
    { name: 'Draft', value: stats.draftCount || 0, color: COLORS.draft },
  ].filter(d => d.value > 0);

  // Bar chart: last 6 months
  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const month = d.toLocaleString('default', { month: 'short' });
    const year = d.getFullYear();
    const monthInvoices = invoices.filter(inv => {
      const created = inv.createdAt?.toDate ? inv.createdAt.toDate() : new Date(inv.createdAt || 0);
      return created.getMonth() === d.getMonth() && created.getFullYear() === year;
    });
    monthlyData.push({ month, revenue: monthInvoices.reduce((s, inv) => s + calcTotal(inv), 0) });
  }

  const recentInvoices = invoices.slice(0, 5);
  const displayName = profile?.businessName || user?.displayName?.split(' ')[0] || 'there';

  const STAT_CARDS = [
    { label: 'Total Invoiced', value: formatCurrency(stats.total), icon: DollarSign, color: 'blue', change: `${invoices.length} invoices` },
    { label: 'Paid', value: formatCurrency(stats.paid), icon: CheckCircle, color: 'green', change: `${stats.paidCount || 0} paid` },
    { label: 'Pending', value: formatCurrency(stats.pending), icon: Clock, color: 'amber', change: `${stats.pendingCount || 0} pending` },
    { label: 'Overdue', value: formatCurrency(stats.overdue), icon: AlertCircle, color: 'red', change: `${stats.overdueCount || 0} overdue` },
  ];

  const colorMap = {
    blue: { bg: 'bg-[#E6F4F3]', text: 'text-[#1A998F]', card: 'border-l-[#1A998F]' },
    green: { bg: 'bg-[#DCFCE7]', text: 'text-[#16A34A]', card: 'border-l-[#16A34A]' },
    amber: { bg: 'bg-[#FEF3C7]', text: 'text-[#D97706]', card: 'border-l-[#D97706]' },
    red: { bg: 'bg-[#FEE2E2]', text: 'text-[#DC2626]', card: 'border-l-[#DC2626]' },
  };

  return (
    <AppLayout>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#0F1115]">Good {getGreeting()}, {displayName}</h1>
            <p className="text-sm text-[#6B7280] mt-0.5">Here's your invoice overview for today</p>
          </div>
          <Link to="/new-invoice" id="btn-new-invoice-dashboard">
            <button className="btn-primary">
              <PlusCircle size={16} />
              New Invoice
            </button>
          </Link>
        </div>

        {/* Stat cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card p-5 h-28 shimmer" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            {STAT_CARDS.map(({ label, value, icon: Icon, color, change }) => {
              const c = colorMap[color];
              return (
                <div key={label} className={`card p-5 border-l-4 ${c.card} hover:shadow-md transition-shadow`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center`}>
                      <Icon size={20} className={c.text} />
                    </div>
                    <span className="badge badge-blue text-xs">{change}</span>
                  </div>
                  <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1">{label}</p>
                  <p className="text-xl font-bold text-[#0F1115]">{value}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Charts & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Bar chart */}
          <div className="card p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-[#0F1115]">Revenue (Last 6 Months)</h2>
              <TrendingUp size={16} className="text-[#1A998F]" />
            </div>
            {loading ? <div className="h-48 shimmer rounded-lg" /> : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={monthlyData} barCategoryGap="40%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 12 }}
                    formatter={(v) => [formatCurrency(v), 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="#1A998F" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Pie chart */}
          <div className="card p-5">
            <h2 className="text-sm font-bold text-[#0F1115] mb-4">Invoice Status</h2>
            {loading ? <div className="h-48 shimmer rounded-lg" /> : pieData.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-sm text-[#9CA3AF]">No invoices yet</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={3}>
                      {pieData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-1.5 mt-2">
                  {pieData.map(({ name, value, color }) => (
                    <div key={name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                        <span className="text-xs text-[#6B7280]">{name}</span>
                      </div>
                      <span className="text-xs font-bold text-[#0F1115]">{value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Recent invoices + Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent invoices */}
          <div className="card lg:col-span-2">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB]">
              <h2 className="text-sm font-bold text-[#0F1115]">Recent Invoices</h2>
              <Link to="/invoices" className="text-xs font-semibold text-[#1A998F] hover:text-[#187F87] flex items-center gap-1">
                View all <ArrowUpRight size={12} />
              </Link>
            </div>
            {loading ? (
              <div className="p-5 flex flex-col gap-3">
                {[...Array(4)].map((_, i) => <div key={i} className="h-12 shimmer rounded-lg" />)}
              </div>
            ) : recentInvoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                <FileText size={32} className="text-[#D1D5DB] mb-3" />
                <p className="text-sm font-medium text-[#6B7280]">No invoices yet</p>
                <p className="text-xs text-[#9CA3AF] mb-4">Create your first invoice to get started</p>
                <Link to="/new-invoice">
                  <button className="btn-primary text-xs">
                    <PlusCircle size={14} /> New Invoice
                  </button>
                </Link>
              </div>
            ) : (
              <div>
                {recentInvoices.map(inv => {
                  const status = getEffectiveStatus(inv);
                  return (
                    <Link key={inv.id} to={`/invoices/${inv.id}`} className="table-row grid-cols-[1fr_auto_auto] hover:no-underline block">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#E6F4F3] flex items-center justify-center shrink-0">
                          <FileText size={14} className="text-[#1A998F]" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#0F1115]">{inv.invoiceNumber}</p>
                          <p className="text-xs text-[#6B7280]">{inv.client?.name || 'No client'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-[#0F1115]">{formatCurrency(calcTotal(inv), inv.currency)}</p>
                        <p className="text-xs text-[#9CA3AF]">{formatRelativeTime(inv.createdAt)}</p>
                      </div>
                      <Badge status={status} className="ml-3 shrink-0 self-start mt-1" />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col gap-4">
            <div className="card p-5">
              <h2 className="text-sm font-bold text-[#0F1115] mb-4">Quick Actions</h2>
              <div className="flex flex-col gap-2">
                <Link to="/new-invoice" id="qa-new-invoice" className="flex items-center gap-3 p-3 rounded-xl bg-[#E6F4F3] hover:bg-[#C4CFCE]/30 transition-colors group">
                  <div className="w-9 h-9 rounded-xl bg-[#1A998F] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <PlusCircle size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1A998F]">New Invoice</p>
                    <p className="text-xs text-[#6B7280]">AI or manual builder</p>
                  </div>
                </Link>
                <Link to="/new-invoice?mode=ai" id="qa-ai-invoice" className="flex items-center gap-3 p-3 rounded-xl bg-[#F5F3FF] hover:bg-[#EDE9FE] transition-colors group">
                  <div className="w-9 h-9 rounded-xl bg-purple-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Sparkles size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-purple-700">AI Generate</p>
                    <p className="text-xs text-[#6B7280]">Type a prompt, get an invoice</p>
                  </div>
                </Link>
                <Link to="/clients" id="qa-clients" className="flex items-center gap-3 p-3 rounded-xl bg-[#F0FDF4] hover:bg-[#DCFCE7] transition-colors group">
                  <div className="w-9 h-9 rounded-xl bg-[#16A34A] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Users size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#15803D]">Manage Clients</p>
                    <p className="text-xs text-[#6B7280]">Add & view clients</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Activity */}
            {activity.length > 0 && (
              <div className="card p-5">
                <h2 className="text-sm font-bold text-[#0F1115] mb-3">Recent Activity</h2>
                <div className="flex flex-col gap-2.5">
                  {activity.slice(0, 5).map(act => (
                    <div key={act.id} className="flex items-start gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#1A998F] mt-1.5 shrink-0" />
                      <div>
                        <p className="text-xs text-[#0F1115] leading-snug">{act.description}</p>
                        <p className="text-[10px] text-[#9CA3AF] mt-0.5">{formatRelativeTime(act.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
