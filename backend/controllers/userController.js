import User from '../models/User.js';
import Department from '../models/Department.js';
import Team from '../models/Team.js';
import makeUsername from '../utils/makeUsername.js';
import {
  ROLES,
  EMPLOYMENT_STATUS,
  CONTACT_FIELDS,
} from '../utils/constants.js';
import {
  getAccessibleUsersFilter,
  canAccessUser,
  canManageUser,
  canCreateRole,
} from '../utils/accessScope.js';

// ------------------------------------------------------------------
// Small helpers
// ------------------------------------------------------------------
const isText = (value) => typeof value === 'string' && value.trim().length > 0;
const isEmail = (value) =>
  typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
const isId = (value) => typeof value === 'string' && /^[0-9a-fA-F]{24}$/.test(value);
const isEmployeeId = (value) => isText(value) && /^[A-Za-z0-9]+$/.test(value.trim());
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Keeps only phone / address / emergencyContact, and only if they are text.
const pickContact = (contact) => {
  const result = {};
  if (!contact || typeof contact !== 'object') return result;
  for (const field of CONTACT_FIELDS) {
    if (typeof contact[field] === 'string') result[field] = contact[field].trim();
  }
  return result;
};

// ------------------------------------------------------------------
// CREATE USER   POST /api/users
// ------------------------------------------------------------------
export const createUser = async (req, res) => {
  const actor = req.user; // the logged-in person creating the account
  const { name, email, employeeId, password, role, designation, contact, department, team } =
    req.body || {};

  // 1. Basic input checks
  if (!isText(name) || !isEmail(email) || !isEmployeeId(employeeId) || !isText(password) || !isText(role)) {
    return res.status(400).json({
      message: 'name, email, employeeId (letters and numbers only), password and role are required',
    });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' });
  }

  // 2. Rank rule: only roles below the creator's own
  if (!canCreateRole(actor, role)) {
    return res.status(403).json({ message: 'You cannot create a user with this role' });
  }

  // 3. Work out where the new person sits in the hierarchy
  let departmentDoc = null;
  let teamDoc = null;

  if (role === ROLES.DEPT_HEAD) {
    if (!isId(department)) {
      return res.status(400).json({ message: 'department is required for a Department Head' });
    }
    departmentDoc = await Department.findOne({ _id: department, company: actor.company });
    if (!departmentDoc) return res.status(404).json({ message: 'Department not found' });
    if (departmentDoc.head) {
      return res.status(409).json({ message: 'This department already has a head' });
    }
  } else {
    // TEAM_MANAGER or EMPLOYEE. A Team Manager can only add people to their own team.
    const teamId = actor.role === ROLES.TEAM_MANAGER ? String(actor.team) : team;

    if (teamId !== undefined && teamId !== null) {
      if (!isId(teamId)) return res.status(400).json({ message: 'Invalid team' });
      teamDoc = await Team.findOne({ _id: teamId, company: actor.company });
      if (!teamDoc) return res.status(404).json({ message: 'Team not found' });
      departmentDoc = await Department.findById(teamDoc.department);
    } else if (role === ROLES.EMPLOYEE && department !== undefined) {
      if (!isId(department)) return res.status(400).json({ message: 'Invalid department' });
      departmentDoc = await Department.findOne({ _id: department, company: actor.company });
      if (!departmentDoc) return res.status(404).json({ message: 'Department not found' });
    }

    if (role === ROLES.TEAM_MANAGER) {
      if (!teamDoc) return res.status(400).json({ message: 'team is required for a Team Manager' });
      if (teamDoc.manager) {
        return res.status(409).json({ message: 'This team already has a manager' });
      }
    }
    if (!departmentDoc) {
      return res.status(400).json({ message: 'team or department is required' });
    }
  }

  // A Department Head may only add people inside their own department
  if (actor.role === ROLES.DEPT_HEAD && String(departmentDoc._id) !== String(actor.department)) {
    return res.status(403).json({ message: 'You can only add people to your own department' });
  }

  // 4. Decide the reporting manager automatically
  let reportingManager = actor._id;
  if (role === ROLES.TEAM_MANAGER && departmentDoc.head) {
    reportingManager = departmentDoc.head;
  }
  if (role === ROLES.EMPLOYEE) {
    reportingManager = (teamDoc && teamDoc.manager) || departmentDoc.head || actor._id;
  }

  // 5. Save. company, username and mustChangePassword come from the server, never the body.
  const user = await User.create({
    name: name.trim(),
    email: email.trim(),
    employeeId: employeeId.trim(),
    username: makeUsername(name, employeeId.trim()),
    password,
    mustChangePassword: true,
    role,
    designation: isText(designation) ? designation.trim() : undefined,
    contact: pickContact(contact),
    company: actor.company,
    department: departmentDoc._id,
    team: teamDoc ? teamDoc._id : undefined,
    reportingManager,
  });

  // 6. Link the new person as head or manager
  if (role === ROLES.DEPT_HEAD) {
    departmentDoc.head = user._id;
    await departmentDoc.save();
  }
  if (role === ROLES.TEAM_MANAGER) {
    teamDoc.manager = user._id;
    await teamDoc.save();
  }

  res.status(201).json({ user });
};

