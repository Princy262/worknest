import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Search, UserPlus, Eye, Pencil, UserX } from 'lucide-react';
import api from '../api/axios';
import useDebounce from '../utils/useDebounce';
import useLookups from '../features/employees/useLookups';
import EmployeeFormModal from '../features/employees/EmployeeFormModal';
import EmployeeDetailsModal from '../features/employees/EmployeeDetailsModal';
import StatusBadge from '../components/StatusBadge';
import Pagination from '../components/Pagination';
import ConfirmDialog from '../components/ConfirmDialog';
import { ROLES, ROLE_LABELS, ROLE_LEVELS, EMPLOYMENT_STATUS, STATUS_LABELS } from '../constants';
import { getInitials } from '../utils/format';

const PAGE_SIZE = 10;
const EMPTY_FILTERS = { search: '', department: '', team: '', role: '', employmentStatus: '' };

// Role pills follow the hierarchy colors: head = teal, department = mint, team = soft teal
const ROLE_TONES = {
  [ROLES.COMPANY_HEAD]: 'bg-primary text-white',
  [ROLES.DEPT_HEAD]: 'bg-accent text-dark',
  [ROLES.TEAM_MANAGER]: 'bg-secondary/30 text-dark',
  [ROLES.EMPLOYEE]: 'bg-background text-ink border border-line',
};

const control =
  'rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:outline-none focus:border-primary focus:ring-2 focus:ring-secondary/40';
const iconButton = 'p-2 rounded-lg text-muted hover:bg-background';

