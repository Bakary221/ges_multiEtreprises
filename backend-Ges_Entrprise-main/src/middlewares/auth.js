const { verifyToken } = require('../utils/jwt');
const prisma = require('../config/prisma');

const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ errorCode: 'UNAUTHORIZED', message: 'Access token required' });
  }

  try {
    const decoded = verifyToken(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ errorCode: 'INVALID_TOKEN', message: 'Invalid access token' });
  }
};

const authorize = (...roles) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ errorCode: 'UNAUTHORIZED', message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ errorCode: 'FORBIDDEN', message: 'Insufficient permissions' });
    }

    // Pour les rôles non-superadmin, vérifier la company
    if (req.user.role !== 'SUPERADMIN') {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { companyId: true, status: true }
      });

      if (!user || user.status !== 'ACTIVE') {
        return res.status(403).json({ errorCode: 'FORBIDDEN', message: 'User inactive or not found' });
      }

      req.user.companyId = user.companyId;
    }

    next();
  };
};

const checkCompanyAccess = (req, res, next) => {
  const { companyId } = req.params;
  if (req.user.role !== 'SUPERADMIN' && req.user.companyId !== parseInt(companyId)) {
    return res.status(403).json({ errorCode: 'FORBIDDEN', message: 'Access denied to this company' });
  }
  next();
};

module.exports = {
  authenticate,
  authorize,
  checkCompanyAccess,
};