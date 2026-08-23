@echo off
cd /d "E:\v8Nova-Indavent-Local-Backup"
if exist 01_migracao_tabelas.sql (
    ren 01_migracao_tabelas.sql 01_migracao_tabelas.sql.bak
    echo Arquivo 01_migracao_tabelas.sql renomeado para liberar a IA.
) else (
    echo Arquivo ja foi renomeado ou nao existe.
)
pause
