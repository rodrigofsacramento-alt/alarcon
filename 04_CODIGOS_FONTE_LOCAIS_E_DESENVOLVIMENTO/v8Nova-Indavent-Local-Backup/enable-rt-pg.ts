import { Client } from 'pg';

const uri = 'postgresql://postgres:i0Lxy5Acllq4yg7f@db.ldfcqxeehgaftxsgxkag.supabase.co:5432/postgres';

async function run() {
  const client = new Client({ connectionString: uri });
  try {
    await client.connect();
    console.log("Conectado ao banco de dados!");

    // Adiciona tabelas à publicação realtime
    await client.query(`ALTER PUBLICATION supabase_realtime ADD TABLE whatsapp_contacts;`);
    console.log("Realtime ativado para whatsapp_contacts");

    await client.query(`ALTER PUBLICATION supabase_realtime ADD TABLE conversations;`);
    console.log("Realtime ativado para conversations");

    await client.query(`ALTER PUBLICATION supabase_realtime ADD TABLE messages;`);
    console.log("Realtime ativado para messages");
    
    // Configura a réplica para que eventos de UPDATE emitam a linha completa (FULL)
    await client.query(`ALTER TABLE whatsapp_contacts REPLICA IDENTITY FULL;`);
    console.log("REPLICA IDENTITY FULL ativada para whatsapp_contacts");

  } catch (err: any) {
    if (err.message.includes('already exists')) {
      console.log("Aviso: tabela já estava no realtime (", err.message, ")");
    } else {
      console.error("Erro SQL:", err);
    }
  } finally {
    await client.end();
  }
}

run();
