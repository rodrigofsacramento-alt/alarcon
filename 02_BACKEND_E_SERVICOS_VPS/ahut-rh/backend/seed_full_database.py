import os
import json
from services.db_service import get_supabase
from dotenv import load_dotenv

load_dotenv()

def seed_all_questions():
    supabase = get_supabase()
    data_dir = os.path.join(os.path.dirname(__file__), 'data')
    
    files = [
        ("DISC", "questions_disc.json"),
        ("MBTI", "questions_mbti.json"),
        ("BIG_FIVE", "questions_bigfive.json"),
        ("ANCORAS", "questions_ancoras.json"),
        ("OPQ", "questions_opq.json"),
        ("VALORES", "questions_valores.json")
    ]
    
    all_questions = []
    
    for tool_name, filename in files:
        filepath = os.path.join(data_dir, filename)
        if os.path.exists(filepath):
            with open(filepath, 'r', encoding='utf-8') as f:
                questions = json.load(f)
                
                # Format to match DB schema
                for i, q in enumerate(questions):
                    # Ensure question_number is set
                    q_num = q.get('question_number') or (i + 1)
                    
                    db_q = {
                        "tool_name": tool_name,
                        "question_number": q_num,
                        "text": q.get('text', ''),
                        "options": q.get('options', None),
                        "construct": q.get('construct', None),
                        "is_inverse": (q.get('scoring') == 'INVERSE')
                    }
                    all_questions.append(db_q)
        else:
            print(f"Aviso: Arquivo não encontrado: {filepath}")

    if not all_questions:
        print("Nenhuma pergunta carregada.")
        return

    print(f"Iniciando inserção de {len(all_questions)} perguntas no Supabase...")
    
    # Clean previous questions
    try:
        supabase.table("questions").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
        print("Tabela 'questions' limpa com sucesso.")
    except Exception as e:
        print(f"Erro ao limpar tabela: {e}")
        pass
        
    # Insert in batches to avoid payload too large
    batch_size = 50
    for i in range(0, len(all_questions), batch_size):
        batch = all_questions[i:i+batch_size]
        try:
            res = supabase.table("questions").insert(batch).execute()
            print(f"Inserido lote {i//batch_size + 1} ({len(batch)} perguntas)")
        except Exception as e:
            print(f"Erro ao inserir lote {i//batch_size + 1}: {e}")

    print("Seeding completo!")

if __name__ == "__main__":
    seed_all_questions()
