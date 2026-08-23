# Skill: Gestão e Transferência de Conhecimento

## 🧠 Objetivo
Esta skill documenta como a inteligência artificial (eu) armazena aprendizados e define um processo padronizado para que você possa extrair, melhorar e adaptar esse conhecimento para utilizá-lo em outros projetos de forma rápida e escalável.

## 📂 Como o Conhecimento é Armazenado?
Atualmente, o nosso conhecimento customizado é salvo de forma persistente através das seguintes estruturas:
1. **Pasta de Skills (`.agent/skills/`)**: Onde guardamos padrões de código, fluxos de trabalho específicos (ex: animações 3D, chamadas de banco de dados) e boas práticas consolidadas.
2. **Workflows (`.agent/workflows/`)**: Usados para criar comandos e rotinas mais abrangentes (ex: estruturar um agente do OpenSquad).
3. **Artifacts (Diretório `brain`)**: Onde crio os planos de implementação, anotações de pesquisas e históricos de execução temporária.

## 🚀 Processo para Transferir Skills para Outros Projetos

Se você aprendeu e configurou algo ótimo aqui e quer levar para um novo projeto (por exemplo, de um projeto para o seu projeto APEXFY), siga estes passos:

### Passo 1: Generalizar a Skill
Antes de exportar, garanta que a documentação não contém regras exclusivas de um único cliente ou projeto.
* **Evite:** "Como conectar no banco de dados da imobiliária XYZ".
* **Prefira:** "Padrão arquitetural de conexão com banco de dados usando Prisma ORM".

### Passo 2: Copiar a Estrutura
O sistema de "memória" é baseado em arquivos locais. Para transferir o conhecimento:
1. Vá até a pasta do projeto atual.
2. Copie a pasta da skill desejada (ex: `.agent/skills/minha-skill-incrivel`).
3. Cole dentro da pasta `.agent/skills/` na raiz do seu **novo projeto**.
*Assim que você iniciar o assistente no novo projeto, eu lerei essa pasta e absorverei o conhecimento instantaneamente.*

### Passo 3: Template Padrão para Novas Skills Portáteis
Para garantir que futuras skills sejam fáceis de adaptar, usaremos sempre esta estrutura ao criar arquivos `SKILL.md`:

```markdown
# [Nome da Habilidade / Padrão]

## 🎯 Quando usar
Descreva em quais cenários essa skill deve ser ativada.

## 📦 Dependências
Liste bibliotecas ou ferramentas necessárias (ex: `npm install lib-x`).

## 💻 Padrão de Implementação
Trechos de código modulares e agnósticos de regra de negócio.

## ⚠️ Armadilhas Comuns (Gotchas)
Erros que já cometemos no passado e como evitá-los.
```

## 🛠️ Como Melhorar Esse Processo no Dia a Dia?
Para evoluirmos esse sistema, proponho três hábitos:
1. **Documentação Pós-Resolução**: Toda vez que passarmos horas resolvendo um bug complexo ou criando uma funcionalidade nova, me diga: *"Crie uma skill genérica baseada na solução que acabamos de fazer"*.
2. **Biblioteca Central**: Você pode ter uma pasta no seu computador ou no GitHub (ex: `my-ai-skills`) para guardar todas as suas skills-mestre. Quando criar um projeto novo, basta colar essa pasta dentro dele.
3. **Refinamento Constante**: Se em um novo projeto a Skill falhar ou ficar desatualizada, peça para eu atualizar o arquivo `SKILL.md` lá. Depois você pode retroalimentar sua biblioteca central.
