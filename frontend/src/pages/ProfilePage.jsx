import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Pencil, KeyRound } from 'lucide-react';
import api from '../api/axios';
import { fetchCurrentUser } from '../features/auth/authSlice';
import StatusBadge from '../components/StatusBadge';
import FormField from '../components/FormField';
import { ROLES, ROLE_LABELS } from '../constants';
import { getInitials } from '../utils/format';

// One "label ........ value" line
const Row = ({ label, value }) => (
  <div className="flex justify-between gap-4 px-5 py-3 text-sm">
    <dt className="text-muted">{label}</dt>
    <dd className="font-medium text-ink text-right wrap-break-word">{value || '-'}</dd>
  </div>
);

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // The backend's /users/me route is closed to the Platform Owner, so the page is read-only for them.
  const canEditContact = user.role !== ROLES.PLATFORM_OWNER;

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ phone: '', address: '', emergencyContact: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const startEditing = () => {
    setForm({
      phone: user.contact?.phone || '',
      address: user.contact?.address || '',
      emergencyContact: user.contact?.emergencyContact || '',
    });
    setError('');
    setSuccess('');
    setEditing(true);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      await api.put('/users/me', { contact: form });
      await dispatch(fetchCurrentUser()); // reload the profile so the screen shows the saved values
      setEditing(false);
      setSuccess('Contact information updated.');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save your changes.');
    } finally {
      setSaving(false);
    }
  };

  const workInfo = [
    ['Name', user.name],
    ['Employee ID', user.employeeId],
    ['Username', user.username],
    ['Email', user.email],
    ['Company', user.company?.name || 'Platform level (no company)'],
    ['Department', user.department?.name],
    ['Team', user.team?.name],
  ];

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="bg-surface border border-line rounded-2xl p-6 flex items-center gap-5 mb-6">
        <span className="h-16 w-16 shrink-0 rounded-full bg-primary text-white text-xl font-semibold flex items-center justify-center">
          {getInitials(user.name)}
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-semibold text-dark truncate">{user.name}</h1>
          <p className="text-muted text-sm">
            {ROLE_LABELS[user.role]}
            {user.designation ? ` · ${user.designation}` : ''}
          </p>
        </div>
        <StatusBadge status={user.employmentStatus} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Work information (read-only) */}
        <section className="bg-surface border border-line rounded-2xl">
          <div className="px-5 py-4 border-b border-line">
            <h2 className="font-semibold text-dark">Work information</h2>
            <p className="text-xs text-muted">Set by your manager. Ask them if something needs correcting.</p>
          </div>
          <dl className="divide-y divide-line">
            {workInfo.map(([label, value]) => (
              <Row key={label} label={label} value={value} />
            ))}
          </dl>
        </section>

        {/* Contact information (you can edit this) */}
        <section className="bg-surface border border-line rounded-2xl">
          <div className="px-5 py-4 border-b border-line flex items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold text-dark">Contact information</h2>
              <p className="text-xs text-muted">
                {canEditContact ? 'You can update this whenever you like.' : 'Contact details are not stored for this account.'}
              </p>
            </div>
            {canEditContact && !editing && (
              <button
                onClick={startEditing}
                className="flex items-center gap-1.5 rounded-lg border border-primary text-primary hover:bg-primary hover:text-white text-sm font-medium px-3 py-1.5 transition-colors"
              >
                <Pencil size={14} />
                Edit
              </button>
            )}
          </div>

          {success && !editing && (
            <div className="mx-5 mt-4 rounded-lg border border-status-active/30 bg-status-active-soft px-4 py-3 text-sm text-status-active-text">
              {success}
            </div>
          )}

          {editing ? (
            <form onSubmit={handleSave} className="p-5 space-y-4">
              {error && (
                <div
                  role="alert"
                  className="rounded-lg border border-status-inactive/30 bg-status-inactive-soft px-4 py-3 text-sm text-status-inactive-text"
                >
                  {error}
                </div>
              )}

              <FormField label="Phone" id="phone" name="phone" value={form.phone} onChange={handleChange} placeholder="e.g. 9876543210" />
              <FormField label="Address" id="address" name="address" value={form.address} onChange={handleChange} />
              <FormField
                label="Emergency contact"
                id="emergencyContact"
                name="emergencyContact"
                value={form.emergencyContact}
                onChange={handleChange}
                placeholder="Name and phone number"
              />

              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-primary hover:bg-primary-hover disabled:opacity-60 text-white text-sm font-medium px-5 py-2.5 transition-colors"
                >
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="rounded-lg border border-line text-ink hover:bg-background text-sm font-medium px-5 py-2.5"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <dl className="divide-y divide-line">
              <Row label="Phone" value={user.contact?.phone} />
              <Row label="Address" value={user.contact?.address} />
              <Row label="Emergency contact" value={user.contact?.emergencyContact} />
            </dl>
          )}
        </section>
      </div>

      {/* Security */}
      <section className="bg-surface border border-line rounded-2xl p-5 mt-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="font-semibold text-dark">Password</h2>
          <p className="text-xs text-muted">Change your password at any time.</p>
        </div>
        <Link
          to="/change-password"
          className="flex items-center gap-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-medium px-4 py-2.5 transition-colors"
        >
          <KeyRound size={16} />
          Change password
        </Link>
      </section>
    </div>
  );
};

export default ProfilePage;