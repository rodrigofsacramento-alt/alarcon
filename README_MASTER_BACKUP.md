
# AHUT ECOSYSTEM — MASTER BACKUP COMPLETO DE PRODUÇÃO

**Data de Geração**: 05/08/2026, 11:37:57
**Domínio em Produção**: https://ahut-ecosystem.apexfyhub.com.br/
**Servidor VPS**: 2.24.95.98
**Servidor Hostinger**: 82.25.73.206

---

## 📂 Estrutura do Pacote Master:

1. **`01_FRONTEND_PRODUCAO_HOSTINGER/`**
   - Build exato da aplicação web de produção hospedada na Hostinger.
   - Contém `index.html`, bundles de JavaScript, CSS, imagens e assets.

2. **`02_BACKEND_E_SERVICOS_VPS/`**
   - Todo o diretório `/var/www/` da VPS contendo:
     - `ahut-rh/` (Frontend e Backend da plataforma comportamental)
     - `api.rh/` (API FastAPI Python, modelos cognitivos digital-brain)
     - `wpp-drgustavorocha/` (Serviço de automação WhatsApp)
     - `indavent-whatsapp-broker/` (Broker WhatsApp Indavent)
     - `crm-imobiliaria/` & `html/` (Sistemas e landings)
   - Arquivos `.env` completos com todas as chaves de API do Supabase, Google Gemini AI, JWT Secrets.
   - Configurações do Nginx (`/etc/nginx/sites-enabled/default`).

3. **`03_BANCOS_DE_DADOS_E_SCHEMAS/`**
   - Scripts SQL de tabelas, migrações, RLS e backups do Supabase.

4. **`04_CODIGOS_FONTE_LOCAIS_E_DESENVOLVIMENTO/`**
   - Código-fonte em desenvolvimento do projeto (`crm-dr-gustavo` e `v8Nova-Indavent-Local-Backup`).

5. **`05_DOCUMENTACAO_E_PROMPTS_IA/`**
   - Prompts de IA, regras do sistema, guias de sincronização e histórico de conversas do Antigravity IDE.
  