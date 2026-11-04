import { useSelector } from 'react-redux';
import { Users, Building2, Network } from 'lucide-react';
import useDashboardData from '../features/dashboard/useDashboardData';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import { getInitials, formatDate } from '../utils/format';

// One "label ........ value" line
const Row = ({ label, value }) => (
  <div className="flex justify-between gap-4 px-5 py-3 text-sm">
    <dt className="text-muted">{label}</dt>
    <dd className="font-medium text-ink text-right wrap-break-word">{value || '-'}</dd>
  </div>
);

const CompanyPage = () => {
  const { user } = useSelector((state) => state.auth);
  const { data, loading, error } = useDashboardData(user.role);
  const company = user.company;

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-dark">Company</h1>
        <p className="text-muted">Your organization at a glance.</p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-6 rounded-lg border border-status-inactive/30 bg-status-inactive-soft px-4 py-3 text-sm text-status-inactive-text"
        >
          {error}
        </div>
      )}

      {/* Details */}
      <div className="bg-surface border border-line rounded-2xl mb-6">
        <div className="flex items-center gap-5 p-6 border-b border-line">
          <span className="h-16 w-16 shrink-0 rounded-xl bg-primary text-white text-xl font-semibold flex items-center justify-center">
            {getInitials(company?.name)}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-semibold text-dark truncate">{company?.name}</h2>
            <p className="text-sm text-muted">{company?.domain || 'No domain set'}</p>
          </div>
          <StatusBadge status={company?.status} />
        </div>

        <dl className="divide-y divide-line">
          <Row label="Company Head" value={user.name} />
          <Row label="Head's email" value={user.email} />
          <Row label="Created" value={formatDate(company?.createdAt)} />
        </dl>
      </div>

      {/* Totals */}
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <StatCard icon={Users} label="Active people" value={data?.people} loading={loading} />
        <StatCard icon={Building2} label="Departments" value={data?.departments.length} tone="accent" loading={loading} />
        <StatCard icon={Network} label="Teams" value={data?.teams.length} tone="secondary" loading={loading} />
      </div>

      <p className="text-sm text-muted">
        To rename the company or change its status, contact the WorkNest Platform Owner.
      </p>
    </div>
  );
};

export default CompanyPage;