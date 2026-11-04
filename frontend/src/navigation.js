import { LayoutDashboard, Users, Network, Building2, Landmark, User } from 'lucide-react';
import { ROLES } from './constants';

const profile = { label: 'My Profile', to: '/profile', icon: User };

// The sidebar menu for each role. Only pages that role may use are listed.
export const NAV_ITEMS = {
  [ROLES.PLATFORM_OWNER]: [
    { label: 'Dashboard', to: '/', icon: LayoutDashboard },
    { label: 'Companies', to: '/companies', icon: Landmark },
    profile,
  ],
  [ROLES.COMPANY_HEAD]: [
    { label: 'Dashboard', to: '/', icon: LayoutDashboard },
    { label: 'Employees', to: '/employees', icon: Users },
    { label: 'Departments', to: '/departments', icon: Building2 },
    { label: 'Teams', to: '/teams', icon: Network },
    { label: 'Company', to: '/company', icon: Landmark },
    profile,
  ],
  [ROLES.DEPT_HEAD]: [
    { label: 'Dashboard', to: '/', icon: LayoutDashboard },
    { label: 'Employees', to: '/employees', icon: Users },
    { label: 'Teams', to: '/teams', icon: Network },
    profile,
  ],
  [ROLES.TEAM_MANAGER]: [
    { label: 'Dashboard', to: '/', icon: LayoutDashboard },
    { label: 'My Team', to: '/employees', icon: Users },
    profile,
  ],
  [ROLES.EMPLOYEE]: [profile],
};