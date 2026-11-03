// The five roles in WorkNest.
// COMPANY_HEAD is the head of ONE specific company, not a global admin.
export const ROLES = {
  PLATFORM_OWNER: 'PLATFORM_OWNER',
  COMPANY_HEAD: 'COMPANY_HEAD',
  DEPT_HEAD: 'DEPT_HEAD',
  TEAM_MANAGER: 'TEAM_MANAGER',
  EMPLOYEE: 'EMPLOYEE',
};

// Higher number = higher rank. Used to check "can this user create that role?"
export const ROLE_LEVELS = {
  PLATFORM_OWNER: 5,
  COMPANY_HEAD: 4,
  DEPT_HEAD: 3,
  TEAM_MANAGER: 2,
  EMPLOYEE: 1,
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

// The only fields an employee may change on their own profile.
export const EMPLOYEE_EDITABLE_FIELDS = ['contact'];
// The contact fields an employee may edit on their own profile.
export const CONTACT_FIELDS = ['phone', 'address', 'emergencyContact'];