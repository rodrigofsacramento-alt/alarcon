import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Faltam variáveis de ambiente no .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const filePath = 'C:/Users/Rafael_Livre/Downloads/Leads_Separados_Cores.md';
  const content = fs.readFileSync(filePath, 'utf8');
  
  const lines = content.split('\n');
  const phones: { raw: string, name: string, block: string }[] = [];
  
  let currentBlock = 'Sem Bloco';
  
  for (const line of lines) {
    if (line.startsWith('## Bloco')) {
      currentBlock = line.replace('##', '').trim();
    }
    
    // Formato esperado: - 554499642244 - Nome
    const match = line.match(/^-\s*(\+?55\s*)?(\d{10,13})\s*-\s*(.*)/);
    if (match) {
      // Normaliza removendo o + e espaços
      let phone = match[2].replace(/\D/g, '');
      if (phone.length <= 11) {
        phone = '55' + phone; // Garante o 55 no começo
      }
      phones.push({ raw: phone, name: match[3].trim(), block: currentBlock });
    } else {
      // Outro formato: - 595983679514 - +595 ...
      const fallback = line.match(/^-\s*(\d{10,15})/);
      if (fallback) {
         phones.push({ raw: fallback[1], name: line.split('-').slice(2).join('-').trim(), block: currentBlock });
      }
    }
  }

  console.log(`Extraídos ${phones.length} telefones do arquivo.`);
  
  // Pegar todos os telefones do Supabase para bater a lista localmente (mais rápido que 4000 queries)
  let allRegistered: string[] = [];
  let page = 0;
  const pageSize = 1000;
  
  while (true) {
    const { data, error } = await supabase
      .from('leads')
      .select('phone')
      .range(page * pageSize, (page + 1) * pageSize - 1);
      
    if (error) {
      console.error("Erro ao buscar leads:", error);
      break;
    }
    
    if (!data || data.length === 0) break;
    
    allRegistered.push(...data.map(d => d.phone).filter(Boolean));
    page++;
  }
  
  console.log(`Encontrados ${allRegistered.length} leads no Supabase.`);
  
  const registeredSet = new Set(allRegistered);
  const found: any[] = [];
  const missing: any[] = [];
  
  for (const p of phones) {
    if (registeredSet.has(p.raw)) {
      found.push(p);
    } else {
      // Tentar match sem o 55 caso o banco tenha salvo diferente
      const sem55 = p.raw.startsWith('55') ? p.raw.substring(2) : p.raw;
      if (registeredSet.has(sem55)) {
        found.push(p);
      } else {
        missing.push(p);
      }
    }
  }
  
  console.log(`✅ Já cadastrados: ${found.length}`);
  console.log(`❌ Não cadastrados: ${missing.length}`);
  
  // Salvar relatórios
  fs.writeFileSync('C:/Users/Rafael_Livre/Downloads/leads_cadastrados.json', JSON.stringify(found, null, 2));
  fs.writeFileSync('C:/Users/Rafael_Livre/Downloads/leads_faltantes.json', JSON.stringify(missing, null, 2));
  console.log("Relatórios salvos em Downloads/leads_cadastrados.json e leads_faltantes.json");
}

run().catch(console.error);
