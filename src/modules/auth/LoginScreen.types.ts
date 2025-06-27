import {UserResponse} from "./user.types";

export interface AuthResponse {
    access_token: string;
    user: UserResponse;
}

export interface LoginScreenProps {
    navigation: {
        navigate: (route: string, params?: { user: AuthResponse['user'] }) => void;
        goBack: () => void;
    };
}
