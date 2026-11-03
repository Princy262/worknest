// Usage: authorizeRoles(ROLES.COMPANY_HEAD, ROLES.DEPT_HEAD)
export const authorizeRoles = (...allowedRoles) => (req, res, next) => {
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: 'You do not have permission to do this' });
  }
  next();
};