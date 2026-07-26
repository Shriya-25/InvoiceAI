import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Search, User, Mail, Phone, MapPin, Eye, Edit2, Trash2 } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';
import { getClients, createClient, updateClient, deleteClient, logActivity } from '../firebase/firestore';
import toast from 'react-hot-toast';

export default function Clients() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    gstNumber: ''
  });

  const load = () => {
    if (!user) return;
    getClients(user.uid).then(res => {
      setClients(res);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [user]);

  const openAddModal = () => {
    setEditingClient(null);
    setForm({ name: '', email: '', phone: '', address: '', gstNumber: '' });
    setModalOpen(true);
  };

  const openEditModal = (client) => {
    setEditingClient(client);
    setForm({
      name: client.name || '',
      email: client.email || '',
      phone: client.phone || '',
      address: client.address || '',
      gstNumber: client.gstNumber || ''
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Client name is required');
    try {
      if (editingClient) {
        await updateClient(user.uid, editingClient.id, form);
        await logActivity(user.uid, {
          type: 'client_updated',
          description: `Updated client details for ${form.name}`
        });
        toast.success('Client updated');
      } else {
        await createClient(user.uid, form);
        await logActivity(user.uid, {
          type: 'client_created',
          description: `Added new client: ${form.name}`
        });
        toast.success('Client added');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error('Failed to save client');
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    try {
      await deleteClient(user.uid, deleteModal.id);
      await logActivity(user.uid, {
        type: 'client_deleted',
        description: `Deleted client ${deleteModal.name}`
      });
      toast.success('Client deleted');
      setDeleteModal(null);
      load();
    } catch {
      toast.error('Failed to delete client');
    }
  };

  const filtered = clients.filter(c => {
    const q = search.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.gstNumber?.toLowerCase().includes(q)
    );
  });

  return (
    <AppLayout>
      <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#0F1115]">Clients</h1>
            <p className="text-sm text-[#6B7280] mt-0.5">{clients.length} client record{clients.length !== 1 ? 's' : ''}</p>
          </div>
          <button id="btn-add-client" onClick={openAddModal} className="btn-primary">
            <PlusCircle size={16} /> New Client
          </button>
        </div>

        <div className="card overflow-hidden">
          {/* Search bar */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-[#E5E7EB]">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                id="client-search"
                className="input-field !pl-8 !py-2 text-sm"
                placeholder="Search by client name, email or GST..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="p-6 flex flex-col gap-3">
              {[...Array(3)].map((_, i) => <div key={i} className="h-14 shimmer rounded-lg" />)}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={User}
              title={search ? 'No matching clients' : 'No clients yet'}
              description={search ? 'Try a different search term' : 'Add clients to easily autofill their info in invoices'}
              action={!search && (
                <button onClick={openAddModal} className="btn-primary w-full justify-center">
                  <PlusCircle size={16} /> Add First Client
                </button>
              )}
            />
          ) : (
            <div>
              {/* Header */}
              <div className="grid grid-cols-[1fr_1fr_120px_120px_90px] gap-4 px-5 py-2 bg-[#F9FAFB] border-b border-[#E5E7EB]">
                {['Client Name', 'Email', 'Phone', 'GST Number', 'Actions'].map((h, i) => (
                  <span key={i} className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">{h}</span>
                ))}
              </div>
              
              {filtered.map(c => (
                <div
                  key={c.id}
                  className="grid grid-cols-[1fr_1fr_120px_120px_90px] gap-4 items-center px-5 py-3.5 border-b border-[#F3F4F6] last:border-0 hover:bg-[#FAFAFA] transition-colors group cursor-pointer"
                  onClick={() => navigate(`/clients/${c.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#EFF4FF] flex items-center justify-center">
                      <User size={14} className="text-[#2563EB]" />
                    </div>
                    <span className="text-sm font-semibold text-[#0F1115]">{c.name}</span>
                  </div>
                  <span className="text-sm text-[#6B7280] truncate">{c.email || '—'}</span>
                  <span className="text-sm text-[#6B7280]">{c.phone || '—'}</span>
                  <span className="text-sm text-[#6B7280]">{c.gstNumber || '—'}</span>
                  <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => navigate(`/clients/${c.id}`)}
                      className="p-1.5 rounded-lg hover:bg-[#E5E7EB] text-[#6B7280] transition-colors"
                      title="View Profile"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={() => openEditModal(c)}
                      className="p-1.5 rounded-lg hover:bg-[#E5E7EB] text-[#6B7280] transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteModal(c)}
                      className="p-1.5 rounded-lg hover:bg-[#FEE2E2] text-[#9CA3AF] hover:text-[#DC2626] transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingClient ? 'Edit Client' : 'Add Client'}>
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Client Name *</label>
            <input
              className="input-field"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Acme Corporation"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Email</label>
            <input
              type="email"
              className="input-field"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="contact@acme.com"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Phone</label>
            <input
              className="input-field"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              placeholder="+91 98765 43210"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">GST Number</label>
            <input
              className="input-field"
              value={form.gstNumber}
              onChange={e => setForm({ ...form, gstNumber: e.target.value })}
              placeholder="22AAAAA0000A1Z5"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Address</label>
            <textarea
              rows={2}
              className="input-field resize-none"
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
              placeholder="123 Corporate Way, Suite 400"
            />
          </div>
          <div className="flex gap-3 justify-end mt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Save Client</button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title="Delete Client">
        <p className="text-sm text-[#6B7280] mb-5">
          Are you sure you want to delete client <strong>{deleteModal?.name}</strong>? This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <button className="btn-secondary" onClick={() => setDeleteModal(null)}>Cancel</button>
          <button className="btn-danger" onClick={handleDelete}>
            <Trash2 size={15} /> Delete
          </button>
        </div>
      </Modal>
    </AppLayout>
  );
}
