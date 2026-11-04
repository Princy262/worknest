import { useSelector } from 'react-redux';
import { Link, Navigate } from 'react-router-dom';
import { Users, Building2, Network, Landmark, UserPlus, FolderPlus } from 'lucide-react';
import useDashboardData from '../features/dashboard/useDashboardData.js';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import { ROLES, ROLE_LABELS } from '../constants';

// ---------- Small pieces used by several dashboards ----------

const Section = ({ title, children }) => (
  <section className="mt-8">
    <h2 className="text-lg font-semibold text-dark mb-3">{title}</h2>
    {children}
  </section>
);

const Empty = ({ children }) => (
  <div className="bg-surface border border-dashed border-line rounded-2xl p-6 text-sm text-muted">
    {children}
  </div>
);

const QuickActions = ({ actions }) => (
  <Section title="Quick actions">
    <div className="flex flex-wrap gap-3">
      {actions.map(({ label, to, icon: Icon }) => (
        <Link
          key={label}
          to={to}
          className="flex items-center gap-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-medium px-4 py-2.5 transition-colors"
        >
          <Icon size={16} />
          {label}
        </Link>
      ))}
    </div>
  </Section>
);

const DepartmentCards = ({ departments }) => (
  <Section title="Departments">
    {departments.length === 0 ? (
      <Empty>No departments yet.</Empty>
    ) : (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {departments.map((department) => (
          <div key={department._id} className="rounded-2xl border border-accent bg-accent/30 p-4">
            <p className="font-semibold text-dark">{department.name}</p>
            <p className="text-sm text-muted">
              {department.head ? `Head: ${department.head.name}` : 'No head assigned yet'}
            </p>
          </div>
        ))}
      </div>
    )}
  </Section>
);

const TeamCards = ({ teams }) => (
  <Section title="Teams">
    {teams.length === 0 ? (
      <Empty>No teams yet.</Empty>
    ) : (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {teams.map((team) => (
          <div key={team._id} className="rounded-2xl border border-secondary/40 bg-secondary/15 p-4">
            <p className="font-semibold text-dark">{team.name}</p>
            <p className="text-sm text-muted">{team.department?.name}</p>
            <p className="text-sm text-muted">
              {team.manager ? `Manager: ${team.manager.name}` : 'No manager assigned yet'}
            </p>
          </div>
        ))}
      </div>
    )}
  </Section>
);

// ---------- One dashboard per role ----------

const CompanyHeadDashboard = ({ user, data, loading }) => (
  <>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard icon={Users} label="Active people" value={data?.people} loading={loading} />
      <StatCard icon={Building2} label="Departments" value={data?.departments.length} tone="accent" loading={loading} />
      <StatCard icon={Network} label="Teams" value={data?.teams.length} tone="secondary" loading={loading} />
      <StatCard icon={Landmark} label="Company" value={user.company?.name} hint="Your organization" tone="primary" />
    </div>

    <QuickActions
      actions={[
        { label: 'Add employee', to: '/employees', icon: UserPlus },
        { label: 'Create department', to: '/departments', icon: FolderPlus },
        { label: 'Manage teams', to: '/teams', icon: Network },
      ]}
    />

    {data && <DepartmentCards departments={data.departments} />}
    {data && <TeamCards teams={data.teams} />}
  </>
);

const DeptHeadDashboard = ({ user, data, loading }) => (
  <>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <StatCard icon={Users} label="People in your department" value={data?.people} loading={loading} />
      <StatCard icon={Network} label="Teams" value={data?.teams.length} tone="secondary" loading={loading} />
      <StatCard icon={Building2} label="Department" value={user.department?.name} hint="You lead this department" tone="accent" />
    </div>

    <QuickActions
      actions={[
        { label: 'Add employee', to: '/employees', icon: UserPlus },
        { label: 'Manage teams', to: '/teams', icon: Network },
      ]}
    />

    {data && <TeamCards teams={data.teams} />}
  </>
);

