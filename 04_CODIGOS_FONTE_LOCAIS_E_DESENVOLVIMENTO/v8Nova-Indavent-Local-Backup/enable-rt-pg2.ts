import { Client } from 'pg';

const uri = 'postgresql://postgres:i0Lxy5Acllq4yg7f@db.ldfcqxeehgaftxsgxkag.supabase.co:5432/postgres';

async function run() {
  const client = new Client({ connectionString: uri });
  try {
    await client.connect();
    // Configura a réplica para que eventos de UPDATE emitam a linha completa (FULL)
    await client.query(`ALTER TABLE whatsapp_contacts REPLICA IDENTITY FULL;`);
    console.log("REPLICA IDENTITY FULL ativada para whatsapp_contacts");
    await client.query(`ALTER TABLE conversations REPLICA IDENTITY FULL;`);
    console.log("REPLICA IDENTITY FULL ativada para conversations");
  } catch (err: any) {
    console.error("Erro SQL:", err);
  } finally {
    await client.end();
  }
}

run();
