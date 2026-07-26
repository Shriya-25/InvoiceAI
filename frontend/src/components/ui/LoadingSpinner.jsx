export default function LoadingSpinner({ size = 'md', className = '' }) {
  const s = { sm: 'w-4 h-4 border-2', md: 'w-8 h-8 border-3', lg: 'w-12 h-12 border-4' }[size];
  return (
    <div className={`${s} border-[#E5E7EB] border-t-[#1A998F] rounded-full animate-spin-slow ${className}`} />
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center h-screen w-full bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-[#E6F4F3] border-t-[#1A998F] rounded-full animate-spin-slow" />
        <span className="text-sm text-[#6B7280] font-medium">Loading InvoiceAI...</span>
      </div>
    </div>
  );
}
