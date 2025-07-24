import {SubscriptionPlanType} from "../subscriptions/SubscriptionsScreen.types";

export enum UserRole {
    PERSONAL = 'PERSONAL',
    CORPORATE = 'CORPORATE',
    CORPORATE_EMPLOYEE = 'CORPORATE_EMPLOYEE',
    ADMIN = 'ADMIN',
    ADVISOR = 'ADVISOR'
}

export interface AuthResponse {
    access_token: string;
    user: UserResponse;
}

export interface RegisterResponse {
    success: boolean;
    message?: string;
    user?: UserResponse;
    requiresVerification?: boolean;
}

export interface UserResponse {
    id: string;
    access_token?: string;
    email: string;
    role: UserRole;
    isPremium: boolean;
    isSocialAuth: boolean;
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    country?: string;
    province?: string;
    canton?: string;
    district?: string;
    profilePicture?: string;
    subscriptionType?: SubscriptionPlanType;
    personalUser?: PersonalUser;
    corporateUser?: CorporateUser;
    corporateEmployee?: CorporateEmployee;
    adminUser?: AdminUser;
    advisorUser?: AdvisorUser;
    activeSubscription?: ActiveSubscription;
}

interface PersonalUser {
    firstName: string;
    lastName: string;
    phone: string;
    location: LocationDetails;
}

interface CorporateUser {
    companyName: string;
    phone: string;
    contactName: string;
    contactPhone: string;
    employeeCount: number;
    isPremium: boolean;
    maxEmployees?: number;
    companyDomain: string;
    location: LocationDetails;
}

interface CorporateEmployee {
    firstName: string;
    lastName: string;
    phone: string;
    corporateId: string;
    corporateName: string;
    location: LocationDetails;
}

interface AdminUser {
    firstName: string;
    lastName: string;
    isSuperAdmin: boolean;
}

interface AdvisorUser {
    firstName: string;
    lastName: string;
    specialty?: string;
    isActive: boolean;
}

interface ActiveSubscription {
    planType: string;
    startDate: string;
    endDate: string;
    status: string;
}

interface LocationDetails {
    country: string;
    province?: {
        id: string;
        name: string;
    };
    canton?: {
        id: string;
        name: string;
    };
    district?: {
        id: string;
        name: string;
    };
}

export interface Country {
    name: string;
    code: string;
}

export interface Location {
    country: string;
    province?: string;
    canton?: string;
    district?: string;
}

export interface PersonalRegisterData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    location: Location;
}

export interface CorporateRegisterData {
    email: string;
    password: string;
    companyName: string;
    phone: string;
    contactName: string;
    contactPhone: string;
    location: Location;
    employeeCount: number;
    companyDomain: string;
}

export interface CorporateEmployeeRegisterData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    location: Location;
    corporateId: string;
}
