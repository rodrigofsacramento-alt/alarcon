import os
from dotenv import load_dotenv
import supabase
import json

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")

client = supabase.create_client(supabase_url, supabase_key)
assessment_id = "a9ba7a5c-1da8-4834-8b45-79f67a96fdcc"

# Buscar respostas
res = client.table("rh_behavioral_responses").select("*").eq("assessment_id", assessment_id).eq("tool_name", "MBTI").execute()

responses = res.data
print("=== RESPOSTAS MBTI ===")
for r in responses:
    print(r)

# Tentar buscar as perguntas para ver o texto original
questions = client.table("rh_behavioral_questions").select("*").eq("tool_name", "MBTI").execute()
q_map = {str(q['id']): q for q in questions.data}

print("\n=== RESUMO DETALHADO ===")
counts = {"E": 0, "I": 0, "S": 0, "N": 0, "T": 0, "F": 0, "J": 0, "P": 0}

for r in responses:
    q = q_map.get(str(r.get("question_id")), {})
    q_text = q.get("question_text", "Desconhecida")
    ans_val = r.get("answer_option")
    
    # Descobrir o constructo da opção selecionada
    options = q.get("options", [])
    construct = ""
    opt_text = ""
    for opt in options:
        if str(opt.get("value")) == str(ans_val) or str(opt.get("id")) == str(ans_val):
            construct = opt.get("construct", "")
            opt_text = opt.get("label", "")
            
    if construct in counts:
        counts[construct] += 1
        
    print(f"Pergunta: {q_text}")
    print(f"Opção Escolhida: {opt_text} (Construto: {construct})")
    print("-" * 20)

print("\n=== CONTAGEM FINAL ===")
print(json.dumps(counts, indent=2))
