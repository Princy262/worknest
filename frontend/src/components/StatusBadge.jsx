import { STATUS_LABELS } from '../constants';

// Works for both employment status and company status (they share the same values).
const styles = {
  ACTIVE: 'bg-status-active-soft text-status-active-text',
  ON_LEAVE: 'bg-status-leave-soft text-status-leave-text',
  INACTIVE: 'bg-status-inactive-soft text-status-inactive-text',
};

const StatusBadge = ({ status }) => (
  <span
    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
      styles[status] || 'bg-background text-muted'
    }`}
  >
    {STATUS_LABELS[status] || status}
  </span>
);

export default StatusBadge;