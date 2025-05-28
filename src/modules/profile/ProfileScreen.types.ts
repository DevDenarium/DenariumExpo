import { User } from '../dashboard/DashboardScreen.types';

export interface ProfileScreenProps {
    route: {
        params: {
            user: User;
        };
    };
    navigation: any;
}
