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

const zipPath = path.resolve(__dirname, '../../ahut-ecosystem-working.zip');

const targets = [
  'domains/ahut-ecosystem.apexfyhub.com.br/public_html',
  'domains/apexfyhub.com.br/public_html/ahut-ecosystem',
  'public_html/ahut-ecosystem',
  'domains/apexfyhub.com.br/public_html/ahut',
  'public_html/ahut'
];

async function restore() {
  console.log('🔄 Restaurando código DE PRODUÇÃO (Estate.ia) com a CORREÇÃO DA TELA BRANCA...');
  
  const sftp = new sftpClient();
  try {
    await sftp.connect(config);
    console.log('📤 Enviando ahut-ecosystem-working.zip para a VPS...');
    await sftp.put(zipPath, 'ahut-ecosystem-working.zip');
    console.log('✅ ZIP enviado.');
    await sftp.end();
  } catch (err) {
    console.error('❌ Erro SFTP:', err);
    return;
  }

  const conn = new Client();
  conn.on('ready', () => {
    console.log('⚡ Extraindo e limpando cache LiteSpeed...');
    const cmds = targets.map(t => `
      mkdir -p ${t}
      rm -rf ${t}/assets/* ${t}/index.html ${t}/.htaccess
      unzip -o ahut-ecosystem-working.zip -d ${t}/
    `).join('\n') + `
      rm ahut-ecosystem-working.zip
      curl -i -H "X-LiteSpeed-Purge: *" https://ahut-ecosystem.apexfyhub.com.br/
    `;

    conn.exec(cmds, (err, stream) => stream.on('close', () => {
      console.log('🎉 RESTAURAÇÃO DE PRODUÇÃO CONCLUÍDA!');
      conn.end();
    }).on('data', d => process.stdout.write(d))).on('error', e => console.error(e));
  }).connect(config);
}

restore();
