import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { Save, Download, Sparkles, Eye, EyeOff, Loader2, ArrowLeft, Send } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import InvoiceForm from '../components/invoice/InvoiceForm';
import InvoicePreview from '../components/invoice/InvoicePreview';
import AIAssistantPanel from '../components/invoice/AIAssistantPanel';
import { InvoiceProvider, useInvoice } from '../context/InvoiceContext';
import { useAuth } from '../context/AuthContext';
import { createInvoice, updateInvoice as updateInvoiceFS, getInvoice, getProfile, logActivity } from '../firebase/firestore';
import { generateInvoiceAI } from '../utils/api';
import { exportInvoicePDF } from '../utils/pdfExport';
import { invoiceToFirestore } from '../utils/invoiceHelpers';
import toast from 'react-hot-toast';

function AIPromptBar({ onGenerate }) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      await onGenerate(prompt);
      toast.success('Invoice generated! Review and edit as needed.');
    } catch {
      toast.error('AI generation failed. Check backend is running on port 5001.');
    }
    setLoading(false);
  };

  return (
    <div className="card p-4 mb-4 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={16} className="text-purple-600" />
        <h3 className="text-sm font-bold text-purple-700">AI Invoice Generator</h3>
        <span className="badge badge-blue text-[10px]">Gemini</span>
      </div>
      <form onSubmit={handle} className="flex gap-2">
        <input
          id="ai-prompt-input"
          className="input-field flex-1 text-sm !border-purple-200 focus:!border-purple-400 focus:!shadow-purple-100"
          placeholder='e.g., "₹15,000 for 3 days of UI design for Nexus Corp, Net 30"'
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
        />
        <button type="submit" disabled={loading || !prompt.trim()} className="btn-primary !bg-purple-600 hover:!bg-purple-700 shrink-0">
          {loading ? <Loader2 size={16} className="animate-spin-slow" /> : <Sparkles size={16} />}
          {loading ? 'Generating...' : 'Generate'}
        </button>
      </form>
      <p className="text-[11px] text-purple-600/70 mt-2">
        Describe the work done, client, amount, and payment terms in plain English
      </p>
    </div>
  );
}

function EditorContent({ mode, profile }) {
  const { invoice, loadInvoice } = useInvoice();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showAI, setShowAI] = useState(false);

  const handleAIGenerate = async (prompt) => {
    const data = await generateInvoiceAI(prompt);
    loadInvoice({ ...data, source: 'ai', status: 'draft' });
  };

  const handleSave = async (newStatus) => {
    if (!user) return;
    
    if (!invoice.client?.name?.trim()) {
      toast.error('Client name is required.');
      return;
    }

    setSaving(true);
    try {
      const data = invoiceToFirestore(
        newStatus ? { ...invoice, status: newStatus } : invoice,
        user.uid
      );
      if (id && id !== 'new') {
        await updateInvoiceFS(user.uid, id, data);
        await logActivity(user.uid, { type: 'updated', invoiceId: id, description: `Updated invoice ${invoice.invoiceNumber}` });
        toast.success('Invoice updated');
      } else {
        const ref = await createInvoice(user.uid, data);
        await logActivity(user.uid, { type: 'created', invoiceId: ref.id, description: `Created invoice ${invoice.invoiceNumber}` });
        toast.success('Invoice saved');
        navigate(`/invoices/${ref.id}`, { replace: true });
      }
    } catch (e) {
      toast.error('Failed to save invoice');
      console.error(e);
    }
    setSaving(false);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportInvoicePDF(invoice, profile);
      toast.success('PDF downloaded');
    } catch (e) {
      toast.error('PDF export failed');
    }
    setExporting(false);
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-[#F7F9FC] text-[#6B7280] hover:text-[#0F1115] transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-[#0F1115]">
              {id && id !== 'new' ? 'Edit Invoice' : 'New Invoice'}
            </h1>
            <p className="text-xs text-[#6B7280]">{mode === 'ai' ? 'AI-generated' : 'Manual builder'} · {invoice.invoiceNumber}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Mobile preview toggle */}
          <button
            className="lg:hidden btn-secondary !p-2"
            onClick={() => setShowPreview(s => !s)}
            title="Toggle preview"
          >
            {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
          <button
            id="btn-ai-assistant"
            onClick={() => setShowAI(true)}
            className="btn-secondary"
          >
            <Sparkles size={15} className="text-purple-500" />
            AI Tools
          </button>
          <button
            id="btn-export-pdf"
            onClick={handleExport}
            disabled={exporting}
            className="btn-secondary"
          >
            {exporting ? <Loader2 size={15} className="animate-spin-slow" /> : <Download size={15} />}
            PDF
          </button>
          <button
            id="btn-save-draft"
            onClick={() => handleSave('draft')}
            disabled={saving}
            className="btn-secondary"
          >
            {saving ? <Loader2 size={15} className="animate-spin-slow" /> : <Save size={15} />}
            Save
          </button>
          <button
            id="btn-send-invoice"
            onClick={() => handleSave('pending')}
            disabled={saving}
            className="btn-primary"
          >
            <Send size={15} />
            Send
          </button>
        </div>
      </div>

      {/* AI Prompt Bar */}
      {mode === 'ai' && <AIPromptBar onGenerate={handleAIGenerate} />}

      {/* Split layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className={`${showPreview ? 'hidden lg:block' : ''}`}>
          <div className="card p-5">
            <InvoiceForm />
          </div>
        </div>

        {/* Preview */}
        <div className={`${!showPreview ? 'hidden lg:block' : ''}`}>
          <div className="sticky top-6">
            <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Eye size={12} /> Live Preview
            </p>
            <InvoicePreview profile={profile} />
          </div>
        </div>
      </div>

      <AIAssistantPanel open={showAI} onClose={() => setShowAI(false)} />
    </div>
  );
}

export default function InvoiceEditor() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'manual';
  const { id } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState({});
  const [initInvoice, setInitInvoice] = useState(null);
  const [loading, setLoading] = useState(id && id !== 'new');

  useEffect(() => {
    if (!user) return;
    getProfile(user.uid).then(p => setProfile(p || {}));
    if (id && id !== 'new') {
      getInvoice(user.uid, id).then(inv => {
        setInitInvoice(inv);
        setLoading(false);
      });
    }
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

  return (
    <AppLayout>
      <InvoiceProvider>
        <EditorContent mode={mode} profile={profile} />
      </InvoiceProvider>
    </AppLayout>
  );
}
