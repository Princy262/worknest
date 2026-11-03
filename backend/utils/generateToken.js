import jwt from 'jsonwebtoken';

// Shared cookie settings (also used when logging out)
export const cookieOptions = {
  httpOnly: true, // JavaScript in the browser can't read it
  secure: process.env.NODE_ENV === 'production', // HTTPS only when deployed
  sameSite: 'lax',
  maxAge: 24 * 60 * 60 * 1000, // 1 day
};

const generateToken = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });

  res.cookie('token', token, cookieOptions);
};

export default generateToken;