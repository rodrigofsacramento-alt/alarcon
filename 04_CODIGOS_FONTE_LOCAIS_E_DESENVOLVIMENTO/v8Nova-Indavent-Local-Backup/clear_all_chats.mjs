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
  console.log('🗑️ Iniciando limpeza TOTAL do histórico de conversas do Supabase...');

  try {
    // 1. Deletar mensagens do whatsapp (whatsapp_messages)
    console.log('Limpando tabela whatsapp_messages...');
    const { count: countWppMsg, error: errWppMsg } = await supabase
      .from('whatsapp_messages')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Deleta tudo de forma segura
    if (errWppMsg) console.error('Erro ao limpar whatsapp_messages:', errWppMsg);

    // 2. Deletar mensagens do CRM (messages)
    console.log('Limpando tabela messages...');
    const { error: errMsg } = await supabase
      .from('messages')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (errMsg) console.error('Erro ao limpar messages:', errMsg);

    // 3. Deletar participantes de grupos (group_participants)
    console.log('Limpando tabela group_participants...');
    const { error: errGrp } = await supabase
      .from('group_participants')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (errGrp) console.error('Erro ao limpar group_participants:', errGrp);

    // 4. Deletar contatos do WhatsApp (whatsapp_contacts)
    console.log('Limpando tabela whatsapp_contacts...');
    const { error: errContact } = await supabase
      .from('whatsapp_contacts')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (errContact) console.error('Erro ao limpar whatsapp_contacts:', errContact);

    // 5. Deletar conversas (conversations)
    console.log('Limpando tabela conversations...');
    const { error: errConv } = await supabase
      .from('conversations')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (errConv) console.error('Erro ao limpar conversations:', errConv);

    console.log('\n🎉 TODAS AS CONVERSAS E HISTÓRICOS FORAM APAGADOS DO BANCO DE DADOS COM SUCESSO!');
  } catch (err) {
    console.error('Ocorreu um erro inesperado durante a limpeza:', err);
  }
}

run();
