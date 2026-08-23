import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar variáveis de ambiente do .env.local
dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configurados no .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

async function run() {
  console.log('🔍 Buscando registros de "Chris Rcanelli" no Supabase...');

  // 1. Buscar em whatsapp_contacts
  const { data: contacts, error: contactsErr } = await supabase
    .from('whatsapp_contacts')
    .select('id, name, phone_number, conversation_id')
    .ilike('name', '%Chris%');

  if (contactsErr) {
    console.error('Erro ao buscar whatsapp_contacts:', contactsErr);
  }

  // 2. Buscar em profiles (se existirem leads/perfis)
  const { data: profiles, error: profilesErr } = await supabase
    .from('profiles')
    .select('id, full_name, phone')
    .ilike('full_name', '%Chris%');

  if (profilesErr) {
    console.error('Erro ao buscar profiles:', profilesErr);
  }

  console.log('\n--- RESULTADOS DA BUSCA ---');
  console.log('whatsapp_contacts encontrados:', contacts);
  console.log('profiles encontrados:', profiles);

  // Coletar IDs de conversas e contatos para exclusão
  const contactIds = contacts?.map(c => c.id) || [];
  const conversationIds = contacts?.map(c => c.conversation_id).filter(Boolean) || [];
  const profileIds = profiles?.map(p => p.id) || [];

  if (contactIds.length === 0 && profileIds.length === 0) {
    console.log('\n⚠️ Nenhum registro encontrado para o nome "Chris". Nenhuma exclusão necessária.');
    return;
  }

  console.log('\n🗑️ Iniciando exclusão do histórico...');

  // Deletar mensagens do whatsapp associadas a essas conversas ou JIDs
  if (conversationIds.length > 0) {
    const { error: msgErr } = await supabase
      .from('whatsapp_messages')
      .delete()
      .in('conversation_id', conversationIds);
    if (msgErr) console.error('Erro deletando whatsapp_messages por conversation_id:', msgErr);
    else console.log(`✅ whatsapp_messages deletadas para as conversas:`, conversationIds);

    const { error: messagesErr } = await supabase
      .from('messages')
      .delete()
      .in('conversation_id', conversationIds);
    if (messagesErr) console.error('Erro deletando messages por conversation_id:', messagesErr);
    else console.log(`✅ messages deletadas para as conversas:`, conversationIds);
  }

  // Deletar mensagens associadas aos perfis como sender/receiver
  if (profileIds.length > 0) {
    const { error: senderMsgErr } = await supabase
      .from('messages')
      .delete()
      .in('sender_id', profileIds);
    if (senderMsgErr) console.error('Erro deletando messages por sender_id:', senderMsgErr);

    const { error: receiverMsgErr } = await supabase
      .from('messages')
      .delete()
      .in('receiver_id', profileIds);
    if (receiverMsgErr) console.error('Erro deletando messages por receiver_id:', receiverMsgErr);

    console.log(`✅ messages deletadas para os profiles:`, profileIds);
  }

  // Deletar conversas
  if (conversationIds.length > 0) {
    const { error: convErr } = await supabase
      .from('conversations')
      .delete()
      .in('id', conversationIds);
    if (convErr) console.error('Erro deletando conversas:', convErr);
    else console.log(`✅ Conversas deletadas:`, conversationIds);
  }

  // Deletar contatos do whatsapp
  if (contactIds.length > 0) {
    const { error: wppContactErr } = await supabase
      .from('whatsapp_contacts')
      .delete()
      .in('id', contactIds);
    if (wppContactErr) console.error('Erro deletando whatsapp_contacts:', wppContactErr);
    else console.log(`✅ Contatos whatsapp deletados:`, contactIds);
  }

  // Deletar perfis
  if (profileIds.length > 0) {
    const { error: profileDeleteErr } = await supabase
      .from('profiles')
      .delete()
      .in('id', profileIds);
    if (profileDeleteErr) console.error('Erro deletando profiles:', profileDeleteErr);
    else console.log(`✅ Perfis deletados:`, profileIds);
  }

  console.log('\n🎉 Toda a história de conversas e registros com Chris Rcanelli foi limpa com sucesso!');
}

run();