const EmployeesPage = () => {
  const { user } = useSelector((state) => state.auth);
  const { departments, teams, reload: reloadLookups } = useLookups(user.role);

  const isCompanyHead = user.role === ROLES.COMPANY_HEAD;
  const isDeptHead = user.role === ROLES.DEPT_HEAD;
  const isTeamManager = user.role === ROLES.TEAM_MANAGER;

  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  // "key" records which request these results belong to, so "loading" can be worked out
  const [data, setData] = useState({ key: null, users: [], total: 0, totalPages: 1 });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const [formModal, setFormModal] = useState(null); // { mode: 'add' | 'edit', employee }
  const [details, setDetails] = useState(null);
  const [toDeactivate, setToDeactivate] = useState(null);
  const [busy, setBusy] = useState(false);

  const debouncedSearch = useDebounce(filters.search);
  const { department, team, role, employmentStatus } = filters;

  // ----- What to ask the backend for. Rebuilt only when a filter or the page changes -----
  const params = useMemo(() => {
    const next = { page, limit: PAGE_SIZE };
    if (debouncedSearch.trim()) next.search = debouncedSearch.trim();
    if (department) next.department = department;
    if (team) next.team = team;
    if (role) next.role = role;
    if (employmentStatus) next.employmentStatus = employmentStatus;
    return next;
  }, [debouncedSearch, department, team, role, employmentStatus, page]);

  // Identifies the current request. When it differs from the key on the data, we are loading.
  const requestKey = `${JSON.stringify(params)}#${reloadKey}`;
  const loading = data.key !== requestKey;

  // ----- Load the list whenever the request changes -----
  useEffect(() => {
    let cancelled = false;

    api
      .get('/users', { params })
      .then((res) => {
        if (cancelled) return;
        // After deactivating the last person on a page, step back one page
        if (res.data.users.length === 0 && params.page > 1) {
          setPage(params.page - 1);
          return;
        }
        setData({ key: requestKey, ...res.data });
        setError('');
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.response?.data?.message || 'Could not load the list.');
        setData((prev) => ({ ...prev, key: requestKey })); // stop the loading state
      });

    return () => {
      cancelled = true;
    };
  }, [params, requestKey]);

  // The green message disappears by itself
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  const updateFilter = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'department' ? { team: '' } : {}), // a new department clears the team
    }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters(EMPTY_FILTERS);
    setPage(1);
  };

  const hasFilters = Object.values(filters).some(Boolean);

  // ----- Rules for what the screen offers (the backend enforces them for real) -----
  const canManage = (target) =>
    target._id !== user._id && ROLE_LEVELS[target.role] < ROLE_LEVELS[user.role];

  const roleFilterOptions = Object.keys(ROLE_LEVELS).filter(
    (r) => ROLE_LEVELS[r] <= ROLE_LEVELS[user.role]
  );
  const teamFilterOptions = department
    ? teams.filter((t) => t.department?._id === department)
    : teams;

  // ----- Actions -----
  const afterSave = (message) => {
    setFormModal(null);
    setNotice(message);
    setReloadKey((key) => key + 1);
    reloadLookups(); // a new head or manager changes which positions are vacant
  };

  const confirmDeactivate = async () => {
    setBusy(true);
    try {
      await api.delete(`/users/${toDeactivate._id}`);
      setNotice(`${toDeactivate.name} was deactivated.`);
      setDetails(null);
      setReloadKey((key) => key + 1);
      reloadLookups();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not deactivate this user.');
    } finally {
      setToDeactivate(null);
      setBusy(false);
    }
  };

  const title = isTeamManager ? 'My Team' : 'Employees';

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-dark">{title}</h1>
          <p className="text-muted">
            {isTeamManager
              ? 'The people in your team.'
              : 'The people you are allowed to see. Search, filter and manage them here.'}
          </p>
        </div>
        <button
          onClick={() => setFormModal({ mode: 'add' })}
          className="flex items-center gap-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-medium px-4 py-2.5 transition-colors"
        >
          <UserPlus size={16} />
          Add employee
        </button>
      </div>

      {notice && (
        <div className="mb-4 rounded-lg border border-status-active/30 bg-status-active-soft px-4 py-3 text-sm text-status-active-text">
          {notice}
        </div>
      )}
      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-status-inactive/30 bg-status-inactive-soft px-4 py-3 text-sm text-status-inactive-text"
        >
          {error}
        </div>
      )}

      {/* Search and filters */}
      <div className="bg-surface border border-line rounded-2xl p-4 mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-52">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            placeholder="Search name, email, username or ID"
            className={`${control} w-full pl-9`}
          />
        </div>

        {isCompanyHead && (
          <select
            value={department}
            onChange={(e) => updateFilter('department', e.target.value)}
            className={control}
            aria-label="Department"
          >
            <option value="">All departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>
        )}

        {(isCompanyHead || isDeptHead) && (
          <select
            value={team}
            onChange={(e) => updateFilter('team', e.target.value)}
            className={control}
            aria-label="Team"
          >
            <option value="">All teams</option>
            {teamFilterOptions.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name}
              </option>
            ))}
          </select>
        )}

        <select
          value={role}
          onChange={(e) => updateFilter('role', e.target.value)}
          className={control}
          aria-label="Role"
        >
          <option value="">All roles</option>
          {roleFilterOptions.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r]}
            </option>
          ))}
        </select>

        <select
          value={employmentStatus}
          onChange={(e) => updateFilter('employmentStatus', e.target.value)}
          className={control}
          aria-label="Status"
        >
          <option value="">All statuses</option>
          {Object.values(EMPLOYMENT_STATUS).map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </select>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-sm font-medium text-primary hover:text-primary-hover"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-surface border border-line rounded-2xl overflow-hidden">
        {loading && data.users.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted">Loading people...</div>
        ) : data.users.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted">
            {hasFilters ? 'No one matches these filters.' : 'There is no one to show yet.'}
          </div>
        ) : (
          <div className={`overflow-x-auto ${loading ? 'opacity-60' : ''}`}>
            <table className="w-full min-w-190 text-sm">
              <thead className="bg-background text-left text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">Employee</th>
                  <th className="px-5 py-3 font-medium">ID</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Department / Team</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.users.map((u) => (
                  <tr key={u._id} className="border-t border-line hover:bg-background/60">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="h-9 w-9 shrink-0 rounded-full bg-accent text-dark text-xs font-semibold flex items-center justify-center">
                          {getInitials(u.name)}
                        </span>
                        <div className="min-w-0">
                          <p className="font-medium text-dark truncate">
                            {u.name}
                            {u._id === user._id && (
                              <span className="ml-2 text-xs font-normal text-muted">(you)</span>
                            )}
                          </p>
                          <p className="text-xs text-muted truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-ink">{u.employeeId || '-'}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${ROLE_TONES[u.role]}`}
                      >
                        {ROLE_LABELS[u.role]}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-ink">
                      {[u.department?.name, u.team?.name].filter(Boolean).join(' · ') || '-'}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={u.employmentStatus} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => setDetails(u)}
                          className={`${iconButton} hover:text-primary`}
                          title="View"
                          aria-label={`View ${u.name}`}
                        >
                          <Eye size={17} />
                        </button>
                        {canManage(u) && (
                          <button
                            onClick={() => setFormModal({ mode: 'edit', employee: u })}
                            className={`${iconButton} hover:text-primary`}
                            title="Edit"
                            aria-label={`Edit ${u.name}`}
                          >
                            <Pencil size={17} />
                          </button>
                        )}
                        {canManage(u) && u.employmentStatus !== EMPLOYMENT_STATUS.INACTIVE && (
                          <button
                            onClick={() => setToDeactivate(u)}
                            className={`${iconButton} hover:text-status-inactive-text`}
                            title="Deactivate"
                            aria-label={`Deactivate ${u.name}`}
                          >
                            <UserX size={17} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          page={page}
          totalPages={data.totalPages}
          total={data.total}
          limit={PAGE_SIZE}
          onPageChange={setPage}
        />
      </div>

      {/* Windows */}
      {formModal && (
        <EmployeeFormModal
          mode={formModal.mode}
          employee={formModal.employee}
          departments={departments}
          teams={teams}
          onClose={() => setFormModal(null)}
          onSaved={afterSave}
        />
      )}

      {details && (
        <EmployeeDetailsModal
          employee={details}
          canManage={canManage(details)}
          onClose={() => setDetails(null)}
          onEdit={() => {
            setFormModal({ mode: 'edit', employee: details });
            setDetails(null);
          }}
          onDeactivate={() => setToDeactivate(details)}
        />
      )}

      {toDeactivate && (
        <ConfirmDialog
          title="Deactivate this person?"
          message={`${toDeactivate.name} will no longer be able to log in. If they lead a department or manage a team, that position becomes vacant. Their record stays, and you can reactivate them later.`}
          confirmLabel="Deactivate"
          busy={busy}
          onConfirm={confirmDeactivate}
          onCancel={() => setToDeactivate(null)}
        />
      )}
    </div>
  );
};

export default EmployeesPage;