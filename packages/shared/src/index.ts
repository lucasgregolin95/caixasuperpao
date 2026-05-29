// Enums / Constantes compartilhados
export const UserRole = {
  ADMIN: 'ADMIN',
  GERENTE: 'GERENTE',
  SUPERVISOR: 'SUPERVISOR',
  CAIXA: 'CAIXA'
} as const;
export type UserRole = typeof UserRole[keyof typeof UserRole];

export const Shift = {
  MANHA: 'MANHA',
  TARDE: 'TARDE',
  NOITE: 'NOITE'
} as const;
export type Shift = typeof Shift[keyof typeof Shift];

export const ClosingStatus = {
  RASCUNHO: 'RASCUNHO',
  ENVIADO: 'ENVIADO'
} as const;
export type ClosingStatus = typeof ClosingStatus[keyof typeof ClosingStatus];

// Moedas e Notas permitidas
export const VALID_COINS = [0.05, 0.10, 0.25, 0.50, 1.00] as const;
export const VALID_BILLS = [2, 5, 10, 20, 50, 100] as const;

export type ValidCoin = typeof VALID_COINS[number];
export type ValidBill = typeof VALID_BILLS[number];

// Contagem detalhada de moedas e notas
export interface DenominationCount {
  denomination: number;
  quantity: number;
  subtotal: number;
}

export interface CashClosingInput {
  bakery?: string; // padrão "Super Pão"
  date: string; // ISO String ou YYYY-MM-DD
  shift: Shift;
  cashNumber: number; // 1 ou 2
  notes?: string;

  // Dinheiro em papel / moedas por denominação
  coinsCount: {
    c005?: number; // Qtd de 0.05
    c010?: number; // Qtd de 0.10
    c025?: number; // Qtd de 0.25
    c050?: number; // Qtd de 0.50
    c100?: number; // Qtd de 1.00
  };
  billsCount: {
    b2?: number;   // Qtd de 2
    b5?: number;   // Qtd de 5
    b10?: number;  // Qtd de 10
    b20?: number;  // Qtd de 20
    b50?: number;  // Qtd de 50
    b100?: number; // Qtd de 100
  };

  // Outros métodos
  pixValue: number;
  cardTotal: number;
  cardDebit?: number;
  cardCredit?: number;

  // Saídas
  withdrawalValue: number; // Retiradas/Sangrias
  adjustmentValue: number;  // Passagens/Ajustes
  adjustmentDescription?: string;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserResponse;
}

export interface CashClosingResponse {
  id: string;
  bakery: string;
  date: string;
  shift: Shift;
  cashNumber: number;
  status: ClosingStatus;
  operatorId: string;
  operator: {
    id: string;
    name: string;
    email: string;
  };
  notes: string | null;

  // Contagens
  coins005: number;
  coins010: number;
  coins025: number;
  coins050: number;
  coins100: number;
  bills2: number;
  bills5: number;
  bills10: number;
  bills20: number;
  bills50: number;
  bills100: number;

  // Valores Outros
  pixValue: number;
  cardDebit: number;
  cardCredit: number;
  cardTotal: number;

  // Ajustes/Saídas
  withdrawalValue: number;
  adjustmentValue: number;
  adjustmentDescription: string | null;

  // Totais
  totalCoins: number;
  totalBills: number;
  totalCash: number;
  totalEntries: number;
  totalExits: number;
  totalFinal: number;

  createdAt: string;
  updatedAt: string;
}

export interface AuditLogResponse {
  id: string;
  userId: string | null;
  user: {
    name: string;
    email: string;
  } | null;
  action: string;
  closingId: string | null;
  description: string;
  details: any;
  createdAt: string;
}

export interface NotificationResponse {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}
