import { prisma } from './db.service';
import { CashClosingInput, ClosingStatus, UserRole } from '@superbom/shared';
import { AuditService } from './audit.service';
import { NotificationService } from './notification.service';

export class ClosingService {
  static calculateTotals(input: CashClosingInput) {
    const c005 = input.coinsCount.c005 || 0;
    const c010 = input.coinsCount.c010 || 0;
    const c025 = input.coinsCount.c025 || 0;
    const c050 = input.coinsCount.c050 || 0;
    const c100 = input.coinsCount.c100 || 0;

    const b2 = input.billsCount.b2 || 0;
    const b5 = input.billsCount.b5 || 0;
    const b10 = input.billsCount.b10 || 0;
    const b20 = input.billsCount.b20 || 0;
    const b50 = input.billsCount.b50 || 0;
    const b100 = input.billsCount.b100 || 0;

    const totalCoins = Number(
      (c005 * 0.05 + c010 * 0.10 + c025 * 0.25 + c050 * 0.50 + c100 * 1.00).toFixed(2)
    );

    const totalBills = Number(
      (b2 * 2 + b5 * 5 + b10 * 10 + b20 * 20 + b50 * 50 + b100 * 100).toFixed(2)
    );

    const totalCash = Number((totalCoins + totalBills).toFixed(2));

    const pix = input.pixValue || 0;
    const debit = input.cardDebit || 0;
    const credit = input.cardCredit || 0;
    const cardTotal = input.cardTotal || Number((debit + credit).toFixed(2));

    const totalEntries = Number((totalCash + pix + cardTotal).toFixed(2));

    const withdrawal = input.withdrawalValue || 0;
    const adjustment = input.adjustmentValue || 0;
    const totalExits = Number((withdrawal + adjustment).toFixed(2));

    const totalFinal = Number((totalEntries - totalExits).toFixed(2));

    return {
      coins005: c005,
      coins010: c010,
      coins025: c025,
      coins050: c050,
      coins100: c100,
      bills2: b2,
      bills5: b5,
      bills10: b10,
      bills20: b20,
      bills50: b50,
      bills100: b100,
      pixValue: pix,
      cardDebit: debit,
      cardCredit: credit,
      cardTotal,
      withdrawalValue: withdrawal,
      adjustmentValue: adjustment,
      totalCoins,
      totalBills,
      totalCash,
      totalEntries,
      totalExits,
      totalFinal,
    };
  }

  static async create(operatorId: string, input: CashClosingInput) {
    if (input.cashNumber <= 0) throw new Error('Número do caixa inválido.');
    
    // Validar se já existe um fechamento aberto/enviado para esse Caixa + Turno + Data para evitar duplicidade
    const targetDate = new Date(input.date);
    const existingClosing = await prisma.cashClosing.findFirst({
      where: {
        date: targetDate,
        shift: input.shift,
        cashNumber: input.cashNumber,
      }
    });

    if (existingClosing) {
      throw new Error(`Já existe um fechamento registrado para Caixa ${input.cashNumber}, Turno ${input.shift} no dia ${input.date}.`);
    }

    const totals = this.calculateTotals(input);

    const closing = await prisma.cashClosing.create({
      data: {
        bakery: input.bakery || 'Super Pão',
        date: targetDate,
        shift: input.shift,
        cashNumber: input.cashNumber,
        status: ClosingStatus.RASCUNHO,
        operatorId,
        notes: input.notes || null,
        adjustmentDescription: input.adjustmentDescription || null,
        ...totals,
      },
      include: { operator: true },
    });

    await AuditService.log(
      operatorId,
      'CREATE',
      closing.id,
      `Criou o rascunho de fechamento do Caixa ${closing.cashNumber} (${closing.shift})`
    );

    return closing;
  }

  static async update(id: string, operatorId: string, userRole: UserRole, input: CashClosingInput) {
    const existing = await prisma.cashClosing.findUnique({
      where: { id },
      include: { operator: true },
    });

    if (!existing) throw new Error('Fechamento não encontrado.');

    // Validação de segurança e permissão de edição
    if (userRole === UserRole.CAIXA || userRole === UserRole.GERENTE) {
      if (existing.operatorId !== operatorId) {
        throw new Error('Você não tem permissão para editar este fechamento.');
      }
      if (existing.status === ClosingStatus.ENVIADO) {
        throw new Error('Fechamento já enviado. Edição bloqueada para operadores.');
      }
    }

    // Se mudou caixa/turno/data, certificar de que não causa duplicidade
    const targetDate = new Date(input.date);
    if (
      existing.cashNumber !== input.cashNumber ||
      existing.shift !== input.shift ||
      existing.date.toISOString().split('T')[0] !== targetDate.toISOString().split('T')[0]
    ) {
      const duplicate = await prisma.cashClosing.findFirst({
        where: {
          id: { not: id },
          date: targetDate,
          shift: input.shift,
          cashNumber: input.cashNumber,
        }
      });
      if (duplicate) {
        throw new Error(`Já existe outro fechamento registrado para Caixa ${input.cashNumber}, Turno ${input.shift} no dia ${input.date}.`);
      }
    }

    const totals = this.calculateTotals(input);

    const updated = await prisma.cashClosing.update({
      where: { id },
      data: {
        date: targetDate,
        shift: input.shift,
        cashNumber: input.cashNumber,
        notes: input.notes || null,
        adjustmentDescription: input.adjustmentDescription || null,
        ...totals,
      },
      include: { operator: true },
    });

    await AuditService.log(
      operatorId,
      'UPDATE',
      updated.id,
      `Atualizou o fechamento do Caixa ${updated.cashNumber} (${updated.shift})`,
      { old: existing, new: updated }
    );

    return updated;
  }

