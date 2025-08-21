export enum ScheduleBlockType {
  SPECIFIC_TIME = 'SPECIFIC_TIME',
  FULL_DAY = 'FULL_DAY',
  RECURRING = 'RECURRING'
}

export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY'
}

export interface ScheduleBlock {
  id: string;
  type: ScheduleBlockType;
  date?: string;
  startTime?: string;
  endTime?: string;
  startDate?: string;
  endDate?: string;
  daysOfWeek?: DayOfWeek[];
  reason?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    adminUser: {
      firstName: string;
      lastName: string;
    };
  };
}

export interface CreateScheduleBlockDto {
  type: ScheduleBlockType;
  date?: string;
  startTime?: string;
  endTime?: string;
  startDate?: string;
  endDate?: string;
  daysOfWeek?: DayOfWeek[];
  reason?: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  reason?: string;
}

export interface AvailabilityResponse {
  time: string;
  available: boolean;
  reason?: string;
}

export const DAY_LABELS = {
  [DayOfWeek.MONDAY]: 'Lunes',
  [DayOfWeek.TUESDAY]: 'Martes',
  [DayOfWeek.WEDNESDAY]: 'Miércoles',
  [DayOfWeek.THURSDAY]: 'Jueves',
  [DayOfWeek.FRIDAY]: 'Viernes',
  [DayOfWeek.SATURDAY]: 'Sábado',
  [DayOfWeek.SUNDAY]: 'Domingo'
};

export const BLOCK_TYPE_LABELS = {
  [ScheduleBlockType.SPECIFIC_TIME]: 'Horario Específico',
  [ScheduleBlockType.FULL_DAY]: 'Día Completo',
  [ScheduleBlockType.RECURRING]: 'Recurrente'
};
