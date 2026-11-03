import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Company from '../models/Company.js';
import { COMPANY_STATUS, EMPLOYMENT_STATUS } from '../utils/constants.js';

// While mustChangePassword is true, only these routes work.
const ALLOWED_WHEN_PASSWORD_CHANGE_REQUIRED = [
  '/api/auth/me',
  '/api/auth/logout',
  '/api/auth/change-password',
];

export const protect = async (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ message: 'Not logged in' });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ message: 'Session expired or invalid. Please log in again.' });
  }

  const user = await User.findById(decoded.id);
  if (!user || user.employmentStatus === EMPLOYMENT_STATUS.INACTIVE) {
    return res.status(401).json({ message: 'Account not available' });
  }

  // Users of an inactive company are locked out (the Platform Owner has no company)
  if (user.company) {
    const company = await Company.findById(user.company).select('status');
    if (!company || company.status !== COMPANY_STATUS.ACTIVE) {
      return res.status(403).json({ message: 'This company is inactive' });
    }
  }

  // Forced password change
  if (user.mustChangePassword) {
    const path = req.originalUrl.split('?')[0];
    if (!ALLOWED_WHEN_PASSWORD_CHANGE_REQUIRED.includes(path)) {
      return res.status(403).json({
        message: 'You must change your password first',
        mustChangePassword: true,
      });
    }
  }

  req.user = user;
  next();
};