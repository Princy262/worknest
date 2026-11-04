import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Routes, Route } from 'react-router-dom';
import { fetchCurrentUser } from './features/auth/authSlice';
import { ROLES } from './constants';
import ProtectedRoute from './routes/ProtectedRoute';
import AppLayout from './components/AppLayout';
import LoginPage from './pages/LoginPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import EmployeesPage from './pages/EmployeesPage';
import DepartmentsPage from './pages/DepartmentsPage';
import TeamsPage from './pages/TeamsPage';
import CompanyPage from './pages/CompanyPage';
import CompaniesPage from './pages/CompaniesPage';
import NotFoundPage from './pages/NotFoundPage';

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
            <Route path="/employees" element={<EmployeesPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={[COMPANY_HEAD]} />}>
            <Route path="/departments" element={<DepartmentsPage />} />
            <Route path="/company" element={<CompanyPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={[COMPANY_HEAD, DEPT_HEAD]} />}>
            <Route path="/teams" element={<TeamsPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={[PLATFORM_OWNER]} />}>
            <Route path="/companies" element={<CompaniesPage />} />
          </Route>
        </Route>
      </Route>

      {/* Unknown address */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;