  static async submit(id: string, userId: string, userRole: UserRole) {
    const existing = await prisma.cashClosing.findUnique({
      where: { id },
      include: { operator: true },
    });

    if (!existing) throw new Error('Fechamento não encontrado.');

    if ((userRole === UserRole.CAIXA || userRole === UserRole.GERENTE) && existing.operatorId !== userId) {
      throw new Error('Você não pode enviar este fechamento.');
    }

    if (existing.status === ClosingStatus.ENVIADO) {
      throw new Error('Este fechamento já foi enviado.');
    }

    const updated = await prisma.cashClosing.update({
      where: { id },
      data: { status: ClosingStatus.ENVIADO },
      include: { operator: true },
    });

    await AuditService.log(
      userId,
      'SEND',
      updated.id,
      `Enviou/Finalizou o fechamento do Caixa ${updated.cashNumber} (${updated.shift})`
    );

    const dateFormatted = new Date(updated.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    const msg = `O operador ${updated.operator.name} finalizou o fechamento do Caixa ${updated.cashNumber} para o turno ${updated.shift} no dia ${dateFormatted}. Valor Final: R$ ${Number(updated.totalFinal).toFixed(2)}`;
    await NotificationService.notifyManagerAndAdmin(
      `Novo Fechamento - Caixa ${updated.cashNumber}`,
      msg,
      updated.id
    );

    return updated;
  }

  static async reopen(id: string, supervisorId: string, supervisorRole: UserRole, reason: string) {
    if (supervisorRole !== UserRole.SUPERVISOR && supervisorRole !== UserRole.ADMIN) {
      throw new Error('Apenas Supervisores e Administradores podem reabrir fechamentos.');
    }

    if (!reason || reason.trim() === '') {
      throw new Error('Um motivo de reabertura deve ser fornecido para auditoria.');
    }

    const existing = await prisma.cashClosing.findUnique({
      where: { id },
      include: { operator: true },
    });

    if (!existing) throw new Error('Fechamento não encontrado.');

    if (existing.status === ClosingStatus.RASCUNHO) {
      throw new Error('O fechamento já está aberto como rascunho.');
    }

    const updated = await prisma.cashClosing.update({
      where: { id },
      data: { status: ClosingStatus.RASCUNHO },
      include: { operator: true },
    });

    await AuditService.log(
      supervisorId,
      'REOPEN',
      updated.id,
      `Reabriu o fechamento do Caixa ${updated.cashNumber} (${updated.shift}). Motivo: ${reason}`
    );

    const supervisor = await prisma.user.findUnique({ where: { id: supervisorId } });
    const supervisorName = supervisor?.name || 'Supervisor';
    const dateFormatted = new Date(updated.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    const msg = `Seu fechamento do Caixa ${updated.cashNumber} (${updated.shift}) de ${dateFormatted} foi reaberto por ${supervisorName}. Motivo: "${reason}". Você já pode editá-lo novamente.`;
    
    await NotificationService.notifyUser(
      updated.operatorId,
      `Fechamento Reaberto - Caixa ${updated.cashNumber}`,
      msg,
      updated.operator.email
    );

    return updated;
  }

  // Mapeia entidade Prisma para a interface do pacote compartilhado
  static mapToResponse(c: any): any {
    return {
      id: c.id,
      bakery: c.bakery,
      date: c.date.toISOString().split('T')[0],
      shift: c.shift,
      cashNumber: c.cashNumber,
      status: c.status,
      operatorId: c.operatorId,
      operator: c.operator ? {
        id: c.operator.id,
        name: c.operator.name,
        email: c.operator.email,
      } : undefined,
      notes: c.notes,
      coins005: c.coins005,
      coins010: c.coins010,
      coins025: c.coins025,
      coins050: c.coins050,
      coins100: c.coins100,
      bills2: c.bills2,
      bills5: c.bills5,
      bills10: c.bills10,
      bills20: c.bills20,
      bills50: c.bills50,
      bills100: c.bills100,
      pixValue: Number(c.pixValue),
      cardDebit: Number(c.cardDebit),
      cardCredit: Number(c.cardCredit),
      cardTotal: Number(c.cardTotal),
      withdrawalValue: Number(c.withdrawalValue),
      adjustmentValue: Number(c.adjustmentValue),
      adjustmentDescription: c.adjustmentDescription,
      totalCoins: Number(c.totalCoins),
      totalBills: Number(c.totalBills),
      totalCash: Number(c.totalCash),
      totalEntries: Number(c.totalEntries),
      totalExits: Number(c.totalExits),
      totalFinal: Number(c.totalFinal),
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    };
  }
}
