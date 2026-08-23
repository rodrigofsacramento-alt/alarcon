# GUIA DE TESTE EM PRODUÇÃO — PLATAFORMA RH (AHUT ECOSYSTEM)

## 📌 1. Visão Geral e Objetivos
Este guia estabelece o procedimento operacional padrão para realização de **testes ponta a ponta (End-to-End)** no sistema de RH Comportamental da **AHUT Ecosystem** em ambiente de **Produção**.

O objetivo do teste é garantir que:
1. A autenticação por PIN corporativo funcione corretamente.
2. Todas as **349 perguntas** distribuídas nas **6 ferramentas comportamentais** sejam carregadas dinamicamente sem regressão para perguntas estáticas (1 de 1).
3. As respostas sejam processadas e salvas no banco de dados Supabase de produção.
4. O formulário de finalização valide a trava do avaliador fixo (**Chris Racanelli**).
5. O painel administrativo exiba a ficha do candidato e permita a geração de relatórios comportamentais em PDF por IA.

---

## 🌐 2. Credenciais e URLs de Produção

| Recurso | URL / Parâmetro | Descrição |
| :--- | :--- | :--- |
| **Página de Início do Teste** | `https://ahut-ecosystem.apexfyhub.com.br/rh/teste` | Interface acessada pelo candidato para iniciar a avaliação |
| **Página Principal do RH** | `https://ahut-ecosystem.apexfyhub.com.br/rh/` | Portal corporativo de entrada |
| **Painel de Triagem RH** | `https://ahut-ecosystem.apexfyhub.com.br/rh/avaliacoes` | Dashboard de gestão de candidatos e relatórios |
| **Endpoint da API Backend** | `https://ahut-ecosystem.apexfyhub.com.br/rh-api` | Servidor FastAPI na VPS |
| **PIN Corporativo de Acesso**| `123456` | Senha padrão de autenticação inicial |

---

## 📊 3. Matriz de Cobertura das Ferramentas (349 Perguntas)

| # | Ferramenta Comportamental | Qtd. Perguntas | Identificador no Banco | Estrutura de Opções |
| :---: | :--- | :---: | :---: | :--- |
| **1** | 🔷 **DISC** | **30** | `DISC` | `{ value: "A", label: "...", construct: "D" }` |
| **2** | 🧠 **MBTI** | **80** | `MBTI` | `{ value: "A", label: "...", construct: "E" }` |
| **3** | 📊 **BIG FIVE** | **35** | `BIG_FIVE` | Escala Likert de 1 a 5 (`{ value: "1", label: "..." }`) |
| **4** | ⚓ **ÂNCTORAS DE CARREIRA** | **16** | `ANCORAS` | `{ value: "A", label: "[A] ..." }, { value: "B", label: "[B] ..." }` |
| **5** | 📋 **OPQ** | **128** | `OPQ` | Escolha de pares/opções de perfil de trabalho |
| **6** | 💎 **VALORES** | **60** | `VALORES` | Valoração de preferências profissionais e pessoais |
| **TOTAL** | **FLUXO COMPLETO** | **349** | — | **100% Integração Supabase Cloud** |

---

## 🧪 4. Procedimento de Teste Manual (Via Navegador)

### Passo 1: Preparação do Navegador
* Abra o Google Chrome e ative uma **Nova Janela Anônima** (`Ctrl + Shift + N` ou `Cmd + Shift + N`).
* *Motivo:* Evita interferência de caches legados do navegador.

### Passo 2: Acesso e Autenticação
* Acesse a URL: `https://ahut-ecosystem.apexfyhub.com.br/rh/teste`
* Na tela de PIN Corporativo, insira: **`123456`**
* Clique em **"Acessar Sistema"**.

### Passo 3: Cadastro do Candidato Teste
* **Nome Completo:** Digite um nome único (ex: `Mariana Souza Teste Prod 01`).
* **E-mail:** Digite um e-mail válido/único (ex: `mariana.teste01@exemplo.com`).
* Clique em **"Iniciar Avaliação"**.

### Passo 4: Execução das Questões
* Verifique no topo da tela se o contador indica a quantidade correta por ferramenta (ex: `DISC - Pergunta 1 de 30`).
* Responda as alternativas observando a fluidez e a ausência de travamentos.
* Acompanhe a transição automática entre as 6 ferramentas (DISC → MBTI → Big Five → Âncoras → OPQ → Valores).

### Passo 5: Validação do Formulário Final e Avaliador
* Ao responder a pergunta 349, a tela transicionará para o **Formulário de Inscrição**.
* Confirme se o campo **Avaliador** está preenchido e travado com o nome: **`Chris Racanelli`**.
* Preencha o **Cargo** (ex: *Gerente Comercial*) e **Empresa** (ex: *Apex Consultoria*).
* Clique em **"Finalizar Inscrição ✓"**.
* Certifique-se de ver a tela de confirmação: **"🎉 Inscrição Finalizada com Sucesso!"**.

### Passo 6: Validação no Painel Administrativo
* Acesse: `https://ahut-ecosystem.apexfyhub.com.br/rh/avaliacoes`
* Localize o candidato recém-cadastrado na lista de triagem.
* Clique no candidato para verificar o cálculo dos gráficos comportamentais e solicite a geração do relatório em PDF.

---

## 🤖 5. Procedimento de Teste Automatizado (Via Script Playwright)

O repositório possui um assistente de automação que executa o teste com o navegador Chrome visível em tempo real.

### Pré-requisitos (macOS / Linux)
Instale o Playwright e o HTTPX utilizando o módulo `python3 -m`:
```bash
python3 -m pip install playwright httpx
python3 -m playwright install chromium
```

### Execução do Script
Navegue até a pasta do backend e execute com `python3`:
```bash
cd "ahut-rh_frontend/backend"
python3 simulate_test.py
```

### O que o Script Executa Automaticamente:
1. Abre o navegador Chromium visível com `slow_mo=300`.
2. Acessa `https://ahut-ecosystem.apexfyhub.com.br/rh/`.
3. Preenche o PIN `123456`.
4. Gera um candidato randômico com e-mail único.
5. Clica sequencialmente em todas as alternativas das 349 perguntas.
6. Valida a trava do avaliador **Chris Racanelli** e envia o formulário final.
7. Exibe a mensagem de sucesso e encerra com log no terminal.

---

## 🔍 6. Checklist de Verificação e Solução de Problemas (Troubleshooting)

| Erro / Sintoma | Causa Provável | Solução Recomendada |
| :--- | :--- | :--- |
| **Tela exibe "Pergunta 1 de 1" (DISC)** | Incompatibilidade de nomes de chaves (`id/text` em vez de `value/label`) no JSON de opções da API | Executar o script de normalização de schema no Supabase (`migrate_questions.py`) e limpar o cache do navegador. |
| **Erro 404 ao abrir a URL `/rh/avaliacao/:id`** | Rota ausente no `App.tsx` ou arquivo `.htaccess` não configurado para React SPA Router | Garantir que o Nginx / Apache redireciona todas as rotas `/rh/*` para `index.html`. |
| **Botão "Iniciar Avaliação" não responde** | Endpoint `/rh-api` inacessível ou erro de CORS | Verificar se a VPS está rodando o serviço com `pm2 status` e testar `curl -I https://ahut-ecosystem.apexfyhub.com.br/rh-api/docs`. |
