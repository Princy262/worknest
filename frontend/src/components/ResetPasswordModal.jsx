import { useState } from 'react';
import api from '../api/axios';
import Modal from './Modal';
import CopyRow from './CopyRow';

// Step 1: "Are you sure?"   Step 2: the new temporary password, shown once.
const ResetPasswordModal = ({ name, url, onClose }) => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null); // { user, temporaryPassword } after a successful reset

  const handleReset = async () => {
    setBusy(true);
    setError('');
    try {
      const { data } = await api.post(url);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reset the password.');
    } finally {
      setBusy(false);
    }
  };

  // ----- Step 2 -----
  if (result) {
    return (
      <Modal title="Password reset" onClose={onClose}>
        <p className="text-sm text-muted mb-4">
          Send these details to {name} through a channel you trust. The password is shown only now,
          and the old one no longer works. They must choose their own the next time they log in.
        </p>
        <div className="border border-line rounded-xl divide-y divide-line mb-6">
          <CopyRow label="Email" value={result.user.email} />
          <CopyRow label="Username" value={result.user.username} />
          <CopyRow label="New temporary password" value={result.temporaryPassword} mono />
        </div>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-medium px-5 py-2.5 transition-colors"
          >
            Done
          </button>
        </div>
      </Modal>
    );
  }

  // ----- Step 1 -----
  return (
    <Modal title="Reset password?" onClose={onClose}>
      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-status-inactive/30 bg-status-inactive-soft px-4 py-3 text-sm text-status-inactive-text"
        >
          {error}
        </div>
      )}
      <p className="text-sm text-ink mb-6">
        {name}'s current password will stop working right away. A new temporary password will be
        created, and {name} must change it the next time they log in.
      </p>
      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          className="rounded-lg border border-line text-ink hover:bg-background text-sm font-medium px-5 py-2.5"
        >
          Cancel
        </button>
        <button
          onClick={handleReset}
          disabled={busy}
          className="rounded-lg bg-primary hover:bg-primary-hover disabled:opacity-60 text-white text-sm font-medium px-5 py-2.5 transition-colors"
        >
          {busy ? 'Resetting...' : 'Reset password'}
        </button>
      </div>
    </Modal>
  );
};

export default ResetPasswordModal;