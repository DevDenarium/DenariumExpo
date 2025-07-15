import {SubscriptionPlan, SubscriptionPlanType} from "../subscriptions/SubscriptionsScreen.types";
import { Appointment } from "../appointment/AppointmentScreen.types";

export type PaymentMetadata = {
    appointmentData?: string;
    [key: string]: string | undefined;
};

export type PaymentSuccessData = {
    paymentType: 'subscription' | 'appointment';
    subscription?: {
        id: string;
        name: string;
        price: number;
        period: string;
        features: string[];
        type: SubscriptionPlanType;
        [key: string]: any;
    };
    appointment?: Appointment;
};

export interface PaymentsScreenProps {
    route: {
        params: {
            plan: SubscriptionPlan;
            onSuccess?: (data: PaymentSuccessData) => Promise<void>;
            metadata?: PaymentMetadata;
        };
    };
    navigation: any;
}
