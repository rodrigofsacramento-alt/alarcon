import { Client } from 'ssh2';
import sftpClient from 'ssh2-sftp-client';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = {
  host: '2.24.95.98',
  port: 22,
  username: 'root',
  password: 'SENHA_REDIGIDA_HERMES'
};

const zipPath = path.resolve(__dirname, '../../ahut-ecosystem-dist.zip');
const remoteTarget = '/var/www/html';

async function deployVPS() {
  console.log('🚀 Iniciando deploy no VPS 2.24.95.98...');

  const sftp = new sftpClient();
  try {
    await sftp.connect(config);
    console.log('📤 Enviando ahut-ecosystem-dist.zip para VPS...');
    await sftp.put(zipPath, '/tmp/ahut-ecosystem-dist.zip');
    console.log('✅ ZIP enviado para VPS.');
    await sftp.end();
  } catch (err) {
    console.error('❌ Erro SFTP VPS:', err);
    return;
  }

  const conn = new Client();
  conn.on('ready', () => {
    console.log('⚡ Extraindo arquivos no VPS /var/www/html...');
    const cmds = `
      mkdir -p ${remoteTarget}/assets
      rm -rf ${remoteTarget}/assets/* ${remoteTarget}/index.html ${remoteTarget}/.htaccess
      unzip -o /tmp/ahut-ecosystem-dist.zip -d ${remoteTarget}/
      rm /tmp/ahut-ecosystem-dist.zip
      systemctl reload nginx
    `;

    conn.exec(cmds, (err, stream) => {
      if (err) throw err;
      stream.on('close', () => {
        console.log('🎉 VPS DEPLOY E RECARREGAMENTO NGINX FINALIZADOS!');
        conn.end();
      }).on('data', d => process.stdout.write(d));
    });
  }).connect(config);
}

deployVPS();
