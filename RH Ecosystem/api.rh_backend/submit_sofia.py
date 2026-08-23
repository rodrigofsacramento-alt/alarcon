import requests
import json
import random

BASE_URL = "http://localhost:8000"
ASSESSMENT_ID = "test_assessment_123"
USER_ID = "test_user"

def run_sofia_test():
    print("Fetching all questions from backend...")
    
    # We can fetch directly from DB to be faster since we know they are in local_db.json
    try:
        with open("local_db.json", "r", encoding="utf-8") as f:
            db = json.load(f)
            questions = db.get("questions", [])
    except Exception as e:
        print("Failed to load local_db.json", e)
        return

    print(f"Loaded {len(questions)} questions.")

    responses = []
    
    # Clear previous responses for this assessment in DB
    db["responses"] = [r for r in db.get("responses", []) if r.get("assessment_id") != ASSESSMENT_ID]
    
    print("Generating Sofia Gusman's answers...")
    for q in questions:
        tool = q.get("tool_name")
        q_id = q.get("id")
        options = q.get("options") or []
        construct = str(q.get("construct") or "").upper()
        
        answer_val = "1"
        answer_opt = "A"
        
        if tool == "DISC":
            # Sofia: High C (Option D) and High D (Option A)
            if random.random() > 0.5:
                # Prefer C
                matched = next((o for o in options if o.get("construct") == "C"), options[-1] if options else None)
                if matched: answer_opt = str(matched.get("value") or matched.get("id"))
            else:
                # Prefer D
                matched = next((o for o in options if o.get("construct") == "D"), options[0] if options else None)
                if matched: answer_opt = str(matched.get("value") or matched.get("id"))

        elif tool == "MBTI":
            # INTJ
            preferred = ["I", "N", "T", "J"]
            matched = next((o for o in options if o.get("construct") in preferred), options[0] if options else None)
            if matched:
                answer_opt = str(matched.get("value") or matched.get("id"))

        elif tool == "BIG_FIVE":
            # High O, C; Low E; moderate A, N
            if "O" in construct or "ABERTURA" in construct:
                answer_val = "3" # Max
            elif "C" in construct or "CONSCI" in construct:
                answer_val = "3"
            elif "E" in construct or "EXTRO" in construct:
                answer_val = "0"
            else:
                answer_val = str(random.choice([1, 2]))

        elif tool == "ANCORAS":
            c_low = construct.lower()
            if "tecnica" in c_low or "autonomia" in c_low or "desafio" in c_low:
                answer_val = "5"
            else:
                answer_val = str(random.choice([1, 2, 3]))

        elif tool == "OPQ":
            c_low = construct.lower()
            high_traits = ["analtico", "inovador", "orientado a detalhes", "orientado a estrutura"]
            if any(t in c_low for t in high_traits):
                answer_val = "3"
            else:
                answer_val = str(random.choice([0, 1, 2]))
                
        elif tool == "VALORES":
            c_low = construct.lower()
            if "autotranscendencia" in c_low or "abertura" in c_low:
                answer_val = "1"
            else:
                answer_val = str(random.choice([0, 1]))

        if options and tool != "DISC" and tool != "MBTI":
            # Just grab first option if forced to
            answer_opt = str(options[-1].get("value") or options[-1].get("id"))
            
        responses.append({
            "id": f"resp_{q_id}",
            "assessment_id": ASSESSMENT_ID,
            "user_id": USER_ID,
            "tool_name": tool,
            "question_id": q_id,
            "answer_value": answer_val,
            "answer_option": answer_opt,
            "construct": q.get("construct")
        })

    db["responses"].extend(responses)
    
    with open("local_db.json", "w", encoding="utf-8") as f:
        json.dump(db, f, indent=2)
        
    print(f"Saved {len(responses)} responses directly to local_db.json.")

    print("Requesting calculation from backend...")
    res = requests.post(f"{BASE_URL}/results/{ASSESSMENT_ID}/calculate")
    if res.status_code == 200:
        print("Calculation complete! Sofia Gusman's profile is ready.")
    else:
        print(f"Failed to calculate: {res.status_code} {res.text}")

if __name__ == "__main__":
    run_sofia_test()
