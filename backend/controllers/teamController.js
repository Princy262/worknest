import Department from '../models/Department.js';
import Team from '../models/Team.js';
import User from '../models/User.js';
import { ROLES, EMPLOYMENT_STATUS } from '../utils/constants.js';
import { isText, isId } from '../utils/validators.js';
import { getAccessibleTeamsFilter, canAccessTeam } from '../utils/accessScope.js';

// ------------------------------------------------------------------
// CREATE TEAM   POST /api/teams   (Company Head, Dept Head)
// ------------------------------------------------------------------
export const createTeam = async (req, res) => {
  const actor = req.user;
  const { name, description, department } = req.body || {};

  if (!isText(name)) {
    return res.status(400).json({ message: 'Team name is required' });
  }

  // A Dept Head can only create teams in their own department
  const departmentId = actor.role === ROLES.DEPT_HEAD ? String(actor.department) : department;

  if (!isId(departmentId)) {
    return res.status(400).json({ message: 'department is required' });
  }

  // The department must exist AND belong to the actor's company
  const departmentDoc = await Department.findOne({ _id: departmentId, company: actor.company });
  if (!departmentDoc) {
    return res.status(404).json({ message: 'Department not found' });
  }

  const team = await Team.create({
    name: name.trim(),
    description: isText(description) ? description.trim() : undefined,
    company: actor.company,
    department: departmentDoc._id,
  });

  res.status(201).json({ team });
};

// ------------------------------------------------------------------
// LIST TEAMS   GET /api/teams
// ------------------------------------------------------------------
export const getTeams = async (req, res) => {
  const { department } = req.query;
  const filters = [];

  if (department !== undefined) {
    if (!isId(department)) return res.status(400).json({ message: 'Invalid department' });
    filters.push({ department });
  }

  // $and keeps the scope rule in force; filters can only narrow it
  const query = { $and: [getAccessibleTeamsFilter(req.user), ...filters] };

  const teams = await Team.find(query)
    .sort({ name: 1 })
    .populate('department', 'name')
    .populate('manager', 'name email');

  res.json({ teams });
};

// ------------------------------------------------------------------
// GET ONE TEAM   GET /api/teams/:id
// ------------------------------------------------------------------
export const getTeamById = async (req, res) => {
  const { id } = req.params;
  if (!isId(id)) return res.status(400).json({ message: 'Invalid ID' });

  const team = await Team.findById(id)
    .populate('department', 'name')
    .populate('manager', 'name email');

  if (!team || !canAccessTeam(req.user, team)) {
    return res.status(404).json({ message: 'Team not found' });
  }

  const memberCount = await User.countDocuments({
    team: team._id,
    employmentStatus: { $ne: EMPLOYMENT_STATUS.INACTIVE },
  });

  res.json({ team, memberCount });
};

// ------------------------------------------------------------------
// UPDATE TEAM   PUT /api/teams/:id   (Company Head, Dept Head)
// ------------------------------------------------------------------
export const updateTeam = async (req, res) => {
  const { id } = req.params;
  if (!isId(id)) return res.status(400).json({ message: 'Invalid ID' });

  const team = await Team.findById(id);
  if (!team || !canAccessTeam(req.user, team)) {
    return res.status(404).json({ message: 'Team not found' });
  }

  const { name, description } = req.body || {};

  if (name !== undefined) {
    if (!isText(name)) return res.status(400).json({ message: 'Invalid name' });
    team.name = name.trim();
  }
  if (description !== undefined) {
    if (typeof description !== 'string') {
      return res.status(400).json({ message: 'Invalid description' });
    }
    team.description = description.trim();
  }

  await team.save();
  res.json({ team });
};

// ------------------------------------------------------------------
// DELETE TEAM   DELETE /api/teams/:id   (Company Head, Dept Head)
// ------------------------------------------------------------------
export const deleteTeam = async (req, res) => {
  const { id } = req.params;
  if (!isId(id)) return res.status(400).json({ message: 'Invalid ID' });

  const team = await Team.findById(id);
  if (!team || !canAccessTeam(req.user, team)) {
    return res.status(404).json({ message: 'Team not found' });
  }

  // Safety: never delete a team that still has active people (including its manager)
  if (
    await User.exists({
      team: team._id,
      employmentStatus: { $ne: EMPLOYMENT_STATUS.INACTIVE },
    })
  ) {
    return res.status(409).json({ message: 'This team still has active members' });
  }

  await team.deleteOne();
  res.json({ message: 'Team deleted' });
};