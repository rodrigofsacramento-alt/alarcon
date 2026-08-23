import os
import re
from services.db_service import get_supabase
from dotenv import load_dotenv

load_dotenv()

def update_valores_db():
    supabase = get_supabase()
    
    inputPath = r"e:\RECOURSES_APEX_BACKUP\docs necessarios\VALORES - QUESTIONÁRIO COMPLETO MAPEADO.md"
    
    with open(inputPath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    questions = []
    current_q = None
    q_num = 1
    
    for line in lines:
        line = line.strip()
        if line.startswith("### P"):
            if current_q:
                questions.append(current_q)
            current_q = {
                "tool_name": "VALORES",
                "question_number": q_num,
                "options": [],
                "text": ""
            }
            q_num += 1
            
        if current_q:
            if line.startswith("Pergunta:"):
                current_q["text"] = line.replace("Pergunta:", "").strip()
            elif re.match(r'^\|\s*([A-D])\s*\|\s*(.*?)\s*\|$', line):
                match = re.match(r'^\|\s*([A-D])\s*\|\s*(.*?)\s*\|$', line)
                val = match.group(1).strip()
                text = match.group(2).strip()
                
                # Extrair o construct da tag gerada
                construct_match = re.search(r'\*\*\(Gera:\s*(.*?)\)\*\*', text)
                construct = construct_match.group(1).strip() if construct_match else val
                
                # Limpar o texto para salvar no banco (para exibir limpo no frontend)
                clean_text = re.sub(r'\*\*\(Gera:\s*.*?\)\*\*', '', text).strip()
                
                current_q["options"].append({
                    "label": clean_text,
                    "value": val,
                    "construct": construct
                })

    if current_q:
        questions.append(current_q)
        
    print(f"Total de {len(questions)} perguntas processadas do Markdown mapeado.")
    print("Iniciando UPDATE no Supabase preservando os IDs originais...")
    
    # Atualizar o banco de dados fazendo UPDATE por question_number
    success_count = 0
    for q in questions:
        q_num = q["question_number"]
        try:
            # Fazemos um update apenas nas options e no text
            res = supabase.table("questions").update({
                "options": q["options"],
                "text": q["text"]
            }).eq("tool_name", "VALORES").eq("question_number", q_num).execute()
            
            # Se não afetou nenhuma linha, talvez ela não exista e precise ser inserida
            if not res.data:
                supabase.table("questions").insert({
                    "tool_name": "VALORES",
                    "question_number": q_num,
                    "text": q["text"],
                    "options": q["options"]
                }).execute()
                print(f"P{q_num} não encontrada -> INSERIDA com sucesso.")
            else:
                print(f"P{q_num} ATUALIZADA com sucesso.")
                
            success_count += 1
        except Exception as e:
            print(f"Erro ao atualizar/inserir P{q_num}: {e}")
            
    print(f"\nFinalizado! {success_count} perguntas consolidadas no banco de dados.")

if __name__ == "__main__":
    update_valores_db()
