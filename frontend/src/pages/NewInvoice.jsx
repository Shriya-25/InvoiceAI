import { useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles, FileText, ArrowRight, Zap, Clock } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';

export default function NewInvoice() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const goTo = (mode) => navigate(`/invoices/new?mode=${mode}`);

  return (
    <AppLayout>
      <div className="animate-fade-in max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#0F1115]">Create New Invoice</h1>
          <p className="text-sm text-[#6B7280] mt-1">Choose how you'd like to create your invoice</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* AI Mode */}
          <button
            id="btn-ai-mode"
            onClick={() => goTo('ai')}
            className="group card p-8 text-left hover:border-purple-200 hover:shadow-xl hover:shadow-purple-100/50 transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50/80 to-teal-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-teal-500 flex items-center justify-center mb-5 shadow-lg shadow-purple-200 group-hover:scale-110 transition-transform duration-300">
                <Sparkles size={26} className="text-white" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-lg font-bold text-[#0F1115]">AI Generator</h2>
                <span className="badge badge-blue text-[10px]">
                  <Zap size={9} className="text-[#1A998F]" fill="currentColor" />
                  Recommended
                </span>
              </div>
              <p className="text-sm text-[#6B7280] mb-5">
                Describe your work in plain English and let AI generate a complete, professional invoice in seconds.
              </p>
              <div className="flex flex-col gap-2 mb-6">
                {[
                  'Just type what you did',
                  'AI fills all fields automatically',
                  'Edit before saving',
                ].map(f => (
                  <div key={f} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    <span className="text-xs text-[#6B7280]">{f}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-purple-600 group-hover:gap-3 transition-all">
                Generate with AI <ArrowRight size={16} />
              </div>
            </div>
          </button>

          {/* Manual Mode */}
          <button
            id="btn-manual-mode"
            onClick={() => goTo('manual')}
            className="group card p-8 text-left hover:border-teal-200 hover:shadow-xl hover:shadow-teal-100/50 transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-teal-50/80 to-cyan-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1A998F] to-teal-700 flex items-center justify-center mb-5 shadow-lg shadow-teal-200 group-hover:scale-110 transition-transform duration-300">
                <FileText size={26} className="text-white" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-lg font-bold text-[#0F1115]">Manual Builder</h2>
                <span className="badge badge-draft text-[10px]">
                  Full control
                </span>
              </div>
              <p className="text-sm text-[#6B7280] mb-5">
                Fill in your invoice details manually with a clean, structured form and see a live preview as you type.
              </p>
              <div className="flex flex-col gap-2 mb-6">
                {[
                  'Live preview side-by-side',
                  'Dynamic line items',
                  'Tax, discount & currency support',
                ].map(f => (
                  <div key={f} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#1A998F]" />
                    <span className="text-xs text-[#6B7280]">{f}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-[#1A998F] group-hover:gap-3 transition-all">
                Build manually <ArrowRight size={16} />
              </div>
            </div>
          </button>
        </div>

        {/* Tip */}
        <div className="mt-8 card p-4 bg-[#E6F4F3] border-[#C4CFCE]">
          <div className="flex items-start gap-3">
            <Clock size={16} className="text-[#1A998F] shrink-0 mt-0.5" />
            <p className="text-sm text-[#155665]">
              <strong>Pro tip:</strong> AI mode can create a complete invoice from a sentence like <em>"$500 for 5 hours of React development for Acme Corp, due in 30 days"</em> — try it!
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
