import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

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

export function Select({ label, error, className = '', wrapperClassName = '', children, value, onChange, ...props }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const options = React.Children.map(children, child => {
    if (child && child.type === 'option') {
      return { value: child.props.value, label: child.props.children, disabled: child.props.disabled };
    }
    return null;
  }).filter(Boolean);

  const selectedOption = options.find(opt => String(opt.value) === String(value)) || options[0];

  return (
    <div className={`flex flex-col gap-1 ${wrapperClassName}`} ref={dropdownRef}>
      {label && (
        <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`input-field w-full flex items-center justify-between text-left ${error ? '!border-red-400' : ''} ${className}`}
          {...props}
        >
          <span className="truncate">{selectedOption?.label || 'Select...'}</span>
          <ChevronDown size={14} className={`text-[#9CA3AF] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        {isOpen && (
          <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-[#E5E7EB] rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.12)] overflow-hidden max-h-60 overflow-y-auto">
            {options.map((opt, idx) => (
              <button
                key={idx}
                type="button"
                disabled={opt.disabled}
                onClick={() => {
                  if (onChange && !opt.disabled) {
                    onChange({ target: { value: opt.value } });
                  }
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2.5 text-sm transition-colors text-left ${
                  String(opt.value) === String(value) ? 'bg-[#F7F9FC] text-[#1A998F] font-semibold' : 'text-[#0F1115] hover:bg-[#F7F9FC]'
                } ${opt.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
      {error && <span className="text-xs text-[#DC2626]">{error}</span>}
    </div>
  );
}
