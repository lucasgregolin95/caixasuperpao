import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { prisma } from '../services/db.service';

export class NotificationController {
  static async list(req: AuthenticatedRequest, res: Response) {
    const { userId } = req.user!;
    try {
      const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      const response = notifications.map((n) => ({
        id: n.id,
        userId: n.userId,
        title: n.title,
        message: n.message,
        read: n.read,
        createdAt: n.createdAt.toISOString(),
      }));

      return res.json(response);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao listar notificações.' });
    }
  }

  static async markRead(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    const { userId } = req.user!;

    try {
      const notification = await prisma.notification.findFirst({
        where: { id, userId },
      });

      if (!notification) {
        return res.status(404).json({ error: 'Notificação não encontrada.' });
      }

      const updated = await prisma.notification.update({
        where: { id },
        data: { read: true },
      });

      return res.json({
        id: updated.id,
        userId: updated.userId,
        title: updated.title,
        message: updated.message,
        read: updated.read,
        createdAt: updated.createdAt.toISOString(),
      });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao marcar notificação como lida.' });
    }
  }

  static async markAllRead(req: AuthenticatedRequest, res: Response) {
    const { userId } = req.user!;

    try {
      await prisma.notification.updateMany({
        where: { userId, read: false },
        data: { read: true },
      });

      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao marcar notificações como lidas.' });
    }
  }
}
