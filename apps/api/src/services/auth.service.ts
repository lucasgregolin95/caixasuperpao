import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'superbom-access-secret-key-12345-very-secret-2026';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'superbom-refresh-secret-key-12345-very-secret-2026';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export class AuthService {
  static generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: '15m' });
  }

  static generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
  }

  static verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, JWT_ACCESS_SECRET) as TokenPayload;
  }

  static verifyRefreshToken(token: string): TokenPayload {
    return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
  }

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
