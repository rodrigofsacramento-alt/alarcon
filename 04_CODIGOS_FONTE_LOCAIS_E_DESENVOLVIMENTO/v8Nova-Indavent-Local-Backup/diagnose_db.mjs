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
  console.log(`🔍 Conectando no Supabase URL: ${supabaseUrl}`);
  
  // 1. Verificar se a tabela orcamentos existe e qual o schema/colunas
  console.log('\n--- VERIFICANDO COLUNAS DA TABELA "orcamentos" ---');
  const { data: cols, error: colsErr } = await supabase
    .rpc('get_table_columns_info', {}, { head: false }); // Tenta usar um helper se existir, ou via query direta

  // Como RPC pode não existir, fazemos uma query direta nas tabelas do postgres
  const { data: tableCheck, error: checkErr } = await supabase
    .from('orcamentos')
    .select('*')
    .limit(1);

  if (checkErr) {
    console.error('Erro ao ler a tabela orcamentos:', checkErr);
  } else {
    console.log('✅ Conexão com a tabela "orcamentos" com sucesso!');
    if (tableCheck && tableCheck.length > 0) {
      console.log('Colunas detectadas no primeiro registro:', Object.keys(tableCheck[0]));
    } else {
      console.log('Tabela está vazia ou nenhum registro foi retornado.');
      
      // Tentar rodar uma query SQL no information_schema usando o cliente RPC (se configurado)
      // Caso contrário, faremos um SELECT de teste de uma coluna específica para ver se ela existe
      const { error: testColErr } = await supabase
        .from('orcamentos')
        .select('codigo')
        .limit(1);
      
      if (testColErr) {
        console.log('❌ Teste de busca da coluna "codigo" FALHOU:', testColErr.message);
      } else {
        console.log('✅ Teste de busca da coluna "codigo" funcionou! A coluna EXISTE no banco de dados.');
      }
    }
  }

  // 2. Verificar tabelas correspondentes a "orcamentos" via consulta de esquema
  console.log('\n--- DIAGNÓSTICO CONCLUÍDO ---');
}

run();
