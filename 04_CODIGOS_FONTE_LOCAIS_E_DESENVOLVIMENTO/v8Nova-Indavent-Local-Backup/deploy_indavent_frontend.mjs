import { Client } from 'ssh2';
import sftpClient from 'ssh2-sftp-client';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = {
  host: '82.25.73.206',
  port: 65002,
  username: 'u817195350',
  password: 'SENHA_DEPLOY_REDIGIDA'
};

const localOut = path.join(__dirname, 'out');
const remotePath = 'domains/appnovaindavent.apexfyhub.com.br/public_html';

const conn = new Client();
conn.on('ready', () => {
  console.log('🔌 Conectado via SSH para limpeza da pasta remota...');
  
  // Limpar a pasta remota primeiro para evitar arquivos fantasmas/antigos
  conn.exec(`rm -rf ${remotePath}/*`, async (err, stream) => {
    if (err) throw err;
    
    stream.on('close', async () => {
      console.log('🧹 Pasta remota limpa com sucesso!');
      conn.end();
      
      // Iniciar upload via SFTP
      const sftp = new sftpClient();
      try {
        console.log('🔌 Conectando via SFTP...');
        await sftp.connect(config);
        
        console.log(`📤 Enviando novos arquivos estáticos de ${localOut} para ${remotePath}...`);
        await sftp.uploadDir(localOut, remotePath);
        console.log('✅ Upload concluído com sucesso!');
        
        // Limpar cache LiteSpeed
        console.log('⚡ Limpando cache LiteSpeed...');
        const conn2 = new Client();
        conn2.on('ready', () => {
          conn2.exec(`
            curl -i -H "X-LiteSpeed-Purge: *" https://appnovaindavent.apexfyhub.com.br/
            curl -i -H "X-LiteSpeed-Purge: *" https://appnovaindavent.apexfyhub.com.br/index.html
            curl -i -H "X-LiteSpeed-Purge: *" https://appnovaindavent.apexfyhub.com.br/comercial/whatsapp/
            curl -i -H "X-LiteSpeed-Purge: *" https://appnovaindavent.apexfyhub.com.br/comercial/whatsapp/index.html
            curl -i -H "X-LiteSpeed-Purge: *" https://appnovaindavent.apexfyhub.com.br/whatsapp/
            curl -i -H "X-LiteSpeed-Purge: *" https://appnovaindavent.apexfyhub.com.br/whatsapp/index.html
            curl -i -X PURGE https://appnovaindavent.apexfyhub.com.br/
            curl -i -X PURGE https://appnovaindavent.apexfyhub.com.br/index.html
            curl -i -X PURGE https://appnovaindavent.apexfyhub.com.br/comercial/whatsapp/
            curl -i -X PURGE https://appnovaindavent.apexfyhub.com.br/comercial/whatsapp/index.html
            curl -i -X PURGE https://appnovaindavent.apexfyhub.com.br/whatsapp/
            curl -i -X PURGE https://appnovaindavent.apexfyhub.com.br/whatsapp/index.html
          `, (err2, stream2) => {
            if (err2) throw err2;
            stream2.on('close', () => {
              console.log('🎉 Deploy e limpeza de cache LiteSpeed concluídos com sucesso!');
              conn2.end();
            }).on('data', (d) => process.stdout.write(d));
          });
        }).connect(config);
        
      } catch (uploadErr) {
        console.error('❌ Erro no upload:', uploadErr);
        sftp.end();
      }
    }).on('data', (d) => process.stdout.write(d));
  });
}).connect(config);
