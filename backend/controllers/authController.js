import User from '../models/User.js';
import Company from '../models/Company.js';
import generateToken, { cookieOptions } from '../utils/generateToken.js';
import { COMPANY_STATUS, EMPLOYMENT_STATUS } from '../utils/constants.js';

// ---------- LOGIN ----------
export const login = async (req, res) => {
  const { identifier, password } = req.body || {};

  // Must be plain text (blocks tricks like sending an object instead of a string)
  if (typeof identifier !== 'string' || typeof password !== 'string' || !identifier || !password) {
    return res.status(400).json({ message: 'Email/username and password are required' });
  }

  // Match by email OR username, ignoring upper/lower case
  const user = await User.findOne({
    $or: [{ email: identifier.trim() }, { username: identifier.trim() }],
  })
    .collation({ locale: 'en', strength: 2 })
    .select('+password'); // password is hidden by default

  // Same vague message for "no such user" and "wrong password"
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid email/username or password' });
  }

  if (user.employmentStatus === EMPLOYMENT_STATUS.INACTIVE) {
    return res.status(403).json({ message: 'This account is inactive' });
  }

  if (user.company) {
    const company = await Company.findById(user.company).select('status');
    if (!company || company.status !== COMPANY_STATUS.ACTIVE) {
      return res.status(403).json({ message: 'This company is inactive' });
    }
  }

  generateToken(res, user._id);

  // toJSON in User.js removes the password from this response
  res.json({ user });
};

// ---------- LOGOUT ----------
export const logout = async (req, res) => {
  res.clearCookie('token', cookieOptions);
  res.json({ message: 'Logged out' });
};

// ---------- GET ME ----------
export const getMe = async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('company', 'name status')
    .populate('department', 'name')
    .populate('team', 'name');

  res.json({ user });
};

// ---------- CHANGE PASSWORD ----------
export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};

  if (typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
    return res.status(400).json({ message: 'Current and new password are required' });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ message: 'New password must be at least 8 characters' });
  }
  if (newPassword === currentPassword) {
    return res.status(400).json({ message: 'New password must be different from the current one' });
  }

  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.matchPassword(currentPassword))) {
    return res.status(401).json({ message: 'Current password is incorrect' });
  }

  user.password = newPassword; // the pre-save hook hashes it
  user.mustChangePassword = false;
  await user.save();

  generateToken(res, user._id);
  res.json({ message: 'Password changed successfully' });
};