import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))
from services.db_service import get_supabase
from services.assessment_service import AssessmentService
from services.calculation_service import CalculationService
from collections import Counter

assessment_id = '278e443f-921a-40ca-9549-737ae9315544'
responses = AssessmentService.get_responses(assessment_id)
print('Responses per tool:')
by_tool = Counter(r.get('tool_name') for r in responses)
for k, v in sorted(by_tool.items()):
    print('  ' + k + ': ' + str(v))

result = CalculationService.calculate_all(assessment_id, responses)

print()
print('=== DISC (formula: letra / total_disc * 100) ===')
print('  D=' + str(round(result['disc_d'],1)) + '%  I=' + str(round(result['disc_i'],1)) + '%  S=' + str(round(result['disc_s'],1)) + '%  C=' + str(round(result['disc_c'],1)) + '%  Primary=' + str(result['disc_primary']))

print()
print('=== MBTI (formula: conta letras E,I,S,N,T,F,J,P por construto) ===')
mc = result['metadata']['mbti_counts']
print('  E=' + str(mc['E']) + ' I=' + str(mc['I']) + ' | S=' + str(mc['S']) + ' N=' + str(mc['N']) + ' | T=' + str(mc['T']) + ' F=' + str(mc['F']) + ' | J=' + str(mc['J']) + ' P=' + str(mc['P']))
print('  Type=' + str(result['mbti_type']))

print()
print('=== BIG FIVE (formula: soma_pesos / count*3 * 100) ===')
print('  Abertura(O)=' + str(result['big_five_openness']) + '%')
print('  Conscienciosidade(C)=' + str(result['big_five_conscientiousness']) + '%')
print('  Extroversao(E)=' + str(result['big_five_extraversion']) + '%')
print('  Amabilidade(A)=' + str(result['big_five_agreeableness']) + '%')
print('  Neuroticismo(N)=' + str(result['big_five_neuroticism']) + '%')

print()
print('=== OPQ top 5 (formula: soma_pesos / count*3 * 100) ===')
opq = result['opq_scores']
top5 = sorted(opq.items(), key=lambda x: x[1], reverse=True)[:5]
for k, v in top5:
    print('  ' + k + ': ' + str(round(v, 1)) + '%')

print()
print('=== ANCORAS (formula: A=1pt, B=0pt por trade-off) ===')
print('  Tecnica=' + str(result['ancoras_tecnica']) + '%  Gerencial=' + str(result['ancoras_gerencial']) + '%  Autonomia=' + str(result['ancoras_autonomia']) + '%')

print()
print('=== VALORES (formula: votos_subconstruto / total_questoes * 100) ===')
print('  Abertura=' + str(result['valores_abertura']) + '%  Conservacao=' + str(result['valores_conservacao']) + '%  Autopromocao=' + str(result['valores_autopromoacao']) + '%  Autotranscendencia=' + str(result['valores_autotranscendencia']) + '%')

supabase = get_supabase()
existing = supabase.table('results').select('id').eq('assessment_id', assessment_id).execute()
if existing.data:
    supabase.table('results').update(result).eq('assessment_id', assessment_id).execute()
else:
    supabase.table('results').insert(result).execute()

print()
print('ALL RESULTS SAVED TO DB!')
