export type AppointmentStatus =
    'PENDING_PAYMENT' |
    'PENDING_ADMIN_REVIEW' |
    'CONFIRMED' |
    'CANCELLED' |
    'RESCHEDULED' |
    'REJECTED' |
    'COMPLETED';


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
    advisorId?: string;
    isVirtual: boolean;
    meetingLink?: string;
    paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED';
    user?: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        role: 'PERSONAL' | 'CORPORATE' | 'CORPORATE_EMPLOYEE';
    };
    admin?: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    advisor?: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
}