const TeamManagerDashboard = ({ user, data, loading }) => (
  <>
    <div className="grid gap-4 sm:grid-cols-2">
      <StatCard icon={Users} label="People in your team" value={data?.people} loading={loading} />
      <StatCard icon={Network} label="Team" value={user.team?.name} hint={user.department?.name} tone="secondary" />
    </div>

    <QuickActions actions={[{ label: 'Add employee', to: '/employees', icon: UserPlus }]} />
  </>
);

const EmployeeDashboard = ({ user }) => {
  const rows = [
    ['Name', user.name],
    ['Designation', user.designation || '-'],
    ['Employee ID', user.employeeId],
    ['Username', user.username],
    ['Email', user.email],
    ['Company', user.company?.name || '-'],
    ['Department', user.department?.name || '-'],
    ['Team', user.team?.name || '-'],
  ];
  const contact = [
    ['Phone', user.contact?.phone || '-'],
    ['Address', user.contact?.address || '-'],
    ['Emergency contact', user.contact?.emergencyContact || '-'],
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="bg-surface border border-line rounded-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <h2 className="font-semibold text-dark">Your profile</h2>
          <StatusBadge status={user.employmentStatus} />
        </div>
        <dl className="divide-y divide-line">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4 px-5 py-3 text-sm">
              <dt className="text-muted">{label}</dt>
              <dd className="font-medium text-ink text-right">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="bg-surface border border-line rounded-2xl">
        <div className="px-5 py-4 border-b border-line">
          <h2 className="font-semibold text-dark">Contact information</h2>
          <p className="text-xs text-muted">You will be able to edit this yourself in an upcoming step.</p>
        </div>
        <dl className="divide-y divide-line">
          {contact.map(([label, value]) => (
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

const PlatformOwnerDashboard = ({ data, loading }) => {
  const companies = data?.companies || [];
  const active = companies.filter((c) => c.status === 'ACTIVE').length;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Landmark} label="Companies" value={companies.length} tone="primary" loading={loading} />
        <StatCard icon={Landmark} label="Active" value={active} loading={loading} />
        <StatCard icon={Landmark} label="Inactive" value={companies.length - active} loading={loading} />
      </div>

      <Section title="Companies">
        {companies.length === 0 ? (
          <Empty>No companies yet.</Empty>
        ) : (
          <div className="bg-surface border border-line rounded-2xl divide-y divide-line">
            {companies.map((company) => (
              <div key={company._id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="min-w-0">
                  <p className="font-medium text-dark truncate">{company.name}</p>
                  <p className="text-sm text-muted truncate">
                    {company.head ? `${company.head.name} · ${company.head.email}` : 'No Company Head'}
                  </p>
                </div>
                <StatusBadge status={company.status} />
              </div>
            ))}
          </div>
        )}
      </Section>
    </>
  );
};

// ---------- The page ----------

const DashboardPage = () => {
  const { user } = useSelector((state) => state.auth);
  const { data, loading, error } = useDashboardData(user.role);

  if (user.role === ROLES.EMPLOYEE) return <Navigate to="/profile" replace />;

  const firstName = user.name.split(' ')[0];
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const dashboards = {
    [ROLES.COMPANY_HEAD]: CompanyHeadDashboard,
    [ROLES.DEPT_HEAD]: DeptHeadDashboard,
    [ROLES.TEAM_MANAGER]: TeamManagerDashboard,
    [ROLES.EMPLOYEE]: EmployeeDashboard,
    [ROLES.PLATFORM_OWNER]: PlatformOwnerDashboard,
  };
  const RoleDashboard = dashboards[user.role];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-dark">Welcome back, {firstName}</h1>
        <p className="text-muted">
          {ROLE_LABELS[user.role]} · {today}
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-6 rounded-lg border border-status-inactive/30 bg-status-inactive-soft px-4 py-3 text-sm text-status-inactive-text"
        >
          {error}
        </div>
      )}

      {RoleDashboard && <RoleDashboard user={user} data={data} loading={loading} />}
    </div>
  );
};

export default DashboardPage;