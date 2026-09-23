"""ATEM — handler /tck do plugin squad-commands (CC-08).

Gerente de chamados TCK do kanban /tecnologia (tabela technology_tickets).
Executa os 4 gatilhos de validação do Comandante pelo Telegram com
confirmação OBRIGATÓRIA antes de qualquer escrita (fluxo em 2 tempos:
comando prepara → /tck confirmar executa; /tck cancelar descarta).

Estado corrente da conversa: /tmp/tck_current.json
  {"env", "code", "pending", "last_interaction"}

Credenciais: lidas em runtime de /opt/data/scripts/keys_ahut.py
(PROD: SB_URL+SB_SERVICE · DEV: SUPABASE_DEV_SERVICE_ROLE).
NUNCA imprimir valores. Sem dependências externas — stdlib only.
"""

from __future__ import annotations

import json
import logging
import os
import sys
import urllib.error
import urllib.request
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

STATE_PATH = "/tmp/tck_current.json"
KEYS_DIR = "/opt/data/scripts"
DEV_REST = "https://xmsulduzvufdzkfktovk.supabase.co"  # ref público (KB §); a CHAVE vem do keys_ahut.py
TABLE = "technology_tickets"

STATUS_LABEL = {
    "a_analisar": "a_analisar",
    "a_executar": "a_executar",
    "executando": "executando",
    "executado": "executado",
    "atualizado_producao": "atualizado_producao",
}

HELP = (
    "🤖 *ATEM* — gerente de chamados TCK. Comandos:\n"
    "/tck usar <TCK-2026-NNN> · /tck env dev|prod · /tck status\n"
    "/tck criar <título> — Gatilho 1 (cria em a_analisar)\n"
    "/tck planejar [code] — Gatilho 2 (→ a_executar, dispara plano do CC)\n"
    "/tck atualizar [code] [nota] — Gatilho 3 (→ executando ou valida subtask)\n"
    "/tck finalizar [code] — Gatilho 4 (→ executado, só pós-Gate 2)\n"
    "/tck producao [code] — pós-deploy PROD real (→ atualizado_producao)\n"
    "/tck subtask <título> · /tck validar-sub <n> [comentário]\n"
    "/tck confirmar — EXECUTA a operação pendente · /tck cancelar"
)


# ── Estado ────────────────────────────────────────────────────────────────────
def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _load_state() -> dict:
    try:
        with open(STATE_PATH) as f:
            return json.load(f)
    except Exception:
        return {"env": "prod", "code": None, "pending": None, "last_interaction": None}


def _save_state(st: dict) -> None:
    st["last_interaction"] = _now_iso()
    with open(STATE_PATH, "w") as f:
        json.dump(st, f, ensure_ascii=False, indent=1)


# ── Supabase REST (service role, chaves NUNCA impressas) ──────────────────────
def _creds(env: str) -> tuple[str, str]:
    if KEYS_DIR not in sys.path:
        sys.path.insert(0, KEYS_DIR)
    import keys_ahut as k  # noqa: PLC0415 — import tardio: falha clara só quando usado

    if env == "dev":
        return DEV_REST, k.SUPABASE_DEV_SERVICE_ROLE
    return k.SB_URL.rstrip("/"), k.SB_SERVICE


