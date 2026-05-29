import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { prisma } from '../services/db.service';

export class AuditController {
  static async list(req: AuthenticatedRequest, res: Response) {
    const { action, userId, closingId } = req.query;

    try {
      const where: any = {};

      if (action) where.action = String(action);
      if (userId) where.userId = String(userId);
      if (closingId) where.closingId = String(closingId);

      const logs = await prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      const response = logs.map((log) => ({
        id: log.id,
        userId: log.userId,
        user: log.user,
        action: log.action,
        closingId: log.closingId,
        description: log.description,
        details: log.details,
        createdAt: log.createdAt.toISOString(),
      }));

      return res.json(response);
    } catch (error) {
      console.error('Erro ao listar logs de auditoria:', error);
      return res.status(500).json({ error: 'Erro ao listar logs de auditoria.' });
    }
  }
}
