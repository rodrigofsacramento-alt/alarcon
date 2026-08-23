import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))
from services.db_service import get_supabase
from services.assessment_service import AssessmentService
from services.calculation_service import CalculationService

supabase = get_supabase()

res = supabase.table('responses').select('assessment_id').execute()
assessment_ids = list(set(r['assessment_id'] for r in res.data if r.get('assessment_id')))

print(f'Encontrados {len(assessment_ids)} testes para recalcular com o motor atualizado!')

for aid in assessment_ids:
    responses = AssessmentService.get_responses(aid)
    if not responses:
        continue
    
    calc_result = CalculationService.calculate_all(aid, responses)
    
    existing = supabase.table('results').select('id').eq('assessment_id', aid).execute()
    if existing.data:
        supabase.table('results').update(calc_result).eq('assessment_id', aid).execute()
    else:
        supabase.table('results').insert(calc_result).execute()
    
    mbti = calc_result.get('mbti_type')
    disc = f"D={calc_result.get('disc_d'):.0f} I={calc_result.get('disc_i'):.0f} S={calc_result.get('disc_s'):.0f} C={calc_result.get('disc_c'):.0f}"
    big5 = calc_result.get('big_five_openness')
    opq_len = len([k for k, v in (calc_result.get('opq_scores') or {}).items() if v > 0])
    
    print(f"OK Teste {aid[:8]}: MBTI={mbti} | DISC={disc} | BigFive(O)={big5}% | OPQ Preenchidos={opq_len}")

print('\nRECALCULO DE TODOS OS TESTES CONCLUIDO COM SUCESSO!')
