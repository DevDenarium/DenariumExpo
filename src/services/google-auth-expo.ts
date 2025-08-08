import { useEffect, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { loginWithGoogle as authServiceLogin } from './auth.service';

// ✅ Configurar WebBrowser para auth
WebBrowser.maybeCompleteAuthSession();

// 🔧 Interfaz para el resultado del login
interface GoogleLoginResult {
  access_token: string;
  user: any;
}

// 📋 Configuración de Google OAuth
const getGoogleConfig = () => {
  const clientId = Platform.select({
    ios: '1065172753437-t37ak00d7cfj6jqotjsm8q7aq8agtumq.apps.googleusercontent.com',
    android: '1065172753437-725fg2ephiqug140qccfejgkdfocq7tl.apps.googleusercontent.com',
    default: '1065172753437-lbvso6nmm20bksgh00uau9pildude834.apps.googleusercontent.com'
  });

  const redirectUri = 'https://auth.expo.io/@hazelmolina/DenariumExpo';

  return {
    clientId,
    redirectUri,
    scopes: ['openid', 'profile', 'email'],
  };
};

export const useGoogleAuthExpo = () => {
  const [isReady, setIsReady] = useState(true);

  const loginWithGoogle = async (): Promise<GoogleLoginResult> => {
    try {
      console.log('🎯 Iniciando login con Google (Expo WebBrowser)...');
      
      const config = getGoogleConfig();
      
      // 🔧 Construir URL de Google OAuth manualmente
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${encodeURIComponent(config.clientId)}&` +
        `redirect_uri=${encodeURIComponent(config.redirectUri)}&` +
        `response_type=id_token&` +
        `scope=${encodeURIComponent(config.scopes.join(' '))}&` +
        `nonce=${Math.random().toString(36).substring(2, 15)}`;

      console.log('📱 Abriendo navegador para Google OAuth...');
      
      // 🚀 Abrir navegador web
      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        config.redirectUri
      );

      console.log('📊 Resultado de autenticación:', result);

      if (result.type === 'success' && result.url) {
        // ✅ Parsear el resultado de la URL
        const urlParts = result.url.split('#');
        if (urlParts.length > 1) {
          const params = new URLSearchParams(urlParts[1]);
          const idToken = params.get('id_token');
          
          if (!idToken) {
            throw new Error('No se recibió ID token de Google');
          }

          console.log('🔐 Token recibido, enviando al backend...');
          
          // 📤 Enviar token al backend
          const userData = await authServiceLogin(idToken);
          
          console.log('✅ Usuario autenticado exitosamente');
          return userData;
        } else {
          throw new Error('URL de respuesta inválida');
        }
        
      } else if (result.type === 'cancel') {
        throw new Error('Login cancelado por el usuario');
      } else {
        throw new Error(`Error en autenticación: ${result.type}`);
      }

    } catch (error: any) {
      console.error('❌ Error en loginWithGoogle (Expo):', error);
      throw error;
    }
  };

  // 🚪 Función para cerrar sesión
  const signOut = async (): Promise<void> => {
    try {
      console.log('✅ Sesión preparada para cerrar (Expo WebBrowser)');
    } catch (error) {
      console.error('❌ Error cerrando sesión:', error);
      throw error;
    }
  };

  // 📊 No hay usuario actual persistente
  const getCurrentUser = async () => {
    return null;
  };

  return {
    loginWithGoogle,
    signOut,
    getCurrentUser,
    isReady: true,
    isInitializing: false,
    isConfigured: true,
  };
};
