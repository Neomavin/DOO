# Script para corregir problemas de rutas en Windows con Expo
# Ejecutar como: .\fix-windows-paths.ps1

Write-Host "=== Corrigiendo problemas de rutas en Windows para Expo ===" -ForegroundColor Cyan

# 1. Detener procesos de Node
Write-Host "`n[1/5] Deteniendo procesos de Node..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# 2. Limpiar caché de Expo
Write-Host "[2/5] Limpiando caché de Expo..." -ForegroundColor Yellow
Remove-Item -Path ".expo" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "dist" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "node_modules\.cache" -Recurse -Force -ErrorAction SilentlyContinue

# 3. Limpiar caché de Metro
Write-Host "[3/5] Limpiando caché de Metro..." -ForegroundColor Yellow
if (Test-Path "$env:TEMP\metro-*") {
    Remove-Item -Path "$env:TEMP\metro-*" -Recurse -Force -ErrorAction SilentlyContinue
}
if (Test-Path "$env:TEMP\haste-map-*") {
    Remove-Item -Path "$env:TEMP\haste-map-*" -Recurse -Force -ErrorAction SilentlyContinue
}

# 4. Limpiar caché de npm
Write-Host "[4/5] Limpiando caché de npm..." -ForegroundColor Yellow
npm cache clean --force 2>$null

# 5. Iniciar servidor con caché limpia
Write-Host "[5/5] Iniciando servidor de Expo con caché limpia..." -ForegroundColor Yellow
Write-Host "`nEl servidor se iniciará en unos segundos..." -ForegroundColor Green
Write-Host "Si el problema persiste, intenta:" -ForegroundColor Cyan
Write-Host "  1. Cerrar completamente el navegador" -ForegroundColor White
Write-Host "  2. Ejecutar: npm install" -ForegroundColor White
Write-Host "  3. Ejecutar este script nuevamente" -ForegroundColor White
Write-Host ""

# Iniciar Expo con puerto explícito para evitar error 65536
npx expo start --clear --port 8081
