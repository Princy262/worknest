import { useState } from 'react';
import api from '../../api/axios';
import Modal from '../../components/Modal';
import FormField from '../../components/FormField';
import GeneratePasswordField from '../../components/GeneratePasswordField';
import CopyRow from '../../components/CopyRow';
import { generatePassword } from '../../utils/passwordGenerator';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMPLOYEE_ID_PATTERN = /^[A-Za-z0-9]+$/;

// Used for both "Create company" and "Edit company".
// Pass a "company" to edit it. Pass nothing to create a new one.
const CompanyFormModal = ({ company, onClose, onSaved }) => {
  const isEdit = Boolean(company);

  const [form, setForm] = useState({
    companyName: company?.name || '',
    domain: company?.domain || '',
    headName: '',
    headEmail: '',
    headEmployeeId: '',
    headDesignation: 'Company Head',
  });
  const [password, setPassword] = useState(() => (isEdit ? '' : generatePassword()));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState(null); // the login details shown after "Create"

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    if (!form.companyName.trim()) return 'Company name is required.';
    if (isEdit) return '';

    if (!form.headName.trim()) return 'The Company Head\'s name is required.';
    if (!EMAIL_PATTERN.test(form.headEmail.trim())) return 'Enter a valid email for the Company Head.';
    if (!EMPLOYEE_ID_PATTERN.test(form.headEmployeeId.trim())) {
      return 'Employee ID can contain letters and numbers only.';
    }
    if (password.length < 8) return 'The temporary password must be at least 8 characters.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const problem = validate();
    if (problem) return setError(problem);

    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/platform/companies/${company._id}`, {
          name: form.companyName.trim(),
          domain: form.domain.trim(),
        });
        onSaved('Company updated.');
      } else {
        const body = {
          company: { name: form.companyName.trim() },
          head: {
            name: form.headName.trim(),
            email: form.headEmail.trim(),
            employeeId: form.headEmployeeId.trim(),
            password,
          },
        };
        if (form.domain.trim()) body.company.domain = form.domain.trim();
        if (form.headDesignation.trim()) body.head.designation = form.headDesignation.trim();

        const { data } = await api.post('/platform/companies', body);
        setCreated({
          companyName: data.company.name,
          headName: data.head.name,
          email: data.head.email,
          username: data.head.username,
          password,
        });
      }
    } catch (err) {
      setError(
        err.response?.status === 409
          ? 'A company with this name already exists, or this email, employee ID or username is already used.'
          : err.response?.data?.message || 'Could not save. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  // ----- After "Create": show the Company Head's login details once -----
  if (created) {
    const finish = () => onSaved(`${created.companyName} was created.`);

    return (
      <Modal title="Company created" onClose={finish}>
        <p className="text-sm text-muted mb-4">
          Send these details to {created.headName}, the Company Head of {created.companyName}, through
          a channel you trust. The password is shown only now. They must change it the first time
          they log in.
        </p>
        <div className="border border-line rounded-xl divide-y divide-line mb-6">
          <CopyRow label="Email" value={created.email} />
          <CopyRow label="Username" value={created.username} />
          <CopyRow label="Temporary password" value={created.password} mono />
        </div>
        <div className="flex justify-end">
          <button
            onClick={finish}
            className="rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-medium px-5 py-2.5 transition-colors"
          >
            Done
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      title={isEdit ? `Edit ${company.name}` : 'Create company'}
      onClose={onClose}
      size={isEdit ? 'md' : 'lg'}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div
            role="alert"
            className="rounded-lg border border-status-inactive/30 bg-status-inactive-soft px-4 py-3 text-sm text-status-inactive-text"
          >
            {error}
          </div>
        )}

        <div>
          <p className="text-sm font-medium text-ink mb-3">Company</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Company name"
              id="companyName"
              name="companyName"
              value={form.companyName}
              onChange={handleChange}
              placeholder="e.g. Orbit Ltd"
              required
            />
            <FormField
              label="Domain (optional)"
              id="domain"
              name="domain"
              value={form.domain}
              onChange={handleChange}
              placeholder="e.g. orbit.com"
            />
          </div>
        </div>

        {isEdit ? (
          <p className="text-xs text-muted">
            Only the name and domain can be changed here. The Company Head manages their own account.
          </p>
        ) : (
          <>
            <div>
              <p className="text-sm font-medium text-ink mb-3">Company Head</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Full name" id="headName" name="headName" value={form.headName} onChange={handleChange} required />
                <FormField label="Email" id="headEmail" name="headEmail" type="email" value={form.headEmail} onChange={handleChange} required />
                <FormField
                  label="Employee ID"
                  id="headEmployeeId"
                  name="headEmployeeId"
                  value={form.headEmployeeId}
                  onChange={handleChange}
                  placeholder="Letters and numbers, e.g. 1"
                  required
                />
                <FormField label="Designation" id="headDesignation" name="headDesignation" value={form.headDesignation} onChange={handleChange} />
              </div>
            </div>

            <GeneratePasswordField value={password} onChange={setPassword} />
          </>
        )}

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
            {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Create company'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CompanyFormModal;