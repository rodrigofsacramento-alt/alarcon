import json
import os

filepath = r"e:\RECOURSES_APEX_BACKUP\app\backend\data\questions_mbti.json"

with open(filepath, 'r', encoding='utf-8') as f:
    questions = json.load(f)

for q in questions:
    q_num = q.get("number", 0)
    
    # Determine which construct maps to A and B
    if 1 <= q_num <= 20:
        c_a, c_b = "E", "I"
    elif 21 <= q_num <= 40:
        c_a, c_b = "S", "N"
    elif 41 <= q_num <= 60:
        c_a, c_b = "T", "F"
    elif 61 <= q_num <= 80:
        c_a, c_b = "J", "P"
    else:
        continue # Should not happen
        
    for opt in q.get("options", []):
        if opt.get("id") == "A":
            opt["construct"] = c_a
        elif opt.get("id") == "B":
            opt["construct"] = c_b

with open(filepath, 'w', encoding='utf-8') as f:
    json.dump(questions, f, ensure_ascii=False, indent=2)

print("MBTI JSON corrigido com sucesso!")
