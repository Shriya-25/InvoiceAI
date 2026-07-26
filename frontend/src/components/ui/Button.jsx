export default function Button({ children, variant = 'primary', size = 'md', className = '', loading = false, icon, ...props }) {
  const base = variant === 'primary' ? 'btn-primary' : variant === 'danger' ? 'btn-danger' : 'btn-secondary';
  const sizeClass = size === 'sm' ? '!py-1 !px-3 !text-xs' : size === 'lg' ? '!py-3 !px-6 !text-base' : '';
  return (
    <button className={`${base} ${sizeClass} ${className}`} disabled={loading || props.disabled} {...props}>
      {loading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin-slow" />
      ) : icon}
      {children}
    </button>
  );
}
