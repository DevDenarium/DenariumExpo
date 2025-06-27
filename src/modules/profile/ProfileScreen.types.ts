
import {UserResponse} from "../auth/user.types";

export interface ProfileScreenProps {
    user: UserResponse;
    onUpdate: (updatedData: Partial<UserResponse>) => Promise<void>;
}

export interface ProfileFormValues {
    firstName: string;
    lastName: string;
    phone: string;
    country: string;
    profilePicture?: string;
}
