import os
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from datetime import datetime
import uuid

class ReportService:
    @staticmethod
    def generate_pdf_report(assessment_id: str, results: dict) -> str:
        # Create directories if they don't exist
        reports_dir = os.path.join(os.path.dirname(__file__), "..", "data", "reports")
        os.makedirs(reports_dir, exist_ok=True)
        
        filename = f"relatorio_{assessment_id}_{uuid.uuid4().hex[:6]}.pdf"
        filepath = os.path.join(reports_dir, filename)
        
        c = canvas.Canvas(filepath, pagesize=A4)
        width, height = A4
        
        # Header
        c.setFillColor(colors.HexColor("#4f46e5")) # Indigo 600
        c.rect(0, height - 80, width, 80, fill=1)
        c.setFillColor(colors.white)
        c.setFont("Helvetica-Bold", 24)
        c.drawString(50, height - 50, "Relatório Integrado de Análise Comportamental")
        
        # Metadata
        c.setFillColor(colors.black)
        c.setFont("Helvetica", 12)
        c.drawString(50, height - 120, f"ID da Avaliação: {assessment_id}")
        c.drawString(50, height - 140, f"Data: {datetime.now().strftime('%d/%m/%Y %H:%M')}")
        c.drawString(50, height - 160, f"Score de Confiança Antifraude: {results.get('confidence_score', 'N/A')}%")
        
        # SWOT Analysis section (mock logic, should be based on real result intersections)
        c.setFont("Helvetica-Bold", 18)
        c.drawString(50, height - 210, "1. Análise SWOT (Cruzamento DISC x MBTI)")
        
        c.setFont("Helvetica-Bold", 14)
        c.drawString(50, height - 240, "Forças (Strengths):")
        c.setFont("Helvetica", 12)
        c.drawString(60, height - 260, "- Alta capacidade de execução orientada a resultados (DISC Dominância).")
        c.drawString(60, height - 280, "- Pensamento estratégico e analítico (MBTI NT).")
        
        c.setFont("Helvetica-Bold", 14)
        c.drawString(50, height - 310, "Fraquezas (Weaknesses):")
        c.setFont("Helvetica", 12)
        c.drawString(60, height - 330, "- Pode ser visto como impaciente com detalhes burocráticos.")
        
        c.setFont("Helvetica-Bold", 14)
        c.drawString(50, height - 360, "Oportunidades (Opportunities):")
        c.setFont("Helvetica", 12)
        c.drawString(60, height - 380, "- Assumir posições de liderança em projetos de inovação (Match Âncoras: Desafio).")
        
        c.setFont("Helvetica-Bold", 14)
        c.drawString(50, height - 410, "Ameaças (Threats):")
        c.setFont("Helvetica", 12)
        c.drawString(60, height - 430, "- Desmotivação em ambientes excessivamente rígidos ou processuais.")
        
        # Other scores
        c.setFont("Helvetica-Bold", 18)
        c.drawString(50, height - 480, "2. Resumo dos Escores")
        c.setFont("Helvetica", 12)
        
        disc_d = results.get("disc_d", 0)
        c.drawString(50, height - 510, f"DISC - Dominância: {disc_d}%")
        c.drawString(50, height - 530, f"MBTI - Perfil Principal: {results.get('mbti_type', 'N/A')}")
        
        # Footer
        c.setFont("Helvetica", 10)
        c.setFillColor(colors.gray)
        c.drawString(50, 50, "Gerado automaticamente por Antigravity Behavioral Platform - Confidencial")
        
        c.save()
        
        # Return a relative URL that the frontend can use to download (assuming static file serving)
        return f"/data/reports/{filename}"
        
    @staticmethod
    def generate_ai_pdf(job_id: str, avaliado_nome: str, ai_reports: dict, chart_paths: dict = None) -> str:
        """
        Gera um PDF robusto usando Platypus, capaz de quebrar páginas e formatar parágrafos
        para o conteúdo massivo gerado pela IA (200 páginas).
        """
        if chart_paths is None: chart_paths = {}
        reports_dir = os.path.join(os.path.dirname(__file__), "..", "data", "reports")
        os.makedirs(reports_dir, exist_ok=True)
        
        filename = f"relatorio_completo_{job_id}.pdf"
        filepath = os.path.join(reports_dir, filename)
        
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Image
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib import colors
        
        doc = SimpleDocTemplate(filepath, pagesize=A4,
                                rightMargin=40, leftMargin=40,
                                topMargin=40, bottomMargin=40)
        
        styles = getSampleStyleSheet()
        
        # Estilos Customizados
        title_style = ParagraphStyle(
            'CustomTitle', parent=styles['Title'],
            fontSize=24, spaceAfter=30, textColor=colors.HexColor("#4f46e5")
        )
        h1_style = ParagraphStyle(
            'CustomH1', parent=styles['Heading1'],
            fontSize=18, spaceBefore=20, spaceAfter=15, textColor=colors.HexColor("#1e293b")
        )
        h2_style = ParagraphStyle(
            'CustomH2', parent=styles['Heading2'],
            fontSize=14, spaceBefore=15, spaceAfter=10, textColor=colors.HexColor("#334155")
        )
        body_style = ParagraphStyle(
            'CustomBody', parent=styles['Normal'],
            fontSize=11, leading=16, spaceBefore=6, spaceAfter=6, textColor=colors.black
        )

        story = []
        
        # Capa
        story.append(Spacer(1, 200))
        story.append(Paragraph("Relatório Diagnóstico Comportamental Integrado", title_style))
        story.append(Paragraph(f"Avaliado: {avaliado_nome}", h1_style))
        story.append(Paragraph(f"Gerado em: {datetime.now().strftime('%d/%m/%Y %H:%M')}", body_style))
        story.append(PageBreak())
        
        # Mapeamento do nome do relatório para a chave da imagem mestre
        report_to_chart_key = {
            "relatorio_1_disc": "disc",
            "relatorio_2_mbti": "mbti",
            "relatorio_3_bigfive": "big_five",
            "relatorio_4_ancoras": "ancoras",
            "relatorio_5_opq": "opq",
            "relatorio_6_valores": "valores",
            "relatorio_7_integrado": "integrado",
            "relatorio_8_pdca": "pdca",
            "disc": "disc",
            "mbti": "mbti",
            "big_five": "big_five",
            "ancoras": "ancoras",
            "opq": "opq",
            "valores": "valores",
            "integrado": "integrado",
            "pdca": "pdca"
        }
        
        report_to_micro_charts = {
            "relatorio_1_disc": ["disc_d", "disc_i", "disc_s", "disc_c"],
            "relatorio_3_bigfive": ["bf_ext", "bf_agr", "bf_con", "bf_neu", "bf_ope"],
            "relatorio_4_ancoras": ["anc_TF", "anc_GM", "anc_AU", "anc_SE", "anc_EC", "anc_SV", "anc_CH", "anc_LS"],
            "relatorio_5_opq": ["opq_energia", "opq_influencia", "opq_empatia", "opq_analise"],
            "relatorio_6_valores": ["val_conservacao", "val_autopromocao", "val_autotranscendencia", "val_abertura_mudanca"],
            "relatorio_7_integrado": ["swot_s", "swot_w", "swot_o", "swot_t"],
            "disc": ["disc_d", "disc_i", "disc_s", "disc_c"],
            "big_five": ["bf_ext", "bf_agr", "bf_con", "bf_neu", "bf_ope"],
            "ancoras": ["anc_TF", "anc_GM", "anc_AU", "anc_SE", "anc_EC", "anc_SV", "anc_CH", "anc_LS"],
            "opq": ["opq_energia", "opq_influencia", "opq_empatia", "opq_analise"],
            "valores": ["val_conservacao", "val_autopromocao", "val_autotranscendencia", "val_abertura_mudanca"],
            "integrado": ["swot_s", "swot_w", "swot_o", "swot_t"]
        }
        
        import re
        from reportlab.lib.units import inch
        import html
        
        for key, text in ai_reports.items():
            if key in ["generated_by", "generated_at", "avaliado"]:
                continue
            
            story.append(Paragraph(f"<b>{key.upper().replace('_', ' ')}</b>", h1_style))
            story.append(Spacer(1, 0.2 * inch))
            
            # Gráfico Mestre (Master Chart)
            c_key = report_to_chart_key.get(key)
            print(f"[DEBUG] key='{key}', c_key='{c_key}', chart_paths={list(chart_paths.keys())}")
            if c_key and c_key in chart_paths and os.path.exists(chart_paths[c_key]):
                try:
                    from reportlab.lib.utils import ImageReader
                    img_reader = ImageReader(chart_paths[c_key])
                    iw, ih = img_reader.getSize()
                    aspect = ih / float(iw)
                    w = 5 * inch
                    h = w * aspect
                    img = Image(chart_paths[c_key], width=w, height=h)
                    story.append(img)
                    story.append(Spacer(1, 0.3 * inch))
                except Exception as e:
                    print(f"Aviso: Falha ao desenhar imagem mestre {chart_paths[c_key]} no PDF: {e}")
            
            # Micro charts para intercalar
            micro_keys = report_to_micro_charts.get(key, [])
            valid_micro_keys = [k for k in micro_keys if k in chart_paths and os.path.exists(chart_paths[k])]
            
            lines = text.split('\n')
            valid_lines = [l.strip() for l in lines if l.strip()]
            
            interval = len(valid_lines) // (len(valid_micro_keys) + 1) if valid_micro_keys else len(valid_lines) + 1
            if interval < 1: interval = 1
            
            line_count = 0
            micro_idx = 0
            
            for line in lines:
                line = line.strip()
                if not line:
                    continue
                
                # Headers
                if line.startswith('### '):
                    clean_line = html.escape(line.replace('### ', ''))
                    story.append(Paragraph(clean_line, h2_style))
                elif line.startswith('## '):
                    clean_line = html.escape(line.replace('## ', ''))
                    story.append(Paragraph(clean_line, h1_style))
                elif line.startswith('# '):
                    clean_line = html.escape(line.replace('# ', ''))
                    story.append(Paragraph(clean_line, h1_style))
                else:
                    # Escape HTML characters to prevent XML parsing crashes in ReportLab
                    safe_line = html.escape(line)
                    
                    # Convert markdown bold to ReportLab bold
                    safe_line = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', safe_line)
                    
                    # Also support AI that outputs literal HTML bold tags (which were just escaped)
                    safe_line = re.sub(r'&lt;strong&gt;(.*?)&lt;/strong&gt;', r'<b>\1</b>', safe_line)
                    safe_line = re.sub(r'&lt;b&gt;(.*?)&lt;/b&gt;', r'<b>\1</b>', safe_line)
                    
                    # Handle AI that outputs literal <br> tags
                    safe_line = safe_line.replace('&lt;br&gt;', '<br/>').replace('&lt;br/&gt;', '<br/>')
                    
                    story.append(Paragraph(safe_line, body_style))
                    
                line_count += 1
                
                # Injetar micro gráfico se atingiu o intervalo
                if valid_micro_keys and micro_idx < len(valid_micro_keys) and line_count >= interval:
                    try:
                        m_key = valid_micro_keys[micro_idx]
                        story.append(Spacer(1, 0.2 * inch))
                        from reportlab.lib.utils import ImageReader
                        img_reader = ImageReader(chart_paths[m_key])
                        iw, ih = img_reader.getSize()
                        aspect = ih / float(iw)
                        w = 3.5 * inch
                        h = w * aspect
                        img = Image(chart_paths[m_key], width=w, height=h)
                        story.append(img)
                        story.append(Spacer(1, 0.2 * inch))
                        micro_idx += 1
                        line_count = 0 # reset
                    except Exception as e:
                        print(f"Aviso: Falha ao desenhar micro-gráfico no PDF: {e}")
                    
            story.append(PageBreak())

        doc.build(story)
        return f"/api/v1/reports/download/{filename}"

    @staticmethod
    def generate_html_report(assessment_id: str, results: dict) -> str:
        # Stub for HTML report generation
        return "https://example.com/report.html"
