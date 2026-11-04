import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import FullPageLoader from '../components/FullPageLoader';

// Wraps pages that need login. Optionally limits them to certain roles.
const ProtectedRoute = ({ allowedRoles }) => {
  const { user, initialized } = useSelector((state) => state.auth);
  const location = useLocation();

  // 1. Still checking the cookie
  if (!initialized) return <FullPageLoader />;

  // 2. Not logged in
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;

  // 3. Temporary password: the only page allowed is /change-password
  if (user.mustChangePassword && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />;
  }

  // 4. Wrong role for this page
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;