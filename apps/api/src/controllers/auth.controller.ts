import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { prisma } from '../services/db.service';
import { AuthService } from '../services/auth.service';
import { AuditService } from '../services/audit.service';

export class AuthController {
  static async login(req: AuthenticatedRequest, res: Response) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }

    try {
      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        return res.status(401).json({ error: 'Credenciais inválidas.' });
      }

      const passwordMatch = await AuthService.comparePassword(password, user.passwordHash);

      if (!passwordMatch) {
        return res.status(401).json({ error: 'Credenciais inválidas.' });
      }

      const payload = { userId: user.id, email: user.email, role: user.role };
      const accessToken = AuthService.generateAccessToken(payload);
      const refreshToken = AuthService.generateRefreshToken(payload);

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          expiresAt,
        },
      });

      await AuditService.log(user.id, 'LOGIN', null, `Usuário ${user.name} efetuou login com sucesso.`);

      return res.json({
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno no servidor durante o login.' });
    }
  }

  static async refresh(req: AuthenticatedRequest, res: Response) {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token é obrigatório.' });
    }

    try {
      const storedToken = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });

      if (!storedToken || storedToken.expiresAt < new Date()) {
        if (storedToken) {
          await prisma.refreshToken.delete({ where: { token: refreshToken } }).catch(() => {});
        }
        return res.status(403).json({ error: 'Refresh token inválido ou expirado.' });
      }

      const payload = AuthService.verifyRefreshToken(refreshToken);
      const newAccessToken = AuthService.generateAccessToken({
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
      });

      return res.json({ accessToken: newAccessToken });
    } catch (error) {
      return res.status(403).json({ error: 'Refresh token inválido.' });
    }
  }

  static async me(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado.' });
    }

    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
      });

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
      return res.status(500).json({ error: 'Erro no servidor.' });
    }
  }

  static async logout(req: AuthenticatedRequest, res: Response) {
    const { refreshToken } = req.body;
    if (refreshToken) {
      try {
        await prisma.refreshToken.delete({ where: { token: refreshToken } });
      } catch (e) {
        // Ignorar se já não existir
      }
    }
    return res.status(204).send();
  }
}
