import { makeWASocket, DisconnectReason, useMultiFileAuthState, Browsers, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, downloadMediaMessage, } from 'baileys';
import QRCode from 'qrcode';
import { supabase } from './supabase.js';
import { pino } from 'pino';
import { randomUUID } from 'node:crypto';
import { rm, mkdir } from 'node:fs/promises';
import path from 'node:path';
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const activeSockets = new Map();
const startingSessions = new Set();
const connectionTimestamps = new Map();
const profilePicBackfillTimers = new Map();
export function isSessionStarting(tenantId, sessionName) {
    return startingSessions.has(`${tenantId}:${sessionName}`);
}
export function isSocketFullyConnected(tenantId, sessionName) {
    const sessionKey = `${tenantId}:${sessionName}`;
    const sock = activeSockets.get(sessionKey);
    return !!sock && connectionTimestamps.has(sessionKey);
}
function stopProfilePicBackfill(sessionKey) {
    const timer = profilePicBackfillTimers.get(sessionKey);
    if (timer) {
        clearInterval(timer);
        profilePicBackfillTimers.delete(sessionKey);
    }
}
function normalizePhone(value) {
    return value.split('@')[0].split(':')[0].replace(/\D/g, '');
}
export function cleanWhatsappName(value) {
    const name = (value || '').trim().replace(/\s+/g, ' ');
    if (!name)
        return '';
    const normalized = name.toLowerCase();
    const digitsOnly = name.replace(/\D/g, '');
    const technicalMarkers = [
        'deleted-self-whatsapp',
        'self-whatsapp',
        'deleted-whatsapp',
        'unknown',
        'undefined',
        'null',
    ];
    if (technicalMarkers.some((marker) => normalized.includes(marker)))
        return '';
    if (name.includes('@s.whatsapp.net') || name.includes('@lid'))
        return '';
    if (/^\[.*\]$/.test(name) && normalized.includes('deleted'))
        return '';
    if (digitsOnly.length >= 10 && digitsOnly === name.replace(/\D/g, ''))
        return '';
    return name;
}
export function isWeakWhatsappName(value, phone) {
    const name = (value || '').trim();
    if (!name)
        return true;
    if (!cleanWhatsappName(name))
        return true;
    const digitsOnly = name.replace(/\D/g, '');
    const phoneOnly = normalizePhone(phone || '');
    return !!digitsOnly && digitsOnly === phoneOnly;
}
function resolveWhatsappDisplayName(pushName, existingContactName, phone) {
    return cleanWhatsappName(pushName)
        || cleanWhatsappName(existingContactName)
        || phone
        || 'Cliente WhatsApp';
}
async function ensureWhatsappLead(params) {
    const phone = normalizePhone(params.phone);
    if (!params.tenantId || !phone)
        return null;
    const name = cleanWhatsappName(params.name) || `Cliente ${phone.slice(-4) || 'WhatsApp'}`;
    const now = new Date().toISOString();
    const { data: existingLead, error: lookupError } = await supabase
        .from('leads')
        .select('id, name, phone, stage, source, tags')
        .eq('tenant_id', params.tenantId)
        .eq('phone', phone)
        .maybeSingle();
    if (lookupError) {
        // Não lança erro — apenas avisa e continua. Um erro de lookup não deve
        // derrubar a sessão do WhatsApp; a mensagem já foi salva.
        logger.warn({ err: lookupError.message, phone }, 'Aviso: falha ao buscar lead existente; continuando sem bloquear');
    }
    if (existingLead?.id) {
        const shouldPatchName = isWeakWhatsappName(existingLead.name, phone) && !isWeakWhatsappName(name, phone);
        const existingTags = existingLead.tags || [];
        const mergedTags = Array.from(new Set([...existingTags, ...(params.tags || [])]));
        const updatePayload = {
            phone,
            source: existingLead.source || 'WhatsApp',
            tags: mergedTags,
            updated_at: now,
        };
        if (shouldPatchName)
            updatePayload.name = name;
        const { error: updateError } = await supabase
            .from('leads')
            .update(updatePayload)
            .eq('id', existingLead.id)
            .eq('tenant_id', params.tenantId);
        if (updateError) {
            logger.warn({ err: updateError.message, leadId: existingLead.id, phone }, 'Aviso: falha ao atualizar lead existente');
        }
        return existingLead.id;
    }
    // Auto-correção: se não encontrou lead pelo telefone real, verifica se existe um lead
    // cujo telefone está salvo como LID do WhatsApp (número com >13 dígitos, formato inválido).
    // Isso acontece quando o lead enviou mensagem via @lid antes de uma sessão limpa.
    // Ao detectar, corrigimos o telefone para o número real e retornamos o lead existente.
    if (params.conversationId) {
        const { data: lidLead } = await supabase
            .from('leads')
            .select('id, name, phone, stage, source, tags')
            .eq('tenant_id', params.tenantId)
            .filter('notes', 'ilike', `%conversation_id: ${params.conversationId}%`)
            .maybeSingle();
        if (lidLead?.id && lidLead.phone && lidLead.phone.replace(/\D/g, '').length > 13) {
            logger.info({ leadId: lidLead.id, oldPhone: lidLead.phone, newPhone: phone }, 'Auto-corrigindo telefone LID -> telefone real no lead');
            const existingTags = lidLead.tags || [];
            const mergedTags = Array.from(new Set([...existingTags, ...(params.tags || [])]));
            const shouldPatchName = isWeakWhatsappName(lidLead.name, lidLead.phone) && !isWeakWhatsappName(name, phone);
            const updatePayload = { phone, tags: mergedTags, updated_at: now };
            if (shouldPatchName)
                updatePayload.name = name;
            await supabase.from('leads').update(updatePayload).eq('id', lidLead.id).eq('tenant_id', params.tenantId);
            return lidLead.id;
        }
    }
    const { data: insertedLead, error: insertError } = await supabase
        .from('leads')
        .insert({
        tenant_id: params.tenantId,
        name,
        phone,
        source: 'WhatsApp',
        stage: 'Primeiro Atendimento',
        score: 50,
        sla_status: 'ok',
        responsible_id: null,
        created_by: params.createdBy || null,
        tags: params.tags || [],
        notes: [
            'Lead criado automaticamente pelo WhatsApp.',
            params.profileId ? `profile_id: ${params.profileId}` : null,
            params.conversationId ? `conversation_id: ${params.conversationId}` : null,
        ].filter(Boolean).join('\n'),
        created_at: now,
        updated_at: now,
    })
        .select('id')
        .single();
    if (insertError) {
        // Código 23505 = violação de unique constraint (lead duplicado com mesmo telefone).
        // Não é um erro fatal — apenas avisa no log e retorna null.
        // A sessão do WhatsApp NUNCA deve ser afetada por duplicata de lead.
        if (insertError.code === '23505' || insertError.message?.includes('duplicate key') || insertError.message?.includes('unique')) {
            logger.warn({ phone, tenantId: params.tenantId }, 'Lead duplicado detectado (mesmo telefone já existe). Ignorando criação; WhatsApp segue ativo.');
            return null;
        }
        // Outros erros de insert: loga e retorna null sem lançar
        logger.warn({ err: insertError.message, phone }, 'Aviso: falha ao inserir lead; mensagem do WhatsApp preservada');
        return null;
    }
    if (insertedLead?.id) {
        const { error: timelineError } = await supabase
            .from('lead_timeline')
            .insert({
            lead_id: insertedLead.id,
            type: 'lead_created',
            title: 'Lead WhatsApp criado',
            description: 'Lead criado automaticamente a partir de uma conversa recebida no WhatsApp.',
            user_id: params.createdBy || null,
        });
        if (timelineError) {
            logger.warn({ err: timelineError.message, leadId: insertedLead.id }, 'Nao foi possivel criar timeline do lead WhatsApp');
        }
    }
    return insertedLead?.id || null;
}
function normalizePairingPhone(value) {
    const phone = normalizePhone(value || '');
    return phone.length >= 10 ? phone : '';
}
function canonicalRemoteJid(remoteJid, realPhone) {
    const phone = normalizePhone(realPhone || remoteJid);
    if (phone.startsWith('55') && phone.length >= 12 && phone.length <= 13) {
        return `${phone}@s.whatsapp.net`;
    }
    return remoteJid;
}
async function updateBrokerHealth(session, patch) {
    try {
        await supabase
            .from('whatsapp_broker_health')
            .upsert({
            tenant_id: session.tenant_id,
            whatsapp_session_id: session.id,
            session_name: session.session_name,
            status: patch.status || session.status || 'unknown',
            broker_pid: Number(process.pid || 0),
            ...patch,
            updated_at: new Date().toISOString(),
        }, { onConflict: 'whatsapp_session_id' });
    }
    catch (err) {
        logger.warn({ err: err?.message || err }, 'Falha ao atualizar health do broker');
    }
}
async function claimMessageProcessing(params) {
    const now = new Date().toISOString();
    const direction = params.isFromMe ? 'outgoing' : 'incoming';
    const { data, error } = await supabase
        .from('whatsapp_message_processing')
        .insert({
        tenant_id: params.session.tenant_id,
        whatsapp_session_id: params.session.id,
        whatsapp_message_id: params.whatsappMessageId,
        remote_jid: params.remoteJid,
        canonical_remote_jid: params.canonicalJid,
        direction,
        event_type: params.eventType,
        message_type: params.messageType,
        status: 'processing',
        media_status: params.messageType === 'text' || params.messageType === 'location' ? 'none' : 'pending',
        first_seen_at: now,
        last_seen_at: now,
    })
        .select('id')
        .single();
    if (!error)
        return { claimed: true, id: data?.id };
    if (error.code === '23505' || error.message?.includes('duplicate key')) {
        await supabase
            .from('whatsapp_message_processing')
            .update({
            status: 'duplicate',
            last_seen_at: now,
            attempts: 2,
            error: 'Mensagem duplicada recebida pelo broker',
        })
            .eq('whatsapp_session_id', params.session.id)
            .eq('whatsapp_message_id', params.whatsappMessageId);
        return { claimed: false };
    }
    logger.warn({ err: error.message, msgId: params.whatsappMessageId }, 'Falha ao criar claim de processamento');
    return { claimed: true };
}
async function finishMessageProcessing(processingId, status, mediaStatus, error) {
    if (!processingId)
        return;
    await supabase
        .from('whatsapp_message_processing')
        .update({
        status,
        media_status: mediaStatus,
        error: error || null,
        processed_at: new Date().toISOString(),
        last_seen_at: new Date().toISOString(),
    })
        .eq('id', processingId);
}
function getMessageContent(msg) {
    return msg.message?.conversation
        || msg.message?.extendedTextMessage?.text
        || msg.message?.imageMessage?.caption
        || msg.message?.videoMessage?.caption
        || msg.message?.documentMessage?.caption
        || '[midia]';
}
function getMessageType(msg) {
    if (msg.message?.imageMessage)
        return 'image';
    if (msg.message?.videoMessage)
        return 'video';
    if (msg.message?.audioMessage)
        return 'audio';
    if (msg.message?.documentMessage)
        return 'document';
    if (msg.message?.locationMessage || msg.message?.liveLocationMessage)
        return 'location';
    return 'text';
}
async function findAuthUserByEmail(email) {
    const normalizedEmail = email.toLowerCase();
    for (let page = 1; page <= 10; page += 1) {
        const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
        if (error)
            throw error;
        const user = data.users.find((item) => item.email?.toLowerCase() === normalizedEmail);
        if (user)
            return user;
        if (data.users.length < 1000)
            break;
    }
    return null;
}
// Helper to download media from Baileys and upload to Supabase Storage
async function downloadAndUploadMedia(sock, msg, messageType) {
    try {
        logger.info({ messageId: msg.key.id, type: messageType }, 'Baixando mídia do WhatsApp...');
        const buffer = await downloadMediaMessage(msg, 'buffer', {}, {
            logger: pino({ level: 'warn' }),
            reuploadRequest: sock.updateMediaMessage
        });
        if (!buffer) {
            logger.error('Não foi possível obter o buffer do download da mídia');
            return null;
        }
        // Determine extension and content type
        let ext = 'bin';
        let contentType = 'application/octet-stream';
        const message = msg.message;
        if (messageType === 'image') {
            ext = 'jpg';
            contentType = 'image/jpeg';
        }
        else if (messageType === 'video') {
            ext = 'mp4';
            contentType = 'video/mp4';
        }
        else if (messageType === 'audio') {
            ext = 'ogg';
            contentType = 'audio/ogg';
        }
        else if (messageType === 'document') {
            const doc = message?.documentMessage;
            ext = doc?.fileName?.split('.').pop() || 'bin';
            contentType = doc?.mimetype || 'application/octet-stream';
        }
        const fileName = `${msg.key.id}.${ext}`;
        const fileKey = `${randomUUID()}_${fileName}`;
        const bucketName = 'chat-attachments';
        logger.info({ fileKey }, 'Fazendo upload da mídia para Supabase Storage...');
        const { data, error } = await supabase.storage
            .from(bucketName)
            .upload(fileKey, buffer, {
            contentType,
            cacheControl: '3600',
            upsert: false
        });
        if (error) {
            logger.error({ error }, 'Erro ao enviar mídia para Supabase Storage');
            return null;
        }
        // Get public URL
        const { data: publicUrlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(fileKey);
        logger.info({ publicUrl: publicUrlData.publicUrl }, 'Upload concluído e URL pública obtida.');
        return {
            publicUrl: publicUrlData.publicUrl,
            fileName: message?.documentMessage?.fileName || fileName,
            mimeType: contentType,
            size: buffer.length
        };
    }
    catch (err) {
        logger.error({ err }, 'Erro no helper downloadAndUploadMedia');
        return null;
    }
}
// Cache de sincronizações recentes para evitar baixar a mesma foto várias vezes
const profilePicSyncCache = new Map();
const PROFILE_PIC_CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 horas
async function syncProfilePicture(sock, tenantId, profileId, remoteJid) {
    const cacheKey = `${tenantId}:${remoteJid}`;
    const lastSync = profilePicSyncCache.get(cacheKey);
    if (lastSync && Date.now() - lastSync < PROFILE_PIC_CACHE_TTL_MS) {
        return; // já sincronizou recentemente
    }
    // 1. Determinar quais JIDs tentar.
    // Contatos @lid geralmente NÃO retornam foto direto — preciso resolver para o numero de telefone (@s.whatsapp.net).
    const jidsToTry = [];
    if (remoteJid.endsWith('@lid')) {
        // Buscar o phone_number no whatsapp_contacts para construir o JID @s.whatsapp.net
        const { data: contactRow } = await supabase
            .from('whatsapp_contacts')
            .select('phone_number')
            .eq('tenant_id', tenantId)
            .eq('remote_jid', remoteJid)
            .maybeSingle();
        if (contactRow?.phone_number) {
            jidsToTry.push(`${contactRow.phone_number}@s.whatsapp.net`);
        }
        jidsToTry.push(remoteJid); // fallback ao @lid
    }
    else {
        jidsToTry.push(remoteJid);
    }
    // Pedir URL da imagem para o WhatsApp (URL é temporária)
    // Usar 'preview' (thumb low-res) é mais permissivo que 'image' (full res, geralmente restrito por privacidade)
    // Timeout curto (8s) — sem isso o WhatsApp pode pendurar a request 45s+ quando o contato não tem foto visível.
    let waUrl = null;
    let lastErr = null;
    for (const jid of jidsToTry) {
        try {
            waUrl = await Promise.race([
                sock.profilePictureUrl(jid, 'preview'),
                new Promise((_, reject) => setTimeout(() => reject(new Error('profilePictureUrl timeout 8s')), 8000)),
            ]);
            if (waUrl && typeof waUrl === 'string') {
                break; // sucesso
            }
        }
        catch (err) {
            lastErr = err;
        }
    }
    if (!waUrl) {
        profilePicSyncCache.set(cacheKey, Date.now());
        logger.info({ jid: remoteJid, jidsToTry, err: lastErr?.message }, 'Foto de perfil indisponivel');
        return;
    }
    logger.info({ jid: remoteJid, waUrl: waUrl.substring(0, 80) }, 'URL da foto obtida, baixando...');
    // 2. Baixar a imagem
    let imageBuffer;
    try {
        const response = await fetch(waUrl);
        if (!response.ok)
            throw new Error(`HTTP ${response.status}`);
        const arrayBuffer = await response.arrayBuffer();
        imageBuffer = Buffer.from(arrayBuffer);
    }
    catch (err) {
        logger.warn({ jid: remoteJid, err: err?.message }, 'Erro ao baixar foto de perfil');
        return;
    }
    // 3. Subir para o Supabase Storage (bucket `avatars`)
    const fileKey = `whatsapp/${tenantId}/${profileId}.jpg`;
    const { error: uploadErr } = await supabase.storage
        .from('avatars')
        .upload(fileKey, imageBuffer, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: true,
    });
    if (uploadErr) {
        logger.debug({ jid: remoteJid, err: uploadErr.message }, 'Erro ao subir foto para Storage');
        return;
    }
    // 4. Obter URL pública e adicionar cache-buster timestamp
    const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(fileKey);
    const publicUrl = `${publicUrlData.publicUrl}?v=${Date.now()}`;
    // 5. Atualizar whatsapp_contacts e profiles
    await supabase
        .from('whatsapp_contacts')
        .update({ profile_pic_url: publicUrl, updated_at: new Date().toISOString() })
        .eq('tenant_id', tenantId)
        .eq('remote_jid', remoteJid);
    await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profileId);
    profilePicSyncCache.set(cacheKey, Date.now());
    logger.info({ jid: remoteJid, profileId }, 'Foto de perfil sincronizada com sucesso');
}
// Sincronização em massa: percorre todos os contatos do tenant e sincroniza fotos.
// Roda em background ao conectar a sessão. Limite e throttle protegem o WhatsApp.
async function bulkSyncProfilePictures(sock, tenantId) {
    const { data: contacts, error } = await supabase
        .from('whatsapp_contacts')
        .select('profile_id, remote_jid, profile_pic_url, updated_at')
        .eq('tenant_id', tenantId)
        .eq('is_group', false)
        .not('profile_id', 'is', null)
        .not('remote_jid', 'is', null)
        .order('last_message_at', { ascending: false, nullsFirst: false })
        .limit(150);
    if (error || !contacts || contacts.length === 0) {
        if (error)
            logger.debug({ err: error.message }, 'Erro ao listar contatos para bulk sync');
        return;
    }
    logger.info({ tenantId, total: contacts.length }, 'Iniciando bulk sync de fotos de perfil');
    let synced = 0;
    for (const contact of contacts) {
        if (!contact.profile_id || !contact.remote_jid)
            continue;
        try {
            await syncProfilePicture(sock, tenantId, contact.profile_id, contact.remote_jid);
            synced++;
        }
        catch (err) {
            logger.debug({ jid: contact.remote_jid, err: err?.message }, 'Erro no item do bulk sync');
        }
        // Throttle: ~300ms entre requisições para não disparar rate-limit do WhatsApp
        await new Promise((r) => setTimeout(r, 300));
    }
    logger.info({ tenantId, synced, total: contacts.length }, 'Bulk sync de fotos concluido');
}
const SAFE_PROFILE_PIC_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const SAFE_PROFILE_PIC_ATTEMPT_TTL_MS = 24 * 60 * 60 * 1000;
const SAFE_PROFILE_PIC_TIMEOUT_MS = 5_000;
const SAFE_PROFILE_PIC_JOB_DELAY_MS = 2_500;
const SAFE_PROFILE_PIC_CIRCUIT_BREAK_MS = 5 * 60 * 1000;
const SAFE_PROFILE_PIC_MAX_CONSECUTIVE_FAILURES = 5;
const safeProfilePicQueue = [];
const safeProfilePicQueued = new Set();
const safeProfilePicCache = new Map();
let safeProfilePicWorkerRunning = false;
let safeProfilePicCircuitOpenUntil = 0;
let safeProfilePicConsecutiveFailures = 0;
function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
function safeProfilePicKey(tenantId, profileId) {
    return `${tenantId}:${profileId}`;
}
function safeProfilePicJids(remoteJid, phone) {
    const jids = [];
    const normalizedPhone = normalizePhone(phone || '');
    if (normalizedPhone.startsWith('55') && normalizedPhone.length >= 12 && normalizedPhone.length <= 13) {
        jids.push(`${normalizedPhone}@s.whatsapp.net`);
    }
    if (remoteJid && !jids.includes(remoteJid)) {
        jids.push(remoteJid);
    }
    return jids;
}
async function updateSafeProfilePicState(tenantId, profileId, patch) {
    const { error } = await supabase
        .from('whatsapp_contacts')
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq('tenant_id', tenantId)
        .eq('profile_id', profileId);
    if (error) {
        logger.debug({ tenantId, profileId, err: error.message }, 'Erro ao atualizar estado da foto do contato');
    }
}
async function bumpSafeProfilePicAttempt(tenantId, profileId, status, error) {
    const { data: current } = await supabase
        .from('whatsapp_contacts')
        .select('profile_pic_attempts')
        .eq('tenant_id', tenantId)
        .eq('profile_id', profileId)
        .limit(1)
        .maybeSingle();
    await updateSafeProfilePicState(tenantId, profileId, {
        profile_pic_status: status,
        profile_pic_error: error || null,
        profile_pic_attempts: Number(current?.profile_pic_attempts || 0) + 1,
    });
}
async function safeSyncProfilePicture(job) {
    const cacheKey = safeProfilePicKey(job.session.tenant_id, job.profileId);
    const lastSync = safeProfilePicCache.get(cacheKey);
    if (lastSync && Date.now() - lastSync < SAFE_PROFILE_PIC_CACHE_TTL_MS) {
        return { status: 'skipped', error: 'Foto ja verificada recentemente' };
    }
    const jids = safeProfilePicJids(job.remoteJid, job.phone);
    if (jids.length === 0) {
        return { status: 'failed', error: 'Contato sem JID/telefone para foto' };
    }
    let waUrl = null;
    let lastError = null;
    for (const jid of jids) {
        try {
            waUrl = await Promise.race([
                job.sock.profilePictureUrl(jid, 'preview'),
                new Promise((_, reject) => setTimeout(() => reject(new Error('profilePictureUrl timeout 5s')), SAFE_PROFILE_PIC_TIMEOUT_MS)),
            ]);
            if (waUrl)
                break;
        }
        catch (err) {
            lastError = err;
        }
    }
    if (!waUrl) {
        safeProfilePicCache.set(cacheKey, Date.now());
        return { status: 'unavailable', error: lastError?.message || 'Foto indisponivel no WhatsApp' };
    }
    try {
        const response = await fetch(waUrl);
        if (!response.ok)
            throw new Error(`HTTP ${response.status}`);
        const buffer = Buffer.from(await response.arrayBuffer());
        const fileKey = `whatsapp/${job.session.tenant_id}/${job.profileId}.jpg`;
        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileKey, buffer, { contentType: 'image/jpeg', cacheControl: '3600', upsert: true });
        if (uploadError)
            throw uploadError;
        const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(fileKey);
        const publicUrl = `${publicUrlData.publicUrl}?v=${Date.now()}`;
        await updateSafeProfilePicState(job.session.tenant_id, job.profileId, {
            profile_pic_url: publicUrl,
            profile_pic_status: 'synced',
            profile_pic_last_success_at: new Date().toISOString(),
            profile_pic_error: null,
        });
        await supabase
            .from('profiles')
            .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
            .eq('id', job.profileId)
            .eq('tenant_id', job.session.tenant_id);
        safeProfilePicCache.set(cacheKey, Date.now());
        logger.info({ profileId: job.profileId, remoteJid: job.remoteJid }, 'Foto de perfil sincronizada pela fila segura');
        return { status: 'synced', publicUrl, error: null };
    }
    catch (err) {
        return { status: 'failed', error: err?.message || 'Erro ao sincronizar foto' };
    }
}
async function shouldRunSafeProfilePicJob(job) {
    const { data, error } = await supabase
        .from('whatsapp_contacts')
        .select('profile_pic_url, profile_pic_status, profile_pic_last_attempt_at, profile_pic_attempts, is_group')
        .eq('tenant_id', job.session.tenant_id)
        .eq('profile_id', job.profileId)
        .limit(1)
        .maybeSingle();
    if (error) {
        logger.debug({ profileId: job.profileId, err: error.message }, 'Erro ao verificar estado da foto');
        return false;
    }
    if (!data || data.is_group)
        return false;
    if (data.profile_pic_url && data.profile_pic_status === 'synced')
        return false;
    if (data.profile_pic_status === 'syncing') {
        if (!data.profile_pic_last_attempt_at)
            return false;
        const lastAttempt = new Date(data.profile_pic_last_attempt_at).getTime();
        if (Date.now() - lastAttempt < 10 * 60 * 1000)
            return false;
    }
    if (data.profile_pic_last_attempt_at) {
        const lastAttempt = new Date(data.profile_pic_last_attempt_at).getTime();
        const tooRecent = Date.now() - lastAttempt < SAFE_PROFILE_PIC_ATTEMPT_TTL_MS;
        if (tooRecent && ['unavailable', 'failed'].includes(data.profile_pic_status))
            return false;
    }
    if (data.profile_pic_status === 'failed' && Number(data.profile_pic_attempts || 0) >= 3)
        return false;
    return true;
}
function enqueueSafeProfilePictureSync(job) {
    if (!job.profileId || !job.remoteJid)
        return;
    if (job.remoteJid.endsWith('@g.us') || job.remoteJid.endsWith('@broadcast') || job.remoteJid.endsWith('@newsletter'))
        return;
    const key = safeProfilePicKey(job.session.tenant_id, job.profileId);
    const lastSync = safeProfilePicCache.get(key);
    if (lastSync && Date.now() - lastSync < SAFE_PROFILE_PIC_CACHE_TTL_MS)
        return;
    if (safeProfilePicQueued.has(key))
        return;
    safeProfilePicQueued.add(key);
    safeProfilePicQueue.push(job);
    void runSafeProfilePicWorker();
}
async function enqueueRecentMissingProfilePictures(sock, session, limit = 5) {
    const { data, error } = await supabase
        .from('whatsapp_contacts')
        .select('profile_id, remote_jid, remote_jid_alt, phone_number')
        .eq('tenant_id', session.tenant_id)
        .eq('is_group', false)
        .not('profile_id', 'is', null)
        .or('profile_pic_url.is.null,profile_pic_status.eq.pending')
        .order('last_message_at', { ascending: false, nullsFirst: false })
        .limit(limit);
    if (error) {
        logger.debug({ err: error.message }, 'Erro ao listar contatos para backfill seguro de fotos');
        return;
    }
    for (const contact of data || []) {
        const profileId = contact.profile_id;
        const remoteJid = (contact.remote_jid_alt || contact.remote_jid);
        if (!profileId || !remoteJid)
            continue;
        enqueueSafeProfilePictureSync({
            sock,
            session,
            profileId,
            remoteJid,
            phone: contact.phone_number,
        });
    }
    if ((data || []).length > 0) {
        logger.info({ tenant: session.tenant_id, count: data?.length || 0 }, 'Backfill seguro de fotos enfileirado');
    }
}
function startSafeProfilePicBackfill(sessionKey, sock, session) {
    stopProfilePicBackfill(sessionKey);
    // Sincronização ativa desativada para estabilizar a conexão com o WhatsApp.
    logger.info({ sessionKey }, 'Backfill de fotos de perfil desativado para evitar sobrecarga de consultas.');
}
async function runSafeProfilePicWorker() {
    if (safeProfilePicWorkerRunning)
        return;
    safeProfilePicWorkerRunning = true;
    try {
        while (safeProfilePicQueue.length > 0) {
            if (Date.now() < safeProfilePicCircuitOpenUntil) {
                await wait(Math.min(safeProfilePicCircuitOpenUntil - Date.now(), SAFE_PROFILE_PIC_CIRCUIT_BREAK_MS));
            }
            const job = safeProfilePicQueue.shift();
            const key = safeProfilePicKey(job.session.tenant_id, job.profileId);
            safeProfilePicQueued.delete(key);
            if (!(await shouldRunSafeProfilePicJob(job)))
                continue;
            await updateSafeProfilePicState(job.session.tenant_id, job.profileId, {
                profile_pic_status: 'syncing',
                profile_pic_last_attempt_at: new Date().toISOString(),
                profile_pic_error: null,
            });
            const result = await safeSyncProfilePicture(job);
            if (result.status === 'synced' || result.status === 'skipped') {
                safeProfilePicConsecutiveFailures = 0;
            }
            else if (result.status === 'unavailable') {
                safeProfilePicConsecutiveFailures = 0;
                await bumpSafeProfilePicAttempt(job.session.tenant_id, job.profileId, 'unavailable', result.error);
            }
            else {
                safeProfilePicConsecutiveFailures += 1;
                await bumpSafeProfilePicAttempt(job.session.tenant_id, job.profileId, 'failed', result.error);
                if (safeProfilePicConsecutiveFailures >= SAFE_PROFILE_PIC_MAX_CONSECUTIVE_FAILURES) {
                    safeProfilePicCircuitOpenUntil = Date.now() + SAFE_PROFILE_PIC_CIRCUIT_BREAK_MS;
                    safeProfilePicConsecutiveFailures = 0;
                    logger.warn({ pausedUntil: new Date(safeProfilePicCircuitOpenUntil).toISOString() }, 'Circuit breaker de fotos de perfil ativado');
                }
            }
            await wait(SAFE_PROFILE_PIC_JOB_DELAY_MS);
        }
    }
    finally {
        safeProfilePicWorkerRunning = false;
    }
}
const pendingParticipantProfiles = new Map();
async function findOrCreateParticipantProfile(session, participantJid, pushName) {
    const phone = normalizePhone(participantJid);
    const lockKey = `${session.tenant_id}:participant:${phone}`;
    if (pendingParticipantProfiles.has(lockKey)) {
        return pendingParticipantProfiles.get(lockKey);
    }
    const promise = (async () => {
        // 1. Check if profile exists by phone
        const { data: existingProfile, error: profileLookupError } = await supabase
            .from('profiles')
            .select('id')
            .eq('tenant_id', session.tenant_id)
            .eq('phone', phone)
            .maybeSingle();
        if (profileLookupError)
            throw profileLookupError;
        if (existingProfile?.id)
            return existingProfile.id;
        // 2. Check if profile exists by synthetic email
        const displayName = resolveWhatsappDisplayName(pushName, null, phone);
        const syntheticEmail = `${phone}@estateia.com`;
        const { data: profileByEmail, error: emailLookupError } = await supabase
            .from('profiles')
            .select('id')
            .eq('tenant_id', session.tenant_id)
            .eq('email', syntheticEmail)
            .maybeSingle();
        if (emailLookupError)
            throw emailLookupError;
        if (profileByEmail?.id)
            return profileByEmail.id;
        // 3. Create auth user
        const password = randomUUID();
        logger.info({ phone, displayName }, 'Criando usuario de auth para o participante do grupo...');
        const { data: userData, error: userError } = await supabase.auth.admin.createUser({
            email: syntheticEmail,
            password,
            email_confirm: true,
            user_metadata: { full_name: displayName }
        });
        let profileId;
        if (userError) {
            const isEmailExists = userError?.code === 'email_exists'
                || userError?.status === 422
                || userError.message?.toLowerCase().includes('already been registered');
            if (!isEmailExists) {
                logger.error({ error: userError, phone }, 'Erro ao criar usuario de auth para participante');
                throw userError;
            }
            const existingUser = await findAuthUserByEmail(syntheticEmail);
            if (!existingUser)
                throw userError;
            profileId = existingUser.id;
        }
        else {
            profileId = userData.user.id;
        }
        await new Promise(resolve => setTimeout(resolve, 500));
        // 4. Ensure profile row exists
        const { data: profileRow } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', profileId)
            .maybeSingle();
        if (!profileRow) {
            const { error: profileInsertError } = await supabase
                .from('profiles')
                .insert({
                id: profileId,
                tenant_id: session.tenant_id,
                full_name: displayName,
                phone,
                role: 'client',
                is_group: false,
            });
            if (profileInsertError)
                throw profileInsertError;
        }
        else {
            await supabase
                .from('profiles')
                .update({
                tenant_id: session.tenant_id,
                full_name: displayName,
                phone,
                role: 'client',
                is_group: false,
            })
                .eq('id', profileId);
        }
        // 5. Ensure whatsapp_contacts row exists
        const { data: existingContact } = await supabase
            .from('whatsapp_contacts')
            .select('id')
            .eq('tenant_id', session.tenant_id)
            .eq('phone_number', phone)
            .maybeSingle();
        if (!existingContact) {
            await supabase
                .from('whatsapp_contacts')
                .insert({
                tenant_id: session.tenant_id,
                profile_id: profileId,
                remote_jid: participantJid,
                phone_number: phone,
                name: displayName,
                is_group: false,
            });
        }
        return profileId;
    })();
    pendingParticipantProfiles.set(lockKey, promise);
    try {
        const result = await promise;
        return result;
    }
    finally {
        setTimeout(() => {
            pendingParticipantProfiles.delete(lockKey);
        }, 5000);
    }
}
async function ensureGroupParticipant(groupId, participantProfileId, role = 'member') {
    try {
        const { error } = await supabase
            .from('group_participants')
            .upsert({
            group_id: groupId,
            profile_id: participantProfileId,
            role,
        }, { onConflict: 'group_id,profile_id' });
        if (error) {
            logger.warn({ error: error.message, groupId, participantProfileId }, 'Erro ao inserir group_participants');
        }
    }
    catch (err) {
        logger.warn({ err: err.message, groupId, participantProfileId }, 'Erro no helper ensureGroupParticipant');
    }
}
const pendingConversations = new Map();
async function findOrCreateWhatsappConversation(session, remoteJid, pushName, realPhone, isFromMe, sock) {
    const phone = realPhone || normalizePhone(remoteJid);
    const lockKey = `${session.tenant_id}:${phone}`;
    if (pendingConversations.has(lockKey)) {
        logger.info({ lockKey }, 'Aguardando criação de conversa concorrente já em andamento...');
        return pendingConversations.get(lockKey);
    }
    const promise = (async () => {
        // 1. Check if the contact already exists by phone_number, remote_jid OR remote_jid_alt
        // (canonical lookup: o mesmo contato pode chegar com @lid e @s.whatsapp.net em momentos diferentes)
        const { data: existingContacts, error: contactError } = await supabase
            .from('whatsapp_contacts')
            .select('id, profile_id, conversation_id, phone_number, name, remote_jid, remote_jid_alt')
            .eq('tenant_id', session.tenant_id)
            .or(`phone_number.eq.${phone},remote_jid.eq.${remoteJid},remote_jid_alt.eq.${remoteJid}`)
            .order('updated_at', { ascending: false })
            .limit(1);
        if (contactError)
            throw contactError;
        const existingContact = existingContacts?.[0] || null;
        let phoneToStore = phone;
        // Anti-overwrite protection: do not let a LID fallback (15-digit Starting with 18...) overwrite a correct phone number!
        if (existingContact?.phone_number && existingContact.phone_number !== phone) {
            const isCurrentLid = phone.length === 15 && phone.startsWith('18');
            if (isCurrentLid || (existingContact.phone_number.startsWith('55') && !phone.startsWith('55'))) {
                phoneToStore = existingContact.phone_number;
            }
        }
        let displayName = resolveWhatsappDisplayName(pushName, existingContact?.name, phoneToStore);
        if (remoteJid.endsWith('@g.us')) {
            let groupName = 'Grupo WhatsApp';
            if (existingContact?.name) {
                groupName = existingContact.name;
            }
            else if (sock) {
                try {
                    const metadata = await sock.groupMetadata(remoteJid);
                    if (metadata && metadata.subject) {
                        groupName = metadata.subject;
                    }
                }
                catch (err) {
                    logger.warn({ err: err.message, remoteJid }, 'Erro ao obter metadados do grupo, usando fallback');
                }
            }
            displayName = groupName;
        }
        const syntheticEmail = `${phoneToStore}@estateia.com`;
        let profileId = existingContact?.profile_id;
        let conversationId = existingContact?.conversation_id;
        let currentProfileName;
        if (!profileId) {
            const { data: profileByPhone, error: profileLookupError } = await supabase
                .from('profiles')
                .select('id')
                .eq('tenant_id', session.tenant_id)
                .eq('phone', phoneToStore)
                .maybeSingle();
            if (profileLookupError)
                throw profileLookupError;
            profileId = profileByPhone?.id;
        }
        if (!profileId) {
            const { data: profileByEmail, error: profileEmailLookupError } = await supabase
                .from('profiles')
                .select('id')
                .eq('tenant_id', session.tenant_id)
                .eq('email', syntheticEmail)
                .maybeSingle();
            if (profileEmailLookupError)
                throw profileEmailLookupError;
            profileId = profileByEmail?.id;
        }
        if (!profileId) {
            // 1. Create a dummy user in auth.users using the admin auth API to satisfy the profiles_id_fkey constraint
            const password = randomUUID();
            logger.info({ phone: phoneToStore }, 'Criando usuario de auth para o cliente...');
            const { data: userData, error: userError } = await supabase.auth.admin.createUser({
                email: syntheticEmail,
                password,
                email_confirm: true,
                user_metadata: { full_name: displayName }
            });
            if (userError) {
                const isEmailExists = userError?.code === 'email_exists'
                    || userError?.status === 422
                    || userError.message?.toLowerCase().includes('already been registered');
                if (!isEmailExists) {
                    logger.error({ error: userError, phone: phoneToStore }, 'Erro ao criar usuario de auth para o cliente');
                    throw userError;
                }
                logger.warn({ phone: phoneToStore, email: syntheticEmail }, 'Usuario de auth ja existia; reaproveitando cadastro');
                const existingUser = await findAuthUserByEmail(syntheticEmail);
                if (!existingUser) {
                    logger.error({ phone: phoneToStore, email: syntheticEmail }, 'Auth informou email existente, mas usuario nao foi encontrado');
                    throw userError;
                }
                profileId = existingUser.id;
            }
            else {
                profileId = userData.user.id;
            }
            // 2. Wait 500ms to let any triggers run, then check if profile exists
            await new Promise(resolve => setTimeout(resolve, 500));
            const { data: existingProfile } = await supabase
                .from('profiles')
                .select('id, full_name')
                .eq('id', profileId)
                .maybeSingle();
            if (!existingProfile) {
                const { error: profileInsertError } = await supabase
                    .from('profiles')
                    .insert({
                    id: profileId,
                    tenant_id: session.tenant_id,
                    full_name: displayName,
                    phone: phoneToStore,
                    role: 'client',
                    is_group: remoteJid.endsWith('@g.us'),
                });
                if (profileInsertError)
                    throw profileInsertError;
            }
            else {
                currentProfileName = existingProfile.full_name;
                const profileNamePatch = isWeakWhatsappName(currentProfileName, phoneToStore)
                    ? { full_name: displayName }
                    : {};
                const { error: profileUpdateError } = await supabase
                    .from('profiles')
                    .update({
                    tenant_id: session.tenant_id,
                    ...profileNamePatch,
                    phone: phoneToStore,
                    role: 'client',
                    is_group: remoteJid.endsWith('@g.us'),
                })
                    .eq('id', profileId);
                if (profileUpdateError)
                    throw profileUpdateError;
            }
        }
        if (!conversationId) {
            const { data: existingConversation, error: conversationLookupError } = await supabase
                .from('conversations')
                .select('id')
                .eq('tenant_id', session.tenant_id)
                .eq('client_id', profileId)
                .neq('status', 'closed')
                .order('last_message_at', { ascending: false, nullsFirst: false })
                .limit(1)
                .maybeSingle();
            if (conversationLookupError)
                throw conversationLookupError;
            conversationId = existingConversation?.id;
        }
        if (!conversationId) {
            // Nova conversa entra como 'pending' (sem agente atribuido)
            // Mensagens enviadas pelo proprio admin (fromMe=true) entram direto como 'open' + agent atribuido
            const initialStatus = isFromMe ? 'open' : 'pending';
            const initialAgent = isFromMe ? (session.user_id || null) : null;
            const initialUnread = isFromMe ? 0 : 1;
            const conversationPayload = {
                tenant_id: session.tenant_id,
                client_id: profileId,
                agent_id: initialAgent,
                subject: `WhatsApp - ${displayName}`,
                status: initialStatus,
                unread_count: initialUnread,
                last_message_at: new Date().toISOString(),
            };
            let { data: conversation, error: conversationInsertError } = await supabase
                .from('conversations')
                .insert(conversationPayload)
                .select('id')
                .single();
            if (conversationInsertError?.message?.includes("'unread_count' column")) {
                delete conversationPayload.unread_count;
                const fallback = await supabase
                    .from('conversations')
                    .insert(conversationPayload)
                    .select('id')
                    .single();
                conversation = fallback.data;
                conversationInsertError = fallback.error;
            }
            if (conversationInsertError)
                throw conversationInsertError;
            if (!conversation) {
                throw new Error('Conversa nao retornada apos insert');
            }
            conversationId = conversation.id;
        }
        else if (!isFromMe) {
            // Conversa existente recebendo mensagem do cliente: incrementa unread_count
            const { error: rpcErr } = await supabase.rpc('increment_conversation_unread', { p_conversation_id: conversationId });
            if (rpcErr) {
                // Fallback se RPC nao existir ainda: raw update
                const { data: curr } = await supabase
                    .from('conversations')
                    .select('unread_count')
                    .eq('id', conversationId)
                    .maybeSingle();
                await supabase
                    .from('conversations')
                    .update({ unread_count: (curr?.unread_count || 0) + 1, updated_at: new Date().toISOString() })
                    .eq('id', conversationId);
            }
        }
        if (existingContact) {
            // Se a mensagem for enviada por mim (fromMe = true), evitamos sobrescrever o nome cadastrado
            // do destinatário usando o pushName do remetente (admin).
            const finalName = isFromMe ? (existingContact.name || displayName) : displayName;
            // Canonicalizar JIDs: se o remoteJid atual difere do salvo, guardar no remote_jid_alt
            const updates = {
                phone_number: phoneToStore,
                name: finalName,
                last_message_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };
            if (existingContact.remote_jid && existingContact.remote_jid !== remoteJid && !existingContact.remote_jid_alt) {
                updates.remote_jid_alt = remoteJid;
            }
            else if (!existingContact.remote_jid && remoteJid) {
                updates.remote_jid = remoteJid;
            }
            const { error: updateError } = await supabase
                .from('whatsapp_contacts')
                .update(updates)
                .eq('id', existingContact.id);
            if (updateError)
                throw updateError;
        }
        else {
            const { error: insertError } = await supabase
                .from('whatsapp_contacts')
                .insert({
                tenant_id: session.tenant_id,
                profile_id: profileId,
                conversation_id: conversationId,
                remote_jid: remoteJid,
                phone_number: phoneToStore,
                name: displayName,
                profile_pic_status: 'pending',
                is_group: remoteJid.endsWith('@g.us'),
                last_message_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            });
            if (insertError)
                throw insertError;
        }
        const safeProfileName = cleanWhatsappName(displayName);
        if (profileId && safeProfileName) {
            const { data: profileNameRow, error: profileNameError } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', profileId)
                .maybeSingle();
            if (profileNameError)
                throw profileNameError;
            if (isWeakWhatsappName(profileNameRow?.full_name, phoneToStore)) {
                await supabase
                    .from('profiles')
                    .update({ full_name: safeProfileName, updated_at: new Date().toISOString() })
                    .eq('id', profileId)
                    .eq('tenant_id', session.tenant_id);
            }
        }
        if (!isFromMe && phoneToStore.startsWith('55') && !remoteJid.endsWith('@g.us')) {
            await supabase
                .from('profiles')
                .update({ phone: phoneToStore, updated_at: new Date().toISOString() })
                .eq('id', profileId)
                .eq('tenant_id', session.tenant_id);
        }
        if (!isFromMe && conversationId && !remoteJid.endsWith('@g.us')) {
            try {
                const leadId = await ensureWhatsappLead({
                    tenantId: session.tenant_id,
                    phone: phoneToStore,
                    name: displayName,
                    profileId,
                    conversationId,
                    createdBy: session.user_id || null,
                });
                if (leadId) {
                    logger.info({ leadId, phone: phoneToStore, conversationId }, 'Lead WhatsApp garantido para dashboard');
                }
            }
            catch (err) {
                logger.error({ err: err?.message || err, phone: phoneToStore, conversationId }, 'Falha ao garantir lead WhatsApp; mensagem sera mantida mesmo assim');
            }
        }
        // Sincronizacao de foto via profilePictureUrl DESATIVADA por bloquear o socket Baileys.
        // (USync timeouts saturam o pipeline, impedindo recepcao de mensagens.)
        // Fotos sao sincronizadas via evento `contacts.upsert/update` quando WhatsApp envia espontaneamente.
        void sock;
        void profileId; // keep params used
        return { profileId, conversationId, phone: phoneToStore };
    })();
    pendingConversations.set(lockKey, promise);
    try {
        const result = await promise;
        return result;
    }
    catch (err) {
        pendingConversations.delete(lockKey);
        throw err;
    }
    finally {
        // Mantém o lock em memória por 5 segundos para que todas as mensagens concorrentes
        // do mesmo tick/rajada compartilhem o mesmo resultado
        setTimeout(() => {
            pendingConversations.delete(lockKey);
        }, 5000);
    }
}
// Retry tracking per session
// lastQr: timestamp do ultimo QR gerado; qrExpiries: quantas vezes o QR expirou sem scan
const retryCounters = new Map();
// Anti-rate-limit backoff compartilhado com index.ts
// Delay: 5s → 10s → 20s → 40s → 5min (cap)
const sessionBackoffInternal = new Map();
export function registerSessionFailure(sessionKey) {
    const current = sessionBackoffInternal.get(sessionKey) || { nextRetryAt: 0, failures: 0 };
    const failures = current.failures + 1;
    const base = 5000;
    const maxDelay = 5 * 60 * 1000;
    const delay = Math.min(base * Math.pow(2, failures - 1), maxDelay);
    sessionBackoffInternal.set(sessionKey, { nextRetryAt: Date.now() + delay, failures });
    logger.info({ sessionKey, failures, delayMs: delay }, `[Backoff] Aguardando ${Math.round(delay / 1000)}s antes de reconectar`);
}
export function resetSessionBackoff(sessionKey) {
    sessionBackoffInternal.delete(sessionKey);
}
export function isSessionInBackoff(sessionKey) {
    const b = sessionBackoffInternal.get(sessionKey);
    if (!b || Date.now() >= b.nextRetryAt)
        return { inBackoff: false, waitSec: 0, failures: 0 };
    return { inBackoff: true, waitSec: Math.round((b.nextRetryAt - Date.now()) / 1000), failures: b.failures };
}
function getRetryCounter(key) {
    if (!retryCounters.has(key)) {
        retryCounters.set(key, { count: 0 });
    }
    return retryCounters.get(key);
}
function resetRetryCounter(key) {
    retryCounters.set(key, { count: 0 });
}
export async function startSession(session) {
    const sessionKey = `${session.tenant_id}:${session.session_name}`;
    startingSessions.add(sessionKey);
    const counter = getRetryCounter(sessionKey);
    // Disconnect existing if any
    if (activeSockets.has(sessionKey)) {
        const old = activeSockets.get(sessionKey);
        activeSockets.delete(sessionKey);
        try {
            old.end(undefined);
        }
        catch { /* ignore */ }
    }
    const authDir = path.resolve(`./auth_info/${session.tenant_id}/${session.session_name}`);
    if (session.status === 'connecting' && !session.qr_code) {
        try {
            await rm(authDir, { recursive: true, force: true });
        }
        catch { /* ignore */ }
    }
    await mkdir(authDir, { recursive: true });
    const { state, saveCreds } = await useMultiFileAuthState(authDir);
    const { version } = await fetchLatestBaileysVersion();
    const socketLogger = pino({ level: 'warn' });
    const sock = makeWASocket({
        version,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, socketLogger),
        },
        printQRInTerminal: false,
        logger: socketLogger,
        browser: Browsers.macOS('Chrome'),
        markOnlineOnConnect: false,
        syncFullHistory: false,
        generateHighQualityLinkPreview: false,
        defaultQueryTimeoutMs: 45_000,
        connectTimeoutMs: 60_000,
        keepAliveIntervalMs: 15_000,
        mobile: false,
    });
    activeSockets.set(sessionKey, sock);
    // Usando modo QR code exclusivamente (sem pairing code por telefone)
    // O requestPairingCode foi removido pois conflitava com o scan de QR:
    // ele trocava o modo do WhatsApp para phone-number pairing 1.5s após gerar o QR,
    // invalidando o QR e causando 401 imediatos quando o usuário tentava escanear.
    // QR code handler
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr) {
            // Debounce QR generation
            const now = Date.now();
            if (counter.lastQr && now - counter.lastQr < 3000) {
                return;
            }
            counter.lastQr = now;
            logger.info({ tenant: session.tenant_id }, 'QR code gerado');
            const qrBase64 = await QRCode.toDataURL(qr, {
                errorCorrectionLevel: 'M',
                margin: 4,
                scale: 10,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF',
                },
            });
            await supabase
                .from('whatsapp_sessions')
                .update({
                status: 'qr_ready',
                qr_code: qrBase64,
                qr_expires_at: new Date(Date.now() + 120_000).toISOString(),
                last_error: null,
                updated_at: new Date().toISOString(),
            })
                .eq('id', session.id);
            await updateBrokerHealth(session, { status: 'qr_ready', last_event_at: new Date().toISOString() });
        }
        if (connection === 'close') {
            const closeCode = lastDisconnect?.error?.output?.statusCode || null;
            const closeMessage = lastDisconnect?.error?.message || 'Conexao fechada';
            const isLoggedOut = closeCode === DisconnectReason.loggedOut;
            const isBadSession = closeCode === DisconnectReason.badSession;
            // closeCode 440 = conflict/replaced — outra sessão substituiu esta (novo QR scan, outro dispositivo)
            const isConflict = closeCode === 440;
            logger.info({ tenant: session.tenant_id, closeCode, isLoggedOut, closeMessage }, 'Conexao fechada');
            // Conflict (440): limpa auth antiga e retorna ao estado disconnected aguardando novo QR
            // NÃO para de reconectar — apenas reseta para que o poll possa gerar novo QR
            if (isConflict) {
                isAuthInvalid = true;
                logger.info({ tenant: session.tenant_id, closeCode }, '[440] Conflict/replaced — limpando auth e aguardando novo QR');
                try {
                    await rm(authDir, { recursive: true, force: true });
                }
                catch { /* ignore */ }
                activeSockets.delete(sessionKey);
                stopProfilePicBackfill(sessionKey);
                startingSessions.delete(sessionKey);
                resetRetryCounter(sessionKey);
                await supabase.from('whatsapp_sessions').update({
                    status: 'disconnected', qr_code: null, qr_expires_at: null,
                    last_error: null, updated_at: new Date().toISOString(),
                }).eq('id', session.id);
                await updateBrokerHealth(session, { status: 'disconnected', last_event_at: new Date().toISOString() });
                return;
            }
            // Intentional disconnect (stopSession was called)
            if (!activeSockets.has(sessionKey)) {
                startingSessions.delete(sessionKey);
                resetRetryCounter(sessionKey);
                logger.info({ tenant: session.tenant_id, sessionKey }, 'Desconexao intencional. Nao reconectando.');
                return;
            }
            activeSockets.delete(sessionKey);
            stopProfilePicBackfill(sessionKey);
            startingSessions.delete(sessionKey);
            // Critical errors: stop
            if (closeCode === 405 || closeCode === DisconnectReason.multideviceMismatch) {
                const errorMsg = closeCode === 405
                    ? '[405] WhatsApp recusou o handshake.'
                    : '[multidevice] Sessao invalida.';
                await supabase.from('whatsapp_sessions').update({
                    status: 'error', qr_code: null, qr_expires_at: null,
                    last_error: errorMsg, updated_at: new Date().toISOString(),
                }).eq('id', session.id);
                await updateBrokerHealth(session, { status: 'error', last_error_at: new Date().toISOString(), last_error: errorMsg });
                resetRetryCounter(sessionKey);
                return;
            }
            // Logged out / bad session: update status and delete invalid auth files
            // FIX 2026-07-20: When isLoggedOut (401) or isBadSession occurs, Meta has revoked the keys.
            // We MUST delete authDir so Baileys can start fresh and request a new QR code.
            if (isLoggedOut || isBadSession) {
                isAuthInvalid = true;
                try {
                    await rm(authDir, { recursive: true, force: true });
                    logger.info({ tenant: session.tenant_id }, 'Credenciais invalidas removidas do authDir para permitir novo QR Code.');
                }
                catch { /* ignore */ }
                await supabase.from('whatsapp_sessions').update({
                    status: 'disconnected', qr_code: null, qr_expires_at: null,
                    last_error: isLoggedOut ? 'Desconectado (escaneie o QR Code novamente)' : 'Sessao invalida',
                    updated_at: new Date().toISOString(),
                }).eq('id', session.id);
                await updateBrokerHealth(session, {
                    status: 'disconnected',
                    last_error_at: new Date().toISOString(),
                    last_error: isLoggedOut ? 'Desconectado (escaneie o QR Code novamente)' : 'Sessao invalida',
                });
                resetRetryCounter(sessionKey);
                return;
            }
            // Everything else: let the central polling system handle the reconnection by updating the DB status to 'connecting'
            counter.count += 1;
            if (counter.count >= 10) {
                await supabase.from('whatsapp_sessions').update({
                    status: 'error', qr_code: null, qr_expires_at: null,
                    last_error: 'Maximo de tentativas excedido. Desconecte e conecte novamente.',
                    updated_at: new Date().toISOString(),
                }).eq('id', session.id);
                await updateBrokerHealth(session, {
                    status: 'error',
                    last_error_at: new Date().toISOString(),
                    last_error: 'Maximo de tentativas excedido. Desconecte e conecte novamente.',
                });
                resetRetryCounter(sessionKey);
                return;
            }
            logger.info({ tenant: session.tenant_id, retry: counter.count }, 'Atualizando status para connecting para o poll loop reconectar de forma limpa');
            // Registrar falha para backoff anti-rate-limit
            registerSessionFailure(sessionKey);
            await supabase.from('whatsapp_sessions').update({
                status: 'connecting',
                qr_code: null,
                qr_expires_at: null,
                last_error: closeCode ? `[${closeCode}] ${closeMessage}` : closeMessage,
                updated_at: new Date().toISOString(),
            }).eq('id', session.id);
            await updateBrokerHealth(session, {
                status: 'connecting',
                last_error_at: new Date().toISOString(),
                last_error: closeCode ? `[${closeCode}] ${closeMessage}` : closeMessage,
            });
        }
        if (connection === 'open') {
            logger.info({ tenant: session.tenant_id }, 'Conexao aberta');
            startingSessions.delete(sessionKey);
            connectionTimestamps.set(sessionKey, Date.now());
            const user = sock.user;
            resetRetryCounter(sessionKey);
            // Conexao ok: resetar backoff anti-rate-limit
            resetSessionBackoff(sessionKey);
            await supabase
                .from('whatsapp_sessions')
                .update({
                status: 'connected',
                qr_code: null,
                qr_expires_at: null,
                phone_number: user?.id?.split(':')[0] || null,
                last_error: null,
                last_connected_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
                .eq('id', session.id);
            await updateBrokerHealth({ ...session, phone_number: user?.id?.split(':')[0] || session.phone_number }, { status: 'connected', last_success_at: new Date().toISOString(), last_error: null });
            // Bulk sync de fotos DESATIVADO — saturava o socket Baileys com USync queries timeout
            // bloqueando recepcao de mensagens. Confiamos apenas em `contacts.upsert/update` events.
            void bulkSyncProfilePictures;
            startSafeProfilePicBackfill(sessionKey, sock, { ...session, phone_number: user?.id?.split(':')[0] || session.phone_number });
        }
    });
    let isAuthInvalid = false;
    // Save credentials
    sock.ev.on('creds.update', async () => {
        if (isAuthInvalid)
            return;
        await saveCreds();
    });
    // Capturar fotos de perfil via evento de contatos (Baileys emite imgUrl quando WhatsApp sincroniza)
    const handleContactsEvent = async (contacts) => {
        for (const c of contacts) {
            try {
                if (!c?.id || !c?.imgUrl || typeof c.imgUrl !== 'string')
                    continue;
                if (c.imgUrl === 'changed' || c.imgUrl.length < 10)
                    continue; // 'changed' = sinal de mudança, não URL
                // Buscar o profile_id correspondente
                const { data: contactRow } = await supabase
                    .from('whatsapp_contacts')
                    .select('profile_id')
                    .eq('tenant_id', session.tenant_id)
                    .or(`remote_jid.eq.${c.id},phone_number.eq.${normalizePhone(c.id)}`)
                    .maybeSingle();
                if (!contactRow?.profile_id)
                    continue;
                // Baixar e subir para Storage
                try {
                    const response = await fetch(c.imgUrl);
                    if (!response.ok)
                        continue;
                    const buf = Buffer.from(await response.arrayBuffer());
                    const fileKey = `whatsapp/${session.tenant_id}/${contactRow.profile_id}.jpg`;
                    const { error: uploadErr } = await supabase.storage
                        .from('avatars')
                        .upload(fileKey, buf, { contentType: 'image/jpeg', cacheControl: '3600', upsert: true });
                    if (uploadErr)
                        continue;
                    const { data: pub } = supabase.storage.from('avatars').getPublicUrl(fileKey);
                    const publicUrl = `${pub.publicUrl}?v=${Date.now()}`;
                    await supabase.from('whatsapp_contacts')
                        .update({
                        profile_pic_url: publicUrl,
                        profile_pic_status: 'synced',
                        profile_pic_last_success_at: new Date().toISOString(),
                        profile_pic_error: null,
                        updated_at: new Date().toISOString(),
                    })
                        .eq('tenant_id', session.tenant_id).eq('remote_jid', c.id);
                    await supabase.from('profiles').update({ avatar_url: publicUrl, updated_at: new Date().toISOString() }).eq('id', contactRow.profile_id);
                    logger.info({ jid: c.id, profileId: contactRow.profile_id }, 'Foto de perfil sincronizada via contacts.update');
                }
                catch (err) {
                    logger.debug({ jid: c.id, err: err?.message }, 'Erro ao processar foto via contacts.update');
                }
            }
            catch (err) {
                logger.debug({ err: err?.message }, 'Erro no handler contacts.update');
            }
        }
    };
    sock.ev.on('contacts.upsert', handleContactsEvent);
    sock.ev.on('contacts.update', handleContactsEvent);
    // Incoming and Outgoing messages handler (Syncs mobile app replies)
    logger.info({ sessionKey }, 'Registrando handler messages.upsert');
    sock.ev.on('messages.upsert', async (upsert) => {
        if (upsert.type !== 'notify') {
            logger.info({ type: upsert.type, count: upsert.messages?.length || 0, sessionKey }, 'messages.upsert tipo nao-notify recebido');
        }
        logger.info({ type: upsert.type, count: upsert.messages?.length || 0, sessionKey }, 'messages.upsert evento recebido');
        const connectedAt = connectionTimestamps.get(sessionKey) || 0;
        for (const msg of upsert.messages) {
            try {
                logger.info({ msgId: msg.key.id, jid: msg.key.remoteJid, fromMe: msg.key.fromMe, type: upsert.type, hasMessage: !!msg.message }, 'Processando mensagem');
                // Clonar a mensagem original intacta para uso no download de mídia
                const originalMsgClone = JSON.parse(JSON.stringify(msg));
                // Se msg.message estiver vazio, pode ser mensagem ainda nao descriptografada (ocorre em LIDs)
                if (!msg.message) {
                    logger.warn({ msgId: msg.key.id, jid: msg.key.remoteJid }, 'msg.message ausente — possivelmente nao descriptografada ainda');
                    continue;
                }
                // Desembrulhar mensagens protegidas/temporárias (ephemeral, viewOnce, document com legenda)
                if (msg.message) {
                    let message = msg.message;
                    if (message.ephemeralMessage) {
                        message = message.ephemeralMessage.message;
                    }
                    if (message.viewOnceMessage) {
                        message = message.viewOnceMessage.message;
                    }
                    if (message.viewOnceMessageV2) {
                        message = message.viewOnceMessageV2.message;
                    }
                    if (message.documentWithCaptionMessage) {
                        message = message.documentWithCaptionMessage.message;
                    }
                    if (message) {
                        msg.message = message;
                    }
                }
                const isFromMe = !!msg.key.fromMe;
                const msgTimestamp = msg.messageTimestamp;
                let msgTimestampSec = 0;
                if (typeof msgTimestamp === 'number') {
                    msgTimestampSec = msgTimestamp;
                }
                else if (msgTimestamp && typeof msgTimestamp === 'object' && 'toNumber' in msgTimestamp) {
                    msgTimestampSec = msgTimestamp.toNumber();
                }
                else if (msgTimestamp) {
                    msgTimestampSec = Number(msgTimestamp);
                }
                const msgTimestampMs = msgTimestampSec * 1000;
                // Apenas bloquear mensagens excessivamente antigas (mais de 24 horas atrás)
                // Removemos a trava do connectedAt porque ela causava descarte de mensagens recebidas durante as reconexões ou intermitências da rede.
                const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
                if (msgTimestampMs < twentyFourHoursAgo) {
                    logger.info({ jid: msg.key.remoteJid, msgId: msg.key.id, msgTime: msgTimestampMs }, 'Mensagem antiga (> 24h) ignorada');
                    continue;
                }
                const remoteJid = msg.key.remoteJid;
                logger.info({ msgId: msg.key.id, jid: remoteJid }, 'JID da mensagem');
                // Bloquear status, newsletters e broadcast lists.
                // Contatos (@s.whatsapp.net e @lid) e grupos (@g.us) devem passar.
                if (remoteJid.endsWith('@broadcast') ||
                    remoteJid.endsWith('@newsletter') ||
                    remoteJid === 'status@broadcast') {
                    logger.info({ jid: remoteJid }, 'Ignorando broadcast/newsletter/status');
                    continue;
                }
                const isGroup = remoteJid.endsWith('@g.us');
                // Só processamos JIDs reconhecidos como contatos pessoais ou grupos
                if (!remoteJid.endsWith('@s.whatsapp.net') && !remoteJid.endsWith('@lid') && !isGroup) {
                    logger.info({ jid: remoteJid }, 'Ignorando JID nao reconhecido');
                    continue;
                }
                const sessionPhone = session.phone_number ? normalizePhone(session.phone_number) : '';
                const remotePhone = normalizePhone(remoteJid);
                if (isFromMe && sessionPhone && remotePhone === sessionPhone) {
                    logger.info({ jid: remoteJid, msgId: msg.key.id, sessionPhone }, 'Ignorando eco fromMe do proprio numero conectado');
                    continue;
                }
                const whatsappMessageId = msg.key.id;
                const crmMessageType = getMessageType(msg);
                const crmMessageTableType = 'text';
                // Extract real phone if available from alternative JID fields (LID resolution)
                let realPhone = null;
                if (remoteJid.endsWith('@lid')) {
                    const keyAny = msg.key;
                    const msgAny = msg;
                    const altJid = keyAny?.remoteJidAlt || keyAny?.senderPn || msgAny?.senderPn || msg.participant || keyAny?.participant;
                    if (altJid && typeof altJid === 'string' && (altJid.endsWith('@s.whatsapp.net') || altJid.includes('@'))) {
                        realPhone = normalizePhone(altJid);
                    }
                    // Se os metadados estiverem vazios, tenta resolver a LID usando o repositório de sinais do socket ativo
                    if (!realPhone && sock) {
                        try {
                            const pnJid = await sock.signalRepository?.lidMapping?.getPNForLID(remoteJid);
                            if (pnJid) {
                                logger.info({ remoteJid, pnJid }, 'LID resolvida com sucesso para PN JID via socket');
                                realPhone = normalizePhone(pnJid);
                            }
                        }
                        catch (err) {
                            logger.debug({ err: err?.message, remoteJid }, 'Erro ao resolver LID via socket');
                        }
                    }
                }
                const canonicalJid = canonicalRemoteJid(remoteJid, realPhone);
                await updateBrokerHealth(session, { status: 'connected', last_event_at: new Date().toISOString() });
                const claim = await claimMessageProcessing({
                    session,
                    whatsappMessageId,
                    remoteJid,
                    canonicalJid,
                    isFromMe,
                    eventType: upsert.type,
                    messageType: crmMessageType,
                });
                if (!claim.claimed) {
                    logger.info({ msgId: whatsappMessageId, remoteJid }, 'Mensagem duplicada ignorada pelo processamento');
                    continue;
                }
                if (whatsappMessageId) {
                    const { count, error: existsError } = await supabase
                        .from('whatsapp_messages')
                        .select('id', { count: 'exact', head: true })
                        .eq('whatsapp_session_id', session.id)
                        .eq('whatsapp_message_id', whatsappMessageId);
                    if (existsError) {
                        logger.error({ err: existsError.message, msgId: whatsappMessageId }, 'Erro ao verificar duplicata, pulando mensagem');
                        continue;
                    }
                    if ((count || 0) > 0) {
                        logger.info({ msgId: whatsappMessageId }, 'Mensagem duplicada, pulando');
                        await finishMessageProcessing(claim.id, 'ignored', 'none', 'Mensagem ja existia em whatsapp_messages');
                        continue;
                    }
                }
                let crmContent = getMessageContent(msg);
                let mediaData = null;
                let mediaStatus = crmMessageType === 'text' || crmMessageType === 'location' ? 'none' : 'failed';
                if (crmMessageType !== 'text' && crmMessageType !== 'location') {
                    const activeSock = getActiveSocket(session.tenant_id, session.session_name);
                    if (activeSock) {
                        logger.info({ msgId: msg.key.id, type: crmMessageType }, 'Baixando midia...');
                        mediaData = await Promise.race([
                            downloadAndUploadMedia(activeSock, originalMsgClone, crmMessageType),
                            new Promise((_, reject) => setTimeout(() => reject(new Error('Media download timeout 20s')), 20_000)),
                        ]).catch((err) => {
                            logger.error({ err: err?.message, msgId: msg.key.id }, 'Timeout/Erro ao baixar midia, prosseguindo sem midia');
                            return null;
                        });
                        if (mediaData) {
                            mediaStatus = 'downloaded';
                            const label = crmMessageType === 'image' ? 'Imagem' :
                                crmMessageType === 'video' ? 'Video' :
                                    crmMessageType === 'audio' ? 'Audio' : 'Arquivo';
                            crmContent = `[${label}] ${mediaData.fileName}\n${mediaData.publicUrl}`;
                        }
                        else {
                            crmContent = `[Midia indisponivel] ${crmMessageType}`;
                        }
                    }
                }
                logger.info({ msgId: msg.key.id, remoteJid, pushName: msg.pushName, realPhone, isFromMe }, 'Buscando/criando conversa...');
                const { profileId, conversationId } = await findOrCreateWhatsappConversation(session, remoteJid, msg.pushName, realPhone, isFromMe, sock);
                logger.info({ msgId: msg.key.id, profileId, conversationId }, 'Conversa encontrada/criada');
                // Sincronização ativa desativada para evitar rate-limit e desconexão no WhatsApp.
                // Confiamos apenas no recebimento espontâneo via evento contacts.upsert/update.
                /*
                if (!isFromMe) {
                  enqueueSafeProfilePictureSync({
                    sock,
                    session,
                    profileId,
                    remoteJid,
                    phone: realPhone,
                  });
                }
                */
                const { error: waMsgErr } = await supabase.from('whatsapp_messages').insert({
                    tenant_id: session.tenant_id,
                    whatsapp_session_id: session.id,
                    conversation_id: conversationId,
                    remote_jid: remoteJid,
                    canonical_remote_jid: canonicalJid,
                    from_me: isFromMe,
                    message_type: crmMessageType,
                    content: crmContent || null,
                    media_url: mediaData?.publicUrl || null,
                    media_mime_type: mediaData?.mimeType || null,
                    media_file_name: mediaData?.fileName || null,
                    media_size: mediaData?.size || null,
                    whatsapp_message_id: whatsappMessageId,
                    source_event_type: upsert.type,
                    processing_status: 'processed',
                    media_status: mediaStatus,
                    status: 'delivered',
                    created_at: new Date(msgTimestampMs).toISOString(),
                });
                if (waMsgErr) {
                    logger.error({ err: waMsgErr.message, msgId: whatsappMessageId, remoteJid }, 'Erro ao inserir whatsapp_messages');
                    if (waMsgErr.code === '23505' || waMsgErr.message?.includes('duplicate key')) {
                        logger.info({ msgId: whatsappMessageId, conversationId }, 'Eco/duplicata do WhatsApp ja registrada; pulando insert em messages');
                        await finishMessageProcessing(claim.id, 'ignored', mediaStatus, 'Duplicada em whatsapp_messages');
                        continue;
                    }
                    await finishMessageProcessing(claim.id, 'failed', mediaStatus, waMsgErr.message);
                    await updateBrokerHealth(session, { status: 'connected', last_error_at: new Date().toISOString(), last_error: waMsgErr.message });
                    continue;
                }
                else {
                    logger.info({ msgId: whatsappMessageId, conversationId }, 'whatsapp_messages inserida com sucesso');
                }
                let agentId = session.user_id || null;
                if (isFromMe && !agentId) {
                    const { data: conv } = await supabase
                        .from('conversations')
                        .select('agent_id')
                        .eq('id', conversationId)
                        .maybeSingle();
                    if (conv?.agent_id) {
                        agentId = conv.agent_id;
                    }
                    else {
                        const { data: adminProf } = await supabase
                            .from('profiles')
                            .select('id')
                            .eq('tenant_id', session.tenant_id)
                            .in('role', ['admin', 'manager'])
                            .limit(1)
                            .maybeSingle();
                        agentId = adminProf?.id || null;
                    }
                }
                let senderProfileId = profileId; // default fallback (group profile)
                if (isGroup && !isFromMe) {
                    const participantJid = msg.participant || msg.key.participant;
                    if (participantJid) {
                        try {
                            // 1. Encontra ou cria o profile para o participante do grupo
                            const participantProfileId = await findOrCreateParticipantProfile(session, participantJid, msg.pushName);
                            senderProfileId = participantProfileId;
                            // 2. Garante que o participante está vinculado ao grupo na tabela group_participants
                            await ensureGroupParticipant(profileId, participantProfileId);
                            // 3. Adiciona ele como lead com a tag "Grupo do WhatsApp"
                            try {
                                const participantPhone = normalizePhone(participantJid);
                                const leadId = await ensureWhatsappLead({
                                    tenantId: session.tenant_id,
                                    phone: participantPhone,
                                    name: msg.pushName || `Cliente ${participantPhone.slice(-4)}`,
                                    profileId: participantProfileId,
                                    conversationId: conversationId,
                                    createdBy: session.user_id || null,
                                    tags: ['Grupo do WhatsApp']
                                });
                                if (leadId) {
                                    logger.info({ leadId, participantJid }, 'Lead garantido com tag de Grupo para o participante');
                                }
                            }
                            catch (leadErr) {
                                logger.error({ err: leadErr.message, participantJid }, 'Erro ao criar/atualizar lead para participante do grupo');
                            }
                        }
                        catch (err) {
                            logger.error({ err: err.message, participantJid }, 'Erro ao processar participante do grupo no messages.upsert');
                        }
                    }
                }
                const { error: msgErr } = await supabase.from('messages').insert({
                    conversation_id: conversationId,
                    sender_id: isFromMe ? (agentId || profileId) : senderProfileId,
                    receiver_id: isGroup ? null : (isFromMe ? profileId : (agentId || null)),
                    content: crmContent || '',
                    message_type: crmMessageTableType,
                    is_read: isFromMe ? true : false,
                    created_at: new Date(msgTimestampMs).toISOString(),
                });
                if (msgErr) {
                    logger.error({ err: msgErr.message, msgId: whatsappMessageId }, 'Erro ao inserir messages');
                    await finishMessageProcessing(claim.id, 'failed', mediaStatus, msgErr.message);
                    await updateBrokerHealth(session, { status: 'connected', last_error_at: new Date().toISOString(), last_error: msgErr.message });
                }
                else {
                    logger.info({ msgId: whatsappMessageId, conversationId }, 'messages inserida com sucesso');
                    await finishMessageProcessing(claim.id, 'processed', mediaStatus, null);
                    await updateBrokerHealth(session, { status: 'connected', last_success_at: new Date().toISOString(), last_error: null });
                }
                if (!isFromMe) {
                    // Se a mensagem vem do cliente
                    const { data: currentConv } = await supabase
                        .from('conversations')
                        .select('status, agent_id')
                        .eq('id', conversationId)
                        .maybeSingle();
                    // Se estiver sem atendente (agent_id IS NULL) ou se a conversa estiver fechada (status = 'closed')
                    // marcamos o status como 'waiting' (Em espera) para ir para "Não Lidas".
                    if (!currentConv || !currentConv.agent_id || currentConv.status === 'closed') {
                        await supabase
                            .from('conversations')
                            .update({
                            status: 'pending',
                            last_message_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        })
                            .eq('id', conversationId);
                    }
                    else {
                        // Se já tem atendente ativo, apenas atualizamos last_message_at
                        await supabase
                            .from('conversations')
                            .update({
                            last_message_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        })
                            .eq('id', conversationId);
                    }
                }
                else {
                    // Se for mensagem de saída (enviada pelo celular pessoal pareado ou pelo CRM)
                    await supabase
                        .from('conversations')
                        .update({
                        last_message_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    })
                        .eq('id', conversationId);
                }
                logger.info({ from: remoteJid, tenant: session.tenant_id, fromMe: isFromMe, msgId: msg.key.id }, 'Mensagem processada com sucesso');
            }
            catch (msgErr) {
                logger.error({ err: msgErr?.message, stack: msgErr?.stack, msgId: msg.key?.id, jid: msg.key?.remoteJid }, 'Erro ao processar mensagem individual');
            }
        }
    });
    // Log de decrypt retries para observabilidade
    sock.ev.on('messages.update', async (updates) => {
        for (const update of updates) {
            if (update.update?.message) {
                logger.info({ msgId: update.key.id, jid: update.key.remoteJid }, 'messages.update recebido (decrypt retry)');
            }
        }
    });
    // Observabilidade: chats.upsert indica que o WhatsApp está sincronizando conversas
    sock.ev.on('chats.upsert', async (chats) => {
        logger.info({ count: chats.length, sessionKey }, 'chats.upsert recebido');
    });
    // Observabilidade: presence indica que o socket está recebendo eventos do WhatsApp
    sock.ev.on('presence.update', async (update) => {
        logger.debug({ jid: update.id, presences: Object.keys(update.presences || {}), sessionKey }, 'presence.update');
    });
}
export async function stopSession(tenantId, sessionName, deleteAuth = false) {
    const sessionKey = `${tenantId}:${sessionName}`;
    startingSessions.delete(sessionKey);
    connectionTimestamps.delete(sessionKey);
    const sock = activeSockets.get(sessionKey);
    if (sock) {
        activeSockets.delete(sessionKey);
        try {
            sock.end(undefined);
        }
        catch { /* ignore */ }
    }
    if (deleteAuth) {
        const authDir = path.resolve(`./auth_info/${tenantId}/${sessionName}`);
        try {
            await rm(authDir, { recursive: true, force: true });
            logger.info({ tenant: tenantId, sessionName }, 'Credenciais de autenticação removidas com sucesso no stopSession');
        }
        catch (err) {
            logger.error({ err, tenant: tenantId, sessionName }, 'Erro ao remover credenciais no stopSession');
        }
    }
}
export async function sendMessage(tenantId, sessionName, phoneNumber, content) {
    const sessionKey = `${tenantId}:${sessionName}`;
    const sock = activeSockets.get(sessionKey);
    if (!sock) {
        throw new Error('Sessão não encontrada ou não conectada');
    }
    let jid = phoneNumber.includes('@') ? phoneNumber : `${phoneNumber}@s.whatsapp.net`;
    // Look up in database if there is a mapped remote_jid for this contact/phone_number to handle LIDs correctly
    if (!phoneNumber.includes('@')) {
        try {
            const cleanPhone = phoneNumber.replace(/\D/g, '');
            const { data: contact } = await supabase
                .from('whatsapp_contacts')
                .select('remote_jid, remote_jid_alt, phone_number')
                .eq('tenant_id', tenantId)
                .eq('phone_number', cleanPhone)
                .maybeSingle();
            if (contact?.remote_jid_alt?.endsWith('@s.whatsapp.net')) {
                jid = contact.remote_jid_alt;
                logger.info({ phoneNumber, resolvedJid: jid }, 'PN/JID alternativo resolvido do banco de dados para envio');
            }
            else if (contact?.remote_jid?.endsWith('@s.whatsapp.net')) {
                jid = contact.remote_jid;
                logger.info({ phoneNumber, resolvedJid: jid }, 'LID/JID resolvido do banco de dados para envio');
            }
            else if (contact?.phone_number) {
                jid = `${contact.phone_number.replace(/\D/g, '')}@s.whatsapp.net`;
                logger.info({ phoneNumber, resolvedJid: jid }, 'Telefone do contato usado como PN para envio');
            }
        }
        catch (err) {
            logger.error({ err, phoneNumber }, 'Erro ao resolver remote_jid no sendMessage');
        }
    }
    // Parse potential media messages sent from the CRM
    const lines = content.split('\n');
    const urlLine = lines.find(line => line.trim().startsWith('http://') || line.trim().startsWith('https://'))?.trim();
    if (urlLine) {
        if (content.startsWith('[Imagem]')) {
            logger.info({ jid, url: urlLine }, 'Enviando imagem nativa via WhatsApp...');
            return await sock.sendMessage(jid, { image: { url: urlLine } });
        }
        if (content.startsWith('[Video]')) {
            logger.info({ jid, url: urlLine }, 'Enviando vídeo nativo via WhatsApp...');
            return await sock.sendMessage(jid, { video: { url: urlLine } });
        }
        if (content.startsWith('[Audio]')) {
            logger.info({ jid, url: urlLine }, 'Enviando áudio nativo via WhatsApp...');
            return await sock.sendMessage(jid, { audio: { url: urlLine }, mimetype: 'audio/mp4', ptt: true });
        }
        if (content.startsWith('[Arquivo]')) {
            const fileName = content.replace(/\[Arquivo\]\s*/, '').split('\n')[0] || 'Arquivo';
            logger.info({ jid, url: urlLine, fileName }, 'Enviando documento nativo via WhatsApp...');
            return await sock.sendMessage(jid, { document: { url: urlLine }, fileName, mimetype: 'application/octet-stream' });
        }
    }
    const result = await sock.sendMessage(jid, { text: content });
    return result;
}
export function getActiveSocket(tenantId, sessionName) {
    return activeSockets.get(`${tenantId}:${sessionName}`);
}
//# sourceMappingURL=session-manager.js.map