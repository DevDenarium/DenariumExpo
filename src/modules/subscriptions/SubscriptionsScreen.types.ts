import { DrawerScreenProps } from '@react-navigation/drawer';
import { DrawerParamList } from '../navegation/Navegation.types';

export type SubscriptionsScreenProps = DrawerScreenProps<DrawerParamList, 'Subscriptions'>;

export type SubscriptionPlanType =
    'PERSONAL_FREE' |
    'PERSONAL_PREMIUM' |
    'CORPORATE_FREE' |
    'CORPORATE_GOLD' |
    'CORPORATE_PREMIUM' | 'ADVISORY_SINGLE';

export interface SubscriptionPlan {
    id: string;
    name: string;
    price: number;
    period: string;
    features: string[];
    highlight?: boolean;
    icon: string;
    employeeLimit?: number;
    freeAdvisoryCount?: number;
    type: SubscriptionPlanType;
}

export interface SubscriptionStatus {
    plan: SubscriptionPlanType;
    planName: string;
    status: 'ACTIVE' | 'CANCELED' | 'EXPIRED' | 'PENDING';
    startDate: string;
    endDate: string;
    daysRemaining: number;
    isPremium: boolean;
    features: string[];
    employeeLimit?: number;
    freeAdvisoryCount?: number;
}

export interface SubscriptionResponse {
    success: boolean;
    message?: string;
    subscription?: SubscriptionStatus;
    planType?: SubscriptionPlanType;
}
