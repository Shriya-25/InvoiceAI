import { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Save, Trash2, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

const STORAGE_KEY = 'invoice_ai_gemini_key';

export default function ApiKeySettings({ onKeyChange }) {
  const [apiKey, setApiKey] = useState('');
  const [savedKey, setSavedKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null); // 'success' | 'error' | null

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) || '';
    setSavedKey(stored);
    setApiKey(stored);
  }, []);

  const maskKey = (key) => {
    if (!key || key.length < 10) return '••••••••';
    return key.slice(0, 6) + '•'.repeat(Math.min(key.length - 10, 20)) + key.slice(-4);
  };

  const handleSave = () => {
    const trimmed = apiKey.trim();
    if (!trimmed) {
      toast.error('Please enter a valid API key');
      return;
    }
    localStorage.setItem(STORAGE_KEY, trimmed);
    setSavedKey(trimmed);
    setTestResult(null);
    onKeyChange?.(trimmed);
    toast.success('API key saved successfully');
  };

  const handleClear = () => {
    localStorage.removeItem(STORAGE_KEY);
    setApiKey('');
    setSavedKey('');
    setTestResult(null);
    onKeyChange?.('');
    toast.success('API key removed');
  };

  const handleTest = async () => {
    if (!savedKey) {
      toast.error('Save your API key first');
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/ai/generate-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-api-key': savedKey,
        },
        body: JSON.stringify({ context: 'Test connection: describe a web development project' }),
      });
      const data = await res.json();
      if (data.success) {
        setTestResult('success');
        toast.success('API key is valid — connection successful!');
      } else {
        setTestResult('error');
        toast.error(data.error || 'API key test failed');
      }
    } catch {
      setTestResult('error');
      toast.error('Connection failed. Make sure the backend server is running.');
    }
    setTesting(false);
  };

  const hasKey = !!savedKey;

  return (
    <div className="card border-[#C4CFCE] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-[#E6F4F3] to-white border-b border-[#E5E7EB]">
        <div className="w-9 h-9 rounded-xl bg-[#1A998F] flex items-center justify-center shadow-sm">
          <Key size={16} className="text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-[#102E3C]">Gemini API Key</h3>
          <p className="text-xs text-[#6B7280]">Required for AI features to work</p>
        </div>
        {hasKey && (
          <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
            testResult === 'success' ? 'bg-green-100 text-green-700' :
            testResult === 'error' ? 'bg-red-100 text-red-700' :
            'bg-[#E6F4F3] text-[#1A998F]'
          }`}>
            {testResult === 'success' ? <><CheckCircle size={12} /> Verified</> :
             testResult === 'error' ? <><AlertCircle size={12} /> Invalid</> :
             <><Key size={12} /> Configured</>}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col gap-4">
        {/* Input */}
        <div className="relative">
          <Key size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            type={showKey ? 'text' : 'password'}
            placeholder="Enter your Gemini API key..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="input-field !pl-9 !pr-10 text-sm font-mono"
          />
          <button
            type="button"
            onClick={() => setShowKey(s => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
          >
            {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>

        {/* Current key display */}
        {hasKey && apiKey === savedKey && (
          <div className="flex items-center gap-2 text-xs text-[#6B7280] bg-[#F4F7F6] rounded-lg px-3 py-2">
            <Key size={12} className="text-[#9CA3AF]" />
            <span>Current key: <code className="font-mono text-[#102E3C]">{maskKey(savedKey)}</code></span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={!apiKey.trim() || apiKey.trim() === savedKey}
            className="btn-primary !py-2 !px-4 text-xs"
          >
            <Save size={13} /> Save Key
          </button>
          <button
            onClick={handleTest}
            disabled={testing || !hasKey}
            className="btn-secondary !py-2 !px-4 text-xs"
          >
            {testing ? (
              <span className="w-3 h-3 border-2 border-[#C4CFCE] border-t-[#1A998F] rounded-full animate-spin-slow" />
            ) : (
              <CheckCircle size={13} />
            )}
            {testing ? 'Testing...' : 'Test Connection'}
          </button>
          {hasKey && (
            <button
              onClick={handleClear}
              className="btn-danger !py-2 !px-4 text-xs ml-auto"
            >
              <Trash2 size={13} /> Remove
            </button>
          )}
        </div>

        {/* Help text */}
        <p className="text-xs text-[#9CA3AF] leading-relaxed">
          Get your free API key from{' '}
          <a
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#1A998F] font-semibold hover:underline inline-flex items-center gap-0.5"
          >
            Google AI Studio <ExternalLink size={10} />
          </a>
          . Your key is stored locally in your browser and never shared.
        </p>
      </div>
    </div>
  );
}
