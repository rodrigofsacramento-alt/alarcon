import { describe, it, expect } from 'vitest';
import { cleanWhatsappName, isWeakWhatsappName } from './session-manager.js';
describe('WhatsApp Name Logic', () => {
    describe('cleanWhatsappName', () => {
        it('deve limpar espaços extras', () => {
            expect(cleanWhatsappName('  João   Silva  ')).toBe('João Silva');
        });
        it('deve retornar vazio se nome for falsy', () => {
            expect(cleanWhatsappName(null)).toBe('');
            expect(cleanWhatsappName(undefined)).toBe('');
            expect(cleanWhatsappName('')).toBe('');
        });
        it('deve bloquear technical markers e placeholders', () => {
            expect(cleanWhatsappName('unknown')).toBe('');
            expect(cleanWhatsappName('null')).toBe('');
            expect(cleanWhatsappName('Agência Hut')).toBe('');
            expect(cleanWhatsappName('agencia hut')).toBe('');
            expect(cleanWhatsappName('NOVO LEAD')).toBe('');
            expect(cleanWhatsappName('deleted-whatsapp')).toBe('');
        });
        it('deve bloquear JIDs', () => {
            expect(cleanWhatsappName('5511999999999@s.whatsapp.net')).toBe('');
            expect(cleanWhatsappName('123@lid')).toBe('');
        });
        it('deve manter nomes válidos', () => {
            expect(cleanWhatsappName('Maria Eduarda')).toBe('Maria Eduarda');
            expect(cleanWhatsappName('Carlos 123')).toBe('Carlos 123');
        });
    });
    describe('isWeakWhatsappName', () => {
        it('deve considerar nomes vazios como fracos', () => {
            expect(isWeakWhatsappName('', '5511999999999')).toBe(true);
            expect(isWeakWhatsappName(null, '5511999999999')).toBe(true);
        });
        it('deve considerar nomes filtrados pelo cleanWhatsappName como fracos', () => {
            expect(isWeakWhatsappName('Agência Hut', '5511999999999')).toBe(true);
            expect(isWeakWhatsappName('unknown', '5511999999999')).toBe(true);
        });
        it('deve considerar um nome apenas com dígitos igual ao telefone como fraco', () => {
            expect(isWeakWhatsappName('+55 11 99999-9999', '+55 11 99999-9999')).toBe(true);
        });
        it('deve considerar nomes reais como fortes (não fracos)', () => {
            expect(isWeakWhatsappName('Rafael Livre', '5511999999999')).toBe(false);
        });
    });
});
//# sourceMappingURL=session-manager.test.js.map