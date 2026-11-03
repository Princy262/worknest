import Department from '../models/Department.js';
import Team from '../models/Team.js';
import User from '../models/User.js';
import { EMPLOYMENT_STATUS } from '../utils/constants.js';
import { isText, isId } from '../utils/validators.js';
import {
  getAccessibleDepartmentsFilter,
  canAccessDepartment,
} from '../utils/accessScope.js';

// ------------------------------------------------------------------
// CREATE DEPARTMENT   POST /api/departments   (Company Head only)
// ------------------------------------------------------------------
export const createDepartment = async (req, res) => {
  const { name, description } = req.body || {};

  if (!isText(name)) {
    return res.status(400).json({ message: 'Department name is required' });
  }

  // company comes from the logged-in user, never from the request body
  const department = await Department.create({
    name: name.trim(),
    description: isText(description) ? description.trim() : undefined,
    company: req.user.company,
  });

  res.status(201).json({ department });
};

// ------------------------------------------------------------------
// LIST DEPARTMENTS   GET /api/departments
// ------------------------------------------------------------------
export const getDepartments = async (req, res) => {
  const departments = await Department.find(getAccessibleDepartmentsFilter(req.user))
    .sort({ name: 1 })
    .populate('head', 'name email');

  res.json({ departments });
};

// ------------------------------------------------------------------
// GET ONE DEPARTMENT (with its teams)   GET /api/departments/:id
// ------------------------------------------------------------------
export const getDepartmentById = async (req, res) => {
  const { id } = req.params;
  if (!isId(id)) return res.status(400).json({ message: 'Invalid ID' });

  const department = await Department.findById(id).populate('head', 'name email');

  // Same answer for "does not exist" and "not allowed"
  if (!department || !canAccessDepartment(req.user, department)) {
    return res.status(404).json({ message: 'Department not found' });
  }

  const teams = await Team.find({ department: department._id })
    .sort({ name: 1 })
    .populate('manager', 'name email');

  res.json({ department, teams });
};

// ------------------------------------------------------------------
// UPDATE DEPARTMENT   PUT /api/departments/:id   (Company Head only)
// ------------------------------------------------------------------
export const updateDepartment = async (req, res) => {
  const { id } = req.params;
  if (!isId(id)) return res.status(400).json({ message: 'Invalid ID' });

  const department = await Department.findById(id);
  if (!department || !canAccessDepartment(req.user, department)) {
    return res.status(404).json({ message: 'Department not found' });
  }

  const { name, description } = req.body || {};

  if (name !== undefined) {
    if (!isText(name)) return res.status(400).json({ message: 'Invalid name' });
    department.name = name.trim();
  }
  if (description !== undefined) {
    if (typeof description !== 'string') {
      return res.status(400).json({ message: 'Invalid description' });
    }
    department.description = description.trim();
  }

  await department.save();
  res.json({ department });
};

// ------------------------------------------------------------------
// DELETE DEPARTMENT   DELETE /api/departments/:id   (Company Head only)
// ------------------------------------------------------------------
export const deleteDepartment = async (req, res) => {
  const { id } = req.params;
  if (!isId(id)) return res.status(400).json({ message: 'Invalid ID' });

  const department = await Department.findById(id);
  if (!department || !canAccessDepartment(req.user, department)) {
    return res.status(404).json({ message: 'Department not found' });
  }

  // Safety: never delete a department that still has teams or active people
  if (await Team.exists({ department: department._id })) {
    return res.status(409).json({ message: 'Delete or move this department\'s teams first' });
  }
  if (
    await User.exists({
      department: department._id,
      employmentStatus: { $ne: EMPLOYMENT_STATUS.INACTIVE },
    })
  ) {
    return res.status(409).json({ message: 'This department still has active people' });
  }

  await department.deleteOne();
  res.json({ message: 'Department deleted' });
};