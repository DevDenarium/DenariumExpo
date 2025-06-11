import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navegation/Navegation.types';
import { User } from '../dashboard/DashboardScreen.types';

export type PaymentSuccessScreenProps = {
    navigation: StackNavigationProp<RootStackParamList, 'PaymentSuccess'>;
    route: RouteProp<RootStackParamList, 'PaymentSuccess'> & {
        params: {
            sessionId: string;
            amount?: number;
            planName?: string;
            user: User;
        };
    };
};

export type PaymentSuccessScreenParams = {
    sessionId: string;
    amount?: number;
    planName?: string;
    user: User;
};
