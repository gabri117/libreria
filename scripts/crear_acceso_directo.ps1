# =====================================================
# Crea el acceso directo en el Escritorio de Windows
# =====================================================
$ErrorActionPreference = "Stop"
$RootDir = Split-Path -Parent $PSScriptRoot
$TargetScript = Join-Path $RootDir "scripts\iniciar_app_local.bat"
$DesktopPath = [Environment]::GetFolderPath("Desktop")
$ShortcutPath = Join-Path $DesktopPath "POS Libreria Maria y Jose.lnk"

$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = $TargetScript
$Shortcut.WorkingDirectory = $RootDir
$Shortcut.Description = "Sistema POS - Libreria Maria y Jose"
$Shortcut.WindowStyle = 7 # Minimizado para no mostrar consola
$Shortcut.Save()

Write-Host "Acceso directo creado en: $ShortcutPath" -ForegroundColor Green
