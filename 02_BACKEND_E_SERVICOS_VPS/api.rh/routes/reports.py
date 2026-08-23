from fastapi import APIRouter, HTTPException, BackgroundTasks, responses
from pydantic import BaseModel
import os
from typing import Optional
from services.report_service import ReportService
from services.ai_report_service import AiReportService
from services.db_service import get_supabase
from services.job_service import JobService

router = APIRouter(prefix="/reports", tags=["reports"])

class AiReportRequest(BaseModel):
    nome: Optional[str] = "Avaliado"
    cargo: Optional[str] = "Não informado"
    area: Optional[str] = "Não informada"
    empresa: Optional[str] = "Antigravity"
    consultor: Optional[str] = "Sistema Antigravity"

@router.post("/{assessment_id}/generate")
async def generate_report(assessment_id: str):
    supabase = get_supabase()
    result = supabase.table("results").select("*").eq("assessment_id", assessment_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Results not found for this assessment")
        
    pdf_url = ReportService.generate_pdf_report(assessment_id, result.data[0])
    
    data = {
        "assessment_id": assessment_id,
        "user_id": result.data[0]["user_id"],
        "report_type": "FULL",
        "title": "Relatório Integrado de Análise Comportamental",
        "pdf_url": pdf_url
    }
    
    report_res = supabase.table("reports").insert(data).execute()
    return report_res.data[0] if report_res.data else {"status": "error"}


@router.post("/{assessment_id}/generate-ai")
async def generate_ai_report(assessment_id: str, background_tasks: BackgroundTasks, body: AiReportRequest = AiReportRequest()):
    """
    Inicia a geração assíncrona de 7 relatórios diagnósticos + PDCA.
    Retorna o job_id imediatamente.
    """
    scores = {}
    try:
        supabase = get_supabase()
        result = supabase.table("results").select("*").eq("assessment_id", assessment_id).single().execute()
        if result.data:
            scores = result.data
    except Exception as e:
        print(f"Erro ao buscar results no banco: {e}")
        
    if not scores:
        print(f"Scores não encontrados para {assessment_id}. Calculando on the fly...")
        try:
            from services.assessment_service import AssessmentService
            from services.calculation_service import CalculationService
            responses = AssessmentService.get_responses(assessment_id)
            if responses:
                scores = CalculationService.calculate_all(assessment_id, responses)
            else:
                raise HTTPException(status_code=400, detail="Sem respostas e sem resultados salvos. Impossível gerar relatório.")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Falha fatal ao recuperar scores: {e}")

    avaliado = body.dict()
    job_id = JobService.create_job(assessment_id)
    
    # Executa a geração em background
    background_tasks.add_task(AiReportService.generate_reports_async, job_id, avaliado, scores)
    
    return {"job_id": job_id, "status": "PENDING"}

@router.get("/status/{job_id}")
async def get_report_status(job_id: str):
    job = JobService.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

from pydantic import BaseModel
from typing import Optional

class JobResultsPayload(BaseModel):
    relatorio_1_disc: str = ""
    relatorio_2_mbti: str = ""
    relatorio_3_bigfive: str = ""
    relatorio_4_ancoras: str = ""
    relatorio_5_opq: str = ""
    relatorio_6_valores: str = ""
    relatorio_7_integrado: str = ""
    relatorio_8_pdca: str = ""
    avaliado: str = ""

@router.post("/generate-pdf/{job_id}")
async def generate_final_pdf(job_id: str, payload: Optional[dict] = None):
    job = JobService.get_job(job_id)
    
    # Se o job foi limpo da memória (devido a um reinício do servidor), recria a partir do payload
    if not job and payload:
        JobService._jobs[job_id] = {
            "job_id": job_id,
            "status": "COMPLETED",
            "results": payload,
            "assessment_id": payload.get("assessment_id", "test_assessment_123") # fallback
        }
        job = JobService.get_job(job_id)

    if not job or job.get("status") != "COMPLETED" or not job.get("results"):
        raise HTTPException(status_code=400, detail="Job textual ainda não concluído ou não encontrado.")
    
    assessment_id = job.get("assessment_id")
    
    # Recuperar os scores para desenhar os gráficos (usar a mesma lógica de on the fly se falhar)
    scores = {}
    
    try:
        supabase = get_supabase()
        result = supabase.table("results").select("*").eq("assessment_id", assessment_id).single().execute()
        if result.data:
            scores = result.data
    except Exception:
        pass
        
    if not scores:
        try:
            from services.assessment_service import AssessmentService
            from services.calculation_service import CalculationService
            responses = AssessmentService.get_responses(assessment_id)
            if responses:
                scores = CalculationService.calculate_all(assessment_id, responses)
        except Exception:
            raise HTTPException(status_code=500, detail="Falha ao calcular scores para gerar gráficos.")

    if not scores:
        raise HTTPException(status_code=404, detail="Resultados não encontrados para desenhar os gráficos.")

    from services.chart_service import ChartService
    from services.report_service import ReportService

    # 1. Desenhar gráficos baseados nos scores reais
    chart_paths = ChartService.generate_all_charts(job_id, scores)
    
    # 2. Injetar textos e gráficos no PDF
    results = job.get("results", {})
    avaliado_nome = results.get("avaliado", "Avaliado")
    pdf_url = ReportService.generate_ai_pdf(job_id, avaliado_nome, results, chart_paths)
    
    # Atualizar o job com o link do PDF
    JobService.update_job(job_id, {"pdf_url": pdf_url})
    
    # Salvar na tabela de reports para a Triagem
    try:
        user_id = scores.get("user_id") if scores else None
        if not user_id:
            # Tenta buscar pelo assessment
            assessment = supabase.table("assessments").select("user_id").eq("id", assessment_id).single().execute()
            if assessment.data:
                user_id = assessment.data.get("user_id")

        if user_id:
            data = {
                "assessment_id": assessment_id,
                "user_id": user_id,
                "report_type": "FULL",
                "title": "Relatório Integrado de Análise Comportamental (IA)",
                "pdf_url": pdf_url
            }
            # Usa upsert para caso já exista
            supabase.table("reports").upsert(data).execute()
    except Exception as e:
        print(f"Erro ao salvar PDF no banco: {e}")
    
    return {"status": "success", "pdf_url": pdf_url}

@router.get("/download/{filename}")
async def download_report_pdf(filename: str):
    reports_dir = os.path.join(os.path.dirname(__file__), "..", "data", "reports")
    filepath = os.path.join(reports_dir, filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="PDF não encontrado")
    return responses.FileResponse(filepath, media_type="application/pdf", filename=filename)
