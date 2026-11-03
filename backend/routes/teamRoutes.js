import express from 'express';
import {
  createTeam,
  getTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
} from '../controllers/teamController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { ROLES } from '../utils/constants.js';

const router = express.Router();

const { COMPANY_HEAD, DEPT_HEAD, TEAM_MANAGER } = ROLES;
const heads = authorizeRoles(COMPANY_HEAD, DEPT_HEAD);

// Login required. Team Managers may only read, so they pass this gate but not `heads`.
router.use(protect, authorizeRoles(COMPANY_HEAD, DEPT_HEAD, TEAM_MANAGER));

router.route('/').get(getTeams).post(heads, createTeam);

router.route('/:id').get(getTeamById).put(heads, updateTeam).delete(heads, deleteTeam);

export default router;