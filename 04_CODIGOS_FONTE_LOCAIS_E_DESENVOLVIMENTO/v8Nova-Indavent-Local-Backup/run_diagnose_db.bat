@echo off
echo ===================================================
echo   DIAGNOSTICANDO COLUNAS DO SUPABASE (NOVA INDAVENT)
echo ===================================================
set PATH=C:\Users\Filom\.gemini\antigravity-ide\scratch\node-win\node-v20.15.1-win-x64;%PATH%
cd /d "E:\v8Nova-Indavent-Local-Backup"
node diagnose_db.mjs
pause
