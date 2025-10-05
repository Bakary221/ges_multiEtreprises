const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'bakarydiassy28@gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendBadgeEmail(employee, badgeData, company) {
    // Vérifier si l'envoi d'emails est désactivé
    if (process.env.DISABLE_EMAILS === 'true') {
      console.log('📧 Email sending disabled - Badge email not sent to:', employee.email);
      return { success: true, message: 'Email sending disabled' };
    }

    try {
      const { qrCode, badgeUrl } = badgeData;

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: ${company.primaryColor || '#4F46E5'};">Votre badge d'accès - ${company.name}</h2>

          <p>Bonjour ${employee.name},</p>

          <p>Votre badge d'accès a été généré avec succès. Vous pouvez utiliser ce QR code pour pointer vos présences :</p>

          <div style="text-align: center; margin: 20px 0;">
            <img src="${qrCode}" alt="QR Code Badge" style="max-width: 200px; height: auto;" />
          </div>

          <p><strong>Informations importantes :</strong></p>
          <ul>
            <li><strong>Matricule :</strong> ${employee.matricule}</li>
            <li><strong>Entreprise :</strong> ${company.name}</li>
            <li><strong>Poste :</strong> ${employee.position}</li>
          </ul>

          <p>Vous pouvez également télécharger votre badge au format PDF :</p>
          <p><a href="${process.env.BASE_URL || 'http://localhost:3000'}${badgeUrl}" style="background-color: ${company.primaryColor || '#4F46E5'}; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Télécharger le badge PDF</a></p>

          <p>Cordialement,<br>L'équipe ${company.name}</p>
        </div>
      `;

      const mailOptions = {
        from: process.env.SMTP_USER,
        to: employee.email,
        subject: `Votre badge d'accès - ${company.name}`,
        html: htmlContent,
        attachments: [
          {
            filename: `badge_${employee.matricule}.pdf`,
            path: `${process.cwd()}/uploads/badges/badge_${employee.matricule}_${Date.now()}.pdf`,
            contentType: 'application/pdf'
          }
        ]
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Badge email sent successfully:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Failed to send badge email:', error);
      throw new Error('Failed to send badge email: ' + error.message);
    }
  }

  async sendWelcomeEmail(employee, company) {
    // Vérifier si l'envoi d'emails est désactivé
    if (process.env.DISABLE_EMAILS === 'true') {
      console.log('📧 Email sending disabled - Welcome email not sent to:', employee.email);
      return { success: true, message: 'Email sending disabled' };
    }

    try {
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: ${company.primaryColor || '#4F46E5'};">Bienvenue chez ${company.name}</h2>

          <p>Bonjour ${employee.name},</p>

          <p>Bienvenue dans l'équipe ${company.name} !</p>

          <p><strong>Vos informations :</strong></p>
          <ul>
            <li><strong>Matricule :</strong> ${employee.matricule}</li>
            <li><strong>Poste :</strong> ${employee.position}</li>
            <li><strong>Email :</strong> ${employee.email}</li>
          </ul>

          <p>Vous recevrez bientôt votre badge d'accès par email séparé.</p>

          <p>Cordialement,<br>L'équipe ${company.name}</p>
        </div>
      `;

      const mailOptions = {
        from: process.env.SMTP_USER,
        to: employee.email,
        subject: `Bienvenue chez ${company.name}`,
        html: htmlContent
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Welcome email sent successfully:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      throw new Error('Failed to send welcome email: ' + error.message);
    }
  }
}

module.exports = new EmailService();