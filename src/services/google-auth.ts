import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { Platform } from 'react-native';
import { useEffect, useState } from 'react';
import { loginWithGoogle as authServiceLogin } from './auth.service';

// 🔧 Interfaz para el resultado del login
interface GoogleLoginResult {
  access_token: string;
  user: any;
}

export const useGoogleAuth = () => {
    const [isConfigured, setIsConfigured] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);

    // 🔧 Configurar Google SDK al inicializar el hook
    useEffect(() => {
        const configureGoogleSignin = async () => {
            try {
                console.log('🔑 Configurando Google SDK...');
                
                // ✅ CONFIGURACIÓN MEJORADA PARA OBTENER idToken
                GoogleSignin.configure({
                    webClientId: '1065172753437-lbvso6nmm20bksgh00uau9pildude834.apps.googleusercontent.com',
                    offlineAccess: true,
                    hostedDomain: '',
                    forceCodeForRefreshToken: true,
                    // ✅ MEJORAS AGREGADAS:
                    iosClientId: '', // Déjalo vacío si no usas iOS
                    scopes: ['openid', 'profile', 'email'], // ✅ Especifica scopes explícitamente
                });
                
                console.log('✅ Google SDK configurado correctamente');
                setIsConfigured(true);
            } catch (error) {
                console.error('❌ Error configurando Google SDK:', error);
                setIsConfigured(false);
            } finally {
                setIsInitializing(false);
            }
        };

        configureGoogleSignin();
    }, []);

    const loginWithGoogle = async (): Promise<GoogleLoginResult> => {
        try {
            console.log('🎯 Iniciando login con Google...');
            
            // ✅ Verificar que esté configurado y listo
            if (isInitializing) {
                throw new Error('Google SDK aún se está inicializando. Espera un momento.');
            }
            
            if (!isConfigured) {
                throw new Error('Google SDK no está configurado correctamente.');
            }
            
            // 🔍 Verificar Google Play Services (solo Android)
            if (Platform.OS === 'android') {
                console.log('🔍 Verificando Google Play Services...');
                try {
                    await GoogleSignin.hasPlayServices({
                        showPlayServicesUpdateDialog: true,
                    });
                    console.log('✅ Google Play Services disponible');
                } catch (playServicesError) {
                    console.error('❌ Google Play Services no disponible:', playServicesError);
                    throw new Error('Google Play Services no está disponible o actualizado');
                }
            }

            // 🚪 Cerrar sesión previa si existe (limpia el estado)
            try {
                await GoogleSignin.signOut();
            } catch (signOutError) {
                // Ignorar errores de signOut si no hay sesión previa
                console.log('ℹ️ No hay sesión previa que cerrar');
            }

            // 🚀 Iniciar sesión - Abrir modal nativo de Google
            console.log('📱 Abriendo modal nativo de Google...');
            const userInfo: any = await GoogleSignin.signIn();
            
            console.log('✅ Login exitoso con Google, datos recibidos:', userInfo);
            
            // 🎯 CORRECCIÓN: Acceder a los datos desde userInfo.data
            const googleData = userInfo.data || userInfo; // Maneja ambos casos
            
            console.log('🔍 Verificando tokens disponibles:', {
                hasIdToken: !!googleData.idToken,
                hasServerAuthCode: !!googleData.serverAuthCode,
                idTokenValue: googleData.idToken ? 'Presente' : 'Ausente',
                serverAuthCodeValue: googleData.serverAuthCode ? 'Presente' : 'Ausente',
                hasUser: !!googleData.user,
                userEmail: googleData.user?.email
            });

            // 🎯 LÓGICA MEJORADA: Usar idToken o serverAuthCode desde data
            let tokenToSend = googleData.idToken;
            let tokenType = 'idToken';
            
            if (!tokenToSend && googleData.serverAuthCode) {
                console.log('⚡ idToken no disponible, usando serverAuthCode');
                tokenToSend = googleData.serverAuthCode;
                tokenType = 'serverAuthCode';
            }
            
            if (!tokenToSend) {
                console.error('❌ No se recibió ni idToken ni serverAuthCode. Datos completos:', userInfo);
                console.error('📊 Estructura de datos:', googleData);
                throw new Error('No se recibió token de Google. Verifica la configuración del webClientId.');
            }

    
            console.log('🔐 Enviando token al backend:', {
                tokenType,
                tokenValue: tokenToSend,
                userEmail: googleData.user?.email || 'Desconocido'
            });
            
            // 📤 Enviar token al backend usando tu servicio existente
            const userData = await authServiceLogin(tokenToSend);
            
            console.log('✅ Usuario autenticado exitosamente');
            return userData;

        } catch (error: any) {
            console.error('❌ Error en loginWithGoogle:', error);
            
            // 🎯 Manejo específico de errores del SDK
            if (error?.code === statusCodes.SIGN_IN_CANCELLED) {
                console.log('ℹ️ Usuario canceló el login');
                throw new Error('Login cancelado');
            }
            
            if (error?.code === statusCodes.IN_PROGRESS) {
                console.log('ℹ️ Login ya en progreso');
                throw new Error('Ya hay un login en progreso');
            }
            
            if (error?.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                console.log('❌ Google Play Services no disponible');
                throw new Error('Google Play Services no disponible');
            }
            
            if (error?.message?.includes('DEVELOPER_ERROR')) {
                console.error('🔍 DEVELOPER_ERROR detectado');
                console.error('📱 Platform:', Platform.OS);
                console.error('📦 Verifica en Google Console:');
                console.error('   - Client ID está habilitado');
                console.error('   - SHA-1 fingerprint registrado');
                console.error('   - Package name correcto');
                throw new Error('Error de configuración de Google - Verifica Google Console');
            }
            
            // Re-lanzar error original si no es uno conocido
            throw error;
        }
    };

    // 🚪 Función para cerrar sesión
    const signOut = async (): Promise<void> => {
        try {
            await GoogleSignin.signOut();
            console.log('✅ Sesión de Google cerrada correctamente');
        } catch (error) {
            console.error('❌ Error cerrando sesión de Google:', error);
            throw error;
        }
    };

    // 📊 Función para obtener usuario actual (si existe)
    const getCurrentUser = async () => {
        try {
            const user = await GoogleSignin.getCurrentUser();
            return user;
        } catch (error) {
            console.log('ℹ️ No hay usuario de Google logueado actualmente');
            return null;
        }
    };

    return { 
        loginWithGoogle,
        signOut,
        getCurrentUser,
        isReady: isConfigured && !isInitializing,
        isInitializing,
        isConfigured
    };
};