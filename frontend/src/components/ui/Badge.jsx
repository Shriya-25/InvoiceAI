import { getStatusColor } from '../../utils/invoiceHelpers';

const STATUS_LABELS = {
  paid: 'Paid',
  pending: 'Pending',
  overdue: 'Overdue',
  draft: 'Draft',
  archived: 'Archived',
};

export default function Badge({ status, children, className = '' }) {
  const colorClass = status ? getStatusColor(status) : 'badge-blue';
  const label = status ? STATUS_LABELS[status] || status : children;
  return (
    <span className={`badge ${colorClass} ${className}`}>
      {status && (
        <span
          className="inline-block w-1.5 h-1.5 rounded-full"
          style={{
            background: status === 'paid' ? '#15803D' :
              status === 'pending' ? '#B45309' :
              status === 'overdue' ? '#B91C1C' : '#9CA3AF'
          }}
        />
      )}
      {label}
    </span>
  );
}
