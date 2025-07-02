import { SubscriptionPlan } from "../subscriptions/SubscriptionsScreen.types";
import { Appointment } from "../appointment/AppointmentScreen.types";

export type PaymentMetadata = {
    appointmentData?: string;
    [key: string]: string | undefined;
};

export type PaymentSuccessData = {
    paymentType: 'subscription' | 'appointment';
    subscription?: SubscriptionPlan;
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
