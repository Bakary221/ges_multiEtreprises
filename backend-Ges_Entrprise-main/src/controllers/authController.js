const authService = require('../services/authService');
const Joi = require('joi');

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

class AuthController {
  async login(req, res) {
    try {
      const { error } = loginSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          errorCode: 'VALIDATION_ERROR',
          message: error.details[0].message,
        });
      }

      const { email, password } = req.body;
      const result = await authService.login(email, password);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(401).json({
        errorCode: 'AUTH_FAILED',
        message: error.message,
      });
    }
  }

  async registerSuperAdmin(req, res) {
    try {
      const { error } = registerSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          errorCode: 'VALIDATION_ERROR',
          message: error.details[0].message,
        });
      }

      const result = await authService.registerSuperAdmin(req.body);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        errorCode: 'REGISTRATION_FAILED',
        message: error.message,
      });
    }
  }

  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({
          errorCode: 'VALIDATION_ERROR',
          message: 'Refresh token required',
        });
      }

      const result = await authService.refreshToken(refreshToken);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(401).json({
        errorCode: 'REFRESH_FAILED',
        message: error.message,
      });
    }
  }

  async logout(req, res) {
    // Dans une vraie implémentation, on pourrait blacklister le token
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  }

  async impersonate(req, res) {
    try {
      const { companyId } = req.params;
      const result = await authService.impersonate(companyId, req.user.id);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        errorCode: 'IMPERSONATE_FAILED',
        message: error.message,
      });
    }
  }

  async revertImpersonate(req, res) {
    try {
      const result = await authService.revertImpersonate(req.user);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        errorCode: 'REVERT_IMPERSONATE_FAILED',
        message: error.message,
      });
    }
  }
}

module.exports = new AuthController();