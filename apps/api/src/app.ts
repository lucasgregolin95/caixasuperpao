import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { AuthController } from './controllers/auth.controller';
import { UserController } from './controllers/user.controller';
import { ClosingController } from './controllers/closing.controller';
import { ReportController } from './controllers/report.controller';
import { NotificationController } from './controllers/notification.controller';
import { AuditController } from './controllers/audit.controller';
import { authenticateJWT, requireRoles } from './middlewares/auth.middleware';
import { UserRole } from '@superbom/shared';

const app = express();

app.use(cors());
app.use(express.json());

// Limite de taxa básico para o login (Prevenção brute force)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requisições por IP
  message: { error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rotas públicas e de auth
app.post('/api/auth/login', loginLimiter, AuthController.login);
app.post('/api/auth/refresh', AuthController.refresh);
app.get('/api/auth/me', authenticateJWT, AuthController.me);
app.post('/api/auth/logout', AuthController.logout);

// Rotas de gerenciamento de usuários (Apenas Admin)
app.get('/api/users', authenticateJWT, requireRoles(UserRole.ADMIN), UserController.list);
app.post('/api/users', authenticateJWT, requireRoles(UserRole.ADMIN), UserController.create);
app.get('/api/users/:id', authenticateJWT, requireRoles(UserRole.ADMIN), UserController.get);
app.put('/api/users/:id', authenticateJWT, requireRoles(UserRole.ADMIN), UserController.update);
app.delete('/api/users/:id', authenticateJWT, requireRoles(UserRole.ADMIN), UserController.delete);

// Rotas dos fechamentos de caixa
app.get('/api/closings', authenticateJWT, ClosingController.list);
app.post('/api/closings', authenticateJWT, ClosingController.create);
app.get('/api/closings/:id', authenticateJWT, ClosingController.get);
app.put('/api/closings/:id', authenticateJWT, ClosingController.update);
app.post('/api/closings/:id/submit', authenticateJWT, ClosingController.submit);
app.post('/api/closings/:id/reopen', authenticateJWT, requireRoles(UserRole.SUPERVISOR, UserRole.ADMIN), ClosingController.reopen);

// Rotas de relatórios e exportações
app.get('/api/reports/summary', authenticateJWT, requireRoles(UserRole.GERENTE, UserRole.ADMIN, UserRole.SUPERVISOR), ReportController.getSummary);
app.get('/api/reports/export/csv', authenticateJWT, requireRoles(UserRole.GERENTE, UserRole.ADMIN, UserRole.SUPERVISOR), ReportController.exportCsv);
app.get('/api/reports/:id/export/pdf', authenticateJWT, ReportController.exportPdf);

// Rotas de notificações
app.get('/api/notifications', authenticateJWT, NotificationController.list);
app.put('/api/notifications/read-all', authenticateJWT, NotificationController.markAllRead);
app.put('/api/notifications/:id/read', authenticateJWT, NotificationController.markRead);

// Rotas de logs de auditoria
app.get('/api/audit', authenticateJWT, requireRoles(UserRole.SUPERVISOR, UserRole.GERENTE, UserRole.ADMIN), AuditController.list);

// Tratamento de erros global
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Erro não tratado na API:', err);
  res.status(500).json({ error: 'Erro interno do servidor.' });
});

export default app;
