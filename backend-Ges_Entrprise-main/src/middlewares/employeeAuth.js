const prisma = require('../config/prisma');

const getEmployeeFromUser = async (req, res, next) => {
  // Bypassed for testing - set dummy employeeId
  console.log('🔐 GET_EMPLOYEE_FROM_USER: Bypassed - setting dummy employeeId');
  req.employeeId = 1; // Dummy employee ID
  next();
};

module.exports = getEmployeeFromUser;