def _rest(env: str, method: str, path: str, body: dict | None = None) -> tuple[int, object]:
    base, key = _creds(env)
    req = urllib.request.Request(
        base + path,
        method=method,
        data=json.dumps(body).encode() if body is not None else None,
        headers={
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            return r.status, json.loads(r.read().decode() or "[]")
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()[:300]
    except Exception as e:  # rede/timeout
        return 0, str(e)


def _get_by_code(env: str, code: str) -> dict | None:
    code = code.upper().strip()
    st_, rows = _rest(env, "GET", f"/rest/v1/{TABLE}?code=eq.{code}&select=id,code,title,main_status,subcategory,timeline,subtasks")
    if st_ != 200 or not isinstance(rows, list) or not rows:
        return None
    return rows[0]


def _next_code(env: str) -> tuple[str | None, str]:
    st_, rows = _rest(env, "GET", f"/rest/v1/{TABLE}?select=code&order=created_at.desc&limit=500")
    if st_ != 200 or not isinstance(rows, list):
        return None, f"❌ Falha ao listar tickets (HTTP {st_}): {rows}"
    n = 0
    for r in rows:
        c = (r.get("code") or "").upper().split("-")
        if len(c) >= 3 and c[1] == "2026":
            try:
                n = max(n, int(c[-1]))
            except ValueError:
                pass
    return f"TCK-2026-{n + 1:03d}", ""


def _env_disp(env: str) -> str:
    return "DEV (xmsulduzvufdzkfktovk, isolado)" if env == "dev" else "PROD (ptochsyoyatsydfysacc, dados reais)"


def _actor() -> str:
    return "Comandante (via Telegram/ATEM)"


# ── Staging (2 tempos) ────────────────────────────────────────────────────────
def _stage(st: dict, pending: dict, msg: str) -> str:
    st["pending"] = pending
    _save_state(st)
    return msg + "\n\n⚠️ Confirma? Responda */tck confirmar* (ou */tck cancelar*)."


def _op_create(st: dict, title: str) -> str:
    env = st.get("env", "prod")
    code, err = _next_code(env)
    if not code:
        return err
    if not title:
        return "❌ Use: /tck criar <título do chamado>"
    ticket = {
        "id": f"ticket-{int(datetime.now().timestamp() * 1000)}",
        "code": code,
        "title": title,
        "description": title,
        "module": "Outro",
        "requester_name": "Rodrigo Sacramento",
        "requester_role": "CTO",
        "requester_department": "Diretoria & Tech",
        "priority": "media",
        "main_status": "a_analisar",
        "subcategory": "nao_especificado",
        "assigned_to": "Squad Ahut Tech (CTO)",
        "impact_level": "Médio",
        "is_ai_triaged": True,
        "subtasks": [],
        "timeline": [{"at": _now_iso(), "from": None, "to": "a_analisar", "note": "Chamado criado pelo Comandante via Telegram (ATEM).", "actor": _actor()}],
    }
    return _stage(
        st,
        {"kind": "create", "env": env, "ticket": ticket},
        f"📝 Vou criar *{code}* — “{title}”\nStatus: a_analisar · Subcat: nao_especificado · Banco: {_env_disp(env)}",
    )


def _op_move(st: dict, code: str | None, to: str, subcat: str | None, note: str, comment_only: bool = False) -> str:
    env = st.get("env", "prod")
    code = (code or st.get("code") or "").upper().strip()
    if not code:
        return "❌ Sem ticket corrente. Use /tck usar <TCK-2026-NNN> ou informe o código."
    t = _get_by_code(env, code)
    if not t:
        return f"❌ Ticket {code} não encontrado em {_env_disp(env)}."
    st["code"] = code
    fr = t["main_status"]
    if comment_only:
        return _stage(
            st,
            {"kind": "comment", "env": env, "id": t["id"], "code": code, "note": note},
            f"💬 Vou registrar em *{code}* (mantém {fr}):\n“{note}”\nBanco: {_env_disp(env)}",
        )
    allowed = {"a_executar": "a_analisar", "executando": "a_executar", "executado": ("executando", "a_executar"), "atualizado_producao": "executado"}
    ok = allowed.get(to)
    ok = (ok,) if isinstance(ok, str) else ok
    if ok and fr not in ok:
        return f"❌ {code} está em *{fr}* — transição para *{to}* fora do fluxo (esperava {ok[0]}). Use /tck status."
    pend = {"kind": "move", "env": env, "id": t["id"], "code": code, "from": fr, "to": to, "subcategory": subcat or t["subcategory"], "note": note}
    sub = f" · Subcat: {pend['subcategory']}" if subcat else ""
    return _stage(st, pend, f"🔁 Vou mover *{code}* de *{fr}* para *{to}*{sub}\nComentário: “{note}”\nBanco: {_env_disp(env)}")


def _op_subtask(st: dict, code: str | None, title: str) -> str:
    env = st.get("env", "prod")
    code = (code or st.get("code") or "").upper().strip()
    if not code or not title:
        return "❌ Use: /tck subtask <título> (com ticket corrente via /tck usar <code>)"
    t = _get_by_code(env, code)
    if not t:
        return f"❌ Ticket {code} não encontrado em {_env_disp(env)}."
    st["code"] = code
    sub = {"id": f"sub-{int(datetime.now().timestamp() * 1000)}", "title": title, "status": "pendente"}
    return _stage(
        st,
        {"kind": "subtask_add", "env": env, "id": t["id"], "code": code, "sub": sub},
        f"➕ Vou adicionar subtarefa em *{code}*:\n“{title}” (pendente)\nBanco: {_env_disp(env)}",
    )


def _op_validate_sub(st: dict, code: str | None, args: list[str]) -> str:
    env = st.get("env", "prod")
    code = (code or st.get("code") or "").upper().strip()
    if len(args) < 1 or not args[0].isdigit():
        return "❌ Use: /tck validar-sub <número> [comentário]"
    idx = int(args[0]) - 1
    comment = " ".join(args[1:]).strip()
    if not code:
        return "❌ Sem ticket corrente. Use /tck usar <TCK-2026-NNN>."
    t = _get_by_code(env, code)
    if not t:
        return f"❌ Ticket {code} não encontrado em {_env_disp(env)}."
    subs = t.get("subtasks") or []
    if not (0 <= idx < len(subs)):
        return f"❌ {code} tem {len(subs)} subtarefa(s); índice {idx + 1} inválido."
    s = subs[idx]
    st["code"] = code
    return _stage(
        st,
        {"kind": "subtask_validate", "env": env, "id": t["id"], "code": code, "idx": idx, "comment": comment},
        f"✔️ Vou validar subtarefa {idx + 1} de *{code}*:\n“{s['title']}” → *validada*"
        + (f"\nComentário: “{comment}”" if comment else "")
        + f"\nBanco: {_env_disp(env)}",
    )


# ── Execução (só roda via /tck confirmar) ────────────────────────────────────
def _append_timeline(t: dict, note: str, to: str | None = None) -> list:
    tl = list(t.get("timeline") or [])
    tl.append({"at": _now_iso(), "from": t.get("main_status"), "to": to or t.get("main_status"), "note": note, "actor": _actor()})
    return tl


def _execute(p: dict) -> str:
    env = p["env"]
    kind = p["kind"]
    if kind == "create":
        st_, rows = _rest(env, "POST", f"/rest/v1/{TABLE}", p["ticket"])
        if st_ not in (200, 201):
            return f"❌ Falha ao criar (HTTP {st_}): {rows}"
        code = rows[0]["code"]
        logger.info("ATEM criou %s em %s", code, env)
        return (
            f"✅ *{code}* criado — “{p['ticket']['title']}”\n"
            f"Estágio: *a_analisar* · Banco: {_env_disp(env)}\n"
            "Próximo passo: quando for planejar, */tck planejar* (dispara o plano do CC com elenco de subagentes)."
        )
    if kind == "move":
        code, to, fr = p["code"], p["to"], p["from"]
        t = _get_by_code(env, code)
        if not t:
            return f"❌ {code} sumiu? Não encontrado. Operação abortada."
        body = {
            "main_status": to,
            "subcategory": p.get("subcategory") or t["subcategory"],
            "timeline": _append_timeline(t, p["note"], to),
            "updated_at": _now_iso(),
        }
        st_, rows = _rest(env, "PATCH", f"/rest/v1/{TABLE}?id=eq.{p['id']}", body)
        if st_ != 200:
            return f"❌ Falha ao mover {code} (HTTP {st_}): {rows}"
        logger.info("ATEM moveu %s %s->%s em %s", code, fr, to, env)
        extra = ""
        if to == "a_executar":
            extra = "\n🧠 Gatilho 2: CC deve PLANEJAR a atualização (plano + elenco/papel dos subagentes) e entregar ao Comandante — NÃO executar ainda."
        if to == "executado":
            extra = "\n📦 Faltando o deploy PROD real: depois use /tck producao para → atualizado_producao."
        if to == "atualizado_producao":
            extra = "\n🏁 Fim de ciclo. Registrar score P1 no PAINEL (se houver)."
        return f"✅ *{code}*: {fr} → *{to}*\nComentário registrado na timeline.\nKanban: {_env_disp(env)}{extra}"
    if kind == "comment":
        t = _get_by_code(env, p["code"])
        if not t:
            return "❌ Ticket não encontrado. Operação abortada."
        body = {"timeline": _append_timeline(t, p["note"]), "updated_at": _now_iso()}
        st_, rows = _rest(env, "PATCH", f"/rest/v1/{TABLE}?id=eq.{p['id']}", body)
        if st_ != 200:
            return f"❌ Falha ao comentar (HTTP {st_}): {rows}"
        return f"✅ Comentário registrado em *{p['code']}* (estágio mantido)."
    if kind == "subtask_add":
        t = _get_by_code(env, p["code"])
        if not t:
            return "❌ Ticket não encontrado. Operação abortada."
        body = {"subtasks": list(t.get("subtasks") or []) + [p["sub"]], "timeline": _append_timeline(t, f"Subtask criada: \"{p['sub']['title']}\"."), "updated_at": _now_iso()}
        st_, rows = _rest(env, "PATCH", f"/rest/v1/{TABLE}?id=eq.{p['id']}", body)
        if st_ != 200:
            return f"❌ Falha ao adicionar subtarefa (HTTP {st_}): {rows}"
        return f"✅ Subtarefa adicionada em *{p['code']}*: “{p['sub']['title']}” (pendente)."
    if kind == "subtask_validate":
        t = _get_by_code(env, p["code"])
        if not t:
            return "❌ Ticket não encontrado. Operação abortada."
        subs = list(t.get("subtasks") or [])
        if not (0 <= p["idx"] < len(subs)):
            return "❌ Subtarefa sumiu; operação abortada."
        s = subs[p["idx"]]
        s.update({"status": "validada", "validated_by": _actor(), "validated_at": _now_iso(), "comment": p.get("comment") or s.get("comment")})
        subs[p["idx"]] = s
        note = f"Subtask \"{s['title']}\" VALIDADA pelo Comandante" + (f" — {p['comment']}" if p.get("comment") else "") + "."
        body = {"subtasks": subs, "timeline": _append_timeline(t, note), "updated_at": _now_iso()}
        st_, rows = _rest(env, "PATCH", f"/rest/v1/{TABLE}?id=eq.{p['id']}", body)
        if st_ != 200:
            return f"❌ Falha ao validar subtarefa (HTTP {st_}): {rows}"
        return f"✅ Subtarefa {p['idx'] + 1} de *{p['code']}* validada: “{s['title']}”.\nComentário na timeline."
    return f"❌ Operação desconhecida: {kind}"


# ── Entry point do comando ────────────────────────────────────────────────────
def handle(raw_args: str) -> str:
    args = (raw_args or "").strip().split()
    st = _load_state()
    sub = (args[0].lower() if args else "") or "status"
    rest = args[1:]

    if sub == "help":
        return HELP

    if sub == "status":
        pend = st.get("pending")
        out = f"🎫 Corrente: *{st.get('code') or '—'}* · Env: *{st.get('env', 'prod')}*"
        if pend:
            out += f"\n⏳ Pendente: *{pend['kind']}* em *{pend.get('code', pend.get('env'))}* — use /tck confirmar ou /tck cancelar."
        return out

    if sub == "env":
        if rest and rest[0].lower() in ("dev", "prod"):
            st["env"] = rest[0].lower()
            _save_state(st)
            return f"✅ Banco alvo: {_env_disp(st['env'])}"
        return "❌ Use: /tck env dev|prod"

    if sub == "usar":
        if not rest:
            return "❌ Use: /tck usar <TCK-2026-NNN>"
        code = rest[0].upper()
        t = _get_by_code(st.get("env", "prod"), code)
        if not t:
            return f"❌ {code} não encontrado em {_env_disp(st.get('env', 'prod'))}."
        st["code"] = code
        _save_state(st)
        return f"✅ Corrente: *{code}* — “{t['title']}” [{t['main_status']} · {t['subcategory']}]"

    if sub == "cancelar":
        st["pending"] = None
        _save_state(st)
        return "🗑️ Operação pendente descartada. Nada foi escrito."

    if sub == "confirmar":
        pend = st.get("pending")
        if not pend:
            return "ℹ️ Nenhuma operação pendente."
        out = _execute(pend)
        st["pending"] = None
        _save_state(st)
        return out

    if sub == "criar":
        return _op_create(st, " ".join(rest).strip())

    if sub == "planejar":
        note = f"Comandante aprovou planejamento via Telegram (Gatilho 2). CC deve apresentar plano + elenco de subagentes ANTES de executar."
        return _op_move(st, rest[0] if rest else None, "a_executar", "em_planejamento", note)

    if sub == "atualizar":
        code = None
        if rest and rest[0].upper().startswith("TCK-"):
            code = rest[0]
            rest = rest[1:]
        nota = " ".join(rest).strip()
        env = st.get("env", "prod")
        target_code = (code or st.get("code") or "").upper().strip()
        t = _get_by_code(env, target_code) if target_code else None
        if t and t["main_status"] == "executando":
            note = nota or "Comandante validou atualização/subtask via Telegram (Gatilho 3)."
            return _op_move(st, target_code, "executando", None, note, comment_only=True)
        note = nota or f"Comandante aprovou o planejamento via Telegram (Gatilho 3). Subtasks em {target_code or 'ticket'} podem ser validadas com /tck validar-sub <n>."
        return _op_move(st, target_code or None, "executando", "em_aplicacao", note)

    if sub == "finalizar":
        note = "Comandante validou finalização via Telegram (Gatilho 4, pós-Gate 2: prova visual + aprovação). Ticket executado."
        return _op_move(st, rest[0] if rest else None, "executado", None, note)

    if sub == "producao":
        note = "Deploy PROD real confirmado pelo Comandante via Telegram. Ticket atualizado em produção."
        return _op_move(st, rest[0] if rest else None, "atualizado_producao", "atualizado", note)

    if sub == "subtask":
        return _op_subtask(st, rest[0].upper() if rest and rest[0].upper().startswith("TCK-") else None, " ".join(rest[1:] if rest and rest[0].upper().startswith("TCK-") else rest).strip())

    if sub == "validar-sub":
        code = rest[0].upper() if rest and rest[0].upper().startswith("TCK-") else None
        return _op_validate_sub(st, code, rest[1:] if code else rest)

    # Fallback (REGRA: nunca adivinhar escrita)
    return (
        f"❓ Não entendi “{sub}”. {HELP}\n\n"
        "🧠 *MODO ATEM:* se o Comandante escreveu linguagem natural (sem /tck), "
        "ative a skill `atem-kanban-manager`: identifique o ticket corrente e qual dos "
        "4 gatilhos se aplica; se houver ambiguidade, PERGUNTE — nunca escreva sem confirmação."
    )


def register(ctx) -> None:
    """Registra o /tck no Hermes (chamado pelo __init__.py do plugin)."""
    ctx.register_command(
        "tck",
        handler=handle,
        description="ATEM — gatilhos TCK do Comandante: criar/planejar/atualizar/finalizar (+ subtasks, confirmar/cancelar).",
        args_hint="<criar|planejar|atualizar|finalizar|producao|subtask|validar-sub|usar|env|status|confirmar|cancelar> [args]",
    )
    logger.info("squad-commands: ATEM /tck registrado (6º comando, CC-08)")
