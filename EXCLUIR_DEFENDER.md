# Excluir Carpetas de Microsoft Defender para Android Studio

Microsoft Defender puede ralentizar significativamente el build de Android. Sigue estos pasos para excluir las carpetas necesarias:

## Pasos para Excluir Carpetas en Microsoft Defender:

### Opción 1: Desde la Configuración de Windows

1. **Abre la Configuración de Windows**
   - Presiona `Windows + I`
   - O busca "Configuración" en el menú inicio

2. **Ve a Seguridad de Windows**
   - Busca "Seguridad de Windows" en la configuración
   - O escribe "Windows Security" en la búsqueda

3. **Accede a Protección contra virus y amenazas**
   - Click en "Protección contra virus y amenazas"
   - Click en "Administrar configuración" (en Protección contra virus y amenazas)

4. **Agrega Exclusiones**
   - Scroll hacia abajo hasta "Exclusiones"
   - Click en "Agregar o quitar exclusiones"
   - Click en "Agregar una exclusión" > "Carpeta"

5. **Agrega estas 3 carpetas:**
   - `C:\lms-mobile-app\android`
   - `C:\Users\dakyo\.gradle`
   - `C:\Users\dakyo\AppData\Local\Android\`

### Opción 2: Desde Android Studio (Recomendado)

1. **En la ventana de advertencia que te aparece:**
   - Click en el botón **"Exclude folders"**
   - Esto abrirá automáticamente la configuración de Windows Defender
   - Confirma las exclusiones

### Opción 3: Usando PowerShell (Administrador)

Abre PowerShell como Administrador y ejecuta:

```powershell
Add-MpPreference -ExclusionPath "C:\lms-mobile-app\android"
Add-MpPreference -ExclusionPath "$env:USERPROFILE\.gradle"
Add-MpPreference -ExclusionPath "$env:LOCALAPPDATA\Android"
```

## Verificar que las Exclusiones Están Activas

1. Ve a Seguridad de Windows > Protección contra virus y amenazas
2. Click en "Administrar configuración"
3. Scroll hasta "Exclusiones"
4. Verifica que las 3 carpetas aparezcan en la lista

## Notas Importantes

- Esto mejorará significativamente el rendimiento del build
- No afecta la seguridad general, solo excluye estas carpetas específicas de desarrollo
- Es una práctica común y recomendada para desarrollo Android

## Después de Excluir las Carpetas

1. Cierra y vuelve a abrir Android Studio
2. Intenta hacer el build nuevamente
3. Deberías notar una mejora significativa en la velocidad





