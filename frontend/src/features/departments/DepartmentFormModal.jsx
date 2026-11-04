import { useState } from 'react';
import api from '../../api/axios';
import Modal from '../../components/Modal';
import FormField from '../../components/FormField';
import TextAreaField from '../../components/TextAreaField';

// Used for both "Create department" and "Edit department".
// Pass a "department" to edit it. Pass nothing to create a new one.
const DepartmentFormModal = ({ department, onClose, onSaved }) => {
  const isEdit = Boolean(department);

  const [form, setForm] = useState({
    name: department?.name || '',
    description: department?.description || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) return setError('Department name is required.');

    setSaving(true);
    try {
      const body = { name: form.name.trim(), description: form.description.trim() };

      if (isEdit) {
        await api.put(`/departments/${department._id}`, body);
        onSaved('Department updated.');
      } else {
        await api.post('/departments', body);
        onSaved('Department created.');
      }
    } catch (err) {
      setError(
        err.response?.status === 409
          ? 'A department with this name already exists.'
          : err.response?.data?.message || 'Could not save the department.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={isEdit ? `Edit ${department.name}` : 'Create department'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div
            role="alert"
            className="rounded-lg border border-status-inactive/30 bg-status-inactive-soft px-4 py-3 text-sm text-status-inactive-text"
          >
            {error}
          </div>
        )}

        <FormField
          label="Department name"
          id="name"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="e.g. Finance"
          required
        />
        <TextAreaField
          label="Description (optional)"
          id="description"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="What does this department do?"
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
            {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Create department'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default DepartmentFormModal;