import os
import json

def generate_report():
    data_dir = r"e:\RECOURSES_APEX_BACKUP\app\backend\data"
    output_path = r"C:\Users\Filom\.gemini\antigravity-ide\brain\b4ecfef3-2fa7-43a0-94f0-a57b1c0075bf\perguntas_teste_enxuto.md"
    
    files = [
        ("DISC", "questions_disc.json"),
        ("MBTI", "questions_mbti.json"),
        ("BIG_FIVE", "questions_bigfive.json"),
        ("ANCORAS", "questions_ancoras.json"),
        ("OPQ", "questions_opq.json"),
        ("VALORES", "questions_valores.json")
    ]
    
    with open(output_path, 'w', encoding='utf-8') as out:
        out.write("# 📋 Perguntas do Teste Enxuto (10 por Ferramenta)\n\n")
        out.write("Este documento lista as 10 perguntas selecionadas para o Teste Enxuto de cada ferramenta, junto com suas opções e o construto que cada opção pontua.\n\n")
        
        for tool_name, filename in files:
            filepath = os.path.join(data_dir, filename)
            if not os.path.exists(filepath):
                out.write(f"## 🔧 {tool_name}\n\n*Arquivo não encontrado*\n\n")
                continue
                
            out.write(f"## 🔧 {tool_name}\n\n")
            
            with open(filepath, 'r', encoding='utf-8') as f:
                questions = json.load(f)[:10]
                
                for idx, q in enumerate(questions):
                    out.write(f"**Pergunta {idx + 1}:** {q.get('text', '')}\n")
                    
                    # Construto base da pergunta (usado no Big Five, OPQ, Ancoras)
                    q_construct = q.get('construct')
                    if q_construct and tool_name not in ["DISC", "MBTI", "VALORES"]:
                        out.write(f"> *Construto da Pergunta:* {q_construct}\n")
                        
                    out.write("\n*Opções:*\n")
                    
                    options = q.get('options', [])
                    for o in options:
                        opt_text = o.get('text', '')
                        # O construto pode estar na opção (DISC, MBTI) ou na pergunta (Big Five, OPQ)
                        opt_construct = o.get('construct') or q_construct or "N/A"
                        
                        out.write(f"- {opt_text} *(Construto: {opt_construct})*\n")
                        
                    out.write("\n---\n\n")

if __name__ == "__main__":
    generate_report()
