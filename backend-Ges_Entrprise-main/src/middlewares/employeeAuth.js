const prisma = require('../config/prisma');

const getEmployeeFromUser = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { employee: true },
    });

    if (!user || !user.employee) {
      return res.status(404).json({
        errorCode: 'EMPLOYEE_NOT_FOUND',
        message: 'Employee profile not found',
      });
    }

    req.employeeId = user.employee.id;
    next();
  } catch (error) {
    res.status(500).json({
      errorCode: 'AUTH_FAILED',
      message: 'Failed to authenticate employee',
    });
  }
};

module.exports = getEmployeeFromUser;