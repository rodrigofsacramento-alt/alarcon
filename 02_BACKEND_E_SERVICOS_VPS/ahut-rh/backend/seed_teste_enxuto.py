import os
import json
from services.db_service import get_supabase
from dotenv import load_dotenv

load_dotenv()

def seed_enxuto():
    supabase = get_supabase()
    data_dir = os.path.join(os.path.dirname(__file__), 'data')
    
    files = [
        ("DISC", "questions_disc.json"),
        ("MBTI", "questions_mbti.json"),
        ("BIG_FIVE", "questions_bigfive.json"),
        ("ANCORAS", "questions_ancoras.json"),
        ("OPQ", "questions_opq.json")
    ]
    
    all_questions = []
    
    # Pegando as 10 primeiras perguntas de cada ferramenta
    for tool_name, filename in files:
        filepath = os.path.join(data_dir, filename)
        if os.path.exists(filepath):
            with open(filepath, 'r', encoding='utf-8') as f:
                questions = json.load(f)
                
                if tool_name == "MBTI":
                    # Pegamos 3 E/I, 3 S/N, 2 T/F, 2 J/P para cobrir todos os eixos no teste enxuto
                    selected = questions[0:3] + questions[20:23] + questions[40:42] + questions[60:62]
                elif tool_name == "BIG_FIVE":
                    # 2 perguntas por fator (Abertura, Consc, Extro, Amab, Neuro)
                    selected = questions[0:2] + questions[7:9] + questions[14:16] + questions[21:23] + questions[28:30]
                elif tool_name == "ANCORAS":
                    # Pega as 8 âncoras (índices 0, 2, 4, 6, 8, 10, 12, 14) + 2 extras (1 e 3)
                    selected = [questions[i] for i in [0, 1, 2, 3, 4, 6, 8, 10, 12, 14] if i < len(questions)]
                elif tool_name == "OPQ":
                    # Salto de 13 em 13 para varrer traços diferentes
                    selected = questions[0:128:13][:10]
                else:
                    selected = questions[:10]
                
                for i, q in enumerate(selected):
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

    print(f"Iniciando inserção de {len(all_questions)} perguntas Enxutas no Supabase...")
    
    # Limpa apenas as tabelas das 5 ferramentas (Preserva a ferramenta VALORES intacta)
    for tool in ["DISC", "MBTI", "BIG_FIVE", "ANCORAS", "OPQ"]:
        try:
            supabase.table("questions").delete().eq("tool_name", tool).execute()
            print(f"Banco limpo para a ferramenta {tool}.")
        except Exception as e:
            print(f"Erro ao limpar tabela para {tool}: {e}")
        
    # Insere as 10 de cada
    try:
        res = supabase.table("questions").insert(all_questions).execute()
        print("Lote de perguntas inserido com sucesso!")
    except Exception as e:
        print(f"Erro ao inserir lote: {e}")

    print("Seeding ENXUTO completo! O banco tem 10 perguntas das 5 ferramentas e as 60 originais de Valores.")

if __name__ == "__main__":
    seed_enxuto()
