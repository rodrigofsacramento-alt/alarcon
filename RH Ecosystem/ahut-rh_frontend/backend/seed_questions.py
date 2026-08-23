import os
import json
from services.db_service import get_supabase
from dotenv import load_dotenv

load_dotenv()

def seed_questions():
    supabase = get_supabase()
    
    # 3 Questions per tool for the short test model
    questions_data = [
        # DISC (3 questions)
        { "tool_name": "DISC", "question_number": 1, "text": "Em um novo projeto com prazo apertado, minha primeira reação é:", "options": [{"label": "Assumir a liderança rapidamente.", "value": "A", "construct": "D"}, {"label": "Motivar a equipe.", "value": "B", "construct": "I"}, {"label": "Criar um cronograma seguro.", "value": "C", "construct": "S"}, {"label": "Analisar todos os riscos.", "value": "D", "construct": "C"}], "construct": None, "is_inverse": False },
        { "tool_name": "DISC", "question_number": 2, "text": "Quando enfrento um conflito na equipe:", "options": [{"label": "Enfrento diretamente o problema.", "value": "A", "construct": "D"}, {"label": "Tento amenizar a situação com humor.", "value": "B", "construct": "I"}, {"label": "Busco um consenso pacífico.", "value": "C", "construct": "S"}, {"label": "Recorro às regras e fatos lógicos.", "value": "D", "construct": "C"}], "construct": None, "is_inverse": False },
        { "tool_name": "DISC", "question_number": 3, "text": "Ao receber uma nova tarefa complexa:", "options": [{"label": "Foco no resultado final imediatamente.", "value": "A", "construct": "D"}, {"label": "Procuro alguém para fazer junto.", "value": "B", "construct": "I"}, {"label": "Peço instruções claras e passo a passo.", "value": "C", "construct": "S"}, {"label": "Pesquiso todas as informações antes de agir.", "value": "D", "construct": "C"}], "construct": None, "is_inverse": False },

        # MBTI (3 questions)
        { "tool_name": "MBTI", "question_number": 1, "text": "Em festas ou eventos sociais, eu geralmente:", "options": [{"label": "Converso com muitas pessoas e ganho energia.", "value": "A", "construct": "E"}, {"label": "Prefiro conversas profundas com poucos amigos.", "value": "B", "construct": "I"}], "construct": "E_I", "is_inverse": False },
        { "tool_name": "MBTI", "question_number": 2, "text": "Ao processar informações, eu prefiro:", "options": [{"label": "Fatos concretos, detalhes e o que é real agora.", "value": "A", "construct": "S"}, {"label": "Padrões, possibilidades e o quadro geral.", "value": "B", "construct": "N"}], "construct": "S_N", "is_inverse": False },
        { "tool_name": "MBTI", "question_number": 3, "text": "Ao tomar decisões importantes, eu:", "options": [{"label": "Uso a lógica e a razão objetiva.", "value": "A", "construct": "T"}, {"label": "Considero os valores e como afetará as pessoas.", "value": "B", "construct": "F"}], "construct": "T_F", "is_inverse": False },

        # BIG FIVE (3 questions, Likert scale expected in frontend)
        { "tool_name": "BIG_FIVE", "question_number": 1, "text": "Eu me considero uma pessoa muito criativa e aberta a novas ideias.", "options": None, "construct": "O", "is_inverse": False },
        { "tool_name": "BIG_FIVE", "question_number": 2, "text": "Sou altamente organizado e sempre cumpro meus prazos rigorosamente.", "options": None, "construct": "C", "is_inverse": False },
        { "tool_name": "BIG_FIVE", "question_number": 3, "text": "Costumo ficar ansioso e preocupado facilmente sob pressão.", "options": None, "construct": "N", "is_inverse": False },

        # ANCORAS (3 questions, Likert or Yes/No)
        { "tool_name": "ANCORAS", "question_number": 1, "text": "Sonho em iniciar e construir meu próprio negócio desde o zero.", "options": [{"label": "Discordo Totalmente", "value": "1", "construct": "criatividade"}, {"label": "Concordo Totalmente", "value": "5", "construct": "criatividade"}], "construct": "criatividade", "is_inverse": False },
        { "tool_name": "ANCORAS", "question_number": 2, "text": "Para mim, estabilidade no emprego é mais importante que um salário alto.", "options": [{"label": "Discordo Totalmente", "value": "1", "construct": "seguranca"}, {"label": "Concordo Totalmente", "value": "5", "construct": "seguranca"}], "construct": "seguranca", "is_inverse": False },
        { "tool_name": "ANCORAS", "question_number": 3, "text": "Prefiro ter liberdade total para decidir como e quando trabalhar.", "options": [{"label": "Discordo Totalmente", "value": "1", "construct": "autonomia"}, {"label": "Concordo Totalmente", "value": "5", "construct": "autonomia"}], "construct": "autonomia", "is_inverse": False },

        # OPQ (3 questions)
        { "tool_name": "OPQ", "question_number": 1, "text": "Gosto de tomar o controle e assumir a responsabilidade pelas decisões.", "options": None, "construct": "lideranca", "is_inverse": False },
        { "tool_name": "OPQ", "question_number": 2, "text": "Gero muitas ideias inovadoras durante reuniões estratégicas.", "options": None, "construct": "inovacao", "is_inverse": False },
        { "tool_name": "OPQ", "question_number": 3, "text": "Sou altamente analítico com dados numéricos.", "options": None, "construct": "analise", "is_inverse": False },

        # VALORES (3 questions)
        { "tool_name": "VALORES", "question_number": 1, "text": "O quanto você valoriza: Ter poder e influência sobre outras pessoas.", "options": None, "construct": "autopromocao", "is_inverse": False },
        { "tool_name": "VALORES", "question_number": 2, "text": "O quanto você valoriza: Ajudar a comunidade e promover bem-estar social.", "options": None, "construct": "autotranscendencia", "is_inverse": False },
        { "tool_name": "VALORES", "question_number": 3, "text": "O quanto você valoriza: Tradição e respeito aos costumes.", "options": None, "construct": "conservacao", "is_inverse": False }
    ]
    
    print("Iniciando inserção no Supabase (Tabela 'questions')...")
    # Clean previous questions first if needed (optional, just inserting new ones here)
    try:
        supabase.table("questions").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
    except:
        pass
        
    for q in questions_data:
        try:
            res = supabase.table("questions").insert(q).execute()
            print(f"Inserido: {q['tool_name']} Q{q['question_number']}")
        except Exception as e:
            print(f"Erro ao inserir {q['tool_name']} Q{q['question_number']}: {e}")

    print("Seeding de Teste Curto concluído!")

if __name__ == "__main__":
    seed_questions()
