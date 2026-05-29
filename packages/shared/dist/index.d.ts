export declare const UserRole: {
    readonly ADMIN: "ADMIN";
    readonly GERENTE: "GERENTE";
    readonly SUPERVISOR: "SUPERVISOR";
    readonly CAIXA: "CAIXA";
};
export type UserRole = typeof UserRole[keyof typeof UserRole];
export declare const Shift: {
    readonly MANHA: "MANHA";
    readonly TARDE: "TARDE";
    readonly NOITE: "NOITE";
};
export type Shift = typeof Shift[keyof typeof Shift];
export declare const ClosingStatus: {
    readonly RASCUNHO: "RASCUNHO";
    readonly ENVIADO: "ENVIADO";
};
export type ClosingStatus = typeof ClosingStatus[keyof typeof ClosingStatus];
export declare const VALID_COINS: readonly [0.05, 0.1, 0.25, 0.5, 1];
export declare const VALID_BILLS: readonly [2, 5, 10, 20, 50, 100];
export type ValidCoin = typeof VALID_COINS[number];
export type ValidBill = typeof VALID_BILLS[number];
export interface DenominationCount {
    denomination: number;
    quantity: number;
    subtotal: number;
}
export interface CashClosingInput {
    bakery?: string;
    date: string;
    shift: Shift;
    cashNumber: number;
    notes?: string;
    coinsCount: {
        c005?: number;
        c010?: number;
        c025?: number;
        c050?: number;
        c100?: number;
    };
    billsCount: {
        b2?: number;
        b5?: number;
        b10?: number;
        b20?: number;
        b50?: number;
        b100?: number;
    };
    pixValue: number;
    cardTotal: number;
    cardDebit?: number;
    cardCredit?: number;
    withdrawalValue: number;
    adjustmentValue: number;
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
    pixValue: number;
    cardDebit: number;
    cardCredit: number;
    cardTotal: number;
    withdrawalValue: number;
    adjustmentValue: number;
    adjustmentDescription: string | null;
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
