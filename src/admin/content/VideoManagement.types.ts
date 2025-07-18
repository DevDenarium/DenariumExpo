export interface EducationalContent {
    id: string;
    title: string;
    description: string;
    type: 'VIDEO' | 'STORY';
    categoryId: string;
    videoUrl?: string;
    duration?: number;
    isPremium: boolean;
    freeViewDuration?: number; // Tiempo en minutos que los usuarios free pueden ver
    isActive: boolean;
    createdById?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface ContentCategory {
    id: string;
    name: string;
    description?: string;
    isActive?: boolean;
    icon?: string;
    color?: string;
}

export interface CreateContentForm {
    title: string;
    description: string;
    type: 'VIDEO' | 'STORY';
    categoryId: string;
    videoUrl: string;
    duration: number;
    isPremium: boolean;
    freeViewDuration?: number; // Solo requerido si isPremium es true
    isActive: boolean;
}


export interface UpdateContentForm {
    id: string;
    title?: string;
    description?: string;
    categoryId?: string;
    videoUrl?: string;
    duration?: number;
    isPremium?: boolean;
    freeViewDuration?: number;
    isActive?: boolean;
}

export interface VideoManagementProps {
    navigation: any;
}
