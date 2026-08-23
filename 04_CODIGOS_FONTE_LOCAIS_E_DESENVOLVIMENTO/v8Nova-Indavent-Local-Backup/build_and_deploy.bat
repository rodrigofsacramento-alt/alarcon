@echo off
echo ===================================================
echo   COMPILANDO E SUBINDO FRONTEND DA NOVA INDAVENT
echo ===================================================
set PATH=C:\Users\Filom\.gemini\antigravity-ide\scratch\node-win\node-v20.15.1-win-x64;%PATH%
cd /d "E:\v8Nova-Indavent-Local-Backup"
echo 1. Limpando cache e compilacao antiga...
if exist .next rmdir /s /q .next
if exist out rmdir /s /q out
echo 2. Executando build de producao (exportacao estatica)...
call npm run build
if %errorlevel% neq 0 (
    echo [ERRO] Falha ao compilar o projeto Next.js!
    pause
    exit /b %errorlevel%
)
echo 3. Iniciando deploy via SFTP...
node deploy_indavent_frontend.mjs
if %errorlevel% neq 0 (
    echo [ERRO] Falha ao fazer o upload dos arquivos!
    pause
    exit /b %errorlevel%
)
echo ===================================================
echo   DEPLOY CONCLUIDO COM SUCESSO!
echo ===================================================
pause
