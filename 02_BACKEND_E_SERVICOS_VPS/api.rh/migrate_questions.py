import os
import json
import logging
from services.db_service import get_supabase

logging.basicConfig(level=logging.INFO)

DB_FILE = os.path.join(os.path.dirname(__file__), 'local_db.json')

def run_migration():
    if not os.path.exists(DB_FILE):
        logging.error(f"local_db.json not found at {DB_FILE}")
        return
        
    with open(DB_FILE, 'r', encoding='utf-8') as f:
        db = json.load(f)
        
    questions = db.get('questions', [])
    if not questions:
        logging.info("No questions to migrate.")
        return
        
    supabase = get_supabase()
    
    logging.info(f"Found {len(questions)} questions to migrate.")
    
    # We migrate them in batches of 100
    batch_size = 100
    for i in range(0, len(questions), batch_size):
        batch = questions[i:i+batch_size]
        
        # Prepare the data for supabase (ensure id is there, maybe remap options)
        clean_batch = []
        for q in batch:
            clean_q = {
                "id": q.get("id"),
                "test_id": q.get("test_id", ""),
                "tool_name": q.get("tool_name", ""),
                "group_id": q.get("group_id"),
                "construct": q.get("construct"),
                "text": q.get("text", ""),
                "options": q.get("options", [])
            }
            clean_batch.append(clean_q)
            
        try:
            response = supabase.table('rh_questions').upsert(clean_batch).execute()
            logging.info(f"Migrated batch {i} to {i+len(batch)}")
        except Exception as e:
            logging.error(f"Error migrating batch: {e}")
            
    logging.info("Migration complete!")

if __name__ == "__main__":
    run_migration()
