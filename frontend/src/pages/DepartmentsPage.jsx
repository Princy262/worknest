import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, UserRound } from 'lucide-react';
import api from '../api/axios';
import useLookups from '../features/employees/useLookups';
import DepartmentFormModal from '../features/departments/DepartmentFormModal';
import ConfirmDialog from '../components/ConfirmDialog';

const iconButton = 'p-2 rounded-lg text-muted hover:bg-surface';

const DepartmentsPage = () => {
  const { user } = useSelector((state) => state.auth);
  const { departments, teams, loaded, error, reload } = useLookups(user.role);

  const [formModal, setFormModal] = useState(null); // { department }, where department is null when creating
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

  // { departmentId: [team, team, ...] } so each card can list its teams
  const teamsByDepartment = useMemo(() => {
    const groups = {};
    for (const team of teams) {
      const id = team.department?._id;
      if (!id) continue;
      groups[id] = [...(groups[id] || []), team];
    }
    return groups;
  }, [teams]);

  const afterSave = (message) => {
    setFormModal(null);
    setActionError('');
    setNotice(message);
    reload();
  };

  const confirmDelete = async () => {
    setBusy(true);
    setActionError('');
    try {
      await api.delete(`/departments/${toDelete._id}`);
      setNotice(`${toDelete.name} was deleted.`);
      reload();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Could not delete this department.');
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
          <h1 className="text-2xl font-semibold text-dark">Departments</h1>
          <p className="text-muted">Each department has one head and any number of teams.</p>
        </div>
        <button
          onClick={() => setFormModal({ department: null })}
          className="flex items-center gap-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-medium px-4 py-2.5 transition-colors"
        >
          <Plus size={16} />
          Create department
        </button>
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

      {/* Cards */}
      {!loaded ? (
        <div className="p-10 text-center text-sm text-muted">Loading departments...</div>
      ) : departments.length === 0 ? (
        <div className="bg-surface border border-dashed border-line rounded-2xl p-10 text-center text-sm text-muted">
          No departments yet. Create the first one to start building your organization.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {departments.map((department) => {
            const departmentTeams = teamsByDepartment[department._id] || [];

            return (
              <div key={department._id} className="rounded-2xl border border-accent bg-accent/30 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-semibold text-dark truncate">{department.name}</h2>
                    <p className="text-sm text-muted">{department.description || 'No description'}</p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      onClick={() => setFormModal({ department })}
                      className={`${iconButton} hover:text-primary`}
                      title="Edit"
                      aria-label={`Edit ${department.name}`}
                    >
                      <Pencil size={17} />
                    </button>
                    <button
                      onClick={() => setToDelete(department)}
                      className={`${iconButton} hover:text-status-inactive-text`}
                      title="Delete"
                      aria-label={`Delete ${department.name}`}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>

                {/* Department head */}
                <div className="mt-4 flex items-center gap-3 rounded-xl bg-surface px-3 py-2.5">
                  <span className="h-9 w-9 shrink-0 rounded-full bg-primary text-white flex items-center justify-center">
                    <UserRound size={17} />
                  </span>
                  <div className="min-w-0 text-sm">
                    <p className="text-xs text-muted">Department head</p>
                    {department.head ? (
                      <p className="font-medium text-dark truncate">{department.head.name}</p>
                    ) : (
                      <Link to="/employees" className="font-medium text-primary hover:text-primary-hover">
                        No head yet. Add one
                      </Link>
                    )}
                  </div>
                </div>

                {/* Teams */}
                <div className="mt-4">
                  <p className="text-xs text-muted mb-2">Teams ({departmentTeams.length})</p>
                  {departmentTeams.length === 0 ? (
                    <p className="text-sm text-muted">No teams yet.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {departmentTeams.map((team) => (
                        <span
                          key={team._id}
                          className="rounded-full bg-secondary/30 text-dark text-xs font-medium px-3 py-1"
                        >
                          {team.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Windows */}
      {formModal && (
        <DepartmentFormModal
          department={formModal.department}
          onClose={() => setFormModal(null)}
          onSaved={afterSave}
        />
      )}

      {toDelete && (
        <ConfirmDialog
          title="Delete this department?"
          message={`${toDelete.name} will be removed permanently. A department can only be deleted when it has no teams and no active people, so move or deactivate them first.`}
          confirmLabel="Delete"
          busy={busy}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  );
};

export default DepartmentsPage;