import express from 'express';
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  updateMyProfile,
  deactivateUser,
  resetUserPassword,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { ROLES } from '../utils/constants.js';

const router = express.Router();

const { COMPANY_HEAD, DEPT_HEAD, TEAM_MANAGER, EMPLOYEE } = ROLES;
const managers = authorizeRoles(COMPANY_HEAD, DEPT_HEAD, TEAM_MANAGER);

// Everything here needs login, and the Platform Owner is kept out of employee data.
router.use(protect, authorizeRoles(COMPANY_HEAD, DEPT_HEAD, TEAM_MANAGER, EMPLOYEE));

router.route('/').get(managers, getUsers).post(managers, createUser);

// "/me" MUST come before "/:id", or Express would treat "me" as an id
router.put('/me', updateMyProfile);

router.post('/:id/reset-password', managers, resetUserPassword);

router
  .route('/:id')
  .get(getUserById)
  .put(managers, updateUser)
  .delete(managers, deactivateUser);

export default router;