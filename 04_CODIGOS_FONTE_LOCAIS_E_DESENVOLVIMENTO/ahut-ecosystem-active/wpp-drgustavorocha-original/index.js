import './load-env.js';
import { supabase } from './supabase.js';
import { startSession, stopSession, sendMessage, getActiveSocket, isSessionStarting, isSocketFullyConnected, resetSessionBackoff, isSessionInBackoff } from './session-manager.js';
import { startSupabaseRealtimeSync } from './realtime-sync.js';
import { pino } from 'pino';
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const POLL_INTERVAL = Number(process.env.POLL_INTERVAL_MS) || 3000;
const cleanedDisconnectedSessions = new Set();
async function startupCleanup() {
    try {
        // Reset any active/starting sessions to connecting so they get reconnected
        const { error } = await supabase
            .from('whatsapp_sessions')
            .update({
            status: 'connecting',
            qr_code: null,
            qr_expires_at: null,
            last_error: 'Reconectando apos reinicializacao do broker...',
            updated_at: new Date().toISOString(),
        })
            .in('status', ['connecting', 'connected', 'qr_ready']);
        if (error) {
            logger.error({ error }, 'Erro ao limpar sessoes stale no startup');
        }
        else {
            logger.info('Sessoes stale preparadas para reconexao');
        }
    }
    catch (err) {
        logger.error({ err }, 'Erro no startup cleanup');
    }
}
async function pollSessions() {
    try {
        const { data: sessions, error } = await supabase
            .from('whatsapp_sessions')
            .select('*')
            .in('status', ['connecting', 'qr_ready', 'connected', 'disconnected']);
        if (error) {
            logger.error({ error }, 'Erro ao buscar sessoes');
            return;
        }
        for (const session of (sessions || [])) {
            const key = `${session.tenant_id}:${session.session_name}`;
            const hasSocket = !!getActiveSocket(session.tenant_id, session.session_name);
            const isStarting = isSessionStarting(session.tenant_id, session.session_name);
            const isFullyConnected = isSocketFullyConnected(session.tenant_id, session.session_name);
            if (session.status === 'disconnected') {
                if (hasSocket || isStarting) {
                    logger.info({ tenant: session.tenant_id, session: session.session_name }, 'Parando sessao desconectada (preservando credenciais para reconexao automatica)');
                    // NÃO deletar auth aqui — preservar creds.json para reconexão automática sem novo QR.
                    // As credenciais só são inválidas em logout permanente (tratado no session-manager).
                    await stopSession(session.tenant_id, session.session_name, false);
                }
                continue;
            }
            if (!hasSocket && !isStarting) {
                // Anti-rate-limit: verificar backoff antes de tentar reconectar
                const { inBackoff, waitSec, failures } = isSessionInBackoff(key);
                if (inBackoff) {
                    logger.info({ tenant: session.tenant_id, waitSec, failures }, `[Backoff] Sessao em espera anti-rate-limit. Proxima tentativa em ${waitSec}s`);
                    continue;
                }
                cleanedDisconnectedSessions.delete(key);
                logger.info({ tenant: session.tenant_id, session: session.session_name, status: session.status }, 'Iniciando sessao');
                await startSession(session);
            }
            else if (hasSocket && !isStarting && isFullyConnected) {
                // Blindagem: Se o socket esta ativo e TOTALMENTE conectado, mas o banco de dados desincronizou
                // o motor forca a verdade para a UI.
                if (session.status !== 'connected') {
                    logger.info({ tenant: session.tenant_id, oldStatus: session.status }, 'Blindagem: Forcando DB para connected pois socket esta ativo.');
                    await supabase.from('whatsapp_sessions').update({ status: 'connected', qr_code: null }).eq('id', session.id);
                }
                // Conexao bem-sucedida: resetar backoff
                resetSessionBackoff(key);
            }
        }
    }
    catch (err) {
        logger.error({ err }, 'Erro no poll de sessoes');
    }
}
let isPollingMessages = false;
async function pollOutgoingMessages() {
    if (isPollingMessages)
        return;
    isPollingMessages = true;
    try {
        const { data: messages, error } = await supabase
            .from('whatsapp_messages')
            .select('*')
            .eq('status', 'pending')
            .eq('from_me', true)
            .order('created_at', { ascending: true })
            .limit(50);
        if (error) {
            logger.error({ error }, 'Erro ao buscar mensagens pendentes');
            isPollingMessages = false;
            return;
        }
        for (const msg of (messages || [])) {
            try {
                const { data: session } = await supabase
                    .from('whatsapp_sessions')
                    .select('*')
                    .eq('id', msg.whatsapp_session_id)
                    .single();
                if (!session || session.status !== 'connected') {
                    continue;
                }
                const result = await sendMessage(session.tenant_id, session.session_name, msg.remote_jid, msg.content || '');
                await supabase
                    .from('whatsapp_messages')
                    .update({
                    status: 'sent',
                    whatsapp_message_id: result?.key?.id,
                    sent_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                })
                    .eq('id', msg.id);
                logger.debug({ msgId: msg.id }, 'Mensagem enviada');
            }
            catch (sendErr) {
                logger.error({ err: sendErr, msgId: msg.id }, 'Erro ao enviar mensagem');
                await supabase
                    .from('whatsapp_messages')
                    .update({
                    status: 'failed',
                    updated_at: new Date().toISOString(),
                })
                    .eq('id', msg.id);
            }
            finally {
                // Throttling anti-rate-limit: Atraso aleatório entre 1.5s e 3.0s entre tentativas de envio
                const delayMs = Math.floor(Math.random() * 1500) + 1500;
                await new Promise((resolve) => setTimeout(resolve, delayMs));
            }
        }
    }
    catch (err) {
        logger.error({ err }, 'Erro no poll de mensagens');
    }
    finally {
        isPollingMessages = false;
    }
}
// cleanupDisconnectedSessions REMOVIDA: deletava credenciais a cada 30s para sessões
// desconectadas, impedindo reconexão automática. O session-manager já cuida de
// deletar credenciais quando o logout é permanente (401 + isLoggedOut=true).
async function cleanupDisconnectedSessions() {
    // NÃO FAZER NADA — credenciais são preservadas para reconexão automática.
    // Deletar apenas quando session-manager detecta logout permanente.
}
async function main() {
    logger.info('WhatsApp Broker iniciado');
    // Clean up stale sessions from previous runs
    await startupCleanup();
    // Start realtime listener for CRM changes
    startSupabaseRealtimeSync();
    // Initial poll
    await pollSessions();
    // Periodic polls
    setInterval(pollSessions, POLL_INTERVAL);
    setInterval(pollOutgoingMessages, POLL_INTERVAL);
    // cleanupDisconnectedSessions desativada (deletava creds desnecessariamente)
    // Keep alive
    setInterval(() => {
        logger.debug('Heartbeat');
    }, 60000);
}
main().catch((err) => {
    logger.fatal({ err }, 'Erro fatal no broker');
    process.exit(1);
});
//# sourceMappingURL=index.js.map