import { Client } from 'ssh2';
import sftpClient from 'ssh2-sftp-client';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceBackupDir = path.resolve(__dirname, '../../02_BACKEND_E_SERVICOS_VPS/crm-imobiliaria');
const prodHostingerDir = path.resolve(__dirname, '../../01_FRONTEND_PRODUCAO_HOSTINGER');
const zipOutputPath = path.resolve(__dirname, '../../restore-previous.zip');

const hostingerConfig = {
  host: '82.25.73.206',
  port: 65002,
  username: 'u817195350',
  password: 'SENHA_REDIGIDA_HERMES'
};

const vpsConfig = {
  host: '2.24.95.98',
  port: 22,
  username: 'root',
  password: 'SENHA_REDIGIDA_HERMES'
};

const hostingerTargets = [
  'domains/apexfyhub.com.br/public_html/ahut',
  'public_html/ahut',
  'domains/ahut-ecosystem.apexfyhub.com.br/public_html',
  'domains/apexfyhub.com.br/public_html/ahut-ecosystem',
  'public_html/ahut-ecosystem'
];

async function restorePreviousVersion() {
  console.log('🔄 RESTAURANDO A VERSÃO ANTERIOR DA PÁGINA DE PRODUÇÃO...');

  // 1. Copiar backup da versão anterior para 01_FRONTEND_PRODUCAO_HOSTINGER
  console.log(`📁 Copiando versão de backup de ${sourceBackupDir} para ${prodHostingerDir}...`);
  execSync(`rm -rf "${prodHostingerDir}/*" && cp -R "${sourceBackupDir}/"* "${prodHostingerDir}/"`);
  console.log('✅ Arquivos locais atualizados com o backup anterior.');

  // 2. Gerar ZIP do backup
  console.log('📦 Gerando pacote ZIP do backup...');
  execSync(`cd "${prodHostingerDir}" && zip -r "${zipOutputPath}" .`);
  console.log('✅ ZIP restore-previous.zip gerado com sucesso.');

  // 3. Deploy Hostinger
  console.log('\n🚀 Restaurando no servidor Hostinger (82.25.73.206)...');
  const sftpHostinger = new sftpClient();
  try {
    await sftpHostinger.connect(hostingerConfig);
    console.log('📤 Enviando restore-previous.zip para Hostinger...');
    await sftpHostinger.put(zipOutputPath, 'restore-previous.zip');
    await sftpHostinger.end();
    console.log('✅ ZIP enviado para Hostinger.');
  } catch (err) {
    console.error('❌ Erro no SFTP Hostinger:', err.message);
  }

  const connHostinger = new Client();
  await new Promise(resolve => {
    connHostinger.on('ready', () => {
      console.log('⚡ Extraindo versão anterior em todos os diretórios do Hostinger...');
      const cmds = hostingerTargets.map(t => `
        mkdir -p ${t}
        rm -rf ${t}/assets/* ${t}/index.html ${t}/.htaccess
        unzip -o restore-previous.zip -d ${t}/
      `).join('\n') + `
        rm restore-previous.zip
        curl -i -H "X-LiteSpeed-Purge: *" https://ahut-ecosystem.apexfyhub.com.br/
      `;

      connHostinger.exec(cmds, (err, stream) => {
        if (err) console.error(err);
        else stream.on('close', () => {
          console.log('✅ Versão anterior restaurada no Hostinger.');
          connHostinger.end();
          resolve();
        }).on('data', d => process.stdout.write(d));
      });
    }).on('error', resolve).connect(hostingerConfig);
  });

  // 4. Deploy VPS
  console.log('\n🚀 Restaurando no servidor VPS (2.24.95.98)...');
  const sftpVPS = new sftpClient();
  try {
    await sftpVPS.connect(vpsConfig);
    console.log('📤 Enviando restore-previous.zip para VPS...');
    await sftpVPS.put(zipOutputPath, '/tmp/restore-previous.zip');
    await sftpVPS.end();
    console.log('✅ ZIP enviado para VPS.');
  } catch (err) {
    console.error('❌ Erro no SFTP VPS:', err.message);
  }

  const connVPS = new Client();
  await new Promise(resolve => {
    connVPS.on('ready', () => {
      console.log('⚡ Extraindo versão anterior no VPS /var/www/html...');
      const cmds = `
        mkdir -p /var/www/html/assets
        rm -rf /var/www/html/assets/* /var/www/html/index.html /var/www/html/.htaccess
        unzip -o /tmp/restore-previous.zip -d /var/www/html/
        rm /tmp/restore-previous.zip
        systemctl reload nginx
      `;

      connVPS.exec(cmds, (err, stream) => {
        if (err) console.error(err);
        else stream.on('close', () => {
          console.log('✅ Versão anterior restaurada no VPS.');
          connVPS.end();
          resolve();
        }).on('data', d => process.stdout.write(d));
      });
    }).on('error', resolve).connect(vpsConfig);
  });

  console.log('\n🎉 RESTAURAÇÃO DA VERSÃO ANTERIOR CONCLUÍDA COM SUCESSO!');
}

restorePreviousVersion();
