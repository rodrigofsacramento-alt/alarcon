import { Client } from 'ssh2';
import sftpClient from 'ssh2-sftp-client';

const config = {
  host: '82.25.73.206',
  port: 65002,
  username: 'u817195350',
  password: 'SENHA_DEPLOY_REDIGIDA'
};

async function test() {
  const sftp = new sftpClient();
  try {
    await sftp.connect(config);
    try {
      const list = await sftp.list('domains/ahut-ecosystem.apexfyhub.com.br/public_html');
      console.log("ROOT:", list.map(i => i.name));
    } catch(e) {}
    try {
      const techList = await sftp.list('domains/ahut-ecosystem.apexfyhub.com.br/public_html/tecnologia');
      console.log("TECNOLOGIA:", techList.map(i => i.name));
    } catch(e) {
      console.log("TECNOLOGIA folder not found!");
    }
    await sftp.end();
  } catch(e) {
    console.log(e);
  }
}
test();
