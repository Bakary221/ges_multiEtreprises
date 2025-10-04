const crypto = require('crypto');

class WebhookService {
  constructor() {
    this.webhooks = new Map(); // companyId -> webhook URLs
  }

  registerWebhook(companyId, url, secret) {
    if (!this.webhooks.has(companyId)) {
      this.webhooks.set(companyId, []);
    }

    const webhook = {
      id: crypto.randomUUID(),
      url,
      secret,
      createdAt: new Date(),
      isActive: true,
    };

    this.webhooks.get(companyId).push(webhook);
    return webhook;
  }

  unregisterWebhook(companyId, webhookId) {
    const companyWebhooks = this.webhooks.get(companyId);
    if (companyWebhooks) {
      const index = companyWebhooks.findIndex(w => w.id === webhookId);
      if (index > -1) {
        companyWebhooks.splice(index, 1);
        return true;
      }
    }
    return false;
  }

  async triggerWebhook(companyId, event, data) {
    const companyWebhooks = this.webhooks.get(companyId);
    if (!companyWebhooks) return;

    const payload = {
      event,
      timestamp: new Date().toISOString(),
      companyId,
      data,
    };

    const activeWebhooks = companyWebhooks.filter(w => w.isActive);

    for (const webhook of activeWebhooks) {
      try {
        // Calculer signature HMAC
        const signature = crypto
          .createHmac('sha256', webhook.secret)
          .update(JSON.stringify(payload))
          .digest('hex');

        const response = await fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': signature,
            'X-Webhook-Event': event,
            'X-Webhook-ID': webhook.id,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          console.error(`Webhook failed for ${webhook.url}: ${response.status}`);
        }
      } catch (error) {
        console.error(`Webhook error for ${webhook.url}:`, error.message);
      }
    }
  }

  getWebhooks(companyId) {
    return this.webhooks.get(companyId) || [];
  }

  // Événements prédéfinis
  async notifyPaymentCompleted(companyId, paymentData) {
    await this.triggerWebhook(companyId, 'payment.completed', paymentData);
  }

  async notifyTimesheetValidated(companyId, timesheetData) {
    await this.triggerWebhook(companyId, 'timesheet.validated', timesheetData);
  }

  async notifyEmployeeCreated(companyId, employeeData) {
    await this.triggerWebhook(companyId, 'employee.created', employeeData);
  }

  async notifyLeaveRequestApproved(companyId, leaveData) {
    await this.triggerWebhook(companyId, 'leave.approved', leaveData);
  }

  async notifyPayrollGenerated(companyId, payrollData) {
    await this.triggerWebhook(companyId, 'payroll.generated', payrollData);
  }
}

module.exports = new WebhookService();