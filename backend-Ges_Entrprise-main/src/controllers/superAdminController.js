const superAdminService = require('../services/superAdminService');
const payrollService = require('../services/admin/payrollService');
const paymentService = require('../services/caissier/paymentService');
const loanService = require('../services/caissier/loanService');
const Joi = require('joi');

const companySchema = Joi.object({
  name: Joi.string().required(),
  currency: Joi.string().optional(),
  logo: Joi.string().uri().optional(),
  primaryColor: Joi.string().optional(),
  secondaryColor: Joi.string().optional(),
  adminEmail: Joi.string().email().required(),
  adminPassword: Joi.string().min(6).required(),
  adminName: Joi.string().required(),
  adminPosition: Joi.string().optional(),
});

const userSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('ADMIN', 'CAISSIER').required(),
});

const companyWithAdminSchema = Joi.object({
  name: Joi.string().required(),
  currency: Joi.string().optional(),
  logo: Joi.string().uri().optional(),
  primaryColor: Joi.string().optional(),
  secondaryColor: Joi.string().optional(),
  adminEmail: Joi.string().email().required(),
  adminPassword: Joi.string().min(6).required(),
  adminName: Joi.string().required(),
  adminPosition: Joi.string().optional(),
});

class SuperAdminController {
  async createCompany(req, res) {
    try {
      console.log('📥 Données reçues du frontend:', req.body);

      const { error } = companySchema.validate(req.body);
      if (error) {
        console.log('❌ Erreur de validation:', error.details[0].message);
        return res.status(400).json({
          errorCode: 'VALIDATION_ERROR',
          message: error.details[0].message,
        });
      }

      console.log('✅ Validation passée, création de l\'entreprise...');
      const company = await superAdminService.createCompany(req.body);
      console.log('✅ Entreprise créée avec succès:', company);

      res.status(201).json({
        success: true,
        data: company,
      });
    } catch (error) {
      res.status(400).json({
        errorCode: 'CREATE_COMPANY_FAILED',
        message: error.message,
      });
    }
  }

  async createCompanyWithAdmin(req, res) {
    try {
      const { error } = companyWithAdminSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          errorCode: 'VALIDATION_ERROR',
          message: error.details[0].message,
        });
      }

      const result = await superAdminService.createCompanyWithAdmin(req.body);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        errorCode: 'CREATE_COMPANY_WITH_ADMIN_FAILED',
        message: error.message,
      });
    }
  }

  async getCompanies(req, res) {
    try {
      const companies = await superAdminService.getCompanies();

      res.json({
        success: true,
        data: companies,
      });
    } catch (error) {
      res.status(500).json({
        errorCode: 'GET_COMPANIES_FAILED',
        message: error.message,
      });
    }
  }

  async getCompanyById(req, res) {
    try {
      const { id } = req.params;
      const company = await superAdminService.getCompanyById(id);

      res.json({
        success: true,
        data: company,
      });
    } catch (error) {
      const status = error.message === 'Company not found' ? 404 : 500;
      res.status(status).json({
        errorCode: 'GET_COMPANY_FAILED',
        message: error.message,
      });
    }
  }

  async updateCompany(req, res) {
    try {
      const { error } = companySchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          errorCode: 'VALIDATION_ERROR',
          message: error.details[0].message,
        });
      }

      const { id } = req.params;
      const company = await superAdminService.updateCompany(id, req.body);

      res.json({
        success: true,
        data: company,
      });
    } catch (error) {
      res.status(400).json({
        errorCode: 'UPDATE_COMPANY_FAILED',
        message: error.message,
      });
    }
  }

  async deleteCompany(req, res) {
    try {
      const { id } = req.params;
      const result = await superAdminService.deleteCompany(id);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        errorCode: 'DELETE_COMPANY_FAILED',
        message: error.message,
      });
    }
  }

  async createUserForCompany(req, res) {
    try {
      const { error } = userSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          errorCode: 'VALIDATION_ERROR',
          message: error.details[0].message,
        });
      }

      const { companyId } = req.params;
      const user = await superAdminService.createUserForCompany(companyId, req.body);

      res.status(201).json({
        success: true,
        data: user,
      });
    } catch (error) {
      res.status(400).json({
        errorCode: 'CREATE_USER_FAILED',
        message: error.message,
      });
    }
  }

  async getLogs(req, res) {
    try {
      const filters = req.query;
      const result = await superAdminService.getLogs(filters);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        errorCode: 'GET_LOGS_FAILED',
        message: error.message,
      });
    }
  }

  async uploadFile(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          errorCode: 'VALIDATION_ERROR',
          message: 'Aucun fichier uploadé',
        });
      }

      // Retourner l'URL accessible du fichier
      const fileUrl = `${req.protocol}://${req.get('host')}/uploads/logos/${req.file.filename}`;

      res.json({
        success: true,
        data: {
          filename: req.file.originalname,
          url: fileUrl,
          size: req.file.size,
        },
      });
    } catch (error) {
      res.status(500).json({
        errorCode: 'UPLOAD_FAILED',
        message: error.message,
      });
    }
  }

  async getDashboardStats(req, res) {
    try {
      const stats = await superAdminService.getDashboardStats();

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      res.status(500).json({
        errorCode: 'GET_DASHBOARD_STATS_FAILED',
        message: error.message,
      });
    }
  }

  // Payroll and Payment management for SuperAdmin
  async getAllPayslips(req, res) {
    try {
      const filters = req.query;
      // For SuperAdmin, we need to get payslips from all companies
      // This requires modifying the service to handle company filtering differently
      const result = await payrollService.getPayslips(null, filters);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        errorCode: 'GET_PAYSLIPS_FAILED',
        message: error.message,
      });
    }
  }

  async getAllPayments(req, res) {
    try {
      const filters = req.query;
      // For SuperAdmin, we need to get payments from all companies
      const result = await paymentService.getPayments(null, filters);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        errorCode: 'GET_PAYMENTS_FAILED',
        message: error.message,
      });
    }
  }

  async getAllLoans(req, res) {
    try {
      const filters = req.query;
      // For SuperAdmin, we need to get loans from all companies
      const result = await loanService.getLoans(null, filters);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        errorCode: 'GET_LOANS_FAILED',
        message: error.message,
      });
    }
  }

  async getPayrollSummary(req, res) {
    try {
      const filters = req.query;
      // Get summary for all companies or specific company
      const summary = await payrollService.getPayrollSummary(null, filters);

      res.json({
        success: true,
        data: summary,
      });
    } catch (error) {
      res.status(500).json({
        errorCode: 'GET_PAYROLL_SUMMARY_FAILED',
        message: error.message,
      });
    }
  }
}

module.exports = new SuperAdminController();