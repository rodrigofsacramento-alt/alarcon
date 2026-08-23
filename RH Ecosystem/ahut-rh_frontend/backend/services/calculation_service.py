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
            # Raw counts for display purposes
            "count_e": counts["E"],
            "count_i": counts["I"],
            "count_s": counts["S"],
            "count_n": counts["N"],
            "count_t": counts["T"],
            "count_f": counts["F"],
            "count_j": counts["J"],
            "count_p": counts["P"],
        }

    @staticmethod
    def calculate_big_five(responses: list) -> dict:
        totals = {}
        counts = {}
        for r in responses:
            val = float(r.get("answer_value") or 0)
                
            construct = str(r.get("construct", "")).upper()
            if construct:
                totals[construct] = totals.get(construct, 0) + val
                counts[construct] = counts.get(construct, 0) + 1
            
        def normalize(score, count):
            max_score = (count * 3) or 1
            return min(round((score / max_score) * 100, 1), 100.0)

        # Robust matching: accepts full names from JSON, abbreviations (O/C/E/A/N), or partial substrings
        def find_key(totals, *patterns):
            for pattern in patterns:
                for k in totals:
                    if k == pattern or pattern in k:
                        return k
            return None

        o_key = find_key(totals, "ABERTURA PARA EXPERI", "ABERTURA", "O")
        c_key = find_key(totals, "CONSCIENCIOSIDADE", "CONSCI", "C")
        e_key = find_key(totals, "EXTROVERS", "EXTRO", "E")
        a_key = find_key(totals, "AMABILIDADE", "AMAB", "A")
        n_key = find_key(totals, "NEUROTICISMO", "NEURO", "N")

        return {
            "openness":          normalize(totals.get(o_key, 0), counts.get(o_key, 0)) if o_key else 0.0,
            "conscientiousness": normalize(totals.get(c_key, 0), counts.get(c_key, 0)) if c_key else 0.0,
            "extraversion":      normalize(totals.get(e_key, 0), counts.get(e_key, 0)) if e_key else 0.0,
            "agreeableness":     normalize(totals.get(a_key, 0), counts.get(a_key, 0)) if a_key else 0.0,
            "neuroticism":       normalize(totals.get(n_key, 0), counts.get(n_key, 0)) if n_key else 0.0,
            # Raw totals for audit
            "debug_totals": {k: totals[k] for k in totals},
            "debug_counts": {k: counts[k] for k in counts},
        }
        
    @staticmethod
    def calculate_ancoras(responses: list) -> dict:
        scores = {}
        counts = {}

        for r in responses:
            val = float(r.get("answer_value") or 0)
            construct = str(r.get("construct", "")).upper()
            if construct:
                if "T" in construct and "CNICA" in construct or "FUNCIONAL" in construct or "TÉCNICA" in construct:
                    key = "técnica/funcional"
                elif "GERENCIAL" in construct:
                    key = "gerencial"
                elif "AUTONOMIA" in construct or "INDEPEND" in construct:
                    key = "autonomia/independência"
                elif "SEGURAN" in construct or "ESTABILIDADE" in construct:
                    key = "segurança/estabilidade"
                elif "CRIATIVIDADE" in construct or "EMPREENDEDORISMO" in construct:
                    key = "criatividade/empreendedorismo"
                elif "SERVI" in construct or "CAUSA" in construct or "DEDICA" in construct:
                    key = "serviço/dedicação a causa"
                elif "DESAFIO" in construct or "COMPETI" in construct:
                    key = "desafio/competição"
                elif "EQUIL" in construct or "TRABALHO" in construct or "VIDA" in construct:
                    key = "equilíbrio vida-trabalho"
                else:
                    key = construct.lower()

                scores[key] = scores.get(key, 0) + val
                counts[key] = counts.get(key, 0) + 1
                
        res = {}
        for k in scores:
            max_val = (counts[k] * 1) or 1
            res[k] = min(round((scores[k] / max_val) * 100, 1), 100.0)
        return res



    @staticmethod
    def calculate_opq(responses: list) -> dict:
        # Inicializamos todas as 32 dimensões para o gráfico nunca sumir com as que não foram respondidas
        scores = {
            "persuasivo": 0, "controlador": 0, "independente": 0, "extrovertido": 0,
            "afiliativo": 0, "socialmente_confiante": 0, "modesto": 0, "democratico": 0,
            "solicito": 0, "avaliativo": 0, "convencional": 0, "conceitual": 0,
            "inovador": 0, "variedade": 0, "adaptavel": 0, "pratico": 0,
            "detalhista": 0, "metodico": 0, "planejador": 0, "relaxado": 0,
            "preocupado": 0, "resistente": 0, "otimista": 0, "confiante": 0,
            "emocionalmente_estavel": 0, "vigoroso": 0, "competitivo": 0, "realizador": 0,
            "decisivo": 0, "orientado_a_dados": 0, "orientado_a_pessoas": 0, "orientado_a_tarefas": 0
        }
        counts = {k: 0 for k in scores}
        
        for r in responses:
            val = float(r.get("answer_value") or 0)
            construct = str(r.get("construct", "")).lower()
            if construct:
                # Trata formatações como 'democrático' ou espaços
                construct_key = construct.replace(" ", "_").replace("á", "a").replace("é", "e").replace("í", "i").replace("ó", "o").replace("ú", "u").replace("ç", "c").replace("ã", "a")
                
                # Se o construto existir na base original (mesmo que com nomes diferentes), nós acumulamos nele
                if construct_key in scores:
                    scores[construct_key] += val
                    counts[construct_key] += 1
                else:
                    scores[construct_key] = val
                    counts[construct_key] = 1

        res = {}
        for k in scores:
            max_val = (counts[k] * 3) or 1
            res[k] = min(round((scores[k] / max_val) * 100, 1), 100.0)
        return res

    @staticmethod
    def calculate_valores(responses: list) -> dict:
        counts = {}
        total_questions = len(responses) or 1
        
        for r in responses:
            c = str(r.get("construct", "")).lower()
            # Normalizar para remover acentos
            import unicodedata
            c = unicodedata.normalize('NFKD', c).encode('ASCII', 'ignore').decode('utf-8')
            if c:
                counts[c] = counts.get(c, 0) + 1
                
        res = {}
        # Pontuação de cada subconstruto (percentual de vezes que foi escolhido)
        for k, v in counts.items():
            res[k] = min(round((v / total_questions) * 100, 1), 100.0)

        def get_c(name):
            return counts.get(name, 0)

        # 1. Abertura à Mudança (Autodireção + Estímulo + Hedonismo)
        abertura = get_c("autodirecao") + get_c("estimulo") + get_c("hedonismo")
        # 2. Conservação (Segurança + Conformidade + Tradição)
        conservacao = get_c("seguranca") + get_c("conformidade") + get_c("tradicao")
        # 3. Autopromoção/Autoaprimoramento (Poder + Realização + Hedonismo)
        autopromocao = get_c("poder") + get_c("realizacao") + get_c("hedonismo")
        # 4. Autotranscendência (Benevolência + Universalismo)
        autotranscendencia = get_c("benevolencia") + get_c("universalismo")

        res["abertura"] = round((abertura / total_questions) * 100, 1) if total_questions else 0.0
        res["conservacao"] = round((conservacao / total_questions) * 100, 1) if total_questions else 0.0
        res["autopromocao"] = round((autopromocao / total_questions) * 100, 1) if total_questions else 0.0
        res["autotranscendencia"] = round((autotranscendencia / total_questions) * 100, 1) if total_questions else 0.0

        return res
        
    @staticmethod
    def calculate_all(assessment_id: str, all_responses: list) -> dict:
        import datetime
        from services.db_service import get_supabase
        supabase = get_supabase()
        
        # Upsert using assessment_id as the conflict key
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
                if matched_option:
                    # Option may override construct (e.g. DISC/VALORES options have per-option constructs)
                    if matched_option.get('construct'):
                        r['construct'] = matched_option.get('construct')
                    else:
                        # BIG_FIVE, OPQ, ANCORAS: construct lives on the question, not the option
                        if not r.get('construct') and q.get('construct'):
                            r['construct'] = q.get('construct')
                    if 'value' in matched_option and r.get('answer_value') is None:
                        r['answer_value'] = matched_option.get('value', 0)
                else:
                    # No matching option (e.g. answer_option empty "") — always use question construct
                    if q.get('construct'):
                        r['construct'] = q.get('construct')

                
                # Previne TypeError em float(None)
                if r.get('answer_value') is None:
                    r['answer_value'] = 0
                else:
                    r['answer_value'] = float(r['answer_value'])
                
                # INVERSÃO GLOBAL DE NOTAS (Para ferramentas com escalas Likert de 4 pontos (0-3))
                # Big Five e OPQ utilizam escala de 0 a 3. Se for inverso, a nota final é (3 - valor_respondido)
                if r.get('is_inverse') and r.get('tool_name') in ['BIG_FIVE', 'OPQ']:
                    r['answer_value'] = 3 - r['answer_value']
                
                # INVERSÃO PARA ÂNCORAS (Trade-off A/B convertido para 0 ou 1)
                if r.get('tool_name') == 'ANCORAS':
                    # O frontend manda 1 para [A] e 2 para [B]
                    if r.get('is_inverse'):
                        # Se inverso, [A] (1) = 0 pontos, [B] (2) = 1 ponto
                        r['answer_value'] = 1.0 if r['answer_value'] == 2 else 0.0
                    else:
                        # Se direto, [A] (1) = 1 ponto, [B] (2) = 0 pontos
                        r['answer_value'] = 1.0 if r['answer_value'] == 1 else 0.0

        disc_res = [r for r in all_responses if r.get('tool_name') == 'DISC']
        mbti_res = [r for r in all_responses if r.get('tool_name') == 'MBTI']
        big_five_res = [r for r in all_responses if r.get('tool_name') == 'BIG_FIVE']
        ancoras_res = [r for r in all_responses if r.get('tool_name') == 'ANCORAS']
        opq_res = [r for r in all_responses if r.get('tool_name') == 'OPQ']
        valores_res = [r for r in all_responses if r.get('tool_name') == 'VALORES']
        
        disc_data = CalculationService.calculate_disc(disc_res)
        mbti_data = CalculationService.calculate_mbti(mbti_res)
        swot_data = CalculationService.generate_swot(disc_data, mbti_data)
        
        # Buscar user_id diretamente do assessment (responses não tem user_id)
        try:
            assessment_data = supabase.table("assessments").select("user_id").eq("id", assessment_id).execute()
            user_id = assessment_data.data[0]["user_id"] if assessment_data.data else None
        except Exception:
            user_id = None
        
        if not user_id:
            # Fallback: tenta das respostas (caso tenha)
            user_id = all_responses[0].get("user_id") if all_responses else None
        
        import uuid
        ancoras_data = CalculationService.calculate_ancoras(ancoras_res)
        valores_data = CalculationService.calculate_valores(valores_res)
        big_five_data = CalculationService.calculate_big_five(big_five_res)
        
        return {
            "id": str(uuid.uuid4()),
            "assessment_id": assessment_id,
            "user_id": user_id,
            "disc_d": disc_data.get("d"),
            "disc_i": disc_data.get("i"),
            "disc_s": disc_data.get("s"),
            "disc_c": disc_data.get("c"),
            "disc_primary": disc_data.get("primary"),
            "disc_secondary": disc_data.get("secondary"),
            "mbti_type": mbti_data.get("type"),
            "mbti_e_i": mbti_data.get("e_i"),
            "mbti_s_n": mbti_data.get("s_n"),
            "mbti_t_f": mbti_data.get("t_f"),
            "mbti_j_p": mbti_data.get("j_p"),

            "big_five_openness": big_five_data.get("openness"),
            "big_five_conscientiousness": big_five_data.get("conscientiousness"),
            "big_five_extraversion": big_five_data.get("extraversion"),
            "big_five_agreeableness": big_five_data.get("agreeableness"),
            "big_five_neuroticism": big_five_data.get("neuroticism"),
            "ancoras_tecnica": ancoras_data.get("técnica/funcional", 0),
            "ancoras_gerencial": ancoras_data.get("gerencial", 0),
            "ancoras_autonomia": ancoras_data.get("autonomia/independência", 0),
            "ancoras_seguranca": ancoras_data.get("segurança/estabilidade", 0),
            "ancoras_criatividade": ancoras_data.get("criatividade/empreendedorismo", 0),
            "ancoras_servico": ancoras_data.get("serviço/dedicação a causa", 0),
            "ancoras_desafio": ancoras_data.get("desafio/competição", 0),
            "ancoras_equilibrio": ancoras_data.get("equilíbrio vida-trabalho", 0),
            "opq_scores": CalculationService.calculate_opq(opq_res),
            "valores_autotranscendencia": valores_data.get("autotranscendencia", 0),
            "valores_autopromoacao": valores_data.get("autopromocao", 0),
            "valores_conservacao": valores_data.get("conservacao", 0),
            "valores_abertura": valores_data.get("abertura", 0),
            "swot": swot_data,
            "confidence_score": 95.0,
            "metadata": {
                "mbti_counts": {
                    "E": mbti_data.get("count_e", 0), "I": mbti_data.get("count_i", 0),
                    "S": mbti_data.get("count_s", 0), "N": mbti_data.get("count_n", 0),
                    "T": mbti_data.get("count_t", 0), "F": mbti_data.get("count_f", 0),
                    "J": mbti_data.get("count_j", 0), "P": mbti_data.get("count_p", 0),
                },
                "valores_subconstructs": {
                    "autodirecao": valores_data.get("autodirecao", 0),
                    "estimulo": valores_data.get("estimulo", 0),
                    "hedonismo": valores_data.get("hedonismo", 0),
                    "seguranca": valores_data.get("seguranca", 0),
                    "conformidade": valores_data.get("conformidade", 0),
                    "tradicao": valores_data.get("tradicao", 0),
                    "poder": valores_data.get("poder", 0),
                    "realizacao": valores_data.get("realizacao", 0),
                    "benevolencia": valores_data.get("benevolencia", 0),
                    "universalismo": valores_data.get("universalismo", 0)
                }
            },
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


