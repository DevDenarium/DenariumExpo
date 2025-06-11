import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navegation/Navegation.types';

type VerificationScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    'Verification'
>;

type LoginScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    'Login'
>;

export interface VerificationScreenProps {
    navigation: LoginScreenNavigationProp;
    route: {
        params: {
            email: string;
        };
    };
}
