// Runs when no route matched
export const notFound = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
};

// Catches every error thrown anywhere and answers in one consistent format
export const errorHandler = (err, req, res, next) => {
  let status = err.statusCode || 500;
  let message = err.message || 'Server error';

  // Mongoose validation failed (missing field, wrong enum value, ...)
  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  }

  // Duplicate key (email, username, employeeId already used)
  if (err.code === 11000) {
    status = 409;
    message = `Already exists: ${Object.keys(err.keyValue || {}).join(', ')}`;
  }

  // Bad ObjectId in a URL
  if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid ID';
  }

  if (status === 500) console.error(err);

  res.status(status).json({
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};