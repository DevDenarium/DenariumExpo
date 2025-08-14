# Configuración de Google Sign-In para iOS 🍎

## Pasos de configuración

### 1. GoogleService-Info.plist
1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Selecciona tu proyecto
3. Ve a Project Settings > Your apps > iOS
4. Registra tu app con el Bundle ID: `com.denarium.app`
5. Descarga el archivo `GoogleService-Info.plist`
6. Coloca el archivo en la raíz del proyecto

### 2. Configuración ya realizada ✅
- Las dependencias necesarias ya están configuradas en el proyecto
- Los URL Schemes están configurados en `app.json`
- El Client ID de iOS ya está configurado: `1065172753437-t37ak00d7cfj6jqotjsm8q7aq8agtumq.apps.googleusercontent.com`

### 3. Pruebas
1. Ejecuta `expo run:ios` para generar el proyecto nativo de iOS
2. Prueba en un dispositivo real o simulador iOS
3. Verifica que el botón de Google Sign-In funcione correctamente

### Compatibilidad
- iOS 12+
- Funciona tanto en simulador como en dispositivo real
- Compatible con las últimas versiones de iOS

### Solución de problemas
Si tienes problemas con el inicio de sesión:
1. Verifica que el Bundle ID coincida en:
   - app.json
   - GoogleService-Info.plist
   - Configuración de Google Cloud Console
2. Asegúrate de que el archivo GoogleService-Info.plist esté en la ubicación correcta
3. Verifica que los URL Schemes estén correctamente configurados

### Notas importantes
- La implementación actual mantiene la compatibilidad con Android
- No se requieren cambios adicionales en el código existente
- El manejo de errores está incluido en la implementación actual
