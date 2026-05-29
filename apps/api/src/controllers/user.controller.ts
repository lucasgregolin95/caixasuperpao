import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { prisma } from '../services/db.service';
import { AuthService } from '../services/auth.service';
import { AuditService } from '../services/audit.service';
import { UserRole } from '@superbom/shared';

export class UserController {
  static async list(req: AuthenticatedRequest, res: Response) {
    try {
      const users = await prisma.user.findMany({
        orderBy: { name: 'asc' },
      });

      const response = users.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      }));

      return res.json(response);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao listar usuários.' });
    }
  }

  static async get(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    try {
      const user = await prisma.user.findUnique({ where: { id } });

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }

      return res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar usuário.' });
    }
  }

  static async create(req: AuthenticatedRequest, res: Response) {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: 'Todos os campos (email, password, name, role) são obrigatórios.' });
    }

    if (!Object.values(UserRole).includes(role as UserRole)) {
      return res.status(400).json({ error: 'Role inválida.' });
    }

    try {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return res.status(400).json({ error: 'E-mail já cadastrado.' });
      }

      const passwordHash = await AuthService.hashPassword(password);

      const user = await prisma.user.create({
        data: {
          email,
          name,
          role,
          passwordHash,
        },
      });

      await AuditService.log(
        req.user?.userId || null,
        'USER_CREATE',
        null,
        `Criou o usuário ${user.name} (${user.email}) com role ${user.role}`
      );

      return res.status(201).json({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao criar usuário.' });
    }
  }

  static async update(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    const { email, name, role, password } = req.body;

    try {
      const existing = await prisma.user.findUnique({ where: { id } });

      if (!existing) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }

      if (email && email !== existing.email) {
        const emailExists = await prisma.user.findUnique({ where: { email } });
        if (emailExists) {
          return res.status(400).json({ error: 'E-mail já está em uso por outro usuário.' });
        }
      }

      const data: any = {};
      if (email) data.email = email;
      if (name) data.name = name;
      if (role) {
        if (!Object.values(UserRole).includes(role as UserRole)) {
          return res.status(400).json({ error: 'Role inválida.' });
        }
        data.role = role;
      }
      if (password && password.trim() !== '') {
        data.passwordHash = await AuthService.hashPassword(password);
      }

      const updated = await prisma.user.update({
        where: { id },
        data,
      });

      await AuditService.log(
        req.user?.userId || null,
        'USER_UPDATE',
        null,
        `Atualizou os dados do usuário ${updated.name} (${updated.email})`,
        {
          old: { name: existing.name, email: existing.email, role: existing.role },
          new: { name: updated.name, email: updated.email, role: updated.role },
        }
      );

      return res.json({
        id: updated.id,
        email: updated.email,
        name: updated.name,
        role: updated.role,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao atualizar usuário.' });
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;

    if (req.user?.userId === id) {
      return res.status(400).json({ error: 'Você não pode excluir a si mesmo.' });
    }

    try {
      const existing = await prisma.user.findUnique({ where: { id } });
      if (!existing) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }

      await prisma.user.delete({ where: { id } });

      await AuditService.log(
        req.user?.userId || null,
        'USER_DELETE',
        null,
        `Excluiu o usuário ${existing.name} (${existing.email})`
      );

      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao excluir usuário.' });
    }
  }
}
