import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');
import './load-env.js';
import { randomUUID } from 'node:crypto';
import { supabase } from './supabase.js';
import { pino } from 'pino';

/**
 * followup-worker.ts — Worker de follow-ups agendados para o broker WhatsApp Ahut.
 *
 * RESPONSABILIDADES:
 *  1. Cada ~60s (FOLLOWUP_POLL_INTERVAL_MS) busca followups vencidos:
 *       SELECT * FROM followups WHERE status='pending' AND scheduled_at <= now()
 *  2. Para cada followup vencido resuelve el destino real:
 *       - tenant + session activa del tenant (whatsapp_sessions.status='connected')
 *       - remote_jid sendable desde whatsapp_contacts (conversation_id)
 *  3. Inyecta la mensaje en la OUTBOX del broker (whatsapp_messages, from_me=true, status='pending')
 *     para que EL BROKER EXISTENTE (no este proceso) la envíe vía Baileys.
 *  4. Marca el followup como 'sent' (sent_at/completed_at=now) que conserva el histórico.
 *
 *  NO envía por socket directamente, NO toca auth_info/, NO toca dist/ a mano.
 *  Este proceso corre separado del broker principal (ver comando PM2 al final del archivo).
 *
 * Contrato OUTBOX (ver audio-recovery.ts / index.ts del broker):
 *   whatsapp_messages: id, tenant_id, whatsapp_session_id, remote_jid, from_me=true,
 *   message_type='text', content, status='pending', processing_status, media_status,
 *   retry_count, created_at, updated_at.
 *
 * Contrato followups (ver src/hooks/use-followups.ts del frontend):
 *   id, tenant_id, conversation_id, agent_id, message, scheduled_at, status
 *   (pending|sent|cancelled), created_at, completed_at.
 */

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

const FOLLOWUP_POLL_INTERVAL_MS = Number(process.env.FOLLOWUP_POLL_INTERVAL_MS) || 60_000;
const OUTBOX_BATCH_LIMIT = Number(process.env.FOLLOWUP_BATCH_LIMIT) || 50;

interface FollowupRow {
  id: string;
  tenant_id?: string;
  conversation_id?: string;
  message?: string | null;
  scheduled_at?: string;
  status?: string;
}

interface ResolvedDestination {
  tenantId: string;
  sessionId: string; // whatsapp_session_id para la OUTBOX
  remoteJid: string; // JID sendable directo
  conversationId?: string;
}

/** Convierte un número crudo/parcial en un JID waistándolo si no trae dominio. */
function toJid(value: string): string {
  const v = value.trim();
  if (!v) return '';
  return v.includes('@') ? v : `${v}@s.whatsapp.net`;
}

/**
 * Resuelve tenant + session activa + remote_jid deliverable de una conversación.
 *
 * PATRON heredado del broker (session-manager.ts / audio-recovery.ts):
 *  - La sessión activa del tenant es la `whatsapp_sessions.status='connected'`.
 *  - El remote_jid se toma de `whatsapp_contacts` por conversation_id.
 *  - Preferencia de JID (mismo criterio que sendMessage del broker, session-manager.ts):
 *      remote_jid_alt que termina en @s.whatsapp.net (PN real / mapeo LID)  → ganador
 *      remote_jid que termina en @s.whatsapp.net (PN/JID estándar)          → siguiente
 *      else remote_jid crudo (p.ej. @lid o @g.us).
 *    remote_jid_alt vs remote_jid NUNCA se invierten: solo se eligen con prioridad
 *    para el envío, igual que hace el propio sendMessage del broker.
 */
async function resolveDestination(fu: FollowupRow): Promise<ResolvedDestination | null> {
  let tenantId = (fu.tenant_id || '').trim();
  const conversationId = (fu.conversation_id || '').trim();
  let sessionId = '';
  let remoteJid = '';

  // 1) tenant de la conversación (fallback si el followup no la trae)
  if (!tenantId && conversationId) {
    const { data: conv, error: convErr } = await supabase
      .from('conversations')
      .select('tenant_id')
      .eq('id', conversationId)
      .limit(1);
    if (convErr) {
      logger.warn({ fu: fu.id, err: convErr.message }, '[FollowupWorker] error al leer conversations');
    } else if (conv && conv[0]) {
      tenantId = String((conv[0] as any).tenant_id || '').trim();
    }
  }
  if (!tenantId) {
    logger.warn({ fu: fu.id }, '[FollowupWorker] sin tenant_id; se omite');
    return null;
  }

  // 2) session activa del tenant (la que usa la OUTBOX del broker para enviar)
  const { data: sess, error: sessErr } = await supabase
    .from('whatsapp_sessions')
    .select('id')
    .eq('tenant_id', tenantId)
    .eq('status', 'connected')
    .limit(1);
  if (sessErr) {
    logger.warn({ fu: fu.id, err: sessErr.message }, '[FollowupWorker] error al leer whatsapp_sessions');
  }
  if (sess && sess[0]) sessionId = String((sess[0] as any).id || '');

  // 3) remote_jid del contacto vinculado a la conversación
  if (conversationId) {
    const { data: wc, error: wcErr } = await supabase
      .from('whatsapp_contacts')
      .select('remote_jid, remote_jid_alt, phone_number')
      .eq('conversation_id', conversationId)
      .limit(5);
    if (wcErr) {
      logger.warn({ fu: fu.id, err: wcErr.message }, '[FollowupWorker] error al leer whatsapp_contacts');
    } else if (wc && wc.length > 0) {
      const c = wc[0] as any;
      const alt = String(c.remote_jid_alt || '');
      const main = String(c.remote_jid || '');
      if (alt.endsWith('@s.whatsapp.net')) remoteJid = alt;
      else if (main.endsWith('@s.whatsapp.net')) remoteJid = main;
      else if (main) remoteJid = main;
      else if (String(c.phone_number || '')) remoteJid = toJid(String(c.phone_number));
    }
  }
  if (!remoteJid) {
    logger.warn({ fu: fu.id, conversation_id: conversationId }, '[FollowupWorker] sin remote_jid resuelto; se omite');
    return null;
  }

  return {
    tenantId,
    sessionId,
    remoteJid,
    ...(conversationId ? { conversationId } : {}),
  };
}

