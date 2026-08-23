import re

filepath = r"C:\Users\Rafael_Livre\Downloads\RECOURSES APEX\analise_comportamental\app\backend\services\chart_service.py"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix Big Five
big_five_target = """            if "big_five" in scores:
                p = ChartService.generate_radar_chart(job_id, scores["big_five"], "Mapeamento Big Five", "big_five")
                if p: paths["big_five"] = p
                paths['bf_ext'] = ChartService.generate_micro_gauge(job_id, scores["big_five"].get("extroversao", 0), "Extroversão", "bf_ext")
                paths['bf_agr'] = ChartService.generate_micro_gauge(job_id, scores["big_five"].get("agradabilidade", 0), "Agradabilidade", "bf_agr")
                paths['bf_con'] = ChartService.generate_micro_gauge(job_id, scores["big_five"].get("conscienciosidade", 0), "Conscienciosidade", "bf_con")
                paths['bf_neu'] = ChartService.generate_micro_gauge(job_id, scores["big_five"].get("neuroticismo", 0), "Neuroticismo", "bf_neu")
                paths['bf_ope'] = ChartService.generate_micro_gauge(job_id, scores["big_five"].get("abertura", 0), "Abertura", "bf_ope")"""
                
big_five_repl = """            if "big_five" in scores:
                p = ChartService.generate_radar_chart(job_id, scores["big_five"], "Mapeamento Big Five", "big_five")
                if p: paths["big_five"] = p
                paths['bf_ext'] = ChartService.generate_micro_gauge(job_id, scores["big_five"].get("extraversion", scores["big_five"].get("extroversao", 0)), "Extroversão", "bf_ext")
                paths['bf_agr'] = ChartService.generate_micro_gauge(job_id, scores["big_five"].get("agreeableness", scores["big_five"].get("agradabilidade", 0)), "Agradabilidade", "bf_agr")
                paths['bf_con'] = ChartService.generate_micro_gauge(job_id, scores["big_five"].get("conscientiousness", scores["big_five"].get("conscienciosidade", 0)), "Conscienciosidade", "bf_con")
                paths['bf_neu'] = ChartService.generate_micro_gauge(job_id, scores["big_five"].get("neuroticism", scores["big_five"].get("neuroticismo", 0)), "Neuroticismo", "bf_neu")
                paths['bf_ope'] = ChartService.generate_micro_gauge(job_id, scores["big_five"].get("openness", scores["big_five"].get("abertura", 0)), "Abertura", "bf_ope")"""

content = content.replace(big_five_target, big_five_repl)

# 2. Fix Ancoras
ancoras_target = """            if "ancoras" in scores:
                p = ChartService.generate_radar_chart(job_id, scores["ancoras"], "Âncoras de Carreira", "ancoras")
                if p: paths["ancoras"] = p
                for k, v in scores["ancoras"].items():
                    paths[f'anc_{k}'] = ChartService.generate_micro_bar(job_id, v, str(k).upper(), ZHAO_NAVY, f"anc_{k}")"""

ancoras_repl = """            if "ancoras" in scores:
                p = ChartService.generate_radar_chart(job_id, scores["ancoras"], "Âncoras de Carreira", "ancoras")
                if p: paths["ancoras"] = p
                
                amap = {
                    "técnica/funcional": "TF", "tecnica/funcional": "TF", "tcnica/funcional": "TF",
                    "gerencial": "GM",
                    "autonomia/independência": "AU", "autonomia/independncia": "AU",
                    "segurança/estabilidade": "SE", "segurana/estabilidade": "SE",
                    "criatividade/empreendedorismo": "EC",
                    "serviço/dedicação a causa": "SV", "servio/dedicao a causa": "SV",
                    "desafio/competição": "CH", "desafio/competio": "CH",
                    "equilíbrio vida-trabalho": "LS", "equilbrio vida-trabalho": "LS"
                }
                for k, v in scores["ancoras"].items():
                    mapped = amap.get(str(k).lower(), "UN")
                    safe_suffix = f"anc_{mapped}" if mapped != "UN" else f"anc_{str(k)[:4]}"
                    paths[safe_suffix] = ChartService.generate_micro_bar(job_id, v, str(k).upper().replace('/', ' '), ZHAO_NAVY, safe_suffix)"""

content = content.replace(ancoras_target, ancoras_repl)

# 3. Fix Valores
valores_target = """            if "valores" in scores:
                p = ChartService.generate_donut_chart(job_id, scores["valores"], "Hierarquia de Valores", "valores")
                if p: paths["valores"] = p
                for k, v in scores["valores"].items():
                    paths[f'val_{k}'] = ChartService.generate_micro_bar(job_id, v, str(k).title().replace('_', ' '), ZHAO_GOLD, f"val_{k}")"""

valores_repl = """            if "valores" in scores:
                p = ChartService.generate_donut_chart(job_id, scores["valores"], "Hierarquia de Valores", "valores")
                if p: paths["valores"] = p
                
                vmap = {
                    "conservação": "conservacao", "conservacao": "conservacao",
                    "autopromoção": "autopromocao", "autopromocao": "autopromocao",
                    "autotranscendência": "autotranscendencia", "autotranscendencia": "autotranscendencia",
                    "abertura a mudança": "abertura_mudanca", "abertura_mudanca": "abertura_mudanca",
                    "abertura a mudana": "abertura_mudanca"
                }
                for k, v in scores["valores"].items():
                    mapped = vmap.get(str(k).lower(), str(k).lower().replace(' ', '_').replace('/', '_'))
                    safe_suffix = f"val_{mapped}"
                    paths[safe_suffix] = ChartService.generate_micro_bar(job_id, v, str(k).title().replace('_', ' '), ZHAO_GOLD, safe_suffix)"""

content = content.replace(valores_target, valores_repl)

# 4. Fix OPQ
opq_target = """            if "opq_scores" in scores:
                p = ChartService.generate_opq_chart(job_id, scores["opq_scores"])
                if p: paths["opq"] = p
                for k, v in scores["opq_scores"].items():
                    paths[f'opq_{k}'] = ChartService.generate_micro_gauge(job_id, v, str(k).title(), f"opq_{k}")"""

opq_repl = """            if "opq_scores" in scores:
                p = ChartService.generate_opq_chart(job_id, scores["opq_scores"])
                if p: paths["opq"] = p
                
                # OPQ gives many traits, but report expects 4 main groups
                groups = {
                    "energia": scores["opq_scores"].get("energia", 50),
                    "influencia": scores["opq_scores"].get("influencia", 50),
                    "empatia": scores["opq_scores"].get("empatia", 50),
                    "analise": scores["opq_scores"].get("analise", 50)
                }
                for k, v in groups.items():
                    safe_suffix = f"opq_{k}"
                    paths[safe_suffix] = ChartService.generate_micro_gauge(job_id, v, str(k).title(), safe_suffix)"""

content = content.replace(opq_target, opq_repl)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patch applied!")
