import json
import uuid
from services.calculation_service import CalculationService
from services.db_service import get_supabase

def test_full_calculation():
    supabase = get_supabase()
    questions = supabase.table("questions").select("*").execute().data
    print(f"Loaded {len(questions)} questions from DB.")

    responses = []
    for q in questions:
        # Mock a valid response
        ans = {
            "question_id": q['id'],
            "tool_name": q['tool_name'],
            "answer_value": "1",  # just a dummy numeric string
            "answer_option": "A", # dummy letter
            "user_id": "test-user-123",
            "assessment_id": "test-assessment-456"
        }
        
        # Give a random option if available
        if q.get("options") and len(q["options"]) > 0:
            ans["answer_option"] = str(q["options"][0].get("id") or q["options"][0].get("value"))
        
        responses.append(ans)
    
    print(f"Generated {len(responses)} mock responses. Running calculation...")
    
    try:
        results = CalculationService.calculate_all("test-assessment-456", responses)
        print("Calculation SUCCESS!")
        print("Keys:", results.keys())
        print("DISC:", results['disc'])
        print("MBTI:", results['mbti'])
        print("BIG FIVE:", results['big_five'])
        print("ANCORAS:", results['ancoras'])
        print("OPQ:", results['opq_scores'])
        print("VALORES:", results['valores'])
        
    except Exception as e:
        print(f"Calculation FAILED: {e}")

if __name__ == "__main__":
    test_full_calculation()
