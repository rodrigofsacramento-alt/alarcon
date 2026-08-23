class CalculationService:
    @staticmethod
    def calculate_disc(responses: list) -> dict:
        counts = {"D": 0, "I": 0, "S": 0, "C": 0}
        for r in responses:
            c = r.get("construct", "")
            if c in counts:
                counts[c] += 1
                
        total = sum(counts.values()) or 1
        d_score = (counts["D"] / total) * 100
        i_score = (counts["I"] / total) * 100
        s_score = (counts["S"] / total) * 100
        c_score = (counts["C"] / total) * 100
        
        scores_map = {"D": d_score, "I": i_score, "S": s_score, "C": c_score}
        sorted_scores = sorted(scores_map.items(), key=lambda x: x[1], reverse=True)
        
        return {
            "d": d_score,
            "i": i_score,
            "s": s_score,
            "c": c_score,
            "D": d_score,
            "I": i_score,
            "S": s_score,
            "C": c_score,
            "primary": sorted_scores[0][0] if sorted_scores else "D",
            "secondary": sorted_scores[1][0] if len(sorted_scores) > 1 else ""
        }

    @staticmethod
    def calculate_mbti(responses: list) -> dict:
        counts = {"E": 0, "I": 0, "S": 0, "N": 0, "T": 0, "F": 0, "J": 0, "P": 0}
        for r in responses:
            construct = r.get("construct")
            if construct in counts:
                counts[construct] += 1

        type_str = ""
        type_str += "E" if counts["E"] >= counts["I"] else "I"
        type_str += "S" if counts["S"] >= counts["N"] else "N"
        type_str += "T" if counts["T"] >= counts["F"] else "F"
        type_str += "J" if counts["J"] >= counts["P"] else "P"
        
        total_ei = (counts["E"] + counts["I"]) or 1
        total_sn = (counts["S"] + counts["N"]) or 1
        total_tf = (counts["T"] + counts["F"]) or 1
        total_jp = (counts["J"] + counts["P"]) or 1
        
        return {
            "type": type_str,
            "e_i": round((counts["E"] / total_ei) * 100, 1),
            "s_n": round((counts["S"] / total_sn) * 100, 1),
            "t_f": round((counts["T"] / total_tf) * 100, 1),
            "j_p": round((counts["J"] / total_jp) * 100, 1),
        }

    @staticmethod
    def calculate_big_five(responses: list) -> dict:
        totals = {}
        counts = {}
        for r in responses:
            val = float(r.get("answer_value", 0))
                
            construct = str(r.get("construct", "")).upper()
            if construct:
                totals[construct] = totals.get(construct, 0) + val
                counts[construct] = counts.get(construct, 0) + 1
            
        def normalize(score, count):
            max_score = (count * 3) or 1
            return min(round((score / max_score) * 100, 1), 100.0)

        o_key = next((k for k in totals if "ABERTURA" in k or k == "O"), "O")
        c_key = next((k for k in totals if "CONSCI" in k or k == "C"), "C")
        e_key = next((k for k in totals if "EXTRO" in k or k == "E"), "E")
        a_key = next((k for k in totals if "AMAB" in k or k == "A"), "A")
        n_key = next((k for k in totals if "NEURO" in k or k == "N"), "N")

        return {
            "openness": normalize(totals.get(o_key, 0), counts.get(o_key, 0)),
            "conscientiousness": normalize(totals.get(c_key, 0), counts.get(c_key, 0)),
            "extraversion": normalize(totals.get(e_key, 0), counts.get(e_key, 0)),
            "agreeableness": normalize(totals.get(a_key, 0), counts.get(a_key, 0)),
            "neuroticism": normalize(totals.get(n_key, 0), counts.get(n_key, 0))
        }
        
    @staticmethod
    def calculate_ancoras(responses: list) -> dict:
        scores = {}
        counts = {}

        for r in responses:
            val = float(r.get("answer_value", 0))
            construct = str(r.get("construct", "")).lower()
            if construct:
                scores[construct] = scores.get(construct, 0) + val
                counts[construct] = counts.get(construct, 0) + 1
                
        res = {}
        for k in scores:
            max_val = (counts[k] * 5) or 1
            res[k] = min(round((scores[k] / max_val) * 100, 1), 100.0)
        return res

    @staticmethod
    def calculate_opq(responses: list) -> dict:
        scores = {}
        counts = {}
        for r in responses:
            val = float(r.get("answer_value", 0))

            c = str(r.get("construct", "")).lower()
            if c:
                scores[c] = scores.get(c, 0) + val
                counts[c] = counts.get(c, 0) + 1
                
        res = {}
        for k, v in scores.items():
            max_val = (counts[k] * 3) or 1
            res[k] = min(round((v / max_val) * 100, 1), 100.0)
        return res

    @staticmethod
    def calculate_valores(responses: list) -> dict:
        scores = {}
        counts = {}
        for r in responses:
            val = float(r.get("answer_value", 0))
            c = str(r.get("construct", "")).lower()
            if c:
                scores[c] = scores.get(c, 0) + 1
                counts[c] = counts.get(c, 0) + 1
            
        res = {}
        for k, v in scores.items():
            max_val = counts[k] or 1
            res[k] = min(round((v / max_val) * 100, 1), 100.0)

        res["autotranscendencia"] = res.get("autotranscendencia", res.get("autotranscendência", 0.0))
        res["autopromocao"] = res.get("autopromocao", res.get("autopromoção", 0.0))
        res["conservacao"] = res.get("conservacao", res.get("conservação", 0.0))
        res["abertura"] = res.get("abertura", res.get("abertura_mudanca", 0.0))
        return res
        
    @staticmethod
    def calculate_all(assessment_id: str, all_responses: list) -> dict:
        import datetime
        from services.db_service import get_supabase
        supabase = get_supabase()
        questions_resp = supabase.table("questions").select("id, tool_name, construct, is_inverse, options").execute()
        questions = questions_resp.data
        q_map = {str(q['id']): q for q in questions}
        
        for r in all_responses:
            q = q_map.get(str(r.get('question_id')))
            if q:
                r['tool_name'] = q.get('tool_name', r.get('tool_name'))
                r['is_inverse'] = q.get('is_inverse', False)
                
                options = q.get('options') or []
                matched_option = next((o for o in options if str(o.get('value')) == str(r.get('answer_option')) or str(o.get('id')) == str(r.get('answer_option'))), None)
                if matched_option and matched_option.get('construct'):
                    r['construct'] = matched_option.get('construct')
                elif q.get('construct'):
                    r['construct'] = q.get('construct')

        disc_res = [r for r in all_responses if r.get('tool_name') == 'DISC']
        mbti_res = [r for r in all_responses if r.get('tool_name') == 'MBTI']
        big_five_res = [r for r in all_responses if r.get('tool_name') == 'BIG_FIVE']
        ancoras_res = [r for r in all_responses if r.get('tool_name') == 'ANCORAS']
        opq_res = [r for r in all_responses if r.get('tool_name') == 'OPQ']
        valores_res = [r for r in all_responses if r.get('tool_name') == 'VALORES']
        
        disc_data = CalculationService.calculate_disc(disc_res)
        mbti_data = CalculationService.calculate_mbti(mbti_res)
        swot_data = CalculationService.generate_swot(disc_data, mbti_data)
        
        user_id = all_responses[0].get("user_id", "user_id") if all_responses else "user_id"
        
        return {
            "id": f"res_{assessment_id}",
            "assessment_id": assessment_id,
            "user_id": user_id,
            "disc": disc_data,
            "mbti": mbti_data,
            "big_five": CalculationService.calculate_big_five(big_five_res),
            "ancoras": CalculationService.calculate_ancoras(ancoras_res),
            "opq_scores": CalculationService.calculate_opq(opq_res),
            "valores": CalculationService.calculate_valores(valores_res),
            "swot": swot_data,
            "confidence_score": 95.0,
            "created_at": datetime.datetime.now().isoformat()
        }

    @staticmethod
    def generate_swot(disc: dict, mbti: dict) -> dict:
        p = disc.get("primary", "D")
        m = mbti.get("type", "ESTJ")
        
        strengths_map = {
            "D": "Foco acentuado em metas, autonomia e agilidade para resolver problemas complexos.",
            "I": "Comunicação persuasiva, entusiasmo contagiante e facilidade de networking.",
            "S": "Empatia, estabilidade sob rotina e capacidade de suporte contínuo à equipe.",
            "C": "Alta precisão analítica, organização minuciosa e respeito a padrões de qualidade."
        }
        
        weaknesses_map = {
            "D": "Impaciência com processos lentos e risco de centralização exagerada.",
            "I": "Tendência a desviar a atenção de detalhes técnicos ou prazos burocráticos.",
            "S": "Resistência a mudanças bruscas e hesitação em cenários de forte confronto.",
            "C": "Perfeccionismo excessivo e cautela prolongada na tomada de decisões."
        }
        
        opportunities_map = {
            "D": "Liderança de novos projetos, turnaround de operações e gestão em momentos de crise.",
            "I": "Desenvolvimento de novos negócios, gestão de relacionamentos e vendas complexas.",
            "S": "Gestão de processos de longo prazo, mentoria de times e cultura organizacional.",
            "C": "Auditoria de processos, arquitetura de sistemas e análise de risco e compliance."
        }
        
        threats_map = {
            "D": "Possíveis atritos com membros de ritmo mais moderado ou avessos a riscos.",
            "I": "Perda de foco em entregáveis práticos se não houver acompanhamento constante.",
            "S": "Sobrecarga silenciosa por dificuldade em dizer 'não' a novas demandas.",
            "C": "Paralisia por análise diante de cenários altamente ambíguos ou incompletos."
        }
        
        return {
            "strengths": [
                strengths_map.get(p, strengths_map["D"]),
                f"Perfil cognitivo {m} com orientação natural para resolução pragmática.",
                "Capacidade de adaptação estratégica baseada em evidências."
            ],
            "weaknesses": [
                weaknesses_map.get(p, weaknesses_map["D"]),
                "Pontos cegos potenciais em momentos de alta pressão comportamental."
            ],
            "opportunities": [
                opportunities_map.get(p, opportunities_map["D"]),
                "Ambientes corporativos dinâmicos que valorizam alta performance."
            ],
            "threats": [
                threats_map.get(p, threats_map["D"]),
                "Turnover de energia se alocado em funções desalinhadas com sua âncora."
            ]
        }