/**
 * Inyecta la mensaje en la OUTBOX del broker (whatsapp_messages) y, si el INSERT
 * fue exitoso, marca el followup como 'sent'. El envio real lo hace el broker.
 */
async function processFollowup(fu: FollowupRow): Promise<void> {
  const dest = await resolveDestination(fu);
  if (!dest) return;

  const content = (fu.message || '').trim();
  if (!content) {
    logger.warn({ fu: fu.id }, '[FollowupWorker] followup sin mensaje; se omite');
    return;
  }

  const now = new Date().toISOString();
  const body: any = {
    id: randomUUID(),
    tenant_id: dest.tenantId,
    remote_jid: dest.remoteJid,
    from_me: true,
    message_type: 'text',
    content,
    status: 'pending',
    processing_status: 'pending',
    media_status: 'none',
    retry_count: 0,
    created_at: now,
    updated_at: now,
  };
  if (dest.sessionId) body.whatsapp_session_id = dest.sessionId;
  if (dest.conversationId) body.conversation_id = dest.conversationId;

  const { error: insErr } = await supabase.from('whatsapp_messages').insert(body);
  if (insErr) {
    logger.error({ fu: fu.id, err: insErr.message }, '[FollowupWorker] fallo al insertar en OUTBOX; se deja pending');
    return;
  }

  // Marcar como sent -> conserva histórico (sin DELETE). Se usan completed_at
  // (contrato del frontend) y sent_at, ambos actualizados a now().
  const { error: updErr } = await supabase
    .from('followups')
    .update({
      status: 'sent',
      sent_at: now,
      completed_at: now,
      updated_at: now,
    })
    .eq('id', fu.id);
  if (updErr) {
    logger.error({ fu: fu.id, err: updErr.message }, '[FollowupWorker] OUTBOX OK pero fallo al marcar sent; posible re-envio en proxima pasada');
    return;
  }

  logger.info(
    { fu: fu.id, remoteJid: dest.remoteJid, sessionId: dest.sessionId || '(sin session connected)' },
    '[FollowupWorker] followup inyectado en OUTBOX y marcado sent'
  );
}

let isPolling = false;

async function pollDueFollowups(): Promise<void> {
  if (isPolling) return; // evita solapamiento si una pasada tarda > intervalo
  isPolling = true;

  try {
    const { data: due, error } = await supabase
      .from('followups')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_at', new Date().toISOString())
      .limit(OUTBOX_BATCH_LIMIT);

    if (error) {
      logger.error({ err: error.message }, '[FollowupWorker] error al buscar followups vencidos');
      return;
    }
    if (!due || due.length === 0) return;

    logger.info({ count: due.length }, '[FollowupWorker] followups vencidos encontrados');
    for (const fu of due as FollowupRow[]) {
      try {
        await processFollowup(fu);
      } catch (err: any) {
        logger.error({ fu: fu.id, err: err?.message || String(err) }, '[FollowupWorker] error procesando followup');
      }
    }
  } catch (err) {
    logger.error({ err }, '[FollowupWorker] error en poll');
  } finally {
    isPolling = false;
  }
}

function main(): void {
  logger.info(`[FollowupWorker] iniciado (intervalo ${FOLLOWUP_POLL_INTERVAL_MS}ms, batch ${OUTBOX_BATCH_LIMIT})`);

  // pasada inicial + loop periódico
  pollDueFollowups().catch((err) => logger.error({ err }, '[FollowupWorker] fallo en pasada inicial'));
  setInterval(pollDueFollowups, FOLLOWUP_POLL_INTERVAL_MS);

  // keep alive
  setInterval(() => logger.debug('[FollowupWorker] heartbeat'), 60_000);
}

main();