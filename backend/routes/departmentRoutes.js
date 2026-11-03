import express from 'express';
import {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
} from '../controllers/departmentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { ROLES } from '../utils/constants.js';

const router = express.Router();

const { COMPANY_HEAD, DEPT_HEAD } = ROLES;

// Login required. Only Company Heads and Dept Heads may use any department route.
router.use(protect, authorizeRoles(COMPANY_HEAD, DEPT_HEAD));

router
  .route('/')
  .get(getDepartments)
  .post(authorizeRoles(COMPANY_HEAD), createDepartment);

router
  .route('/:id')
  .get(getDepartmentById)
  .put(authorizeRoles(COMPANY_HEAD), updateDepartment)
  .delete(authorizeRoles(COMPANY_HEAD), deleteDepartment);

export default router;