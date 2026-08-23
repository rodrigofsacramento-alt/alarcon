# 📋 LISTA MASTER DE DEMANDAS — AHUT ECOSYSTEM

**Última Atualização**: 11 de Agosto de 2026  
**Ambiente de Produção**: [https://ahut-ecosystem.apexfyhub.com.br/](https://ahut-ecosystem.apexfyhub.com.br/)  
**Servidores**: VPS (2.24.95.98) | Hostinger (82.25.73.206)  

---

## 📊 Resumo Executivo de Status

| Categoria | Em Andamento (🔄) | A Executar (⏳) | Concluídas (✅) | Total |
| :--- | :---: | :---: | :---: | :---: |
| **1. RH Ecosystem (Plataforma Comportamental)** | 1 | 3 | 5 | 9 |
| **2. Nova Indavent (App & Sincronização)** | 1 | 2 | 3 | 6 |
| **3. Apexfy Landing Page & Digital Brain 3D** | 1 | 2 | 4 | 7 |
| **4. Serviços VPS (WhatsApp Broker & CRMs)** | 1 | 2 | 3 | 6 |
| **5. Infraestrutura & Documentação** | 0 | 1 | 3 | 4 |
| **TOTAL GERAL** | **4** | **10** | **18** | **32** |

---

## 🔄 1. DEMANDAS SENDO EXECUTADAS (EM ANDAMENTO)

### 🟢 RH Ecosystem (Plataforma Comportamental)
* **[RH-01] Automação de Testes de Produção (Playwright E2E)**
  * **Descrição**: Validação e execução de script em Python/Playwright (`simulate_test.py`) para simular o preenchimento automatizado das 349 perguntas (DISC, MBTI, Big Five, OPQ, Âncoras e Valores) diretamente na URL de produção (`https://ahut-ecosystem.apexfyhub.com.br/rh/`).
  * **Status**: 🔄 Em Execução / Validação em Tempo Real no Chrome.

### 🔵 Nova Indavent
* **[IND-01] Manutenção do Ambiente Local & Sincronização Google Drive**
  * **Descrição**: Acompanhamento do ciclo de desenvolvimento em `v8Nova-Indavent-Local-Backup` e sincronização contínua com a nuvem (Google Drive).
  * **Status**: 🔄 Em Andamento.

### 🟣 Apexfy Landing & Componentes Visuais
* **[APX-01] Polimento e Ajustes Finos do Herói 3D (Digital Brain)**
  * **Descrição**: Refinamento da renderização Three.js do cérebro holográfico (efeito bioluminescente, rotação e pulsação celular) e integração visual com as seções de agentes da landing page.
  * **Status**: 🔄 Em Andamento.

### 🟡 Serviços VPS & Automação WhatsApp
* **[VPS-01] Monitoramento do Serviço de WhatsApp Broker & Webhooks**
  * **Descrição**: Verificação de estabilidade dos serviços `wpp-drgustavorocha` e `indavent-whatsapp-broker` em produção no Nginx/VPS.
  * **Status**: 🔄 Em Andamento.

---

## ⏳ 2. DEMANDAS A EXECUTAR (BACKLOG / PENDENTES)

### 🟢 RH Ecosystem
* **[RH-02] Validação do Motor Cognitivo e Geração de Relatórios por IA**
  * **Prioridade**: Alta
  * **Descrição**: Testar a consolidação dos resultados dos testes de 349 perguntas no banco Supabase e a geração automática de relatórios em PDF via Google Gemini / Claude.
* **[RH-03] Envio Automático de Relatórios Comportamentais via WhatsApp/E-mail**
  * **Prioridade**: Média
  * **Descrição**: Conectar o evento de conclusão do teste de RH ao disparo automático do relatório em PDF para o candidato e gestor.
* **[RH-04] Otimização de Performance no Painel Dashboard de RH**
  * **Prioridade**: Média
  * **Descrição**: Reduzir o tempo de carregamento de dashboards e histórico de avaliações dos colaboradores.

### 🔵 Nova Indavent
* **[IND-02] Implementação de Novas Funcionalidades Visuais conforme Prompts**
  * **Prioridade**: Alta
  * **Descrição**: Processar as solicitações de alteração de interface e componentes com base em novos prompts e especificações de imagem.
* **[IND-03] Integração com Broker de Mensagens WhatsApp**
  * **Prioridade**: Média
  * **Descrição**: Conectar o fluxo da aplicação Indavent v8 ao broker de mensagens hospedado na VPS.

### 🟣 Apexfy Landing Page
* **[APX-02] Deploy Final da Landing Page Apexfy em Produção**
  * **Prioridade**: Alta
  * **Descrição**: Publicar a versão mais recente da landing page interativa na estrutura de hospedagem (Hostinger/Nginx).
* **[APX-03] Integração de Formulários de Captura com CRM**
  * **Prioridade**: Média
  * **Descrição**: Conectar os botões de CTA da Landing Page aos endpoints de captação de leads.

### 🟡 Serviços VPS & CRMs
* **[VPS-02] Validação dos Fluxos de Atendimento do CRM Médico (Dr. Gustavo)**
  * **Prioridade**: Média
  * **Descrição**: Testar o funil de agendamentos e automação de mensagens para pacientes.
* **[VPS-03] Atualização do CRM Imobiliário**
  * **Prioridade**: Baixa
  * **Descrição**: Revisão das rotas de imóveis e integração de novos corretores.

### ⚪ Infraestrutura & Segurança
* **[INF-01] Verificação de Rotinas de Backup Automático**
  * **Prioridade**: Média
  * **Descrição**: Configurar rotina diária/semanal de backup dos schemas do Supabase e do diretório `/var/www` da VPS.

---

## ✅ 3. DEMANDAS EXECUTADAS (CONCLUÍDAS)

### 🟢 RH Ecosystem
* **[RH-05] Implementação dos Motores Comportamentais (MBTI, Big Five, Âncoras, OPQ, Valores, DISC)** — ✅ Concluído
* **[RH-06] Configuração de Banco de Dados Supabase (Schema, Tabelas & Auth)** — ✅ Concluído
* **[RH-07] Estruturação da API Backend FastAPI (`api.rh`) na VPS** — ✅ Concluído
* **[RH-08] Frontend em Next.js (`ahut-rh_frontend`) implantado na Hostinger/VPS** — ✅ Concluído
* **[RH-09] Criação do Script Base de Testes Playwright (`simulate_test.py`)** — ✅ Concluído

### 🔵 Nova Indavent
* **[IND-04] Desenvolvimento da Versão v8 (Local/Backup)** — ✅ Concluído
* **[IND-05] Automação e Execução de Sincronização Forçada com Google Drive** — ✅ Concluído
* **[IND-06] Estruturação do Script de Guia de Sync (`INDAVENT_SYNC_GUIDE.md`)** — ✅ Concluído

### 🟣 Apexfy Landing & Componentes Visuais
* **[APX-04] Desenvolvimento do Componente 3D Cérebro Digital (Three.js bioluminescente)** — ✅ Concluído
* **[APX-05] Atualização da Seção "O que os agentes executam?" com Grid de Setores** — ✅ Concluído
* **[APX-06] Modularização de Componentes React (`ModularPanel`)** — ✅ Concluído
* **[APX-07] Padronização Tipográfica e Estilização Dark Mode com Glassmorphism** — ✅ Concluído

### 🟡 Serviços VPS & CRMs
* **[VPS-04] Configuração do Nginx Reverse Proxy para múltiplos domínios** — ✅ Concluído
* **[VPS-05] Implantação do Serviço `wpp-drgustavorocha`** — ✅ Concluído
* **[VPS-06] Configuração de Variáveis de Ambiente (`.env`) e SSL** — ✅ Concluído

### ⚪ Infraestrutura & Suporte
* **[INF-02] Diagnóstico e Resolução de Erro de Acesso ao HD (Unidade E:)** — ✅ Concluído (Documentado em `HISTORICO_RESOLUCAO_ACESSO_HD.md`)
* **[INF-03] Criação do Backup Master da Produção (Hostinger + VPS)** — ✅ Concluído (Documentado em `README_MASTER_BACKUP.md`)
* **[INF-04] Centralização de Prompts e Histórico de IA em Markdown** — ✅ Concluído

---

## 📌 Como Consultar e Atualizar este Arquivo

1. **Alterar Status**: Quando uma demanda mudar de fase, troque as tags de status (`⏳ A Executar` ➔ `🔄 Em Andamento` ➔ `✅ Concluído`).
2. **Adicionar Novas Demandas**: Insira o item na categoria correspondente utilizando o padrão `[CODIGO-ID] Título da Demanda`.
3. **Localizações do Arquivo**:
   - Raiz do projeto: `LISTA_DE_DEMANDAS.md`
   - Diretório de Documentação: `05_DOCUMENTACAO_E_PROMPTS_IA/LISTA_DE_DEMANDAS.md`
