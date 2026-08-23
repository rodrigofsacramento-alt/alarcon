import requests
import time

BASE_URL = "http://localhost:8000/api/v1"
# ID do assessment que o usuário acabou de concluir
ASSESSMENT_ID = "a9ba7a5c-1da8-4834-8b45-79f67a96fdcc" 

print(f"Iniciando teste de geração de relatórios para o assessment {ASSESSMENT_ID}...")

# 1. Acionar a geração do relatório IA (assíncrono)
try:
    print("Enviando requisição POST para /reports/{id}/generate-ai ...")
    res = requests.post(f"{BASE_URL}/reports/{ASSESSMENT_ID}/generate-ai", json={
        "nome": "Candidato Teste",
        "cargo": "Desenvolvedor",
        "area": "Tecnologia",
        "empresa": "Antigravity",
        "consultor": "Sistema"
    })
    
    if res.status_code != 200:
        print(f"Erro ao iniciar job: {res.status_code} - {res.text}")
        exit(1)
        
    data = res.json()
    job_id = data.get("job_id")
    print(f"✅ Job iniciado com sucesso! ID do Job: {job_id}")
    
    # 2. Fazer polling até concluir
    print("Aguardando IA gerar textos (isso pode levar de 30s a 2 minutos)...")
    status = "PENDING"
    while status == "PENDING" or status == "PROCESSING":
        time.sleep(5)
        status_res = requests.get(f"{BASE_URL}/reports/status/{job_id}")
        if status_res.status_code == 200:
            status_data = status_res.json()
            status = status_data.get("status")
            print(f"Status atual: {status}")
        else:
            print(f"Erro ao verificar status: {status_res.status_code}")
            break
            
    if status == "COMPLETED":
        print("✅ Textos gerados pela IA com sucesso!")
        
        # 3. Gerar PDF final
        print("Iniciando geração dos gráficos e do PDF...")
        pdf_res = requests.post(f"{BASE_URL}/reports/generate-pdf/{job_id}")
        
        if pdf_res.status_code == 200:
            pdf_data = pdf_res.json()
            print(f"🎉 SUCESSO! Relatório PDF gerado: {pdf_data.get('pdf_url')}")
            print("O relatório já foi salvo na tabela rh_behavioral_reports do Supabase.")
        else:
            print(f"Erro ao gerar PDF: {pdf_res.status_code} - {pdf_res.text}")
    else:
        print(f"❌ Falha na geração do relatório. Status final: {status}")

except Exception as e:
    print(f"Erro de conexão: {e}")
