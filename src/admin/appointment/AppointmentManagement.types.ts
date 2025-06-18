export type AppointmentStatus =
    'PENDING' |
    'CONFIRMED' |
    'CANCELLED' |
    'RESCHEDULED' |
    'REJECTED' |
    'COMPLETED';

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
}

export interface Appointment {
    id: string;
    title: string;
    description?: string;
    requestedDate: string;
    suggestedDate?: string;
    confirmedDate?: string;
    duration: number;
    status: AppointmentStatus;
    user: User;
}

export interface AppointmentManagementProps {
    navigation: any;
}
