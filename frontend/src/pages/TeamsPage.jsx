import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, UserRound } from 'lucide-react';
import api from '../api/axios';
import useLookups from '../features/employees/useLookups';
import TeamFormModal from '../features/teams/TeamFormModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { ROLES } from '../constants';

const control =
  'rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:outline-none focus:border-primary focus:ring-2 focus:ring-secondary/40';
const iconButton = 'p-2 rounded-lg text-muted hover:bg-surface';

const TeamsPage = () => {
  const { user } = useSelector((state) => state.auth);
  const { departments, teams, loaded, error, reload } = useLookups(user.role);
  const isCompanyHead = user.role === ROLES.COMPANY_HEAD;

  const [departmentFilter, setDepartmentFilter] = useState('');
  const [formModal, setFormModal] = useState(null); // { team }, where team is null when creating
  const [toDelete, setToDelete] = useState(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [actionError, setActionError] = useState('');

  // The green message disappears by itself
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  const visibleTeams = departmentFilter
    ? teams.filter((team) => team.department?._id === departmentFilter)
    : teams;

  // A Company Head needs at least one department before a team can exist
  const cannotCreate = isCompanyHead && loaded && departments.length === 0;

  const afterSave = (savedMessage) => {
    setFormModal(null);
    setActionError('');
    setNotice(savedMessage);
    reload();
  };

  const confirmDelete = async () => {
    setBusy(true);
    setActionError('');
    try {
      await api.delete(`/teams/${toDelete._id}`);
      setNotice(`${toDelete.name} was deleted.`);
      reload();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Could not delete this team.');
    } finally {
      setToDelete(null);
      setBusy(false);
    }
  };

  const message = actionError || error;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-dark">Teams</h1>
          <p className="text-muted">
            {isCompanyHead ? 'Teams across your company.' : 'Teams in your department.'}
          </p>
        </div>
        <button
          onClick={() => setFormModal({ team: null })}
          disabled={cannotCreate}
          className="flex items-center gap-2 rounded-lg bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2.5 transition-colors"
        >
          <Plus size={16} />
          Create team
        </button>
      </div>

      {cannotCreate && (
        <div className="mb-4 rounded-lg bg-accent/30 px-4 py-3 text-sm text-dark">
          You need a department before you can create a team.{' '}
          <Link to="/departments" className="font-medium text-primary hover:text-primary-hover">
            Create a department
          </Link>
        </div>
      )}

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

      {/* Department filter (Company Head only) */}
      {isCompanyHead && departments.length > 0 && (
        <div className="mb-4">
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
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
        </div>
      )}

      {/* Cards */}
      {!loaded ? (
        <div className="p-10 text-center text-sm text-muted">Loading teams...</div>
      ) : visibleTeams.length === 0 ? (
        <div className="bg-surface border border-dashed border-line rounded-2xl p-10 text-center text-sm text-muted">
          {departmentFilter ? 'No teams in this department yet.' : 'No teams yet.'}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleTeams.map((team) => (
            <div key={team._id} className="rounded-2xl border border-secondary/40 bg-secondary/15 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="font-semibold text-dark truncate">{team.name}</h2>
                  <span className="inline-block mt-1 rounded-full bg-accent text-dark text-xs font-medium px-3 py-1">
                    {team.department?.name}
                  </span>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    onClick={() => setFormModal({ team })}
                    className={`${iconButton} hover:text-primary`}
                    title="Edit"
                    aria-label={`Edit ${team.name}`}
                  >
                    <Pencil size={17} />
                  </button>
                  <button
                    onClick={() => setToDelete(team)}
                    className={`${iconButton} hover:text-status-inactive-text`}
                    title="Delete"
                    aria-label={`Delete ${team.name}`}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>

              <p className="text-sm text-muted mt-3">{team.description || 'No description'}</p>

              {/* Team manager */}
              <div className="mt-4 flex items-center gap-3 rounded-xl bg-surface px-3 py-2.5">
                <span className="h-9 w-9 shrink-0 rounded-full bg-secondary text-dark flex items-center justify-center">
                  <UserRound size={17} />
                </span>
                <div className="min-w-0 text-sm">
                  <p className="text-xs text-muted">Team manager</p>
                  {team.manager ? (
                    <>
                      <p className="font-medium text-dark truncate">{team.manager.name}</p>
                      <p className="text-xs text-muted truncate">{team.manager.email}</p>
                    </>
                  ) : (
                    <Link to="/employees" className="font-medium text-primary hover:text-primary-hover">
                      No manager yet. Add one
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Windows */}
      {formModal && (
        <TeamFormModal
          team={formModal.team}
          departments={departments}
          onClose={() => setFormModal(null)}
          onSaved={afterSave}
        />
      )}

      {toDelete && (
        <ConfirmDialog
          title="Delete this team?"
          message={`${toDelete.name} will be removed permanently. A team can only be deleted when it has no active members, including its manager, so deactivate them first.`}
          confirmLabel="Delete"
          busy={busy}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  );
};

export default TeamsPage;