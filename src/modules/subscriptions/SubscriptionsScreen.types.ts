import { DrawerScreenProps } from '@react-navigation/drawer';
import { DrawerParamList } from '../navegation/Navegation.types';
import { UserRole } from '../auth/user.types';

export type SubscriptionsScreenProps = DrawerScreenProps<DrawerParamList, 'Subscriptions'>;

export type SubscriptionPlanType =
    'PERSONAL_FREE' |
    'PERSONAL_PREMIUM' |
    'CORPORATE_FREE' |
    'CORPORATE_GOLD' |
    'CORPORATE_PREMIUM' |
    'CUSTOM';

export interface SubscriptionPlan {
    id: string;
    name: string;
    price: number;
    period: string;
    features: string[];
    isCurrent?: boolean;
    highlight?: boolean;
    icon: string;
    employeeLimit?: number;
    freeAdvisoryCount?: number;
    type: SubscriptionPlanType;
}

export interface SubscriptionStatus {
    planType: SubscriptionPlanType;
    status: 'ACTIVE' | 'CANCELED' | 'EXPIRED' | 'PENDING';
    startDate: string;
    endDate: string;
    employeeLimit?: number;
    freeAdvisoryCount?: number;
    daysRemaining?: number;
}

export interface SubscriptionResponse {
    success: boolean;
    message?: string;
    subscription?: SubscriptionStatus;
    planType: SubscriptionPlanType;
}

export interface SubscriptionError {
    error: string;
    message: string;
}
