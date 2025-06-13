import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navegation/Navegation.types';

export interface AppointmentScreenProps {
    navigation: StackNavigationProp<RootStackParamList, 'AppointmentScreen'>;
}

export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'RESCHEDULED' | 'REJECTED' | 'COMPLETED';

export interface Appointment {
    id: string;
    title: string;
    description?: string;
    status: AppointmentStatus;
    requestedDate: string;
    suggestedDate?: string;
    confirmedDate?: string;
    duration: number;
    userId: string;
    adminId?: string;
    admin?: {
        firstName: string;
        lastName: string;
        email: string;
    };
}
