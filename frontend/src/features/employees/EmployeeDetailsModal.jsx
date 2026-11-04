import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import { EMPLOYMENT_STATUS, ROLE_LABELS } from '../../constants';
import { getInitials } from '../../utils/format';

const Row = ({ label, value }) => (
  <div className="flex justify-between gap-4 px-4 py-3 text-sm">
    <dt className="text-muted">{label}</dt>
    <dd className="font-medium text-ink text-right wrap-break-word">{value || '-'}</dd>
  </div>
);

const EmployeeDetailsModal = ({ employee, canManage, onEdit, onDeactivate, onClose }) => (
  <Modal title="Employee details" onClose={onClose} size="lg">
    <div className="flex items-center gap-4 mb-5">
      <span className="h-14 w-14 shrink-0 rounded-full bg-accent text-dark text-lg font-semibold flex items-center justify-center">
        {getInitials(employee.name)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-lg font-semibold text-dark truncate">{employee.name}</p>
        <p className="text-sm text-muted">
          {ROLE_LABELS[employee.role]}
          {employee.designation && employee.designation !== ROLE_LABELS[employee.role]
            ? ` · ${employee.designation}`
            : ''}
        </p>
      </div>
      <StatusBadge status={employee.employmentStatus} />
    </div>

    <div className="grid gap-5 md:grid-cols-2">
      <dl className="border border-line rounded-xl divide-y divide-line">
        <Row label="Employee ID" value={employee.employeeId} />
        <Row label="Username" value={employee.username} />
        <Row label="Email" value={employee.email} />
        <Row label="Department" value={employee.department?.name} />
        <Row label="Team" value={employee.team?.name} />
        <Row label="Reports to" value={employee.reportingManager?.name} />
      </dl>

      <dl className="border border-line rounded-xl divide-y divide-line self-start">
        <Row label="Phone" value={employee.contact?.phone} />
        <Row label="Address" value={employee.contact?.address} />
        <Row label="Emergency contact" value={employee.contact?.emergencyContact} />
      </dl>
    </div>

    {canManage && (
      <div className="flex justify-end gap-3 mt-6">
        {employee.employmentStatus !== EMPLOYMENT_STATUS.INACTIVE && (
          <button
            onClick={onDeactivate}
            className="rounded-lg border border-status-inactive-text text-status-inactive-text hover:bg-status-inactive-soft text-sm font-medium px-5 py-2.5"
          >
            Deactivate
          </button>
        )}
        <button
          onClick={onEdit}
          className="rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-medium px-5 py-2.5 transition-colors"
        >
          Edit
        </button>
      </div>
    )}
  </Modal>
);

export default EmployeeDetailsModal;