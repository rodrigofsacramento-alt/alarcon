import os
import sys

sys.path.append(r"e:\RECOURSES_APEX_BACKUP\app\backend")

from supabase import create_client
from services.calculation_service import CalculationService

def force_recalculate(assessment_id):
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY")
    
    if not url or not key:
        print("Erro: SUPABASE_URL ou SUPABASE_KEY não configurados. Execute o script no terminal onde eles estão exportados ou com python-dotenv.")
        return
        
    try:
        supabase = create_client(url, key)
        
        print(f"Buscando respostas para {assessment_id}...")
        resp = supabase.table("rh_responses").select("*").eq("assessment_id", assessment_id).execute()
        responses = resp.data
        
        if not responses:
            print("Nenhuma resposta encontrada para este assessment.")
            return
            
        print(f"Encontradas {len(responses)} respostas. Recalculando...")
        
        # O calculate_all original usa `CalculationService.calculate_all(assessment_id, responses)`
        # Mas vamos verificar como ele é chamado no backend
        new_result = CalculationService.calculate_all(assessment_id, responses)
        
        # Remove a chave 'metadata' temporariamente se causar erro, ou formata
        old_res = supabase.table("rh_results").select("id").eq("assessment_id", assessment_id).execute()
        if old_res.data:
            result_id = old_res.data[0]["id"]
            new_result["id"] = result_id
            
            # Precisamos converter o dict do OPQ para JSON
            supabase.table("rh_results").update(new_result).eq("id", result_id).execute()
            print("✅ Resultado recalculado e ATUALIZADO no banco de dados com sucesso!")
        else:
            supabase.table("rh_results").insert(new_result).execute()
            print("✅ Resultado recalculado e INSERIDO no banco de dados com sucesso!")
            
    except Exception as e:
        print(f"Erro ao recalcular: {e}")

if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv(r"e:\RECOURSES_APEX_BACKUP\app\backend\.env")
    force_recalculate("49c5f567-6cc3-4c70-bcff-f3e4aade22e2")
