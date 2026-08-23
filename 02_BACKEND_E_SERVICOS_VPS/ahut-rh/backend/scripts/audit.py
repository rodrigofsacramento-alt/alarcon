import os
import json

def audit():
    data_dir = r"e:\RECOURSES_APEX_BACKUP\app\backend\data"
    files = [
        "questions_disc.json",
        "questions_mbti.json",
        "questions_bigfive.json",
        "questions_ancoras.json",
        "questions_opq.json",
        "questions_valores.json"
    ]
    
    missing_value_errors = []
    
    for filename in files:
        filepath = os.path.join(data_dir, filename)
        if not os.path.exists(filepath):
            continue
            
        with open(filepath, 'r', encoding='utf-8') as f:
            questions = json.load(f)
            for q in questions:
                options = q.get('options', [])
                for o in options:
                    val = o.get('value')
                    if val is None or val == "":
                        missing_value_errors.append(f"Ferramenta: {filename} | Pergunta: {q.get('question_number', q.get('number', q.get('id')))} | Opção: {o.get('text')}")
    
    print(f"ENCONTRADOS {len(missing_value_errors)} ERROS DE PESO NUMERICO:")
    for err in missing_value_errors[:50]:
        print(err)

if __name__ == "__main__":
    audit()
