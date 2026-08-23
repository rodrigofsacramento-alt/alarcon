<#
.SYNOPSIS
Script de Deploy Automatizado para Hostinger (Next.js Standalone)

.DESCRIPTION
Este script compila a aplicação Next.js no modo standalone, prepara os arquivos estáticos,
compacta tudo em um arquivo ZIP e envia para a sua hospedagem Hostinger via SCP (SSH).

.NOTES
Requisitos:
1. Ter o SSH configurado na Hostinger e a chave adicionada ao seu Windows.
2. Atualizar as variáveis abaixo com os seus dados reais da Hostinger.
#>

$ErrorActionPreference = "Stop"

# ==========================================
# 1. CONFIGURAÇÕES DA HOSTINGER
# ==========================================
$SSH_USER = "u817195350" # Seu usuário SSH da Hostinger
$SSH_HOST = "82.25.73.206" # IP do Servidor
$SSH_PORT = "65002" # Porta SSH
$REMOTE_DIR = "/home/u817195350" # Caminho raiz da sua hospedagem

# ==========================================
# 2. BUILD DA APLICAÇÃO NEXT.JS
# ==========================================
Write-Host "🚀 Iniciando processo de Deploy para Hostinger..." -ForegroundColor Cyan
Write-Host "📦 Compilando Next.js (Modo Standalone)..." -ForegroundColor Yellow

# Roda o build de produção (gera a pasta .next/standalone baseada no next.config.ts)
npm run build

# Verifica se o build gerou a pasta standalone
if (!(Test-Path ".next\standalone")) {
    Write-Host "❌ Erro: Pasta .next/standalone não encontrada. Verifique o next.config.ts" -ForegroundColor Red
    exit 1
}

# ==========================================
# 3. PREPARAR ARQUIVOS ESTÁTICOS
# ==========================================
Write-Host "📂 Copiando arquivos estáticos para o pacote standalone..." -ForegroundColor Yellow

# A pasta standalone precisa das pastas public e .next/static copiadas para dentro dela
Copy-Item -Path "public" -Destination ".next\standalone\public" -Recurse -Force
$staticDest = ".next\standalone\.next\static"
if (!(Test-Path $staticDest)) {
    New-Item -ItemType Directory -Force -Path $staticDest | Out-Null
}
Copy-Item -Path ".next\static\*" -Destination $staticDest -Recurse -Force

# ==========================================
# 4. COMPACTAR PARA ENVIO
# ==========================================
Write-Host "🗜️ Compactando arquivos para envio (deploy.zip)..." -ForegroundColor Yellow
if (Test-Path "deploy.zip") { Remove-Item "deploy.zip" -Force }
Compress-Archive -Path ".next\standalone\*" -DestinationPath "deploy.zip" -Force

# ==========================================
# 5. ENVIO VIA SSH (SCP)
# ==========================================
Write-Host "✈️ Enviando deploy.zip para a Hostinger via SCP..." -ForegroundColor Cyan
Write-Host "Atenção: Pode ser solicitada a sua senha do SSH." -ForegroundColor DarkGray

# Comando SCP para enviar o arquivo para a pasta raiz do servidor
scp -P $SSH_PORT deploy.zip "${SSH_USER}@${SSH_HOST}:${REMOTE_DIR}/deploy.zip"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Arquivo enviado com sucesso!" -ForegroundColor Green
    
    # Executa comando remoto para descompactar o arquivo e iniciar/reiniciar o servidor
    Write-Host "🔄 Descompactando no servidor remoto..." -ForegroundColor Yellow
    ssh -p $SSH_PORT "${SSH_USER}@${SSH_HOST}" "cd ${REMOTE_DIR} && unzip -o deploy.zip && rm deploy.zip && echo 'Descompactado com sucesso! Agora você pode reiniciar seu App Node.js no hPanel.'"
    
    Write-Host "🎉 DEPLOY CONCLUÍDO COM SUCESSO!" -ForegroundColor Green
    Write-Host "👉 Vá até o painel da Hostinger e reinicie sua aplicação Node.js (ou configure o server.js se for hospedagem compartilhada)." -ForegroundColor Cyan
} else {
    Write-Host "❌ Falha no envio SCP." -ForegroundColor Red
}

# Limpeza local
if (Test-Path "deploy.zip") { Remove-Item "deploy.zip" -Force }
