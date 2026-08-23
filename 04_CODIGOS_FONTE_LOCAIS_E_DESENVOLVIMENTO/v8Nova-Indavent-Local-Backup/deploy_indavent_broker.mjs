import { execSync } from 'child_process';
import Client from 'ssh2-sftp-client';
import { Client as SSHClient } from 'ssh2';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SSH_CONFIG = {
  host: '2.24.95.98',
  port: 22,
  username: 'root',
  password: 'SENHA_DEPLOY_REDIGIDA'
};

const LOCAL_BROKER_DIR = path.join(__dirname, 'whatsapp-broker');
const REMOTE_BROKER_DIR = '/var/www/indavent-whatsapp-broker';

async function deploy() {
  console.log('🚀 Iniciando deploy do WhatsApp Broker da Nova Indavent...');
  
  // 1. Compilação Local
  console.log('📦 Compilando TypeScript localmente...');
  execSync('npm run build', { stdio: 'inherit', cwd: LOCAL_BROKER_DIR });

  const sftp = new Client();
  try {
    // 2. Conexão SFTP para Envio de Arquivos
    console.log('🔌 Conectando via SFTP...');
    await sftp.connect(SSH_CONFIG);

    // Garantir que a pasta remota existe
    console.log(`Garantindo que a pasta remota existe: ${REMOTE_BROKER_DIR}`);
    if (!(await sftp.exists(REMOTE_BROKER_DIR))) {
      await sftp.mkdir(REMOTE_BROKER_DIR, true);
    }

    // Upload do diretório dist
    const localDist = path.join(LOCAL_BROKER_DIR, 'dist');
    const remoteDist = `${REMOTE_BROKER_DIR}/dist`;
    console.log(`📤 Enviando dist de ${localDist} para ${remoteDist}...`);
    if (await sftp.exists(remoteDist)) {
      await sftp.rmdir(remoteDist, true);
    }
    await sftp.uploadDir(localDist, remoteDist);

    // Upload dos arquivos de configuração/dependência
    const filesToUpload = ['package.json', 'package-lock.json', '.env'];
    for (const file of filesToUpload) {
      const localFile = path.join(LOCAL_BROKER_DIR, file);
      const remoteFile = `${REMOTE_BROKER_DIR}/${file}`;
      if (fs.existsSync(localFile)) {
        console.log(`📤 Enviando arquivo ${file}...`);
        await sftp.put(localFile, remoteFile);
      }
    }

    console.log('✅ Arquivos enviados com sucesso! Fechando canal SFTP...');
    await sftp.end();

    // 3. Execução SSH para Instalação e Inicialização PM2
    console.log('🔌 Conectando via SSH para iniciar o serviço...');
    const conn = new SSHClient();
    conn.on('ready', () => {
      console.log('SSH Conectado.');
      
      const cmds = [
        `cd ${REMOTE_BROKER_DIR}`,
        `npm install --production`,
        `pm2 delete indavent-whatsapp-broker 2>/dev/null || true`,
        `pm2 start dist/index.js --name "indavent-whatsapp-broker" --cwd "${REMOTE_BROKER_DIR}"`,
        `pm2 save`,
        `pm2 status`
      ].join(' && ');

      conn.exec(cmds, (err, stream) => {
        if (err) throw err;
        stream.on('data', (data) => {
          process.stdout.write(data.toString());
        });
        stream.stderr.on('data', (data) => {
          process.stderr.write(data.toString());
        });
        stream.on('close', () => {
          console.log('\n🎉 DEPLOY DO BROKER CONCLUÍDO COM SUCESSO!');
          conn.end();
        });
      });
    }).connect(SSH_CONFIG);

  } catch (err) {
    console.error('❌ Erro no deploy:', err);
    try { await sftp.end(); } catch {}
  }
}

deploy();
