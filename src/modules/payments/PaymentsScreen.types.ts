import { RouteProp } from '@react-navigation/native';
import {StackNavigationProp, StackScreenProps} from '@react-navigation/stack';
import { RootStackParamList } from '../navegation/Navegation.types';
import {User} from "../dashboard/DashboardScreen.types";

export type PaymentsScreenProps = StackScreenProps<RootStackParamList, 'Payments'>;


export type PaymentStatus = 'processing' | 'succeeded' | 'failed' | 'canceled' | 'form';

export type PaymentData = {
    sessionId: string;
    cardNumber: string;
    cardExpiry: string;
    cardCvc: string;
    cardholderName: string;
};
