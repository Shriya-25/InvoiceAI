export default function Input({ label, error, className = '', wrapperClassName = '', ...props }) {
  return (
    <div className={`flex flex-col gap-1 ${wrapperClassName}`}>
      {label && (
        <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">
          {label}
        </label>
      )}
      <input className={`input-field ${error ? '!border-red-400' : ''} ${className}`} {...props} />
      {error && <span className="text-xs text-[#DC2626]">{error}</span>}
    </div>
  );
}

export function Textarea({ label, error, className = '', wrapperClassName = '', ...props }) {
  return (
    <div className={`flex flex-col gap-1 ${wrapperClassName}`}>
      {label && (
        <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">
          {label}
        </label>
      )}
      <textarea
        className={`input-field resize-none ${error ? '!border-red-400' : ''} ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-[#DC2626]">{error}</span>}
    </div>
  );
}

export function Select({ label, error, className = '', wrapperClassName = '', children, ...props }) {
  return (
    <div className={`flex flex-col gap-1 ${wrapperClassName}`}>
      {label && (
        <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">
          {label}
        </label>
      )}
      <select className={`input-field ${error ? '!border-red-400' : ''} ${className}`} {...props}>
        {children}
      </select>
      {error && <span className="text-xs text-[#DC2626]">{error}</span>}
    </div>
  );
}
