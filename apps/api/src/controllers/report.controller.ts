import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { prisma } from '../services/db.service';
import { ClosingService } from '../services/closing.service';
import { PdfService } from '../services/pdf.service';
import { UserRole } from '@superbom/shared';

export class ReportController {
  static async getSummary(req: AuthenticatedRequest, res: Response) {
    const { startDate, endDate, shift, cashNumber, operatorId, status } = req.query;

    try {
      const where: any = {};

      if (req.user?.role === UserRole.CAIXA) {
        where.operatorId = req.user.userId;
      } else if (operatorId) {
        where.operatorId = String(operatorId);
      }

      if (startDate || endDate) {
        where.date = {};
        if (startDate) where.date.gte = new Date(String(startDate));
        if (endDate) where.date.lte = new Date(String(endDate));
      }

      if (shift) where.shift = String(shift);
      if (cashNumber) where.cashNumber = parseInt(String(cashNumber), 10);
      if (status) where.status = String(status);

      const closings = await prisma.cashClosing.findMany({
        where,
        include: { operator: true },
        orderBy: { date: 'desc' },
      });

      const response = closings.map((c) => ClosingService.mapToResponse(c));

      const totalEntries = response.reduce((sum, c) => sum + c.totalEntries, 0);
      const totalExits = response.reduce((sum, c) => sum + c.totalExits, 0);
      const totalFinal = response.reduce((sum, c) => sum + c.totalFinal, 0);

      return res.json({
        closings: response,
        summary: {
          count: response.length,
          totalEntries,
          totalExits,
          totalFinal,
        },
      });
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      return res.status(500).json({ error: 'Erro ao gerar resumo de relatório.' });
    }
  }

  static async exportCsv(req: AuthenticatedRequest, res: Response) {
    const { startDate, endDate, shift, cashNumber, operatorId, status } = req.query;

    try {
      const where: any = {};

      if (req.user?.role === UserRole.CAIXA) {
        where.operatorId = req.user.userId;
      } else if (operatorId) {
        where.operatorId = String(operatorId);
      }

      if (startDate || endDate) {
        where.date = {};
        if (startDate) where.date.gte = new Date(String(startDate));
        if (endDate) where.date.lte = new Date(String(endDate));
      }

      if (shift) where.shift = String(shift);
      if (cashNumber) where.cashNumber = parseInt(String(cashNumber), 10);
      if (status) where.status = String(status);

      const closings = await prisma.cashClosing.findMany({
        where,
        include: { operator: true },
        orderBy: { date: 'desc' },
      });

      const headers = [
        'ID',
        'Data',
        'Turno',
        'Caixa',
        'Status',
        'Operador',
        'Total Dinheiro (Notas+Moedas)',
        'Total PIX',
        'Total Cartao',
        'Total Entradas',
        'Total Saidas',
        'Saldo Final',
        'Observacoes',
      ];

      const rows = closings.map((c) => {
        const mapped = ClosingService.mapToResponse(c);
        return [
          mapped.id,
          mapped.date,
          mapped.shift,
          mapped.cashNumber,
          mapped.status,
          mapped.operator?.name || '',
          mapped.totalCash.toFixed(2),
          mapped.pixValue.toFixed(2),
          mapped.cardTotal.toFixed(2),
          mapped.totalEntries.toFixed(2),
          mapped.totalExits.toFixed(2),
          mapped.totalFinal.toFixed(2),
          (mapped.notes || '').replace(/\r?\n|\r/g, ' '),
        ];
      });

      const csvContent = [
        headers.join(';'),
        ...rows.map((row) => row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(';')),
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename=relatorio_fechamentos.csv');
      res.write('\uFEFF'); // UTF-8 BOM
      res.end(csvContent);
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      return res.status(500).json({ error: 'Erro ao exportar CSV.' });
    }
  }

  static async exportPdf(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    try {
      const closing = await prisma.cashClosing.findUnique({
        where: { id },
        include: { operator: true },
      });

      if (!closing) {
        return res.status(404).send('<h1>Erro: Fechamento não encontrado.</h1>');
      }

      if (req.user?.role === UserRole.CAIXA && closing.operatorId !== req.user.userId) {
        return res.status(403).send('<h1>Erro: Sem permissão.</h1>');
      }

      const html = PdfService.generateClosingHtmlReport(closing);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.send(html);
    } catch (error) {
      console.error('Erro ao gerar relatório HTML:', error);
      return res.status(500).send('<h1>Erro ao gerar PDF/Relatório.</h1>');
    }
  }
}
