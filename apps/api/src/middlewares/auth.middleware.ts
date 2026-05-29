import { Request, Response, NextFunction } from 'express';
import { AuthService, TokenPayload } from '../services/auth.service';
import { UserRole } from '@superbom/shared';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export function authenticateJWT(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de acesso não fornecido.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = AuthService.verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token de acesso inválido ou expirado.' });
  }
}

export function requireRoles(...roles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado.' });
    }

    const { role } = req.user;

    if (!roles.includes(role as UserRole)) {
      return res.status(403).json({ error: 'Permissão negada. Apenas roles: ' + roles.join(', ') });
    }

    next();
  };
}
