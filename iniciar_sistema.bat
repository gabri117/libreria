@echo off
echo ===================================================
echo   Iniciando Sistema POS - Libreria Maria y Jose
echo ===================================================
echo.
echo Verificando si Docker esta corriendo...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker no se esta ejecutando. Por favor inicia Docker Desktop.
    pause
    exit /b
)

echo Construyendo e iniciando contenedores...
docker-compose up -d --build

echo.
echo ===================================================
echo   SISTEMA INICIADO CORRECTAMENTE
echo   Backend: http://localhost:8080
echo   Frontend: http://localhost
echo ===================================================
echo.
pause
