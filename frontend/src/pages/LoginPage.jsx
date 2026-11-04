import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { loginUser, clearError } from '../features/auth/authSlice';
import FormField from '../components/FormField';
import PasswordField from '../components/PasswordField';
import FullPageLoader from '../components/FullPageLoader';
import logo from '../assets/worknest-logo.png';

const levels = [
  { dot: 'bg-primary', title: 'Company', text: 'One head, one organization' },
  { dot: 'bg-accent', title: 'Departments', text: 'Each with its own head' },
  { dot: 'bg-secondary', title: 'Teams', text: 'Led by their managers' },
  { dot: 'bg-white', title: 'People', text: 'Everyone in the right place' },
];

const LoginPage = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user, initialized, loading, error } = useSelector((state) => state.auth);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  // Clear any old error message when the page opens
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  if (!initialized) return <FullPageLoader />;

  // Already logged in: go to the page they wanted, or to the change-password page
  if (user) {
    const from = location.state?.from?.pathname || '/';
    return <Navigate to={user.mustChangePassword ? '/change-password' : from} replace />;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser({ identifier: identifier.trim(), password }));
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left panel: hidden on small screens */}
      <aside className="hidden lg:flex lg:w-1/2 bg-dark text-white flex-col justify-between p-12">
        <img src="/worknest-icon.png" alt="WorkNest" className="h-14 w-14 rounded-xl" />

        <div>
          <h2 className="text-3xl font-semibold leading-snug mb-3">
            Your organization,
            <br />
            in the right order.
          </h2>
          <p className="text-white/70 mb-10 max-w-sm">
            Every person sees exactly what their role allows. Nothing more, nothing less.
          </p>

          <ul className="space-y-4">
            {levels.map((level) => (
              <li key={level.title} className="flex items-center gap-4">
                <span className={`h-3 w-3 rounded-full ${level.dot}`} />
                <span className="font-medium">{level.title}</span>
                <span className="text-sm text-white/60">{level.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-white/40">WorkNest</p>
      </aside>

      {/* Right panel: the form */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <img src={logo} alt="WorkNest" className="h-14 mb-8 mix-blend-multiply" />

          <h1 className="text-2xl font-semibold text-dark mb-1">Welcome back</h1>
          <p className="text-muted mb-8">Log in with your email or username.</p>

          <form onSubmit={handleSubmit} className="bg-surface border border-line rounded-2xl p-6 space-y-5">
            {error && (
              <div
                role="alert"
                className="rounded-lg border border-status-inactive/30 bg-status-inactive-soft px-4 py-3 text-sm text-status-inactive-text"
              >
                {error}
              </div>
            )}

            <FormField
              label="Email or username"
              id="identifier"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              autoComplete="username"
              placeholder="you@company.com"
              required
            />

            <PasswordField
              label="Password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />

            <button
              type="submit"
              disabled={loading || !identifier.trim() || !password}
              className="w-full rounded-lg bg-primary hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-2.5 transition-colors"
            >
              {loading ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          <p className="text-xs text-muted mt-6 text-center">
            Accounts are created by your manager. There is no public sign-up.
          </p>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;