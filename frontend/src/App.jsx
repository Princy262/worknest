import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Routes, Route, Navigate } from 'react-router-dom';
import { fetchCurrentUser } from './features/auth/authSlice';
import { ROLES } from './constants';
import ProtectedRoute from './routes/ProtectedRoute';
import AppLayout from './components/AppLayout';
import LoginPage from './pages/LoginPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import DashboardPage from './pages/DashboardPage';
import PlaceholderPage from './pages/PlaceholderPage';
import ProfilePage from './pages/ProfilePage';

const { PLATFORM_OWNER, COMPANY_HEAD, DEPT_HEAD, TEAM_MANAGER } = ROLES;

function App() {
  const dispatch = useDispatch();

  // On first load, ask the server who is logged in (uses the cookie)
  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Everything inside here requires login */}
      <Route element={<ProtectedRoute />}>
        <Route path="/change-password" element={<ChangePasswordPage />} />

        {/* Pages with the sidebar and top bar */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          <Route element={<ProtectedRoute allowedRoles={[COMPANY_HEAD, DEPT_HEAD, TEAM_MANAGER]} />}>
            <Route
              path="/employees"
              element={<PlaceholderPage title="Employees" description="Search, filter and manage the people you are allowed to see." />}
            />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={[COMPANY_HEAD]} />}>
            <Route
              path="/departments"
              element={<PlaceholderPage title="Departments" description="Create departments and see their heads and teams." />}
            />
            <Route
              path="/company"
              element={<PlaceholderPage title="Company" description="Your organization's details." />}
            />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={[COMPANY_HEAD, DEPT_HEAD]} />}>
            <Route
              path="/teams"
              element={<PlaceholderPage title="Teams" description="Create teams and see their managers and members." />}
            />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={[PLATFORM_OWNER]} />}>
            <Route
              path="/companies"
              element={<PlaceholderPage title="Companies" description="Create and manage companies and their Company Heads." />}
            />
          </Route>
        </Route>
      </Route>

      {/* Unknown address: send them home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;