import { useEffect, useState } from 'react';
import { Plus, Pencil, Power, PowerOff, Landmark } from 'lucide-react';
import api from '../api/axios';
import CompanyFormModal from '../features/companies/CompanyFormModal';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';
import { COMPANY_STATUS } from '../constants';
import { getInitials, formatDate } from '../utils/format';

const iconButton = 'p-2 rounded-lg text-muted hover:bg-background';

const CompaniesPage = () => {
  const [companies, setCompanies] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const [formModal, setFormModal] = useState(null); // { company }, where company is null when creating
  const [toDeactivate, setToDeactivate] = useState(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [actionError, setActionError] = useState('');

  // ----- Load the list now, and again whenever reloadKey goes up -----
  useEffect(() => {
    let cancelled = false;

    api
      .get('/platform/companies')
      .then((res) => {
        if (cancelled) return;
        setCompanies(res.data.companies);
        setError('');
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || 'Could not load the companies.');
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  // The green message disappears by itself
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  const reload = () => setReloadKey((key) => key + 1);

  const afterSave = (message) => {
    setFormModal(null);
    setActionError('');
    setNotice(message);
    reload();
  };

  const changeStatus = async (company, status) => {
    setBusy(true);
    setActionError('');
    try {
      await api.put(`/platform/companies/${company._id}`, { status });
      setNotice(
        status === COMPANY_STATUS.ACTIVE
          ? `${company.name} is active again.`
          : `${company.name} was deactivated. Nobody in it can log in.`
      );
      reload();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Could not change the status.');
    } finally {
      setToDeactivate(null);
      setBusy(false);
    }
  };

  const activeCount = companies.filter((c) => c.status === COMPANY_STATUS.ACTIVE).length;
  const message = actionError || error;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-dark">Companies</h1>
          <p className="text-muted">
            Create companies and their Company Heads. You cannot see any company's employees.
          </p>
        </div>
        <button
          onClick={() => setFormModal({ company: null })}
          className="flex items-center gap-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-medium px-4 py-2.5 transition-colors"
        >
          <Plus size={16} />
          Create company
        </button>
      </div>

      {/* Counts */}
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <StatCard icon={Landmark} label="Companies" value={companies.length} tone="primary" loading={!loaded} />
        <StatCard icon={Landmark} label="Active" value={activeCount} loading={!loaded} />
        <StatCard icon={Landmark} label="Inactive" value={companies.length - activeCount} loading={!loaded} />
      </div>

      {notice && (
        <div className="mb-4 rounded-lg border border-status-active/30 bg-status-active-soft px-4 py-3 text-sm text-status-active-text">
          {notice}
        </div>
      )}
      {message && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-status-inactive/30 bg-status-inactive-soft px-4 py-3 text-sm text-status-inactive-text"
        >
          {message}
        </div>
      )}

      {/* Table */}
      <div className="bg-surface border border-line rounded-2xl overflow-hidden">
        {!loaded ? (
          <div className="p-10 text-center text-sm text-muted">Loading companies...</div>
        ) : companies.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted">
            No companies yet. Create the first one to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-180 text-sm">
              <thead className="bg-background text-left text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">Company</th>
                  <th className="px-5 py-3 font-medium">Company Head</th>
                  <th className="px-5 py-3 font-medium">Created</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => {
                  const isActive = company.status === COMPANY_STATUS.ACTIVE;

                  return (
                    <tr key={company._id} className="border-t border-line hover:bg-background/60">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <span className="h-9 w-9 shrink-0 rounded-lg bg-primary text-white text-xs font-semibold flex items-center justify-center">
                            {getInitials(company.name)}
                          </span>
                          <div className="min-w-0">
                            <p className="font-medium text-dark truncate">{company.name}</p>
                            <p className="text-xs text-muted truncate">{company.domain || 'No domain'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        {company.head ? (
                          <div className="min-w-0">
                            <p className="font-medium text-ink truncate">{company.head.name}</p>
                            <p className="text-xs text-muted truncate">{company.head.email}</p>
                          </div>
                        ) : (
                          <span className="text-muted">No Company Head</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-ink">{formatDate(company.createdAt)}</td>
                      <td className="px-5 py-3">
                        <StatusBadge status={company.status} />
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => setFormModal({ company })}
                            className={`${iconButton} hover:text-primary`}
                            title="Edit"
                            aria-label={`Edit ${company.name}`}
                          >
                            <Pencil size={17} />
                          </button>
                          {isActive ? (
                            <button
                              onClick={() => setToDeactivate(company)}
                              className={`${iconButton} hover:text-status-inactive-text`}
                              title="Deactivate"
                              aria-label={`Deactivate ${company.name}`}
                            >
                              <PowerOff size={17} />
                            </button>
                          ) : (
                            <button
                              onClick={() => changeStatus(company, COMPANY_STATUS.ACTIVE)}
                              disabled={busy}
                              className={`${iconButton} hover:text-status-active-text disabled:opacity-50`}
                              title="Activate"
                              aria-label={`Activate ${company.name}`}
                            >
                              <Power size={17} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Windows */}
      {formModal && (
        <CompanyFormModal
          company={formModal.company}
          onClose={() => setFormModal(null)}
          onSaved={afterSave}
        />
      )}

      {toDeactivate && (
        <ConfirmDialog
          title="Deactivate this company?"
          message={`Nobody in ${toDeactivate.name} will be able to log in, including its Company Head. Nothing is deleted, and you can activate the company again at any time.`}
          confirmLabel="Deactivate"
          busy={busy}
          onConfirm={() => changeStatus(toDeactivate, COMPANY_STATUS.INACTIVE)}
          onCancel={() => setToDeactivate(null)}
        />
      )}
    </div>
  );
};

export default CompaniesPage;