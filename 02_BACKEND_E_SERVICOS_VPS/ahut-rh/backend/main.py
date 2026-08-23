from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
from config import settings

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Criar aplicação FastAPI
app = FastAPI(
    title="API de Análise Comportamental",
    description="Sistema integrado de análise comportamental com 6 ferramentas",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from routes import auth, assessments, responses, results, reports, admin

# Incluir rotas
app.include_router(auth.router, prefix="/api/v1")
app.include_router(assessments.router, prefix="/api/v1")
app.include_router(responses.router, prefix="/api/v1")
app.include_router(results.router, prefix="/api/v1")
app.include_router(reports.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")

# Health check
@app.get("/health")
async def health_check():
    return {"status": "ok", "version": "1.0.0"}

# Rota raiz
@app.get("/")
async def root():
    return {"message": "API de Análise Comportamental v1.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level="info"
    )
