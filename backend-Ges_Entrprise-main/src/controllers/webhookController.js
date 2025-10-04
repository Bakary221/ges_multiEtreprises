const webhookService = require('../services/webhookService');
const Joi = require('joi');

const webhookSchema = Joi.object({
  url: Joi.string().uri().required(),
  secret: Joi.string().min(16).required(),
});

class WebhookController {
  async registerWebhook(req, res) {
    try {
      const { error } = webhookSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          errorCode: 'VALIDATION_ERROR',
          message: error.details[0].message,
        });
      }

      const webhook = webhookService.registerWebhook(
        req.user.companyId,
        req.body.url,
        req.body.secret
      );

      res.status(201).json({
        success: true,
        data: webhook,
      });
    } catch (error) {
      res.status(400).json({
        errorCode: 'WEBHOOK_REGISTRATION_FAILED',
        message: error.message,
      });
    }
  }

  async getWebhooks(req, res) {
    try {
      const webhooks = webhookService.getWebhooks(req.user.companyId);

      res.json({
        success: true,
        data: webhooks,
      });
    } catch (error) {
      res.status(500).json({
        errorCode: 'GET_WEBHOOKS_FAILED',
        message: error.message,
      });
    }
  }

  async deleteWebhook(req, res) {
    try {
      const { id } = req.params;
      const deleted = webhookService.unregisterWebhook(req.user.companyId, id);

      if (!deleted) {
        return res.status(404).json({
          errorCode: 'WEBHOOK_NOT_FOUND',
          message: 'Webhook not found',
        });
      }

      res.json({
        success: true,
        message: 'Webhook deleted successfully',
      });
    } catch (error) {
      res.status(400).json({
        errorCode: 'DELETE_WEBHOOK_FAILED',
        message: error.message,
      });
    }
  }

  // Endpoint pour tester les webhooks
  async testWebhook(req, res) {
    try {
      const { id } = req.params;
      const webhooks = webhookService.getWebhooks(req.user.companyId);
      const webhook = webhooks.find(w => w.id === id);

      if (!webhook) {
        return res.status(404).json({
          errorCode: 'WEBHOOK_NOT_FOUND',
          message: 'Webhook not found',
        });
      }

      await webhookService.triggerWebhook(req.user.companyId, 'test', {
        message: 'This is a test webhook',
        timestamp: new Date().toISOString(),
      });

      res.json({
        success: true,
        message: 'Test webhook sent',
      });
    } catch (error) {
      res.status(400).json({
        errorCode: 'TEST_WEBHOOK_FAILED',
        message: error.message,
      });
    }
  }
}

module.exports = new WebhookController();