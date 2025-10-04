const bankIntegrationService = require('../services/bankIntegrationService');
const Joi = require('joi');

const paymentSchema = Joi.object({
  provider: Joi.string().valid('orange-money', 'wave', 'bank-transfer').required(),
  amount: Joi.number().positive().required(),
  recipientPhone: Joi.string().when('provider', {
    is: Joi.valid('orange-money', 'wave'),
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
  recipientBank: Joi.string().when('provider', {
    is: 'bank-transfer',
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
  currency: Joi.string().default('XOF'),
});

class IntegrationController {
  async initiatePayment(req, res) {
    try {
      const { error } = paymentSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          errorCode: 'VALIDATION_ERROR',
          message: error.details[0].message,
        });
      }

      const paymentData = req.body;

      // Valider le destinataire
      const isValidRecipient = await bankIntegrationService.validateRecipient(
        paymentData.provider,
        paymentData.recipientPhone || paymentData.recipientBank
      );

      if (!isValidRecipient) {
        return res.status(400).json({
          errorCode: 'INVALID_RECIPIENT',
          message: 'Invalid recipient format for selected provider',
        });
      }

      const result = await bankIntegrationService.initiatePayment(paymentData);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        errorCode: 'PAYMENT_INITIATION_FAILED',
        message: error.message,
      });
    }
  }

  async checkPaymentStatus(req, res) {
    try {
      const { transactionId } = req.params;

      if (!transactionId) {
        return res.status(400).json({
          errorCode: 'VALIDATION_ERROR',
          message: 'Transaction ID is required',
        });
      }

      const result = await bankIntegrationService.checkPaymentStatus(transactionId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        errorCode: 'PAYMENT_STATUS_CHECK_FAILED',
        message: error.message,
      });
    }
  }

  async getSupportedProviders(req, res) {
    try {
      const { country } = req.query;
      const providers = await bankIntegrationService.getSupportedProviders(country);

      res.json({
        success: true,
        data: providers,
      });
    } catch (error) {
      res.status(500).json({
        errorCode: 'GET_PROVIDERS_FAILED',
        message: error.message,
      });
    }
  }

  async getExchangeRate(req, res) {
    try {
      const { from, to } = req.params;

      if (!from || !to) {
        return res.status(400).json({
          errorCode: 'VALIDATION_ERROR',
          message: 'Both from and to currencies are required',
        });
      }

      const result = await bankIntegrationService.getExchangeRate(from.toUpperCase(), to.toUpperCase());

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        errorCode: 'EXCHANGE_RATE_FAILED',
        message: error.message,
      });
    }
  }

  async bulkPayment(req, res) {
    try {
      const { payments } = req.body;

      if (!Array.isArray(payments) || payments.length === 0) {
        return res.status(400).json({
          errorCode: 'VALIDATION_ERROR',
          message: 'Payments array is required and cannot be empty',
        });
      }

      // Valider chaque paiement
      for (const payment of payments) {
        const { error } = paymentSchema.validate(payment);
        if (error) {
          return res.status(400).json({
            errorCode: 'VALIDATION_ERROR',
            message: `Invalid payment data: ${error.details[0].message}`,
          });
        }
      }

      const result = await bankIntegrationService.bulkPayment(payments);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        errorCode: 'BULK_PAYMENT_FAILED',
        message: error.message,
      });
    }
  }
}

module.exports = new IntegrationController();