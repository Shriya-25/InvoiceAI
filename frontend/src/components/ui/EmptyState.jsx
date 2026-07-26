export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-[#EFF4FF] flex items-center justify-center mb-4">
          <Icon size={28} className="text-[#2563EB]" />
        </div>
      )}
      <h3 className="text-base font-bold text-[#0F1115] mb-1">{title}</h3>
      {description && <p className="text-sm text-[#6B7280] max-w-xs mb-6">{description}</p>}
      {action && <div className="w-full max-w-xs">{action}</div>}
    </div>
  );
}
