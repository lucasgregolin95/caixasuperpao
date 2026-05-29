import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { prisma } from '../services/db.service';
import { ClosingService } from '../services/closing.service';
import { UserRole } from '@superbom/shared';

export class ClosingController {
  static async list(req: AuthenticatedRequest, res: Response) {
    if (!req.user) return res.status(401).json({ error: 'Não autenticado.' });

    const { userId, role } = req.user;
    const { date, shift, cashNumber, status, operatorId } = req.query;

    try {
      const where: any = {};

      if (role === UserRole.CAIXA) {
        // Operador de caixa só visualiza seus próprios registros
        where.operatorId = userId;
      } else if (operatorId) {
        where.operatorId = String(operatorId);
      }

      if (date) {
        where.date = new Date(String(date));
      }
      if (shift) {
        where.shift = String(shift);
      }
      if (cashNumber) {
        where.cashNumber = parseInt(String(cashNumber), 10);
      }
      if (status) {
        where.status = String(status);
      }

      const closings = await prisma.cashClosing.findMany({
        where,
        include: { operator: true },
        orderBy: { date: 'desc' },
      });

      const response = closings.map((c) => ClosingService.mapToResponse(c));
      return res.json(response);
    } catch (error) {
      console.error('Erro ao buscar fechamentos:', error);
      return res.status(500).json({ error: 'Erro ao buscar fechamentos.' });
    }
  }

  static async get(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    const { role, userId } = req.user!;

    try {
      const closing = await prisma.cashClosing.findUnique({
        where: { id },
        include: { operator: true },
      });

      if (!closing) {
        return res.status(404).json({ error: 'Fechamento não encontrado.' });
      }

      if (role === UserRole.CAIXA && closing.operatorId !== userId) {
        return res.status(403).json({ error: 'Permissão negada para visualizar este fechamento.' });
      }

      return res.json(ClosingService.mapToResponse(closing));
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar fechamento.' });
    }
  }

  static async create(req: AuthenticatedRequest, res: Response) {
    const { userId } = req.user!;
    try {
      const closing = await ClosingService.create(userId, req.body);
      return res.status(201).json(ClosingService.mapToResponse(closing));
    } catch (error: any) {
      console.error('Erro ao criar fechamento:', error);
      return res.status(400).json({ error: error.message || 'Erro ao criar fechamento.' });
    }
  }

  static async update(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    const { userId, role } = req.user!;
    try {
      const closing = await ClosingService.update(id, userId, role as UserRole, req.body);
      return res.json(ClosingService.mapToResponse(closing));
    } catch (error: any) {
      console.error('Erro ao atualizar fechamento:', error);
      return res.status(400).json({ error: error.message || 'Erro ao atualizar fechamento.' });
    }
  }

  static async submit(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    const { userId, role } = req.user!;
    try {
      const closing = await ClosingService.submit(id, userId, role as UserRole);
      return res.json(ClosingService.mapToResponse(closing));
    } catch (error: any) {
      console.error('Erro ao enviar fechamento:', error);
      return res.status(400).json({ error: error.message || 'Erro ao enviar fechamento.' });
    }
  }

  static async reopen(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    const { userId, role } = req.user!;
    const { reason } = req.body;

    try {
      const closing = await ClosingService.reopen(id, userId, role as UserRole, reason);
      return res.json(ClosingService.mapToResponse(closing));
    } catch (error: any) {
      console.error('Erro ao reabrir fechamento:', error);
      return res.status(400).json({ error: error.message || 'Erro ao reabrir fechamento.' });
    }
  }
}
