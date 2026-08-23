import os
import sys
import json
from dotenv import load_dotenv
from services.db_service import get_supabase

# Adiciona o diretório do backend ao path
backend_dir = r"e:\RECOURSES_APEX_BACKUP\app\backend"
sys.path.append(backend_dir)
load_dotenv(os.path.join(backend_dir, ".env"))

supabase = get_supabase()
if not supabase:
    print("ERRO: Credenciais do Supabase não encontradas!")
    sys.exit(1)

print("Buscando o teste mais recente executado no sistema que possua respostas...")
assessments_resp = supabase.table("assessments").select("*, rh_users(name, email)").order("created_at", desc=True).limit(10).execute()
if not assessments_resp.data:
    print("Nenhum teste encontrado no banco de dados.")
    sys.exit()

assessment_id = None
assessment = None
responses = []

for a in assessments_resp.data:
    a_id = a["id"]
    resp = supabase.table("responses").select("*").eq("assessment_id", a_id).execute()
    if resp.data and len(resp.data) > 0:
        assessment_id = a_id
        assessment = a
        responses = resp.data
        break

if not assessment_id:
    print("Nenhum teste com respostas encontrado nos últimos 10 testes iniciados!")
    sys.exit()

user_info = assessment.get("rh_users", {})
user_name = user_info.get("name", "Candidato Desconhecido")
user_email = user_info.get("email", "Sem Email")

print(f"Teste ID: {assessment_id}")
print(f"Pertence a: {user_name} ({user_email})")
print(f"Foram encontradas {len(responses)} respostas salvas no banco!")

data_dir = os.path.join(backend_dir, "data")
tools = {
    "DISC": "questions_disc.json",
    "MBTI": "questions_mbti.json",
    "BIG_FIVE": "questions_bigfive.json",
    "ANCORAS": "questions_ancoras.json",
    "OPQ": "questions_opq.json",
    "VALORES": "questions_valores.json"
}

questions_map = {}
for tool, filename in tools.items():
    filepath = os.path.join(data_dir, filename)
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            qs = json.load(f)
            for q in qs:
                questions_map[q["id"]] = q

report = f"# Relatório de Auditoria de Respostas - João Robô\n\n"
report += f"**ID do Teste:** {assessment_id}\n"
report += f"**Total de Respostas Capturadas:** {len(responses)}\n\n"

grouped_responses = {}
for r in responses:
    tool = r.get("tool_name")
    if tool not in grouped_responses:
        grouped_responses[tool] = []
    grouped_responses[tool].append(r)

for tool, resps in grouped_responses.items():
    report += f"## Ferramenta: {tool}\n\n"
    for r in resps:
        q_id = r.get("question_id")
        sel_opt = r.get("answer_option") or r.get("selected_option")
        q_data = questions_map.get(str(q_id)) or questions_map.get(q_id)
        
        if q_data:
            q_text = q_data.get("text") or q_data.get("texto") or q_id
            options = q_data.get("options", [])
            
            opt_text = f"Opção {sel_opt}"
            if isinstance(options, list):
                for opt in options:
                    if isinstance(opt, dict):
                        val = opt.get("value") or opt.get("id") or opt.get("letra")
                        if str(val) == str(sel_opt):
                            opt_text = opt.get("label") or opt.get("text") or opt.get("texto") or opt.get("nome") or opt_text
                            break
                    elif isinstance(opt, str):
                        # Caso especial onde opções são array de strings (ex: Ancoras)
                        if str(sel_opt) == "1": opt_text = options[0] if len(options)>0 else "1"
                        elif str(sel_opt) == "2": opt_text = options[1] if len(options)>1 else "2"
                        elif str(sel_opt) == "3": opt_text = options[2] if len(options)>2 else "3"
                        elif str(sel_opt) == "4": opt_text = options[3] if len(options)>3 else "4"
                        elif str(sel_opt) == "5": opt_text = options[4] if len(options)>4 else "5"
                        elif str(sel_opt) == "A": opt_text = options[0] if len(options)>0 else "A"
                        elif str(sel_opt) == "B": opt_text = options[1] if len(options)>1 else "B"
            
            report += f"- **{q_id} ({q_data.get('construct', 'Geral')}):** {q_text}\n"
            report += f"  - **Resposta:** {opt_text}\n"
            report += f"  - **Peso (Matemática):** {r.get('answer_value', 0)}\n\n"
        else:
            report += f"- **{q_id}:** (Texto da pergunta não encontrado)\n"
            report += f"  - **Opção:** {sel_opt} | **Peso:** {r.get('answer_value', 0)}\n\n"
            report += f"  - **Resposta Escolhida:** {sel_opt}\n\n"

output_file = os.path.join(backend_dir, "report_joao.md")
with open(output_file, "w", encoding="utf-8") as f:
    f.write(report)

print(f"\n✅ SUCESSO! O relatório completo contendo todas as perguntas e respostas foi salvo em:\n{output_file}")
