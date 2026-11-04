import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { logoutUser } from '../features/auth/authSlice';
import { ROLE_LABELS } from '../constants';
import mark from '../assets/worknest-mark.png';

// A temporary page to prove login works. We replace it with the real layout next.
const DashboardPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const details = [
    ['Role', ROLE_LABELS[user.role]],
    ['Designation', user.designation || '-'],
    ['Company', user.company?.name || 'Platform level (no company)'],
    ['Department', user.department?.name || '-'],
    ['Team', user.team?.name || '-'],
    ['Employee ID', user.employeeId || '-'],
    ['Username', user.username],
    ['Email', user.email],
  ];

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <img src={mark} alt="WorkNest" className="h-12 mix-blend-multiply" />
          <div className="flex items-center gap-4 text-sm">
            <Link to="/change-password" className="text-primary hover:text-primary-hover font-medium">
              Change password
            </Link>
            <button
              onClick={() => dispatch(logoutUser())}
              className="rounded-lg bg-dark text-white px-4 py-2 hover:opacity-90"
            >
              Log out
            </button>
          </div>
        </div>

        <h1 className="text-2xl font-semibold text-dark mb-1">Welcome, {user.name.split(' ')[0]}</h1>
        <p className="text-muted mb-6">You are logged in. This page is temporary.</p>

        <dl className="bg-surface border border-line rounded-2xl divide-y divide-line">
          {details.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4 px-5 py-3 text-sm">
              <dt className="text-muted">{label}</dt>
              <dd className="font-medium text-ink text-right">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
};

export default DashboardPage;