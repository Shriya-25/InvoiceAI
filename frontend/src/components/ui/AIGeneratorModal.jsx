import { useState, useEffect } from 'react';
import { Sparkles, Loader2, Check } from 'lucide-react';
import Modal from './Modal';
import toast from 'react-hot-toast';

export default function AIGeneratorModal({ open, onClose, title, promptLabel, contextData, generatorFn, onUse }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  // Auto-generate on open if contextData is already provided
  useEffect(() => {
    if (open) {
      setResult('');
      generate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const generate = async () => {
    if (loading) return;
    setLoading(true);
    setResult('');
    try {
      const output = await generatorFn(contextData);
      // Determine what field the AI returned (description, paymentTerms, note, etc.)
      const textResult = typeof output === 'object' 
        ? (output.description || output.paymentTerms || output.note || output.terms || output) 
        : output;
      setResult(textResult);
    } catch (err) {
      toast.error(err.response?.data?.error || 'AI generation failed');
      onClose();
    }
    setLoading(false);
  };

  const handleUse = () => {
    if (result) onUse(result);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="flex flex-col gap-4">
        {promptLabel && (
          <p className="text-sm text-[#6B7280]">{promptLabel}</p>
        )}

        <div className="min-h-[100px] flex items-center justify-center p-4 bg-[#F7F9FC] rounded-xl border border-[#E5E7EB]">
          {loading ? (
            <div className="flex flex-col items-center gap-2 text-[#1A998F]">
              <Loader2 className="animate-spin" size={24} />
              <span className="text-sm font-medium">Generating...</span>
            </div>
          ) : result ? (
            <p className="text-sm text-[#0F1115] whitespace-pre-wrap leading-relaxed w-full text-left">
              {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
            </p>
          ) : (
            <span className="text-sm text-[#9CA3AF]">Waiting for AI...</span>
          )}
        </div>

        <div className="flex gap-3 justify-end mt-2">
          <button onClick={generate} disabled={loading} className="btn-secondary !py-2 !px-4 text-sm">
            <Sparkles size={16} /> Regenerate
          </button>
          <button 
            onClick={handleUse} 
            disabled={loading || !result} 
            className="btn-primary !py-2 !px-4 text-sm disabled:opacity-50"
          >
            <Check size={16} /> Use This
          </button>
        </div>
      </div>
    </Modal>
  );
}
