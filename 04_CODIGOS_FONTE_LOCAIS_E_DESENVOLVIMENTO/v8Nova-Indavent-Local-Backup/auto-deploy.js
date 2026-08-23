const Client = require('ssh2-sftp-client');
const { Client: SSHClient } = require('ssh2');
const fs = require('fs');

const config = {
  host: '82.25.73.206',
  port: 65002,
  username: 'u817195350',
  password: 'Dir@124!'
};

const remoteDir = '/home/u817195350';
const localFile = 'deploy.zip';
const remoteFile = `${remoteDir}/deploy.zip`;

async function deploy() {
  const sftp = new Client();
  try {
    console.log('🔗 Conectando via SFTP para envio...');
    await sftp.connect(config);
    
    if (fs.existsSync(localFile)) {
      console.log('⬆️ Enviando deploy.zip...');
      await sftp.put(localFile, remoteFile);
      console.log('✅ Arquivo enviado com sucesso!');
    } else {
      console.log('❌ Arquivo deploy.zip não encontrado localmente!');
      return;
    }
    await sftp.end();

    // Executar descompactação via SSH
    console.log('🔄 Descompactando no servidor via SSH...');
    const conn = new SSHClient();
    conn.on('ready', () => {
      conn.exec(`cd ${remoteDir} && unzip -o deploy.zip && rm deploy.zip`, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
          console.log('🎉 Deploy Concluído com Sucesso e Descompactado no Servidor!');
          conn.end();
        }).on('data', (data) => {
          console.log('STDOUT: ' + data);
        }).stderr.on('data', (data) => {
          console.log('STDERR: ' + data);
        });
      });
    }).connect(config);
    
  } catch (err) {
    console.error('❌ Erro no deploy:', err);
  }
}

deploy();
