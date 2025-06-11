import { useIdTokenAuthRequest } from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { makeRedirectUri } from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

export const useGoogleAuth = () => {
    const clientId = Platform.select({
        android: Constants.expoConfig?.extra?.googleClientIdAndroid,
        ios: Constants.expoConfig?.extra?.googleClientIdIos,
        web: Constants.expoConfig?.extra?.googleClientIdWeb,
    });

    if (!clientId) {
        throw new Error('Google Client ID no está configurado para esta plataforma');
    }

    const redirectUri = makeRedirectUri({
        scheme: 'denarium',
        preferLocalhost: true,
    });

    console.log('Redirect URI generado:', redirectUri);

    const [request, response, promptAsync] = useIdTokenAuthRequest({
        clientId: Constants.expoConfig?.extra?.googleClientIdExpo,
        iosClientId: Constants.expoConfig?.extra?.googleClientIdIos,
        androidClientId: Constants.expoConfig?.extra?.googleClientIdAndroid,
        webClientId: Constants.expoConfig?.extra?.googleClientIdWeb,
        scopes: ['openid', 'profile', 'email'],
        redirectUri,
        responseType: 'id_token',
        extraParams: {
            prompt: 'select_account',
        },
    });

    return { request, response, promptAsync };
};
