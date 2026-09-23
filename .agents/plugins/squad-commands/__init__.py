"""squad-commands plugin — slash commands do Squad Tech Ahut.

Registra os 5 comandos de orquestracao (/go, /performance,
/criar-agente, /evolucao, /resumo) que o Comandante Rodrigo usa para
disparar os fluxos do squad. /go substitui o antigo /executar
(renomeado em 23/09, sem alterar a semantica dos 3 gates).
Cada handler devolve um texto deterministico com as instrucoes minimas
do fluxo; o agente (Jarvis) executa em seguida, sempre abrindo o
cerebro primeiro (KB_GLOBAL + PAINEL + skill minima).
"""

from __future__ import annotations

import logging

logger = logging.getLogger(__name__)

# Camada anti-amesia obrigatoria (AGENTS.md REGRA 0) — prefixo padrao
_CEREBRO = (
    "ANTES DE TUDO: leia .agents/docs/KNOWLEDGE_BASE_GLOBAL.md e "
    ".agents/docs/PAINEL_DE_CONTROLE.md (cerebro do squad) e valide o "
    "estado real com find/md5sum antes de agir."
    " Responda EM PORTUGUES BRASILEIRO."
)

_GO = (
    "INSTRUCAO /go — FLUXO COMPLETO do squad (Fluxo 1→6; antigo /executar, "
    "renomeado 23/09, gates inalterados):\n"
    "1. Diagnostique a tarefa citada (ou peca contexto se ausente).\n"
    "2. JARVIS valida a demanda e DESPACHA AO AXIOM (orquestrador tecnico).\n"
    "3. AXIOM ORQUESTRA os agentes executores conforme topologia (nao executa "
    "tudo sozinho); execucao com ferramentas REAIS (termina o trabalho, nao "
    "descreva).\n"
    "4. AXIOM revisa no loop dev<->QA (max 3 retries); QA com PROVA VISUAL REAL "
    "(tarefa de codigo sem prova visual anexada = Gate 1 RECUSA); gate de "
    "seguranca (secrets/RLS) antes do deploy.\n"
    "5. JARVIS valida nos GATES HITL 1/2/3: Gate 1 = prova visual; Gate 2 = PROD "
    "so com aprovacao do COMANDANTE; Gate 3 = disparar o FLUXO 6 (P1-P6: "
    "performance, lacuna, conhecimento de todo o squad via ARGUS, WRITE-LAST "
    "+ TCK, Graph/Atlas como ultima etapa).\n"
    "6. Comite no repo remodel-copy (branch remodel) com backup.\n"
    "FORMATO: tabela curta + conclusao + proximo passo acionavel (preferencia "
    "de Rodrigo)."
)

_PERFORMANCE = (
    "INSTRUCAO /performance — pontue a ULTIMA entrega (P1 do FLUXO 6):\n"
    "Indicadores: TEMPO_EXECUCAO, RETRABALHO (regra de ponderacao de Rodrigo: "
    "so penaliza instrucao que o squad podia resolver sozinho; NAO penaliza "
    "credencial/senha nunca fornecida), COBERTURA_TECNICA, "
    "CONFORMIDADE_CRITERIOS, AUTONOMIA_AGENTE, APRENDIZADO_REGISTRADO.\n"
    "Entregue: tabela 4-5 linhas + score 0-100 + analise de LACUNA "
    "(sugerir agentes novos se houver gap, ASIMOV cria) + proximo passo."
)

_CRIAR_AGENTE = (
    "INSTRUCAO /criar-agente — ANALISE DE GAP para criar novo agente:\n"
    "1. So criar se um gap real justificar; NUNCA duplicar papel existente.\n"
    "2. Nome deve comecar com A (precedente do squad).\n"
    "3. Entregar SKILL.md completo (frontmatter name/description + secoes).\n"
    "4. Registrar no PAINEL_DE_CONTROLE + positions no organograma (KB §7).\n"
    "5. Hierarquia: especialista -> generalista (superior tem contexto p/ validar).\n"
    "Preferencia: ASIMOV (criador de agentes) conduz; Jarvis valida."
)

_EVOLUCAO = (
    "INSTRUCAO /evolucao — HISTORICO do squad:\n"
    "Busque no PAINEL_DE_CONTROLE.md os scores e agentes criados. "
    "Entregue: historico de scores (linha do tempo), agentes adicionados, "
    "e tendencia (evoluiu ou regrediu?). Conclua com recomendacao."
)

_RESUMO = (
    "INSTRUCAO /resumo — STATUS DO SQUAD HOJE:\n"
    "Liste: agentes ativos (organograma, 14 agentes), skills carregadas, "
    "tarefas pendentes no PAINEL, proxima acao. Tabela curta e objetiva."
)


def _handle_go(raw_args: str) -> str:
    return f"{_CEREBRO}\n\n{_GO}\n\nCONTEXTO: {raw_args}".strip()


def _handle_performance(raw_args: str) -> str:
    return f"{_CEREBRO}\n\n{_PERFORMANCE}\n\nALVO: {raw_args or 'ultima entrega'}".strip()


def _handle_criar_agente(raw_args: str) -> str:
    return f"{_CEREBRO}\n\n{_CRIAR_AGENTE}\n\nCONTEXTO: {raw_args}".strip()


def _handle_evolucao(raw_args: str) -> str:
    return f"{_CEREBRO}\n\n{_EVOLUCAO}".strip()


def _handle_resumo(raw_args: str) -> str:
    return f"{_CEREBRO}\n\n{_RESUMO}".strip()


def register(ctx) -> None:
    """Registra os 5 slash commands do squad no Hermes."""
    ctx.register_command(
        "go",
        handler=_handle_go,
        description="Fluxo COMPLETO do squad: JARVIS despacha, AXIOM orquestra a execucao, QA com prova visual, gates e commit.",
        args_hint="<descricao da tarefa>",
    )
    ctx.register_command(
        "performance",
        handler=_handle_performance,
        description="Pontua a ultima entrega (6 indicadores) + analise de lacuna.",
        args_hint="[alvo]",
    )
    ctx.register_command(
        "criar-agente",
        handler=_handle_criar_agente,
        description="Analise de gap para criar novo agente do squad (nome com A, via ASIMOV).",
        args_hint="<gap observado>",
    )
    ctx.register_command(
        "evolucao",
        handler=_handle_evolucao,
        description="Historico de scores e agentes criados do squad.",
    )
    ctx.register_command(
        "resumo",
        handler=_handle_resumo,
        description="Status do squad hoje: agentes, skills, pendencias.",
    )
    logger.info("squad-commands: registrados 5 comandos (/go /performance /criar-agente /evolucao /resumo)")
