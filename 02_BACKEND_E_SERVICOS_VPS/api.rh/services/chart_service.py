import os
import matplotlib
import matplotlib.pyplot as plt
import matplotlib.patheffects as path_effects
import numpy as np

# Forcar o uso do Agg para nao abrir janelas no backend
matplotlib.use('Agg')

# Cores Padrao Zhao
ZHAO_GOLD = '#C5A059'
ZHAO_NAVY = '#1e3a8a'
ZHAO_SLATE = '#0f172a'
ZHAO_LIGHT_SLATE = '#64748b'

class ChartService:
    @staticmethod
    def _get_charts_dir() -> str:
        d = os.path.join(os.path.dirname(__file__), "..", "data", "reports", "charts")
        os.makedirs(d, exist_ok=True)
        return d

    @staticmethod
    def _apply_zhao_style(ax, title=None, has_grid=True):
        ax.spines['top'].set_visible(False)
        ax.spines['right'].set_visible(False)
        ax.spines['left'].set_visible(False)
        ax.spines['bottom'].set_color(ZHAO_LIGHT_SLATE)
        if has_grid:
            ax.grid(axis='x', linestyle='--', alpha=0.2, color=ZHAO_LIGHT_SLATE)
        if title:
            ax.set_title(title.upper(), size=14, y=1.05, color=ZHAO_GOLD, fontweight='bold')
        ax.tick_params(colors=ZHAO_SLATE)

    @staticmethod
    def generate_disc_chart(job_id: str, disc_data: dict) -> str:
        fig, ax = plt.subplots(figsize=(6, 4))
        labels = ['D', 'I', 'S', 'C']
        values = [disc_data.get(l, 0) for l in labels]
        
        bars = ax.barh(labels, values, color=ZHAO_NAVY, alpha=0.9)
        for bar in bars:
            bar.set_path_effects([path_effects.SimpleLineShadow(offset=(1,-1), alpha=0.15), path_effects.Normal()])
            
        ax.invert_yaxis()
        ChartService._apply_zhao_style(ax, 'Perfil DISC')
        
        plt.xlim(0, 100)
        plt.tight_layout()
        path = os.path.join(ChartService._get_charts_dir(), f"{job_id}_disc.png")
        plt.savefig(path, dpi=150, bbox_inches='tight', transparent=True)
        plt.close()
        return path

    @staticmethod
    def generate_radar_chart(job_id: str, scores_dict: dict, title: str, filename_suffix: str) -> str:
        if not scores_dict: return ""
        
        labels = list(scores_dict.keys())
        values = list(scores_dict.values())
        if not labels: return ""
        
        # Adiciona o primeiro valor no final para fechar o radar
        values += values[:1]
        angles = np.linspace(0, 2 * np.pi, len(labels), endpoint=False).tolist()
        angles += angles[:1]
        
        fig, ax = plt.subplots(figsize=(6, 6), subplot_kw=dict(polar=True))
        ax.plot(angles, values, color=ZHAO_GOLD, linewidth=2, linestyle='solid')
        ax.fill(angles, values, color=ZHAO_GOLD, alpha=0.25)
        
        # ZHAO STYLE RADAR
        ax.spines['polar'].set_visible(False)
        ax.grid(color=ZHAO_LIGHT_SLATE, alpha=0.2, linestyle='--')
        ax.set_xticks(angles[:-1])
        clean_labels = [str(l).replace('_', ' ').upper() for l in labels]
        ax.set_xticklabels(clean_labels, fontsize=10, color=ZHAO_SLATE, fontweight='bold')
        ax.set_yticks([]) # hide radial ticks
        
        ax.set_ylim(0, 100)
        plt.title(title.upper(), size=14, y=1.1, color=ZHAO_GOLD, fontweight='bold')
        
        path = os.path.join(ChartService._get_charts_dir(), f"{job_id}_{filename_suffix}.png")
        plt.savefig(path, dpi=150, bbox_inches='tight', transparent=True)
        plt.close()
        return path

    @staticmethod
    def generate_donut_chart(job_id: str, scores_dict: dict, title: str, filename_suffix: str) -> str:
        if not scores_dict: return ""
        labels = list(scores_dict.keys())
        values = list(scores_dict.values())
        filtered = [(l, v) for l, v in zip(labels, values) if v > 0]
        if not filtered: return ""
        labels, values = zip(*filtered)
        
        fig, ax = plt.subplots(figsize=(6, 5))
        clean_labels = [str(l).replace('_', ' ').upper() for l in labels]
        
        # Generate shades of Navy and Gold
        zhao_colors = [ZHAO_NAVY, ZHAO_GOLD, '#3b82f6', '#d4b67a', ZHAO_SLATE, '#64748b', '#0f172a', '#eab308']
        wedges, texts, autotexts = ax.pie(values, labels=clean_labels, autopct='%1.1f%%', 
                                          startangle=90, colors=zhao_colors, textprops=dict(color=ZHAO_SLATE, fontweight='bold'))
        
        centre_circle = plt.Circle((0,0), 0.70, fc='white')
        fig.gca().add_artist(centre_circle)
        
        for w in wedges:
            w.set_path_effects([path_effects.SimpleLineShadow(offset=(2,-2), alpha=0.1), path_effects.Normal()])
            
        for autotext in autotexts:
            autotext.set_color('white')
            autotext.set_fontsize(8)
            autotext.set_fontweight('bold')
            
        plt.title(title.upper(), size=14, y=1.05, color=ZHAO_GOLD, fontweight='bold')
        plt.tight_layout()
        
        path = os.path.join(ChartService._get_charts_dir(), f"{job_id}_{filename_suffix}.png")
        plt.savefig(path, dpi=150, bbox_inches='tight', transparent=True)
        plt.close()
        return path

    @staticmethod
    def generate_mbti_chart(job_id: str, mbti_data: dict) -> str:
        fig, ax = plt.subplots(figsize=(6, 4))
        labels = ['E - I', 'S - N', 'T - F', 'J - P']
        vals = [mbti_data.get('e_i', 50), mbti_data.get('s_n', 50), mbti_data.get('t_f', 50), mbti_data.get('j_p', 50)]
        
        y_pos = np.arange(len(labels))
        bars = ax.barh(y_pos, vals, align='center', color=ZHAO_NAVY)
        for bar in bars:
            bar.set_path_effects([path_effects.SimpleLineShadow(offset=(1,-1), alpha=0.15), path_effects.Normal()])
            
        ax.set_yticks(y_pos, labels=labels)
        ax.invert_yaxis()
        ChartService._apply_zhao_style(ax, 'Preferências MBTI')
        
        plt.xlim(0, 100)
        plt.tight_layout()
        path = os.path.join(ChartService._get_charts_dir(), f"{job_id}_mbti.png")
        plt.savefig(path, dpi=150, bbox_inches='tight', transparent=True)
        plt.close()
        return path

    @staticmethod
    def generate_opq_chart(job_id: str, opq_data: dict) -> str:
        fig, ax = plt.subplots(figsize=(6, 4))
        colors = ['#f1f5f9', '#d4b67a', ZHAO_GOLD]
        ax.pie([33, 33, 34], radius=1, colors=colors, startangle=180, counterclock=False, 
               wedgeprops=dict(width=0.4, edgecolor='none'))
        
        val = opq_data.get("energia", 75)
        angle = 180 - (val / 100) * 180
        import math
        x = 0.6 * math.cos(math.radians(angle))
        y = 0.6 * math.sin(math.radians(angle))
        
        ax.annotate('', xy=(x, y), xytext=(0, 0), arrowprops=dict(facecolor=ZHAO_NAVY, width=3, headwidth=10))
        ax.text(0, -0.2, f"{int(val)}%", ha='center', va='center', fontsize=20, fontweight='bold', color=ZHAO_NAVY)
        
        ax.set_ylim(-0.3, 1)
        ax.set_title('ENERGIA DE LIDERANÇA (OPQ)', size=14, y=1.1, color=ZHAO_GOLD, fontweight='bold')
        plt.tight_layout()
        path = os.path.join(ChartService._get_charts_dir(), f"{job_id}_opq.png")
        plt.savefig(path, dpi=150, bbox_inches='tight', transparent=True)
        plt.close()
        return path

    @staticmethod
    def generate_polar_chart(job_id: str, swot_data: dict) -> str:
        labels = ['FORÇAS', 'FRAQUEZAS', 'OPORTUNIDADES', 'AMEAÇAS']
        values = [swot_data.get('forcas_score', 80), swot_data.get('fraquezas_score', 40),
                  swot_data.get('oportunidades_score', 70), swot_data.get('ameacas_score', 50)]
                  
        N = len(labels)
        theta = np.linspace(0.0, 2 * np.pi, N, endpoint=False)
        radii = np.array(values)
        width = 2 * np.pi / N
        colors = [ZHAO_NAVY, '#475569', ZHAO_GOLD, '#d4b67a']
        
        fig = plt.figure(figsize=(6, 6))
        ax = fig.add_subplot(111, polar=True)
        bars = ax.bar(theta, radii, width=width, bottom=0.0, color=colors, alpha=0.9)
        
        ax.spines['polar'].set_visible(False)
        ax.grid(color=ZHAO_LIGHT_SLATE, alpha=0.2, linestyle='--')
        ax.set_xticks(theta)
        ax.set_xticklabels(labels, fontweight='bold', color=ZHAO_SLATE)
        ax.set_yticks([])
        ax.set_title('MAPEAMENTO INTEGRADO SWOT', size=14, y=1.1, color=ZHAO_GOLD, fontweight='bold')
        
        plt.tight_layout()
        path = os.path.join(ChartService._get_charts_dir(), f"{job_id}_integrado.png")
        plt.savefig(path, dpi=150, bbox_inches='tight', transparent=True)
        plt.close()
        return path

    @staticmethod
    def generate_timeline_chart(job_id: str, pdca_data: dict) -> str:
        fig, ax = plt.subplots(figsize=(8, 3))
        labels = ['PLAN', 'DO', 'CHECK', 'ACT']
        x = [1, 2, 3, 4]
        y = [0, 0, 0, 0]
        
        ax.plot([1, 4], [0, 0], color='#cbd5e1', lw=4, zorder=1)
        ax.scatter(x, y, s=400, color=ZHAO_GOLD, zorder=2)
        
        for i, txt in enumerate(labels):
            ax.annotate(txt, (x[i], y[i] + 0.1), ha='center', fontweight='bold', fontsize=12, color=ZHAO_NAVY)
            
        ax.set_ylim(-0.2, 0.3)
        ax.set_xlim(0.5, 4.5)
        ax.axis('off')
        ax.set_title('ROADMAP PDCA (90 DIAS)', size=14, y=1.0, color=ZHAO_GOLD, fontweight='bold')
        
        plt.tight_layout()
        path = os.path.join(ChartService._get_charts_dir(), f"{job_id}_pdca.png")
        plt.savefig(path, dpi=150, bbox_inches='tight', transparent=True)
        plt.close()
        return path

    @staticmethod
    def generate_micro_bar(job_id: str, value: float, title: str, color: str, suffix: str) -> str:
        fig, ax = plt.subplots(figsize=(4, 1))
        
        bar1 = ax.barh([0], [value], color=color, height=0.6, align='center')
        bar1[0].set_path_effects([path_effects.SimpleLineShadow(offset=(1,-1), alpha=0.15), path_effects.Normal()])
        ax.barh([0], [100], color='#e2e8f0', height=0.6, align='center', zorder=-1)
        
        ax.set_yticks([])
        ax.set_xticks([])
        ax.axis('off')
        
        ax.text(0, 0.4, title.upper(), ha='left', va='center', fontsize=12, fontweight='bold', color=ZHAO_GOLD)
        ax.text(value, 0, f"{int(value)}%", ha='right' if value > 15 else 'left', va='center', fontsize=10, color='white' if value > 15 else ZHAO_NAVY, fontweight='bold')
        
        plt.xlim(0, 100)
        plt.ylim(-0.5, 0.6)
        plt.tight_layout()
        
        path = os.path.join(ChartService._get_charts_dir(), f"{job_id}_{suffix}.png")
        plt.savefig(path, dpi=150, bbox_inches='tight', transparent=True)
        plt.close()
        return path

    @staticmethod
    def generate_micro_gauge(job_id: str, value: float, title: str, suffix: str) -> str:
        fig, ax = plt.subplots(figsize=(4, 2))
        colors = ['#f1f5f9', '#d4b67a', ZHAO_GOLD]
        ax.pie([33, 33, 34], radius=1, colors=colors, startangle=180, counterclock=False, 
               wedgeprops=dict(width=0.3, edgecolor='none', alpha=0.8))
        
        angle = 180 - (value / 100) * 180
        import math
        x = 0.8 * math.cos(math.radians(angle))
        y = 0.8 * math.sin(math.radians(angle))
        
        ax.annotate('', xy=(x, y), xytext=(0, 0), arrowprops=dict(facecolor=ZHAO_NAVY, width=2, headwidth=8))
        ax.text(0, -0.3, f"{int(value)}%", ha='center', va='center', fontsize=16, fontweight='bold', color=ZHAO_NAVY)
        ax.text(0, 1.1, title.upper(), ha='center', va='center', fontsize=11, fontweight='bold', color=ZHAO_GOLD)
        
        ax.set_ylim(-0.4, 1.3)
        ax.axis('off')
        
        plt.tight_layout()
        path = os.path.join(ChartService._get_charts_dir(), f"{job_id}_{suffix}.png")
        plt.savefig(path, dpi=150, bbox_inches='tight', transparent=True)
        plt.close()
        return path

    @staticmethod
    def generate_all_charts(job_id: str, scores: dict) -> dict:
        paths = {}
        try:
            if "disc" in scores:
                p = ChartService.generate_disc_chart(job_id, scores["disc"])
                if p: paths["disc"] = p
                paths['disc_d'] = ChartService.generate_micro_bar(job_id, scores["disc"].get("D", 0), "Dominância (D)", ZHAO_NAVY, "disc_d")
                paths['disc_i'] = ChartService.generate_micro_bar(job_id, scores["disc"].get("I", 0), "Influência (I)", ZHAO_GOLD, "disc_i")
                paths['disc_s'] = ChartService.generate_micro_bar(job_id, scores["disc"].get("S", 0), "Estabilidade (S)", '#475569', "disc_s")
                paths['disc_c'] = ChartService.generate_micro_bar(job_id, scores["disc"].get("C", 0), "Conformidade (C)", '#d4b67a', "disc_c")
                
            if "big_five" in scores:
                p = ChartService.generate_radar_chart(job_id, scores["big_five"], "Mapeamento Big Five", "big_five")
                if p: paths["big_five"] = p
                paths['bf_ext'] = ChartService.generate_micro_gauge(job_id, scores["big_five"].get("extraversion", scores["big_five"].get("extroversao", 0)), "Extroversão", "bf_ext")
                paths['bf_agr'] = ChartService.generate_micro_gauge(job_id, scores["big_five"].get("agreeableness", scores["big_five"].get("agradabilidade", 0)), "Agradabilidade", "bf_agr")
                paths['bf_con'] = ChartService.generate_micro_gauge(job_id, scores["big_five"].get("conscientiousness", scores["big_five"].get("conscienciosidade", 0)), "Conscienciosidade", "bf_con")
                paths['bf_neu'] = ChartService.generate_micro_gauge(job_id, scores["big_five"].get("neuroticism", scores["big_five"].get("neuroticismo", 0)), "Neuroticismo", "bf_neu")
                paths['bf_ope'] = ChartService.generate_micro_gauge(job_id, scores["big_five"].get("openness", scores["big_five"].get("abertura", 0)), "Abertura", "bf_ope")
                
            if "ancoras" in scores:
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
                    paths[safe_suffix] = ChartService.generate_micro_bar(job_id, v, str(k).upper().replace('/', ' '), ZHAO_NAVY, safe_suffix)
                
            if "valores" in scores:
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
                    paths[safe_suffix] = ChartService.generate_micro_bar(job_id, v, str(k).title().replace('_', ' '), ZHAO_GOLD, safe_suffix)
                
            if "mbti" in scores:
                p = ChartService.generate_mbti_chart(job_id, scores["mbti"])
                if p: paths["mbti"] = p
                
            if "opq_scores" in scores:
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
                    paths[safe_suffix] = ChartService.generate_micro_gauge(job_id, v, str(k).title(), safe_suffix)
                
            if "swot" in scores:
                p = ChartService.generate_polar_chart(job_id, scores["swot"])
                if p: paths["integrado"] = p
                paths['swot_s'] = ChartService.generate_micro_bar(job_id, scores["swot"].get("forcas_score", 0), "Forças", ZHAO_GOLD, "swot_s")
                paths['swot_w'] = ChartService.generate_micro_bar(job_id, scores["swot"].get("fraquezas_score", 0), "Fraquezas", '#475569', "swot_w")
                paths['swot_o'] = ChartService.generate_micro_bar(job_id, scores["swot"].get("oportunidades_score", 0), "Oportunidades", ZHAO_NAVY, "swot_o")
                paths['swot_t'] = ChartService.generate_micro_bar(job_id, scores["swot"].get("ameacas_score", 0), "Ameaças", '#d4b67a', "swot_t")
                
            p = ChartService.generate_timeline_chart(job_id, {})
            if p: paths["pdca"] = p
                
        except Exception as e:
            print(f"Aviso: Erro ao gerar gráficos para o job {job_id}: {e}")
            
        return paths
