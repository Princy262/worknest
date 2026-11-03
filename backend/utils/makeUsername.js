// "Rahul Sharma" + "123"  ->  "Rahul123"
const makeUsername = (name, employeeId) => {
  const firstName = String(name)
    .trim()
    .split(/\s+/)[0]
    .replace(/[^A-Za-z0-9]/g, '');

  if (!firstName) {
    const error = new Error('Name must contain letters or numbers');
    error.statusCode = 400;
    throw error;
  }

  return `${firstName}${employeeId}`;
};

export default makeUsername;