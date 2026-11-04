import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Copy, Check } from 'lucide-react';
import api from '../../api/axios';
import Modal from '../../components/Modal';
import FormField from '../../components/FormField';
import SelectField from '../../components/SelectField';
import GeneratePasswordField from '../../components/GeneratePasswordField';
import { generatePassword } from '../../utils/passwordGenerator';
import {
  ROLES,
  ROLE_LABELS,
  EMPLOYMENT_STATUS,
  STATUS_LABELS,
  getCreatableRoles,
} from '../../constants';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMPLOYEE_ID_PATTERN = /^[A-Za-z0-9]+$/;

// One "label / value / Copy" line in the "Account created" window
const CopyRow = ({ label, value, mono }) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Blocked by the browser: the value is still visible to copy by hand.
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="min-w-0">
        <p className="text-xs text-muted">{label}</p>
        <p className={`text-sm font-medium text-ink break-all ${mono ? 'font-mono' : ''}`}>{value}</p>
      </div>
      <button
        type="button"
        onClick={copy}
        className="shrink-0 flex items-center gap-1.5 rounded-lg border border-line text-ink hover:bg-background text-xs font-medium px-3 py-1.5"
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
};

// Used for both "Add employee" (mode="add") and "Edit" (mode="edit").
const EmployeeFormModal = ({ mode, employee, departments, teams, onClose, onSaved }) => {
  const { user: actor } = useSelector((state) => state.auth);
  const isEdit = mode === 'edit';
  const roleOptions = getCreatableRoles(actor.role);

  const [form, setForm] = useState(() =>
    isEdit
      ? {
          name: employee.name,
          email: employee.email,
          employeeId: employee.employeeId || '',
          designation: employee.designation || '',
          employmentStatus: employee.employmentStatus,
          phone: employee.contact?.phone || '',
          address: employee.contact?.address || '',
          emergencyContact: employee.contact?.emergencyContact || '',
        }
      : {
          name: '',
          email: '',
          employeeId: '',
          designation: '',
          role: roleOptions[roleOptions.length - 1], // the lowest role is the default
          // A Dept Head always adds people to their own department
          department: actor.role === ROLES.DEPT_HEAD ? actor.department?._id || '' : '',
          team: '',
          phone: '',
          address: '',
          emergencyContact: '',
        }
  );
  const [password, setPassword] = useState(() => (isEdit ? '' : generatePassword()));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState(null); // the credentials shown after "Create"

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      // Changing the role or the department clears the team picked before
      ...(name === 'role' || name === 'department' ? { team: '' } : {}),
    }));
  };

  // ----- What the dropdowns offer (add mode) -----
  const departmentsWithoutHead = departments.filter((d) => !d.head);
  const teamsWithoutManager = teams.filter((t) => !t.manager);
  const teamsInDepartment = teams.filter((t) => t.department?._id === form.department);

  const validate = () => {
    if (!form.name.trim()) return 'Name is required.';
    if (!EMAIL_PATTERN.test(form.email.trim())) return 'Enter a valid email address.';
    if (!EMPLOYEE_ID_PATTERN.test(form.employeeId.trim())) {
      return 'Employee ID can contain letters and numbers only.';
    }
    if (isEdit) return '';

    if (password.length < 8) return 'The temporary password must be at least 8 characters.';
    if (form.role === ROLES.DEPT_HEAD && !form.department) return 'Choose the department this person will head.';
    if (form.role === ROLES.TEAM_MANAGER && !form.team) return 'Choose the team this person will manage.';
    if (form.role === ROLES.EMPLOYEE && actor.role === ROLES.COMPANY_HEAD && !form.department) {
      return 'Choose a department.';
    }
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
        const body = {
          name: form.name.trim(),
          email: form.email.trim(),
          employeeId: form.employeeId.trim(),
          designation: form.designation.trim(),
          contact: {
            phone: form.phone.trim(),
            address: form.address.trim(),
            emergencyContact: form.emergencyContact.trim(),
          },
        };
        // Only send the status when it really changed (the backend refuses "INACTIVE" here)
        if (form.employmentStatus !== employee.employmentStatus) {
          body.employmentStatus = form.employmentStatus;
        }

        await api.put(`/users/${employee._id}`, body);
        onSaved('Changes saved.');
      } else {
        const contact = {};
        if (form.phone.trim()) contact.phone = form.phone.trim();
        if (form.address.trim()) contact.address = form.address.trim();
        if (form.emergencyContact.trim()) contact.emergencyContact = form.emergencyContact.trim();

        const body = {
          name: form.name.trim(),
          email: form.email.trim(),
          employeeId: form.employeeId.trim(),
          password,
          role: form.role,
          contact,
        };
        if (form.designation.trim()) body.designation = form.designation.trim();

        // Send only what the backend needs for this role
        if (form.role === ROLES.DEPT_HEAD) {
          body.department = form.department;
        } else if (form.role === ROLES.TEAM_MANAGER) {
          body.team = form.team;
        } else if (form.team) {
          body.team = form.team;
        } else if (form.department) {
          body.department = form.department;
        }

        const { data } = await api.post('/users', body);
        setCreated({
          name: data.user.name,
          email: data.user.email,
          username: data.user.username,
          password,
        });
      }
    } catch (err) {
      setError(
        err.response?.status === 409
          ? 'An account with this email, employee ID or username already exists.'
          : err.response?.data?.message || 'Could not save. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  // ----- After "Create": show the new login details once -----
  if (created) {
    const finish = () => onSaved(`Account created for ${created.name}.`);

    return (
      <Modal title="Account created" onClose={finish}>
        <p className="text-sm text-muted mb-4">
          Share these details with {created.name} securely. The password is shown only now, and they
          must change it the first time they log in.
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

  const statusOptions = [EMPLOYMENT_STATUS.ACTIVE, EMPLOYMENT_STATUS.ON_LEAVE];
  if (isEdit && employee.employmentStatus === EMPLOYMENT_STATUS.INACTIVE) {
    statusOptions.unshift(EMPLOYMENT_STATUS.INACTIVE);
  }

  return (
    <Modal title={isEdit ? `Edit ${employee.name}` : 'Add employee'} onClose={onClose} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div
            role="alert"
            className="rounded-lg border border-status-inactive/30 bg-status-inactive-soft px-4 py-3 text-sm text-status-inactive-text"
          >
            {error}
          </div>
        )}

        {isEdit && (
          <p className="text-xs text-muted">
            Role, department and team can't be changed here. Changing the name or employee ID also
            updates the username.
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Full name" id="name" name="name" value={form.name} onChange={handleChange} required />
          <FormField label="Email" id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
          <FormField
            label="Employee ID"
            id="employeeId"
            name="employeeId"
            value={form.employeeId}
            onChange={handleChange}
            placeholder="Letters and numbers, e.g. 123"
            required
          />
          <FormField label="Designation" id="designation" name="designation" value={form.designation} onChange={handleChange} placeholder="e.g. Frontend Developer" />
        </div>

        {/* ----- Edit: status ----- */}
        {isEdit && (
          <SelectField label="Status" id="employmentStatus" name="employmentStatus" value={form.employmentStatus} onChange={handleChange}>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </SelectField>
        )}

        {/* ----- Add: role and where the person belongs ----- */}
        {!isEdit && (
          <>
            {roleOptions.length > 1 && (
              <SelectField label="Role" id="role" name="role" value={form.role} onChange={handleChange}>
                {roleOptions.map((role) => (
                  <option key={role} value={role}>
                    {ROLE_LABELS[role]}
                  </option>
                ))}
              </SelectField>
            )}

            {/* A Team Manager adds people to their own team automatically */}
            {actor.role === ROLES.TEAM_MANAGER && (
              <p className="rounded-lg bg-accent/30 px-4 py-3 text-sm text-dark">
                This person will join your team{actor.team?.name ? `: ${actor.team.name}` : ''}.
              </p>
            )}

            {/* Department head: pick a department that has no head yet */}
            {form.role === ROLES.DEPT_HEAD && (
              <SelectField
                label="Department to lead"
                id="department"
                name="department"
                value={form.department}
                onChange={handleChange}
                hint={
                  departmentsWithoutHead.length === 0
                    ? 'Every department already has a head. Create a new department first.'
                    : undefined
                }
              >
                <option value="">Choose a department</option>
                {departmentsWithoutHead.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </SelectField>
            )}

            {/* Team manager: pick a team that has no manager yet */}
            {form.role === ROLES.TEAM_MANAGER && (
              <SelectField
                label="Team to manage"
                id="team"
                name="team"
                value={form.team}
                onChange={handleChange}
                hint={
                  teamsWithoutManager.length === 0
                    ? 'Every team already has a manager. Create a new team first.'
                    : undefined
                }
              >
                <option value="">Choose a team</option>
                {teamsWithoutManager.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name} ({t.department?.name})
                  </option>
                ))}
              </SelectField>
            )}

            {/* Employee added by a Company Head: department, then an optional team */}
            {form.role === ROLES.EMPLOYEE && actor.role === ROLES.COMPANY_HEAD && (
              <div className="grid gap-4 sm:grid-cols-2">
                <SelectField label="Department" id="department" name="department" value={form.department} onChange={handleChange}>
                  <option value="">Choose a department</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name}
                    </option>
                  ))}
                </SelectField>
                <SelectField label="Team (optional)" id="team" name="team" value={form.team} onChange={handleChange} disabled={!form.department}>
                  <option value="">No team yet</option>
                  {teamsInDepartment.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name}
                    </option>
                  ))}
                </SelectField>
              </div>
            )}

            {/* Employee added by a Dept Head: an optional team in their department */}
            {form.role === ROLES.EMPLOYEE && actor.role === ROLES.DEPT_HEAD && (
              <SelectField label="Team (optional)" id="team" name="team" value={form.team} onChange={handleChange}>
                <option value="">No team yet (department only)</option>
                {teamsInDepartment.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </SelectField>
            )}

            <GeneratePasswordField value={password} onChange={setPassword} />
          </>
        )}

        {/* ----- Contact information (optional) ----- */}
        <div>
          <p className="text-sm font-medium text-ink mb-3">Contact information (optional)</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Phone" id="phone" name="phone" value={form.phone} onChange={handleChange} />
            <FormField label="Emergency contact" id="emergencyContact" name="emergencyContact" value={form.emergencyContact} onChange={handleChange} placeholder="Name and phone number" />
            <div className="sm:col-span-2">
              <FormField label="Address" id="address" name="address" value={form.address} onChange={handleChange} />
            </div>
          </div>
        </div>

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
            {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Create account'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EmployeeFormModal;