import { WASocket } from 'baileys';
interface SessionRecord {
    id: string;
    tenant_id: string;
    user_id?: string | null;
    session_name: string;
    status: string;
    phone_number?: string | null;
    last_error?: string | null;
}
export declare function isSessionStarting(tenantId: string, sessionName: string): boolean;
export declare function isSocketFullyConnected(tenantId: string, sessionName: string): boolean;
export declare function cleanWhatsappName(value?: string | null): string;
export declare function isWeakWhatsappName(value?: string | null, phone?: string | null): boolean;
export declare function startSession(session: SessionRecord): Promise<void>;
export declare function stopSession(tenantId: string, sessionName: string, deleteAuth?: boolean): Promise<void>;
export declare function sendMessage(tenantId: string, sessionName: string, phoneNumber: string, content: string): Promise<import("baileys").WAMessage | undefined>;
export declare function getActiveSocket(tenantId: string, sessionName: string): WASocket | undefined;
export {};
//# sourceMappingURL=session-manager.d.ts.map