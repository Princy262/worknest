import express from 'express';
import {
  createCompany,
  listCompanies,
  updateCompany,
} from '../controllers/platformController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { ROLES } from '../utils/constants.js';

const router = express.Router();

// Login required, and ONLY the Platform Owner may use any route in this file.
router.use(protect, authorizeRoles(ROLES.PLATFORM_OWNER));

router.route('/companies').get(listCompanies).post(createCompany);
router.put('/companies/:id', updateCompany);

export default router;