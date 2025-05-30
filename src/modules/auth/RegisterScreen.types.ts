export interface RegisterFormData {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    phone?: string;
    country?: string;
}

export interface RegisterResponse {
    success: boolean;
    message?: string;
    user?: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        phone?: string;
        country?: string;
        role: string;
    };
}

export interface RegisterScreenProps {
    navigation: {
        navigate: (route: string, params?: { message?: string }) => void;
        goBack: () => void;
    };
}
