export interface AuthResponse {
    access_token: string;
    user: {
        id: string;
        email: string;
        firstName?: string;
        lastName?: string;
        picture?: string;
    };
}

export interface LoginScreenProps {
    navigation: {
        navigate: (route: string, params?: { user: AuthResponse['user'] }) => void;
        goBack: () => void;
    };
}


