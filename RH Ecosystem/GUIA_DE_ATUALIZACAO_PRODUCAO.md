# GUIA DE ATUALIZAÇÃO EM PRODUÇÃO — PLATAFORMA RH (AHUT ECOSYSTEM)

## 📌 1. Regra de Ouro e Diretrizes Gerais
Este documento define o **Procedimento Operacional Padrão (SOP)** para publicar atualizações no aplicativo **RH Ecosystem** em ambiente de **Produção**.

> [!IMPORTANT]
> **REGRA DE OURO DE DEPLOY**: Nenhuma atualização deve ser enviada para a VPS/Hostinger sem realizar um **backup preventivo do bundle funcional anterior**, validar o contrato de API (`/rh-api`) e verificar a compatibilidade do schema das **349 perguntas** no Supabase.

---

## 🌐 2. Arquitetura da Infraestrutura de Produção

* **Domínio Oficial do Sistema**: `https://ahut-ecosystem.apexfyhub.com.br/rh/`
* **Domínio Oficial da API Backend**: `https://ahut-ecosystem.apexfyhub.com.br/rh-api`
* **Hospedagem Frontend**: Hostinger / Apache (`public_html/ahut/recourses-apex`) ou Nginx (`/var/www/crm-imobiliaria/dist`)
* **Gerenciador de Processos Backend**: PM2 em Linux VPS (`pm2 status`, serviço `rh-api` ou `api.rh_backend`)
* **Configuração Nginx (Reverse Proxy)**: `/etc/nginx/sites-available/default`
* **Banco de Dados Cloud**: Supabase Production (`https://ywxlmxjpearnowdlwtpj.supabase.co`)

---

## 🛠️ 3. Passo a Passo para Atualização do Frontend (React / Vite)

### Etapa 1: Validação do Código Local e Endpoints
Antes de compilar, garanta que os arquivos de configuração apontem para as rotas de produção:
1. No arquivo `src/services/api.ts`, confirme que a `API_BASE_URL` utiliza o caminho relativo de produção:
   ```typescript
   export const API_BASE_URL = '/rh-api';
   ```
2. No arquivo `src/App.tsx`, certifique-se de que todas as rotas da SPA estão declaradas:
   * `/rh/` (Home / PIN)
   * `/rh/teste` (Identificação)
   * `/rh/avaliacao/:id` e `/rh/assessment` (Tela de perguntas)
   * `/rh/avaliacoes` (Dashboard Triagem)

### Etapa 2: Compilação do Bundle (`dist`)
No diretório do frontend (`ahut-rh_frontend/frontend` ou projeto raiz do React):
```bash
npm run build
```
*Verifique se a pasta `dist/` foi gerada sem erros de sintaxe ou TypeScript.*

### Etapa 3: Backup Preventivo na Hospedagem (Hostinger/VPS)
Antes de enviar os novos arquivos, faça um backup do `dist` atual via SSH ou script automatizado:
```bash
# Exemplo de comando no servidor
cp -r /var/www/crm-imobiliaria/dist /var/www/crm-imobiliaria/dist_backup_$(date +%Y%m%d_%H%M%S)
```

### Etapa 4: Upload e Substituição dos Arquivos Estáticos
Transfira o conteúdo compilado da pasta `dist/` local para a pasta remota de produção.
* **Arquivos essenciais no servidor**:
  * `index.html`
  * `assets/` (arquivos `.js` e `.css` com sufixos hash)
  * `.htaccess` (Essencial para redirecionamento SPA do Apache/Hostinger)

> [!NOTE]
> **Conteúdo Obrigatório do `.htaccess` no Servidor Frontend**:
> ```apache
> <IfModule mod_rewrite.c>
>   RewriteEngine On
>   RewriteBase /rh/
>   RewriteRule ^index\.html$ - [L]
>   RewriteCond %{REQUEST_FILENAME} !-f
>   RewriteCond %{REQUEST_FILENAME} !-d
>   RewriteRule . /rh/index.html [L]
> </IfModule>
> ```

