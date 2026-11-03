import { ROLES, ROLE_LEVELS } from './constants.js';

// A filter that matches no user at all. Used when a role has no valid scope.
const NOTHING = { _id: null };

// Turns an id, an ObjectId or a populated document into a plain string id.
const idOf = (value) => {
  if (!value) return null;
  return String(value._id ?? value);
};

// True only when both ids exist and are equal.
const sameId = (a, b) => {
  const first = idOf(a);
  const second = idOf(b);
  return first !== null && second !== null && first === second;
};

// 1. WHO CAN THIS USER SEE? Returns a MongoDB filter used in every list query.
export const getAccessibleUsersFilter = (user) => {
  switch (user.role) {
    case ROLES.COMPANY_HEAD:
      return user.company ? { company: user.company } : NOTHING;

    case ROLES.DEPT_HEAD:
      return user.company && user.department
        ? { company: user.company, department: user.department }
        : NOTHING;

    case ROLES.TEAM_MANAGER:
      return user.company && user.team
        ? { company: user.company, team: user.team }
        : NOTHING;

    case ROLES.EMPLOYEE:
      return { _id: user._id };

    default: // PLATFORM_OWNER or anything unknown sees no employees
      return NOTHING;
  }
};

// 2. CAN THIS USER SEE ONE SPECIFIC PERSON?
export const canAccessUser = (user, target) => {
  if (user.role === ROLES.PLATFORM_OWNER) return false;
  if (sameId(user._id, target._id)) return true; // everyone can see themselves
  if (!sameId(user.company, target.company)) return false; // never cross companies

  switch (user.role) {
    case ROLES.COMPANY_HEAD:
      return true;
    case ROLES.DEPT_HEAD:
      return sameId(user.department, target.department);
    case ROLES.TEAM_MANAGER:
      return sameId(user.team, target.team);
    default:
      return false;
  }
};

// 3. CAN THIS USER EDIT OR DEACTIVATE THAT PERSON?
// Must be in scope, must not be themselves, and the target's rank must be lower.
export const canManageUser = (user, target) =>
  !sameId(user._id, target._id) &&
  canAccessUser(user, target) &&
  ROLE_LEVELS[target.role] < ROLE_LEVELS[user.role];

// 4. CAN THIS USER CREATE A PERSON WITH THIS ROLE? Only roles below their own.
export const canCreateRole = (user, roleToCreate) =>
  ROLE_LEVELS[roleToCreate] !== undefined &&
  ROLE_LEVELS[roleToCreate] < ROLE_LEVELS[user.role];