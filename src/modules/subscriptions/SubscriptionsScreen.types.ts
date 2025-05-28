import { DrawerScreenProps } from '@react-navigation/drawer';
import { DrawerParamList } from '../../modules/navegation/navegation.types';
import { User } from '../dashboard/DashboardScreen.types';

export type SubscriptionsScreenProps = DrawerScreenProps<DrawerParamList, 'Subscriptions'>;

export type SubscriptionPlanType = 'Free' | 'Premium';

export interface SubscriptionPlan {
    icon: string;
    id: string;
    name: string;
    price: number;
    period: string;
    features: string[];
    isCurrent?: boolean;
    highlight?: boolean;
}

export interface SubscriptionStatus {
    plan: 'Free' | 'Premium';
    status: 'active' | 'expired' | 'inactive';
    startDate: string;
    endDate: string;
}

export interface SubscriptionHistoryItem {
    plan: string;
    status: string;
    startDate: string;
    endDate: string;
    paymentAmount: number;
    user: User;
}

export interface SubscriptionResponse {
    success: boolean;
    message?: string;
    subscription?: SubscriptionStatus;
}

export interface SubscriptionError {
    error: string;
    message: string;
}
