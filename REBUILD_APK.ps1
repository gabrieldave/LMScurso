# Script para regenerar el bundle y compilar el APK con las variables de entorno

Write-Host "=== Regenerando Bundle y APK ===" -ForegroundColor Green

# Verificar que existe .env
if (-not (Test-Path ".env")) {
    Write-Host "`n⚠️ ERROR: No se encontró el archivo .env" -ForegroundColor Red
    Write-Host "Crea un archivo .env con tus credenciales de Supabase" -ForegroundColor Yellow
    Write-Host "Puedes usar .env.ejemplo como referencia`n" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n1. Limpiando proyecto anterior..." -ForegroundColor Cyan
cd android
$env:ANDROID_HOME = "C:\Users\dakyo\AppData\Local\Android\Sdk"
.\gradlew clean --no-daemon | Out-Null

cd ..

Write-Host "`n2. Creando directorio de assets..." -ForegroundColor Cyan
if (-not (Test-Path "android\app\src\main\assets")) {
    New-Item -ItemType Directory -Path "android\app\src\main\assets" -Force | Out-Null
}

Write-Host "`n3. Generando bundle de JavaScript..." -ForegroundColor Cyan
npx expo export --platform android --output-dir android/app/src/main/assets --clear

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Error al generar el bundle" -ForegroundColor Red
    exit 1
}

Write-Host "`n4. Compilando APK..." -ForegroundColor Cyan
cd android
.\gradlew assembleRelease --no-daemon

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ APK generado exitosamente!" -ForegroundColor Green
    Write-Host "Ubicación: android\app\build\outputs\apk\release\app-release.apk" -ForegroundColor Green
} else {
    Write-Host "`n❌ Error al compilar el APK" -ForegroundColor Red
    exit 1
}

cd ..




