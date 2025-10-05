const { verifyToken } = require('../utils/jwt');
const prisma = require('../config/prisma');

const authenticate = (req, res, next) => {
  const authHeader = req.header('Authorization');
  console.log('🔐 AUTHENTICATE: Raw Authorization header:', authHeader);

  const token = authHeader?.replace('Bearer ', '');
  console.log('🔐 AUTHENTICATE: Extracted token (first 20 chars):', token ? token.substring(0, 20) + '...' : 'null');

  if (!token) {
    console.log('❌ AUTHENTICATE: No token provided');
    return res.status(401).json({ errorCode: 'UNAUTHORIZED', message: 'Access token required' });
  }

  try {
    const decoded = verifyToken(token, process.env.JWT_SECRET);
    console.log('✅ AUTHENTICATE: Token decoded successfully. User:', {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      companyId: decoded.companyId
    });
    req.user = decoded;
    next();
  } catch (error) {
    console.log('❌ AUTHENTICATE: Token verification failed:', error.message);
    return res.status(401).json({ errorCode: 'INVALID_TOKEN', message: 'Invalid access token' });
  }
};

const authorize = (...roles) => {
  // Support both array and rest parameters
  const allowedRoles = Array.isArray(roles[0]) ? roles[0] : roles;

  return async (req, res, next) => {
    console.log('🔐 AUTHORIZE: Checking permissions for user:', req.user?.email, 'Role:', req.user?.role);
    console.log('🔐 AUTHORIZE: Request path:', req.path, 'Method:', req.method);
    console.log('🔐 AUTHORIZE: Raw roles parameter:', roles);
    console.log('🔐 AUTHORIZE: Allowed roles:', allowedRoles);
    console.log('🔐 AUTHORIZE: Stack trace:', new Error().stack.split('\n').slice(2, 5).join('\n'));

    if (!req.user) {
      console.log('❌ AUTHORIZE: No user in request - authentication failed');
      return res.status(401).json({ errorCode: 'UNAUTHORIZED', message: 'Authentication required' });
    }

    console.log('🔐 AUTHORIZE: User role from token:', req.user.role);
    console.log('🔐 AUTHORIZE: Checking if role is allowed...');

    if (!allowedRoles.includes(req.user.role)) {
      console.log('❌ AUTHORIZE: Role not authorized. Required:', allowedRoles, 'User role:', req.user.role);
      return res.status(403).json({ errorCode: 'FORBIDDEN', message: 'Insufficient permissions' });
    }

    console.log('✅ AUTHORIZE: Role check passed');

    // Pour les rôles non-superadmin, vérifier la company
    if (req.user.role !== 'SUPERADMIN') {
      console.log('🔄 AUTHORIZE: Checking company access for non-superadmin user, userId:', req.user.id);

      try {
        const user = await prisma.user.findUnique({
          where: { id: req.user.id },
          select: { companyId: true, status: true, email: true }
        });

        console.log('📋 AUTHORIZE: Database user lookup result:', {
          id: user?.id,
          email: user?.email,
          companyId: user?.companyId,
          status: user?.status
        });

        if (!user) {
          console.log('❌ AUTHORIZE: User not found in database');
          return res.status(403).json({ errorCode: 'FORBIDDEN', message: 'User not found' });
        }

        if (user.status !== 'ACTIVE') {
          console.log('❌ AUTHORIZE: User status is not ACTIVE, status:', user.status);
          return res.status(403).json({ errorCode: 'FORBIDDEN', message: 'User inactive' });
        }

        if (!user.companyId) {
          console.log('❌ AUTHORIZE: No companyId for user in database');
          return res.status(403).json({ errorCode: 'FORBIDDEN', message: 'No company associated with user' });
        }

        req.user.companyId = user.companyId;
        console.log('✅ AUTHORIZE: Company access granted. Final req.user:', {
          id: req.user.id,
          email: req.user.email,
          role: req.user.role,
          companyId: req.user.companyId
        });
      } catch (dbError) {
        console.log('❌ AUTHORIZE: Database error during user lookup:', dbError.message);
        return res.status(500).json({ errorCode: 'INTERNAL_ERROR', message: 'Database error' });
      }
    } else {
      console.log('✅ AUTHORIZE: SUPERADMIN user - skipping company check');
    }

    console.log('🎯 AUTHORIZE: Authorization successful, proceeding to controller');
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