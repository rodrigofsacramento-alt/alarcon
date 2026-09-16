"""squad-commands plugin — slash commands do Squad Tech Ahut.

Registra os 5 comandos de orquestracao (/executar, /performance,
/criar-agente, /evolucao, /resumo) que o Comandante Rodrigo usa para
disparar os fluxos do squad. Cada handler devolve um texto deterministico
com as instrucoes minimas do fluxo; o agente (Jarvis) executa em seguida,
sempre abrindo o cerebro primeiro (KB_GLOBAL + PAINEL + skill minima).
"""

from __future__ import annotations

import logging

logger = logging.getLogger(__name__)

# Camada anti-amesia obrigatoria (AGENTS.md REGRA 0) — prefixo padrao
_CEREBRO = (
    "ANTES DE TUDO: leia 04_CODIGOS_FONTE_LOCAIS_E_DESENVOLVIMENTO/"
    "00_SQUAD_AGENTES_IA/KNOWLEDGE_BASE_GLOBAL.md e PAINEL_DE_CONTROLE.md "
    "(cerebro do squad) e valide o estado real com find/md5sum antes de agir."
    " Responda EM PORTUGUES BRASILEIRO."
)

_EXECUTAR = (
    "INSTRUCAO /executar — FLUXO COMPLETO do squad:\n"
    "1. Diagnostique a tarefa citada (ou peca contexto se ausente).\n"
    "2. Escale os agentes do squad (delegacao paralela) para resolver.\n"
    "3. Execute com ferramentas REAIS (termina o trabalho, nao descreva).\n"
    "4. QA com prova visual; gate de seguranca (secrets/RLS) antes do deploy.\n"
    "5. Pontue a entrega (/performance) e registre aprendizado no PAINEL.\n"
    "6. Comite com backup no repo remodel-copy.\n"
    "FORMATO: tabela curta + conclusao + proximo passo acionavel (preferencia de Rodrigo)."
)

_PERFORMANCE = (
    "INSTRUCAO /performance — pontue a ULTIMA entrega:\n"
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
    "4. Registrar no PAINEL_DE_CONTROLE + positions no organograma.\n"
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
    "Liste: agentes ativos (organograma), skills carregadas, tarefas "
    "pendentes no PAINEL, proxima acao. Tabela curta e objetiva."
)


def _handle_executar(raw_args: str) -> str:
    return f"{_CEREBRO}\n\n{_EXECUTAR}\n\nCONTEXTO: {raw_args}".strip()


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
        "executar",
        handler=_handle_executar,
        description="Fluxo COMPLETO do squad: diagnostica, escala agentes, executa, QA, pontua e comita.",
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
    logger.info("squad-commands: registrados 5 comandos (/executar /performance /criar-agente /evolucao /resumo)")