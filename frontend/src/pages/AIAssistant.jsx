import { useState, useEffect } from 'react';
import { Sparkles, Type, Clock, FileCheck, Mail, Copy, CheckCheck, Loader2, Key, AlertCircle } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import ApiKeySettings from '../components/ui/ApiKeySettings';
import { generateDescriptionAI, suggestTermsAI, generateNotesAI, generateEmailAI } from '../utils/api';
import toast from 'react-hot-toast';

const TOOLS = [
  { id: 'description', label: 'Description Generator', icon: Type, color: 'teal', desc: 'Convert rough work notes into a polished service statement.' },
  { id: 'terms', label: 'Payment Terms Suggester', icon: Clock, color: 'teal', desc: 'Determine professional credit conditions for client profiles.' },
  { id: 'notes', label: 'Notes Generator', icon: FileCheck, color: 'green', desc: 'Generate polite notes or footer reminders for bank receipts.' },
  { id: 'email', label: 'Email Covering Letter', icon: Mail, color: 'indigo', desc: 'Create copy-ready notification emails for sending invoices.' },
];

export default function AIAssistant() {
  const [activeTool, setActiveTool] = useState('description');
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    setHasApiKey(!!localStorage.getItem('invoice_ai_gemini_key'));
  }, []);

  const run = async () => {
    if (!hasApiKey) {
      setShowSettings(true);
      return toast.error('Please configure your Gemini API key first');
    }
    if (activeTool === 'description' && !input.trim()) {
      return toast.error('Please enter a description input');
    }
    setLoading(true);
    setResult('');
    try {
      let output;
      if (activeTool === 'description') {
        output = await generateDescriptionAI(input);
      } else if (activeTool === 'terms') {
        const data = await suggestTermsAI({ client: { name: input || 'Client' } });
        output = `Suggested terms: ${data.terms}\nReasoning: ${data.reason}`;
      } else if (activeTool === 'notes') {
        output = await generateNotesAI({ notes: input });
      } else if (activeTool === 'email') {
        output = await generateEmailAI({ client: { name: 'Client' }, items: [{ description: input || 'Services', quantity: 1, rate: 1000 }] });
      }
      setResult(output);
    } catch {
      toast.error('AI assistant route failed. Check server is active on 5001.');
    }
    setLoading(false);
  };

  const copy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppLayout>
      <div className="animate-fade-in max-w-4xl mx-auto">
        <div className="mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#1A998F] to-[#155665] flex items-center justify-center">
            <Sparkles size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-[#102E3C]">AI Assistant Playground</h1>
            <p className="text-sm text-[#6B7280]">Run standalone copy-ready invoice generators powered by Gemini</p>
          </div>
          <button
            onClick={() => setShowSettings(s => !s)}
            className={`btn-secondary !py-2 !px-3 text-xs ${hasApiKey ? '' : '!border-amber-300 !bg-amber-50 !text-amber-700'}`}
          >
            <Key size={14} />
            {hasApiKey ? 'API Key Settings' : 'Set API Key'}
          </button>
        </div>

        {/* API Key Warning Banner */}
        {!hasApiKey && !showSettings && (
          <div className="mb-6 flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 animate-fade-in">
            <AlertCircle size={18} className="text-amber-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800">Gemini API Key Required</p>
              <p className="text-xs text-amber-600 mt-0.5">You need to configure your API key to use AI features.</p>
            </div>
            <button onClick={() => setShowSettings(true)} className="btn-primary !py-1.5 !px-3 text-xs !bg-amber-600 hover:!bg-amber-700">
              Configure Now
            </button>
          </div>
        )}

        {/* API Key Settings Panel */}
        {showSettings && (
          <div className="mb-6 animate-fade-in">
            <ApiKeySettings onKeyChange={(key) => {
              setHasApiKey(!!key);
              if (key) setShowSettings(false);
            }} />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Menu */}
          <div className="flex flex-col gap-2.5">
            {TOOLS.map(({ id, label, icon: Icon, color, desc }) => (
              <button
                key={id}
                onClick={() => {
                  setActiveTool(id);
                  setResult('');
                  setInput('');
                }}
                className={`p-4 rounded-xl border text-left transition-all ${
                  activeTool === id
                    ? 'bg-white border-[#1A998F] shadow-md border-l-4 border-l-[#1A998F]'
                    : 'bg-white border-[#E5E7EB] hover:bg-[#F4F7F6]'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Icon size={16} className={activeTool === id ? 'text-[#1A998F]' : 'text-[#6B7280]'} />
                  <span className="text-sm font-bold text-[#102E3C]">{label}</span>
                </div>
                <p className="text-xs text-[#6B7280] leading-relaxed">{desc}</p>
              </button>
            ))}
          </div>

          {/* Workbench */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <div className="card p-5">
              <h2 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-3">Input Context</h2>
              
              <textarea
                rows={4}
                className="input-field resize-none w-full"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={
                  activeTool === 'description' ? 'e.g. built login page for react app using tailwind css' :
                  activeTool === 'terms' ? 'Enter client name or business profile details' :
                  activeTool === 'notes' ? 'Enter raw payment notes, bank info, or specific requirements' :
                  'Enter brief summary of work done or item details'
                }
              />

              <button
                onClick={run}
                disabled={loading}
                className="btn-primary w-full justify-center mt-4 py-2.5"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin-slow" />
                    Thinking...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Run Generator
                  </>
                )}
              </button>
            </div>

            {/* Output */}
            {result && (
              <div className="card border-[#C4CFCE] bg-gradient-to-br from-teal-50/40 to-white overflow-hidden animate-fade-in">
                <div className="flex items-center justify-between px-5 py-3 border-b border-[#E5E7EB] bg-white">
                  <span className="text-xs font-bold text-[#1A998F] flex items-center gap-1.5">
                    <Sparkles size={13} /> AI Generated Output
                  </span>
                  <button onClick={copy} className="btn-secondary !py-1 !px-2.5 flex items-center gap-1 text-xs">
                    {copied ? <CheckCheck size={13} className="text-green-600" /> : <Copy size={13} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="p-5 text-sm text-[#102E3C] leading-relaxed whitespace-pre-wrap">
                  {result}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
