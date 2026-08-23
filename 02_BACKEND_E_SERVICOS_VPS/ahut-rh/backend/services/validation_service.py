class ValidationService:
    @staticmethod
    def check_fraud(responses: list) -> dict:
        flags = []
        confidence = 100.0
        
        if not responses:
            return {"confidence_score": 0.0, "validation_status": "INVALID", "flags": ["NO_DATA"]}

        # 1. Detecção de padrão automático (mesma resposta em tudo)
        # Check if more than 80% of answers are identical
        answer_counts = {}
        for r in responses:
            val = r.get("answer_value")
            answer_counts[val] = answer_counts.get(val, 0) + 1
            
        max_same_answer = max(answer_counts.values()) if answer_counts else 0
        if max_same_answer / len(responses) > 0.8:
            flags.append("PADRAO_REPETITIVO")
            confidence -= 40.0
            
        # 2. Detecção de tempo muito rápido (< 5 segundos por pergunta em média)
        times = [r.get("response_time", 10) for r in responses]
        avg_time = sum(times) / len(times) if times else 10
        if avg_time < 5.0:
            flags.append("RESPOSTAS_MUITO_RAPIDAS")
            confidence -= 30.0
            
        # 3. Detecção de inconsistência em itens inversos (stub)
        # Assuming we check difference between direct and inverse items of the same construct
        # If difference is too high, subtract confidence
        
        status = "VALID"
        if confidence < 70.0:
            status = "SUSPECT"
        if confidence < 40.0:
            status = "FRAUD_POTENTIAL"

        return {
            "confidence_score": max(0.0, confidence),
            "validation_status": status,
            "flags": flags
        }
        
    @staticmethod
    def cross_validate(results: dict) -> list:
        # Stub for cross validation across tools
        return []
