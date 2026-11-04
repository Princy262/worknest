import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { changePassword, logoutUser, clearError } from '../features/auth/authSlice';
import PasswordField from '../components/PasswordField';
import logo from '../assets/worknest-logo.png';

const ChangePasswordPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector((state) => state.auth);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // frontend only, never sent
  const [formError, setFormError] = useState('');

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const forced = user.mustChangePassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (newPassword.length < 8) {
      return setFormError('New password must be at least 8 characters.');
    }
    if (newPassword !== confirmPassword) {
      return setFormError('New password and confirmation do not match.');
    }
    if (newPassword === currentPassword) {
      return setFormError('New password must be different from the current one.');
    }

    const result = await dispatch(changePassword({ currentPassword, newPassword }));
    if (changePassword.fulfilled.match(result)) {
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md">
        <img src={logo} alt="WorkNest" className="h-14 mb-8 mix-blend-multiply" />

        <h1 className="text-2xl font-semibold text-dark mb-1">
          {forced ? 'Set your new password' : 'Change password'}
        </h1>
        <p className="text-muted mb-6">
          {forced
            ? 'You are using a temporary password. Choose your own to continue.'
            : 'Enter your current password, then choose a new one.'}
        </p>

        <form onSubmit={handleSubmit} className="bg-surface border border-line rounded-2xl p-6 space-y-5">
          {(formError || error) && (
            <div
              role="alert"
              className="rounded-lg border border-status-inactive/30 bg-status-inactive-soft px-4 py-3 text-sm text-status-inactive-text"
            >
              {formError || error}
            </div>
          )}

          <PasswordField
            label={forced ? 'Temporary password' : 'Current password'}
            id="currentPassword"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          <PasswordField
            label="New password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            required
          />

          <PasswordField
            label="Confirm new password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            required
          />

          <button
            type="submit"
            disabled={loading || !currentPassword || !newPassword || !confirmPassword}
            className="w-full rounded-lg bg-primary hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-2.5 transition-colors"
          >
            {loading ? 'Saving...' : 'Save new password'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          {forced ? (
            <button
              type="button"
              onClick={() => dispatch(logoutUser())}
              className="text-muted hover:text-ink"
            >
              Log out
            </button>
          ) : (
            <Link to="/" className="text-primary hover:text-primary-hover font-medium">
              Back to dashboard
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordPage;