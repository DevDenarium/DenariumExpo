export interface EducationalContent {
    id: string;
    title: string;
    description: string;
    videoUrl?: string;
    type: 'VIDEO' | 'STORY';
    duration: number;
    isPremium: boolean;
    freeViewDuration?: number; // Tiempo en minutos que usuarios free pueden ver
    category: {
        id: string;
        name: string;
        color: string;
        icon: string;
    };
}

export interface EducationalCategory {
    id: string;
    name: string;
    icon: string;
    color: string;
}

export interface ProgressData {
    contentId: string;
    progress: number;
    isCompleted: boolean;
}


// EducationalScreen.types.ts

// Define y exporta el tipo ContentCategory

export interface EducationalContent {
    id: string;
    title: string;
    description: string;
    type: 'VIDEO' | 'STORY';
    categoryId: string;
    videoUrl?: string;
    duration: number;
    isPremium: boolean;
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
    icon: string;
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
    isActive: boolean;
}

export interface UpdateContentForm extends Partial<CreateContentForm> {
    id: string;
}
