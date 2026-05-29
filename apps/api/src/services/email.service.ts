import * as nodemailer from 'nodemailer';

export class EmailService {
  private static transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'localhost',
    port: parseInt(process.env.SMTP_PORT || '1025', 10),
    secure: false,
    auth: process.env.SMTP_USER
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS || '',
        }
      : undefined,
  });

  static async sendNotificationEmail(to: string, subject: string, htmlContent: string) {
    const from = process.env.SMTP_FROM || 'fechamento@superbom.local';
    try {
      const info = await this.transporter.sendMail({
        from: `"Super Bom Caixa" <${from}>`,
        to,
        subject,
        html: htmlContent,
      });
      console.log('E-mail enviado: %s', info.messageId);
      return true;
    } catch (error) {
      console.error('Erro ao enviar e-mail:', error);
      return false;
    }
  }
}
