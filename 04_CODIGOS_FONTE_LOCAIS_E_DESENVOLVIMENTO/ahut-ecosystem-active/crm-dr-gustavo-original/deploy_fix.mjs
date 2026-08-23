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

const localDir = path.resolve(__dirname, '../../01_FRONTEND_PRODUCAO_HOSTINGER');
const remotePath = 'domains/ahut-ecosystem.apexfyhub.com.br/public_html';

async function runDeploy() {
  const sftp = new sftpClient();
  try {
    await sftp.connect(config);
    console.log("Uploading to " + remotePath);
    await sftp.uploadDir(localDir, remotePath);
    console.log("Uploaded successfully!");
    await sftp.end();
  } catch(e) {
    console.log(e);
  }
}
runDeploy();
