import { prisma } from './db.service';
import { EmailService } from './email.service';

export class NotificationService {
  static async notifyManagerAndAdmin(title: string, message: string, closingId?: string) {
    try {
      // Busca todos os gerentes e admins
      const recipients = await prisma.user.findMany({
        where: {
          role: { in: ['ADMIN', 'GERENTE'] },
        },
      });

      // Cria notificações in-app
      const dbNotifications = recipients.map((user) =>
        prisma.notification.create({
          data: {
            userId: user.id,
            title,
            message,
          },
        })
      );
      await Promise.all(dbNotifications);

      // Envia e-mails
      for (const user of recipients) {
        const html = `
          <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px;">
            <h2 style="color: #6366f1; border-bottom: 2px solid #6366f1; padding-bottom: 10px;">Super Pão - Fechamento de Caixa</h2>
            <p style="font-size: 16px;"><strong>${title}</strong></p>
            <p style="font-size: 14px; line-height: 1.5; color: #555;">${message}</p>
            ${
              closingId
                ? `<div style="margin: 20px 0; text-align: center;">
                     <a href="http://localhost:5173/closings" style="display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Visualizar no Painel</a>
                   </div>`
                : ''
            }
            <hr style="border: none; border-top: 1px solid #eee; margin-top: 25px;" />
            <p style="font-size: 12px; color: #999; text-align: center;">Esta é uma mensagem automática enviada pelo sistema Super Pão.</p>
          </div>
        `;
        await EmailService.sendNotificationEmail(user.email, title, html);
      }
    } catch (error) {
      console.error('Erro ao notificar gerentes/admins:', error);
    }
  }

  static async notifyUser(userId: string, title: string, message: string, email: string) {
    try {
      await prisma.notification.create({
        data: {
          userId,
          title,
          message,
        },
      });

      const html = `
        <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #6366f1; border-bottom: 2px solid #6366f1; padding-bottom: 10px;">Super Pão - Notificação</h2>
          <p style="font-size: 16px;"><strong>${title}</strong></p>
          <p style="font-size: 14px; line-height: 1.5; color: #555;">${message}</p>
          <div style="margin: 20px 0; text-align: center;">
            <a href="http://localhost:5173/dashboard" style="display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Acessar o Aplicativo</a>
          </div>
          <hr style="border: none; border-top: 1px solid #eee; margin-top: 25px;" />
          <p style="font-size: 12px; color: #999; text-align: center;">Esta é uma mensagem automática enviada pelo sistema Super Pão.</p>
        </div>
      `;
      await EmailService.sendNotificationEmail(email, title, html);
    } catch (error) {
      console.error(`Erro ao notificar usuário ${userId}:`, error);
    }
  }
}
