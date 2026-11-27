# =====================================================
# Backup Diario Automático de PostgreSQL (pg_dump)
# Uso: .\scripts\backup_bd.ps1 [-BackupDir "C:\Backups\Libreria"] [-RetentionDays 30]
# =====================================================
param(
    [string]$BackupDir = "",
    [int]$RetentionDays = 30
)

$ErrorActionPreference = "Stop"
$RootDir = Split-Path -Parent $PSScriptRoot
$EnvFile = Join-Path $RootDir ".env"

if (-not $BackupDir) {
    $BackupDir = Join-Path $RootDir "backups"
}

if (-not (Test-Path $EnvFile)) {
    throw "No se encontró el archivo .env en $EnvFile"
}

# Leer variables desde .env
$EnvVars = @{}
Get-Content $EnvFile | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith("#") -and $line.Contains("=")) {
        $parts = $line.Split("=", 2)
        $EnvVars[$parts[0].Trim()] = $parts[1].Trim()
    }
}

$DbUrl = $EnvVars["DB_URL"]
$DbUser = $EnvVars["DB_USER"]
$DbPassword = $EnvVars["DB_PASSWORD"]

# Extraer host, puerto y nombre de BD desde jdbc:postgresql://host:port/dbname
if ($DbUrl -match "jdbc:postgresql://([^:/]+):?(\d+)?/([^\?]+)") {
    $DbHost = $Matches[1]
    $DbPort = if ($Matches[2]) { $Matches[2] } else { "5432" }
    $DbName = $Matches[3]
} else {
    throw "Formato de DB_URL inválido en .env: $DbUrl"
}

if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
}

$Timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$OutputFile = Join-Path $BackupDir "backup_${DbName}_${Timestamp}.sql"

$env:PGPASSWORD = $DbPassword
try {
    pg_dump -h $DbHost -p $DbPort -U $DbUser -d $DbName -F p -f $OutputFile
    Write-Host "Backup generado correctamente: $OutputFile" -ForegroundColor Green
} finally {
    Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
}

# Limpiar backups antiguos
$CutoffDate = (Get-Date).AddDays(-$RetentionDays)
Get-ChildItem -Path $BackupDir -Filter "backup_${DbName}_*.sql" |
    Where-Object { $_.LastWriteTime -lt $CutoffDate } |
    ForEach-Object {
        Remove-Item $_.FullName -Force
        Write-Host "Backup antiguo eliminado: $($_.Name)" -ForegroundColor Yellow
    }
