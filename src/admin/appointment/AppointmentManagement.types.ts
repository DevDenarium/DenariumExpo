// src/admin/appointment/AppointmentManagement.types.ts

export {
    Appointment,
    AppointmentStatus,
    AppointmentManagementScreenProps
} from '../../modules/navegation/Navegation.types';

// Puedes añadir más props específicas si lo necesitas:
export type AppointmentManagementProps = {
    // Props específicas si hay navegación distinta en el admin
    navigation: any;
};
