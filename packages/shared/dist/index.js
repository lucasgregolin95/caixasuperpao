"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VALID_BILLS = exports.VALID_COINS = exports.ClosingStatus = exports.Shift = exports.UserRole = void 0;
// Enums / Constantes compartilhados
exports.UserRole = {
    ADMIN: 'ADMIN',
    GERENTE: 'GERENTE',
    SUPERVISOR: 'SUPERVISOR',
    CAIXA: 'CAIXA'
};
exports.Shift = {
    MANHA: 'MANHA',
    TARDE: 'TARDE',
    NOITE: 'NOITE'
};
exports.ClosingStatus = {
    RASCUNHO: 'RASCUNHO',
    ENVIADO: 'ENVIADO'
};
// Moedas e Notas permitidas
exports.VALID_COINS = [0.05, 0.10, 0.25, 0.50, 1.00];
exports.VALID_BILLS = [2, 5, 10, 20, 50, 100];
