const bcrypt = require('bcryptjs');
const { generateAccessToken, generateRefreshToken, verifyToken } = require('../utils/jwt');
const prisma = require('../config/prisma');

class AuthService {
  async registerSuperAdmin(data) {
    const { email, password } = data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'SUPERADMIN',
      },
    });

    return { id: user.id, email: user.email, role: user.role };
  }

  async login(email, password) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { company: true }
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        company: user.company,
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshToken) {
    try {
      const decoded = verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET);
      const user = await prisma.user.findUnique({ where: { id: decoded.id } });

      if (!user || user.status !== 'ACTIVE') {
        throw new Error('Invalid refresh token');
      }

      const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
      };

      const newAccessToken = generateAccessToken(payload);
      const newRefreshToken = generateRefreshToken(payload);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  async impersonate(companyId, superAdminId) {
    const company = await prisma.company.findUnique({
      where: { id: parseInt(companyId) },
      include: { users: { where: { role: 'ADMIN' }, take: 1 } }
    });

    if (!company) {
      throw new Error('Company not found');
    }

    const adminUser = company.users[0];
    if (!adminUser) {
      throw new Error('No admin found for this company');
    }

    const payload = {
      id: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
      companyId: adminUser.companyId,
      impersonatedBy: superAdminId,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return {
      user: {
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
        company: company,
      },
      accessToken,
      refreshToken,
    };
  }
}

module.exports = new AuthService();