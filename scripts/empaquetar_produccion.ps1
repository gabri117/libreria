# =====================================================
# Empaquetado de Producción (Opción 1: JAR único + SPA)
# =====================================================
$ErrorActionPreference = "Stop"
$RootDir = Split-Path -Parent $PSScriptRoot
$FrontendDir = Join-Path $RootDir "frontend"
$StaticDir = Join-Path $RootDir "src\main\resources\static"

Write-Host "1/3 Compilando frontend React..." -ForegroundColor Cyan
Push-Location $FrontendDir
try {
    npm ci
    npm run build
} finally {
    Pop-Location
}

Write-Host "2/3 Copiando frontend/dist hacia src/main/resources/static..." -ForegroundColor Cyan
if (Test-Path $StaticDir) {
    Get-ChildItem -Path $StaticDir -Force | Remove-Item -Recurse -Force
} else {
    New-Item -ItemType Directory -Path $StaticDir -Force | Out-Null
}
Copy-Item -Path (Join-Path $FrontendDir "dist\*") -Destination $StaticDir -Recurse -Force

Write-Host "3/3 Empaquetando Spring Boot JAR..." -ForegroundColor Cyan
Push-Location $RootDir
try {
    .\mvnw.cmd clean package -DskipTests
} finally {
    Pop-Location
}

Write-Host "`nEmpaquetado completado: target\libreria-0.0.1-SNAPSHOT.jar" -ForegroundColor Green
