import { useState } from 'react';
import { useSelector } from 'react-redux';
import api from '../../api/axios';
import Modal from '../../components/Modal';
import FormField from '../../components/FormField';
import TextAreaField from '../../components/TextAreaField';
import SelectField from '../../components/SelectField';
import { ROLES } from '../../constants';

// Used for both "Create team" and "Edit team".
// Pass a "team" to edit it. Pass nothing to create a new one.
const TeamFormModal = ({ team, departments, onClose, onSaved }) => {
  const { user: actor } = useSelector((state) => state.auth);
  const isEdit = Boolean(team);

  // Only a Company Head picks the department. A Dept Head's team goes into their own.
  const chooseDepartment = !isEdit && actor.role === ROLES.COMPANY_HEAD;

  const [form, setForm] = useState({
    name: team?.name || '',
    description: team?.description || '',
    department: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) return setError('Team name is required.');
    if (chooseDepartment && !form.department) return setError('Choose a department for this team.');

    setSaving(true);
    try {
      const body = { name: form.name.trim(), description: form.description.trim() };

      if (isEdit) {
        await api.put(`/teams/${team._id}`, body);
        onSaved('Team updated.');
      } else {
        if (chooseDepartment) body.department = form.department;
        await api.post('/teams', body);
        onSaved('Team created.');
      }
    } catch (err) {
      setError(
        err.response?.status === 409
          ? 'A team with this name already exists in this department.'
          : err.response?.data?.message || 'Could not save the team.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={isEdit ? `Edit ${team.name}` : 'Create team'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div
            role="alert"
            className="rounded-lg border border-status-inactive/30 bg-status-inactive-soft px-4 py-3 text-sm text-status-inactive-text"
          >
            {error}
          </div>
        )}

        {chooseDepartment && (
          <SelectField
            label="Department"
            id="department"
            name="department"
            value={form.department}
            onChange={handleChange}
          >
            <option value="">Choose a department</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </SelectField>
        )}

        {!chooseDepartment && (
          <p className="rounded-lg bg-accent/30 px-4 py-3 text-sm text-dark">
            {isEdit
              ? `Department: ${team.department?.name}. A team stays in its department.`
              : `This team will be created in your department${
                  actor.department?.name ? `: ${actor.department.name}` : ''
                }.`}
          </p>
        )}

        <FormField
          label="Team name"
          id="name"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="e.g. Frontend"
          required
        />
        <TextAreaField
          label="Description (optional)"
          id="description"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="What does this team work on?"
        />

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-line text-ink hover:bg-background text-sm font-medium px-5 py-2.5"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-primary hover:bg-primary-hover disabled:opacity-60 text-white text-sm font-medium px-5 py-2.5 transition-colors"
          >
            {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Create team'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TeamFormModal;