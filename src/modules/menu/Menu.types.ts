import {User} from "../dashboard/DashboardScreen.types";

export type MenuItem = {
    id: string;
    title: string;
    icon: string;
    screen: string;
};

export type MenuProps = {
    navigation: any;
    closeMenu: () => void;
    isVisible: boolean;
    user: User;
};
