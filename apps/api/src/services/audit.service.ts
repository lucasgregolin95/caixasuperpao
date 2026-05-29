import { prisma } from './db.service';

export class AuditService {
  static async log(
    userId: string | null,
    action: string,
    closingId: string | null,
    description: string,
    details?: any
  ) {
    try {
      await prisma.auditLog.create({
        data: {
          userId,
          action,
          closingId,
          description,
          details: details ? JSON.stringify(details) : null,
        },
      });
    } catch (error) {
      console.error('Erro ao salvar AuditLog:', error);
    }
  }
}
