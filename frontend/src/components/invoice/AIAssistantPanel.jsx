import { useState } from 'react';
import { X, Sparkles, Type, Clock, FileCheck, Mail, AlertTriangle, Copy, CheckCheck, Loader2 } from 'lucide-react';
import {
  generateDescriptionAI, suggestTermsAI, generateNotesAI,
  validateInvoiceAI, generateEmailAI
} from '../../utils/api';
import { useInvoice } from '../../context/InvoiceContext';
import toast from 'react-hot-toast';

const TOOLS = [
  { id: 'description', label: 'Description Generator', icon: Type, color: 'purple', desc: 'Polish a rough service description' },
  { id: 'terms', label: 'Payment Terms', icon: Clock, color: 'blue', desc: 'Get smart payment term suggestions' },
  { id: 'notes', label: 'Notes Generator', icon: FileCheck, color: 'green', desc: 'Generate professional invoice notes' },
  { id: 'validate', label: 'Validate Invoice', icon: AlertTriangle, color: 'amber', desc: 'Check for missing or incorrect fields' },
  { id: 'email', label: 'Email Draft', icon: Mail, color: 'indigo', desc: 'Create a covering email for this invoice' },
];

const COLOR_MAP = {
  purple: 'bg-purple-100 text-purple-600 border-purple-200',
  blue: 'bg-blue-100 text-blue-600 border-blue-200',
  green: 'bg-green-100 text-green-600 border-green-200',
  amber: 'bg-amber-100 text-amber-600 border-amber-200',
  indigo: 'bg-indigo-100 text-indigo-600 border-indigo-200',
};

export default function AIAssistantPanel({ open, onClose }) {
  const { invoice, updateInvoice } = useInvoice();
  const [activeTool, setActiveTool] = useState(null);
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const runTool = async () => {
    setLoading(true);
    setResult(null);
    try {
      let output;
      switch (activeTool) {
        case 'description':
          if (!input.trim()) { toast.error('Enter a rough description first'); setLoading(false); return; }
          output = await generateDescriptionAI(input);
          setResult({ type: 'text', content: output, label: 'Polished Description' });
          break;
        case 'terms':
          output = await suggestTermsAI({ client: invoice.client, total: invoice.items?.reduce((s,i)=>s+(i.quantity*i.rate),0) });
          setResult({ type: 'terms', content: output, label: 'Suggested Terms' });
          break;
        case 'notes':
          output = await generateNotesAI({ client: invoice.client, paymentTerms: invoice.paymentTerms });
          setResult({ type: 'text', content: output, label: 'Invoice Notes' });
          break;
        case 'validate':
          output = await validateInvoiceAI(invoice);
          setResult({ type: 'validation', content: output, label: 'Validation Report' });
          break;
        case 'email':
          output = await generateEmailAI(invoice);
          setResult({ type: 'text', content: output, label: 'Email Draft' });
          break;
      }
    } catch (e) {
      toast.error('AI service unavailable. Check backend is running.');
    }
    setLoading(false);
  };

  const copyResult = () => {
    const text = result?.type === 'terms' ? result.content.terms : result?.content;
    if (text) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const applyResult = () => {
    if (!result) return;
    if (activeTool === 'notes') { updateInvoice({ notes: result.content }); toast.success('Notes applied'); }
    if (activeTool === 'terms') { updateInvoice({ paymentTerms: result.content.terms }); toast.success('Terms applied'); }
    if (activeTool === 'description') { toast.info('Copy and paste into the relevant line item description'); }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div
        className="relative ml-auto w-full max-w-md h-full bg-white shadow-2xl overflow-y-auto animate-slide-in"
        onClick={e => e.stopPropagation()}
        style={{ animation: 'slideIn 0.25s ease-out' }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-sm">AI Assistant</h2>
              <p className="text-white/70 text-[10px]">Powered by Gemini</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-5">
          {/* Tool selector */}
          <div className="flex flex-col gap-2 mb-5">
            <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-1">Choose a tool</p>
            {TOOLS.map(({ id, label, icon: Icon, color, desc }) => (
              <button
                key={id}
                onClick={() => { setActiveTool(id); setResult(null); setInput(''); }}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                  activeTool === id
                    ? `${COLOR_MAP[color]} shadow-sm`
                    : 'bg-white border-[#E5E7EB] hover:bg-[#F7F9FC]'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${activeTool === id ? 'bg-white/60' : 'bg-[#F7F9FC]'}`}>
                  <Icon size={15} className={activeTool === id ? '' : 'text-[#6B7280]'} />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0F1115]">{label}</p>
                  <p className="text-[11px] text-[#6B7280]">{desc}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Input area */}
          {activeTool && activeTool === 'description' && (
            <div className="mb-4">
              <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2 block">Rough Description</label>
              <textarea
                rows={3}
                className="input-field resize-none w-full"
                placeholder="e.g., built login page for react app"
                value={input}
                onChange={e => setInput(e.target.value)}
              />
            </div>
          )}

          {/* Run button */}
          {activeTool && (
            <button
              onClick={runTool}
              disabled={loading}
              className="btn-primary w-full justify-center mb-5"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin-slow" />
                  Thinking...
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  Run {TOOLS.find(t => t.id === activeTool)?.label}
                </>
              )}
            </button>
          )}

          {/* Results */}
          {result && (
            <div className="border border-[#E5E7EB] rounded-xl overflow-hidden animate-fade-in">
              <div className="flex items-center justify-between px-4 py-2.5 bg-[#F7F9FC] border-b border-[#E5E7EB]">
                <span className="text-xs font-bold text-[#0F1115]">{result.label}</span>
                <div className="flex items-center gap-1.5">
                  <button onClick={copyResult} className="p-1.5 rounded-lg hover:bg-[#E5E7EB] text-[#6B7280] transition-colors">
                    {copied ? <CheckCheck size={13} className="text-green-600" /> : <Copy size={13} />}
                  </button>
                </div>
              </div>

              <div className="p-4">
                {result.type === 'text' && (
                  <p className="text-sm text-[#0F1115] leading-relaxed whitespace-pre-wrap">{result.content}</p>
                )}

                {result.type === 'terms' && (
                  <div>
                    <p className="text-base font-bold text-[#0F1115] mb-1">{result.content.terms}</p>
                    {result.content.reason && <p className="text-sm text-[#6B7280]">{result.content.reason}</p>}
                  </div>
                )}

                {result.type === 'validation' && (
                  <div>
                    {result.content.valid ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCheck size={18} />
                        <span className="text-sm font-semibold">Invoice looks good!</span>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-amber-600 mb-1">
                          <AlertTriangle size={16} />
                          <span className="text-sm font-semibold">{result.content.issues.length} issue(s) found</span>
                        </div>
                        {result.content.issues.map((issue, i) => (
                          <div key={i} className="flex items-start gap-2 p-2.5 bg-amber-50 rounded-lg border border-amber-200">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                            <div>
                              <p className="text-xs font-semibold text-amber-700">{issue.field}</p>
                              <p className="text-xs text-amber-600">{issue.message}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {(activeTool === 'notes' || activeTool === 'terms') && (
                <div className="px-4 pb-4">
                  <button onClick={applyResult} className="btn-primary w-full justify-center text-sm">
                    Apply to Invoice
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