// ------------------------------------------------------------------
// LIST / SEARCH / FILTER   GET /api/users
// ------------------------------------------------------------------
export const getUsers = async (req, res) => {
  const { search, department, team, role, employmentStatus } = req.query;
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);

  const filters = []; // every item here narrows the result further

  if (isText(search)) {
    const pattern = new RegExp(escapeRegex(search.trim()), 'i');
    filters.push({
      $or: [{ name: pattern }, { email: pattern }, { username: pattern }, { employeeId: pattern }],
    });
  }
  if (department !== undefined) {
    if (!isId(department)) return res.status(400).json({ message: 'Invalid department' });
    filters.push({ department });
  }
  if (team !== undefined) {
    if (!isId(team)) return res.status(400).json({ message: 'Invalid team' });
    filters.push({ team });
  }
  if (role !== undefined) {
    if (!Object.values(ROLES).includes(role)) return res.status(400).json({ message: 'Invalid role' });
    filters.push({ role });
  }
  if (employmentStatus !== undefined) {
    if (!Object.values(EMPLOYMENT_STATUS).includes(employmentStatus)) {
      return res.status(400).json({ message: 'Invalid employmentStatus' });
    }
    filters.push({ employmentStatus });
  }

  // $and means the scope rule ALWAYS applies, and the filters can only narrow it further
  const query = { $and: [getAccessibleUsersFilter(req.user), ...filters] };

  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .sort({ name: 1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('department', 'name')
    .populate('team', 'name')
    .populate('reportingManager', 'name');

  res.json({ users, page, limit, total, totalPages: Math.ceil(total / limit) });
};

// ------------------------------------------------------------------
// GET ONE PROFILE   GET /api/users/:id
// ------------------------------------------------------------------
export const getUserById = async (req, res) => {
  const { id } = req.params;
  if (!isId(id)) return res.status(400).json({ message: 'Invalid ID' });

  const target = await User.findById(id);

  // Same answer for "does not exist" and "not allowed", so IDs can't be probed
  if (!target || !canAccessUser(req.user, target)) {
    return res.status(404).json({ message: 'User not found' });
  }

  await target.populate([
    { path: 'department', select: 'name' },
    { path: 'team', select: 'name' },
    { path: 'reportingManager', select: 'name email' },
  ]);

  res.json({ user: target });
};

// ------------------------------------------------------------------
// UPDATE SOMEONE BELOW YOU   PUT /api/users/:id
// ------------------------------------------------------------------
export const updateUser = async (req, res) => {
  const { id } = req.params;
  if (!isId(id)) return res.status(400).json({ message: 'Invalid ID' });

  const target = await User.findById(id);
  if (!target || !canAccessUser(req.user, target)) {
    return res.status(404).json({ message: 'User not found' });
  }
  if (!canManageUser(req.user, target)) {
    return res.status(403).json({ message: 'You cannot modify this user' });
  }

  const { name, email, employeeId, designation, employmentStatus, contact } = req.body || {};

  if (name !== undefined) {
    if (!isText(name)) return res.status(400).json({ message: 'Invalid name' });
    target.name = name.trim();
  }
  if (email !== undefined) {
    if (!isEmail(email)) return res.status(400).json({ message: 'Invalid email' });
    target.email = email.trim();
  }
  if (employeeId !== undefined) {
    if (!isEmployeeId(employeeId)) return res.status(400).json({ message: 'Invalid employeeId' });
    target.employeeId = employeeId.trim();
  }
  if (designation !== undefined) {
    if (typeof designation !== 'string') return res.status(400).json({ message: 'Invalid designation' });
    target.designation = designation.trim();
  }
  if (employmentStatus !== undefined) {
    if (employmentStatus === EMPLOYMENT_STATUS.INACTIVE) {
      return res.status(400).json({ message: 'To deactivate a user, use the DELETE route' });
    }
    if (!Object.values(EMPLOYMENT_STATUS).includes(employmentStatus)) {
      return res.status(400).json({ message: 'Invalid employmentStatus' });
    }
    target.employmentStatus = employmentStatus;
  }
  if (contact !== undefined) {
    for (const [field, value] of Object.entries(pickContact(contact))) {
      target.set(`contact.${field}`, value);
    }
  }

  // Keep the rule "username = first name + employeeId" true after edits
  if (name !== undefined || employeeId !== undefined) {
    target.username = makeUsername(target.name, target.employeeId);
  }

  await target.save();
  res.json({ user: target });
};

// ------------------------------------------------------------------
// UPDATE MY OWN CONTACT INFO   PUT /api/users/me
// ------------------------------------------------------------------
export const updateMyProfile = async (req, res) => {
  const updates = pickContact(req.body?.contact);

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({
      message: `Send at least one contact field: ${CONTACT_FIELDS.join(', ')}`,
    });
  }

  const user = await User.findById(req.user._id);
  for (const [field, value] of Object.entries(updates)) {
    user.set(`contact.${field}`, value);
  }
  await user.save();

  res.json({ user });
};

// ------------------------------------------------------------------
// DEACTIVATE (soft delete)   DELETE /api/users/:id
// ------------------------------------------------------------------
export const deactivateUser = async (req, res) => {
  const { id } = req.params;
  if (!isId(id)) return res.status(400).json({ message: 'Invalid ID' });

  const target = await User.findById(id);
  if (!target || !canAccessUser(req.user, target)) {
    return res.status(404).json({ message: 'User not found' });
  }
  if (!canManageUser(req.user, target)) {
    return res.status(403).json({ message: 'You cannot deactivate this user' });
  }

  target.employmentStatus = EMPLOYMENT_STATUS.INACTIVE;
  await target.save();

  // If they were a department head or team manager, free up that position
  await Department.updateMany({ head: target._id }, { $unset: { head: 1 } });
  await Team.updateMany({ manager: target._id }, { $unset: { manager: 1 } });

  res.json({ message: 'User deactivated' });
};