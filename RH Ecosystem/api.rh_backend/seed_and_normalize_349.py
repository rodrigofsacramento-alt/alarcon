import os
import json
from services.db_service import get_supabase
from dotenv import load_dotenv

load_dotenv()

def normalize_options(tool_name, raw_options, text=""):
    """
    Garante que todas as opções estejam padronizadas no formato:
    [{ "value": "A", "label": "Texto da Opção", "construct": "D" }]
    """
    if raw_options and isinstance(raw_options, list) and len(raw_options) > 0:
        normalized = []
        for idx, opt in enumerate(raw_options):
            if isinstance(opt, dict):
                val = opt.get("value") or opt.get("id") or str(idx + 1)
                lbl = opt.get("label") or opt.get("text") or f"Opção {val}"
                const = opt.get("construct") or None
                normalized.append({
                    "value": str(val),
                    "label": str(lbl),
                    "construct": const
                })
            else:
                normalized.append({
                    "value": str(idx + 1),
                    "label": str(opt),
                    "construct": None
                })
        return normalized

    # Fallbacks baseados na ferramenta se options estiver vazio
    if tool_name == "BIG_FIVE":
        return [
            {"value": "0", "label": "0 - Discordo Totalmente"},
            {"value": "1", "label": "1 - Discordo Parcialmente"},
            {"value": "2", "label": "2 - Concordo Parcialmente"},
            {"value": "3", "label": "3 - Concordo Totalmente"}
        ]
    elif tool_name == "ANCORAS":
        return [
            {"value": "1", "label": "1 - Nunca é verdade para mim"},
            {"value": "2", "label": "2 - Raramente é verdade para mim"},
            {"value": "3", "label": "3 - Às vezes é verdade para mim"},
            {"value": "4", "label": "4 - Frequentemente é verdade para mim"},
            {"value": "5", "label": "5 - Sempre é verdade para mim"}
        ]
    elif tool_name == "OPQ":
        return [
            {"value": "1", "label": "1 - Discordo Fortemente"},
            {"value": "2", "label": "2 - Discordo"},
            {"value": "3", "label": "3 - Neutro"},
            {"value": "4", "label": "4 - Concordo"},
            {"value": "5", "label": "5 - Concordo Fortemente"}
        ]
    elif tool_name == "VALORES":
        return [{"value": str(i), "label": str(i)} for i in range(11)]
    elif tool_name == "DISC":
        return [
            {"value": "A", "label": "Opção A", "construct": "D"},
            {"value": "B", "label": "Opção B", "construct": "I"},
            {"value": "C", "label": "Opção C", "construct": "S"},
            {"value": "D", "label": "Opção D", "construct": "C"}
        ]
    elif tool_name == "MBTI":
        return [
            {"value": "A", "label": "Opção A", "construct": "E"},
            {"value": "B", "label": "Opção B", "construct": "I"}
        ]
    
    return []

def run_seeder():
    print("Iniciando processo de normalização e carga das 349 perguntas...")
    supabase = get_supabase()
    data_dir = os.path.join(os.path.dirname(__file__), 'data')
    
    files = [
        ("DISC", "questions_disc.json", 30),
        ("MBTI", "questions_mbti.json", 80),
        ("BIG_FIVE", "questions_bigfive.json", 35),
        ("ANCORAS", "questions_ancoras.json", 16),
        ("OPQ", "questions_opq.json", 128),
        ("VALORES", "questions_valores.json", 60)
    ]
    
    all_questions = []
    
    for tool_name, filename, expected_count in files:
        filepath = os.path.join(data_dir, filename)
        if os.path.exists(filepath):
            with open(filepath, 'r', encoding='utf-8') as f:
                questions = json.load(f)
                print(f"Lendo {filename}: {len(questions)} perguntas encontradas.")
                
                for i, q in enumerate(questions):
                    q_num = q.get('number') or q.get('question_number') or (i + 1)
                    q_text = q.get('text', '')
                    raw_opts = q.get('options')
                    norm_opts = normalize_options(tool_name, raw_opts, q_text)
                    
                    db_q = {
                        "tool_name": tool_name,
                        "question_number": int(q_num),
                        "text": q_text,
                        "options": norm_opts,
                        "construct": q.get('construct', None),
                        "is_inverse": q.get('reverse_coded', False)
                    }
                    all_questions.append(db_q)
        else:
            print(f"ERRO CRÍTICO: Arquivo não encontrado -> {filepath}")

    total_loaded = len(all_questions)
    print(f"\nTotal de perguntas processadas e normalizadas: {total_loaded} (Esperado: 349)")
    
    if total_loaded != 349:
        print(f"AVISO: O total ({total_loaded}) difere do esperado (349).")

    # Limpar perguntas existentes no Supabase
    try:
        print("Limpando registros antigos da tabela 'questions' no Supabase...")
        supabase.table("questions").delete().neq("question_number", -1).execute()
        print("Tabela 'questions' limpa com sucesso.")
    except Exception as e:
        print(f"Erro ao limpar tabela: {e}")

    # Inserir em lotes de 50 para evitar estouro de payload
    batch_size = 50
    inserted_count = 0
    for i in range(0, len(all_questions), batch_size):
        batch = all_questions[i:i+batch_size]
        try:
            res = supabase.table("questions").insert(batch).execute()
            inserted_count += len(batch)
            print(f"✓ Inserido lote {i//batch_size + 1}: +{len(batch)} perguntas (Total até agora: {inserted_count})")
        except Exception as e:
            print(f"❌ Erro ao inserir lote {i//batch_size + 1}: {e}")

    print(f"\n==============================================")
    print(f"SUCESSO: {inserted_count} perguntas inseridas no Supabase com sucesso!")
    print(f"==============================================")

if __name__ == '__main__':
    run_seeder()
