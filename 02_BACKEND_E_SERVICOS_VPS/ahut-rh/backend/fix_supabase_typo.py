import os
from supabase import create_client

def fix_mbti_typo():
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY")
    
    if not url or not key:
        print("Erro: SUPABASE_URL ou SUPABASE_KEY não definidos no ambiente (arquivo .env).")
        return
        
    try:
        supabase = create_client(url, key)
        
        # Buscar a pergunta 10 do MBTI
        response = supabase.table("questions").select("*").eq("tool_name", "MBTI").eq("question_number", 10).execute()
        
        if not response.data:
            print("Pergunta 10 do MBTI não encontrada no banco.")
            return
            
        q = response.data[0]
        options = q.get("options", [])
        updated = False
        
        for opt in options:
            if "ENTJ" in str(opt.get("text", "")):
                print(f"Encontrado typo na opção: {opt['text']}")
                opt["text"] = "Costumo ser mais casual e menos formal"
                updated = True
                
            if "ENTJ" in str(opt.get("label", "")):
                print(f"Encontrado typo na label: {opt['label']}")
                opt["label"] = "Costumo ser mais casual e menos formal"
                updated = True
                
        if updated:
            print("Corrigindo banco de dados...")
            supabase.table("questions").update({"options": options}).eq("id", q["id"]).execute()
            print("✅ Correção aplicada com sucesso no Supabase!")
        else:
            print("Nenhum typo encontrado nas opções. Já estava corrigido!")
            
    except Exception as e:
        print(f"Erro ao conectar ou atualizar: {e}")

if __name__ == "__main__":
    fix_mbti_typo()
