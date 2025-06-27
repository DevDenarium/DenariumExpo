import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navegation/Navegation.types';
import { SubscriptionPlan } from "../subscriptions/SubscriptionsScreen.types";

export type PaymentsScreenRouteParams = {
    plan: SubscriptionPlan;
    onSuccess?: () => Promise<void>;
};

export type PaymentsScreenProps = {
    route: RouteProp<RootStackParamList, 'PaymentsScreen'>;
    navigation: StackNavigationProp<RootStackParamList, 'PaymentsScreen'>;
};

export type PaymentData = {
    sessionId: string;
    cardNumber: string;
    cardExpiry: string;
    cardCvc: string;
    cardholderName: string;
};
