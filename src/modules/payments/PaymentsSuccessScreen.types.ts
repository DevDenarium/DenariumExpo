import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navegation/Navegation.types';
import { Appointment } from '../appointment/AppointmentScreen.types';

export type PaymentSuccessScreenProps = {
    navigation: StackNavigationProp<RootStackParamList, 'PaymentSuccess'>;
    route: RouteProp<RootStackParamList, 'PaymentSuccess'> & {
        params: {
            sessionId: string;
            amount?: number;
            planName?: string;
            paymentType: 'subscription' | 'appointment'; // Añade esta línea
            appointmentId?: string; // Añade esta línea si también la necesitas
        };
    };
};

export type PaymentSuccessScreenParams = {
    sessionId: string;
    amount?: number;
    planName?: string;
    paymentType: 'subscription' | 'appointment'; // Añade esta línea
    appointmentId?: string; // Añade esta línea si también la necesitas
};
