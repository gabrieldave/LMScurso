# Script para corregir módulos de Expo que usan expo-module-gradle-plugin
$modules = @(
    "expo-constants",
    "expo-font", 
    "expo-linking"
)

foreach ($module in $modules) {
    $buildGradle = "node_modules\$module\android\build.gradle"
    if (Test-Path $buildGradle) {
        Write-Host "Corrigiendo $module..."
        $content = Get-Content $buildGradle -Raw
        
        # Reemplazar el plugin con la aplicación directa
        $newContent = $content -replace "id 'expo-module-gradle-plugin'", ""
        $newContent = $newContent -replace "plugins \{[^}]*\}", "plugins {`n  id 'com.android.library'`n}"
        
        # Agregar aplicación del plugin después de plugins
        if ($newContent -notmatch "applyKotlinExpoModulesCorePlugin") {
            $pluginApply = @"

apply from: new File(["node", "--print", "require.resolve('expo-modules-core/package.json')"].execute(null, rootDir).text.trim()).getParentFile().toString() + "/android/ExpoModulesCorePlugin.gradle"
applyKotlinExpoModulesCorePlugin()
useDefaultAndroidSdkVersions()

"@
            $newContent = $newContent -replace "(plugins \{[\s\S]*?\})", "`$1`n$pluginApply"
        }
        
        Set-Content -Path $buildGradle -Value $newContent
        Write-Host "✓ $module corregido"
    }
}

Write-Host "`nTodos los módulos han sido corregidos!"

