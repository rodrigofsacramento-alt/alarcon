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
  password: 'SENHA_REDIGIDA_HERMES'
};

const localDir = path.resolve(__dirname, '../../01_FRONTEND_PRODUCAO_HOSTINGER');

const remotePaths = [
  'domains/ahut-ecosystem.apexfyhub.com.br/public_html',
  'domains/apexfyhub.com.br/public_html/ahut-ecosystem',
  'public_html/ahut-ecosystem'
];

async function runDeploy() {
  console.log('🚀 Iniciando deploy automático em todos os diretórios possíveis do AHUT ECOSYSTEM...');

  for (const remotePath of remotePaths) {
    console.log(`\n----------------------------------------`);
    console.log(`🌐 Atualizando destino: ${remotePath}`);

    // 1. Limpeza remota
    const conn1 = new Client();
    await new Promise((resolve) => {
      conn1.on('ready', () => {
        conn1.exec(`mkdir -p ${remotePath}/assets && rm -rf ${remotePath}/assets/* ${remotePath}/index.html ${remotePath}/.htaccess`, (err, stream) => {
          if (err) console.error(err);
          else stream.on('close', () => conn1.end() && resolve());
        });
      }).on('error', () => resolve()).connect(config);
    });

    // 2. Upload via SFTP
    const sftp = new sftpClient();
    try {
      await sftp.connect(config);
      if (!(await sftp.exists(remotePath))) {
        await sftp.mkdir(remotePath, true);
      }
      if (!(await sftp.exists(`${remotePath}/assets`))) {
        await sftp.mkdir(`${remotePath}/assets`, true);
      }
      await sftp.uploadDir(localDir, remotePath);
      console.log(`✅ Upload para ${remotePath} concluído!`);
      await sftp.end();
    } catch (err) {
      console.error(`❌ Erro no SFTP para ${remotePath}:`, err.message);
      try { await sftp.end(); } catch {}
    }
  }

  // 3. Limpeza de cache no LiteSpeed
  console.log('\n⚡ Disparando purge de cache LiteSpeed...');
  const conn2 = new Client();
  await new Promise((resolve) => {
    conn2.on('ready', () => {
      conn2.exec(`
        curl -i -H "X-LiteSpeed-Purge: *" https://ahut-ecosystem.apexfyhub.com.br/
        curl -i -H "X-LiteSpeed-Purge: *" https://ahut-ecosystem.apexfyhub.com.br/index.html
        curl -i -H "X-LiteSpeed-Purge: *" https://ahut-ecosystem.apexfyhub.com.br/atendimento
      `, (err, stream) => {
        if (err) console.error(err);
        else stream.on('close', () => conn2.end() && resolve());
      });
    }).on('error', () => resolve()).connect(config);
  });

  console.log('✨ DEPLOY MULTI-DESTINO CONCLUÍDO COM SUCESSO!');
}

runDeploy();