### Etapa 5: Invalidação de Cache
* Renomeie os arquivos estáticos se necessário ou adicione parâmetro de versão no `index.html` para forçar os navegadores dos usuários a baixar o novo bundle sem ler do cache antigo.

---

## 🐍 4. Passo a Passo para Atualização do Backend (FastAPI / Python)

### Etapa 1: Atualização dos Arquivos do Backend
Suba as alterações da pasta `api.rh_backend/` (rotas em `routes/`, serviços em `services/` e modelos em `models/`) para o diretório de produção na VPS (ex: `/opt/rh-backend` ou `/root/rh-backend`).

### Etapa 2: Instalação de Novas Dependências (se houver)
Caso tenha adicionado novas bibliotecas ao `requirements.txt`, execute na VPS:
```bash
source venv/bin/activate
pip install -r requirements.txt
```

### Etapa 3: Reinicialização do Serviço no PM2
Reinicie o processo da API no PM2 para aplicar as mudanças:
```bash
pm2 restart rh-api
# ou se o processo tiver outro nome:
pm2 reload all
```

### Etapa 4: Teste de Integridade da API
Valide a disponibilidade da API rodando um teste HTTP:
```bash
curl -I https://ahut-ecosystem.apexfyhub.com.br/rh-api/docs
```
*Deve retornar HTTP STATUS `200 OK`.*

---

## 🗄️ 5. Padronização e Regras de Schema do Banco de Dados (Supabase)

Um dos principais motivos de falhas anteriores foi a divergência de contrato JSON no banco de dados.

### ⚠️ Regra Crítica das Opções das Perguntas
Todas as **349 perguntas** cadastradas na tabela `questions` do Supabase **OBRIGATORIAMENTE** devem ter o campo `options` (JSONB) formatado no seguinte padrão universal:

```json
[
  {
    "value": "A",
    "label": "Texto visível da opção de resposta",
    "construct": "D"
  },
  {
    "value": "B",
    "label": "Outra alternativa de resposta",
    "construct": "I"
  }
]
```

> [!CAUTION]
> **NUNCA** cadastre opções utilizando chaves legadas como `{ "id": "A", "text": "..." }` ou com arrays vazios `[]`. Isso faz o frontend React falhar na renderização e cair na trava de contingência de **1 pergunta (1 de 1)**.

Se for necessário rodar uma migração ou atualização de perguntas no Supabase, use sempre o script de suporte:
```bash
python migrate_questions.py
```

---

## 🔄 6. Procedimento de Rollback (Plano de Contingência)

Se uma atualização em produção apresentar falha crítica imprevista, siga este procedimento de reversão imediata:

1. **Restaurar o Frontend**:
   ```bash
   rm -rf /var/www/crm-imobiliaria/dist
   cp -r /var/www/crm-imobiliaria/dist_backup_ULTIMO /var/www/crm-imobiliaria/dist
   ```

2. **Restaurar o Backend**:
   ```bash
   git checkout HEAD~1  # ou copiar a pasta de backup anterior
   pm2 restart rh-api
   ```

3. **Verificar Restabelecimento**:
   Acesse a URL `https://ahut-ecosystem.apexfyhub.com.br/rh/teste` e certifique-se de que a versão estável voltou ao ar.

---

## 📋 7. Checklist Pós-Deploy (Smoke Test Mandatory)

Após finalizar qualquer deploy em produção, o desenvolvedor/agente **DEVE** executar o checklist abaixo:

- [ ] Acessar `https://ahut-ecosystem.apexfyhub.com.br/rh/teste` em Aba Anônima.
- [ ] Inserir o PIN `123456` e confirmar acesso sem erro 404/CORS.
- [ ] Confirmar que o contador exibe **DISC - Pergunta 1 de 30** (e não 1 de 1).
- [ ] Executar o script de automação: `python simulate_test.py` no terminal.
- [ ] Confirmar se o robô completou as **349 perguntas** e se o candidato aparece no Dashboard (`/rh/avaliacoes`).
- [ ] Baixar o PDF de relatório por IA para testar a geração final de documentos.
