// These values must match backend/utils/constants.js exactly.

export const ROLES = {
  PLATFORM_OWNER: 'PLATFORM_OWNER',
  COMPANY_HEAD: 'COMPANY_HEAD',
  DEPT_HEAD: 'DEPT_HEAD',
  TEAM_MANAGER: 'TEAM_MANAGER',
  EMPLOYEE: 'EMPLOYEE',
};

export const EMPLOYMENT_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  ON_LEAVE: 'ON_LEAVE',
};

export const COMPANY_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
};

// Friendly names shown in the interface
export const ROLE_LABELS = {
  PLATFORM_OWNER: 'Platform Owner',
  COMPANY_HEAD: 'Company Head',
  DEPT_HEAD: 'Department Head',
  TEAM_MANAGER: 'Team Manager',
  EMPLOYEE: 'Employee',
};

export const STATUS_LABELS = {
  ACTIVE: 'Active',
  ON_LEAVE: 'On Leave',
  INACTIVE: 'Inactive',
};

// Rank of each role. Must match backend/utils/constants.js.
export const ROLE_LEVELS = {
  PLATFORM_OWNER: 5,
  COMPANY_HEAD: 4,
  DEPT_HEAD: 3,
  TEAM_MANAGER: 2,
  EMPLOYEE: 1,
};

// The roles a person may create: only roles ranked below their own.
export const getCreatableRoles = (role) =>
  Object.keys(ROLE_LEVELS).filter((r) => ROLE_LEVELS[r] < ROLE_LEVELS[role]);