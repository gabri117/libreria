@echo off
setlocal
set ROOT_DIR=%~dp0..
set PORT=8080
set URL=http://localhost:%PORT%

echo ===================================================
echo   POS Libreria Maria y Jose - Modo Escritorio
echo ===================================================

:: Verificar si el backend ya esta escuchando en el puerto 8080
powershell -NoProfile -Command "if (Test-NetConnection -ComputerName localhost -Port %PORT% -InformationLevel Quiet) { exit 0 } else { exit 1 }"
if %errorlevel% neq 0 (
    echo Iniciando servidor local en segundo plano...
    start "POS-Libreria-Backend" /MIN cmd /c "cd /d ""%ROOT_DIR%"" && java -jar target\libreria-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod"
    echo Esperando a que el sistema este listo...
    powershell -NoProfile -Command "for ($i=0; $i -lt 30; $i++) { if (Test-NetConnection -ComputerName localhost -Port %PORT% -InformationLevel Quiet) { exit 0 }; Start-Sleep -Seconds 1 }; exit 1"
)

:: Abrir en modo ventana limpia (app de escritorio) con Edge o Chrome
where msedge >nul 2>&1
if %errorlevel% equ 0 (
    start "" msedge --app=%URL%
    exit /b 0
)

where chrome >nul 2>&1
if %errorlevel% equ 0 (
    start "" chrome --app=%URL%
    exit /b 0
)

:: Fallback navegador predeterminado
start "" %URL%
endlocal
