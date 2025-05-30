import React from 'react';
import { View, Text, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { styles } from './Menu.styles';
import type { MenuItem, MenuProps } from './Menu.types';

const menuItems: MenuItem[] = [
    { id: 'dashboard', title: 'Dashboard', icon: 'view-dashboard', screen: 'Dashboard' },
    { id: 'transactions', title: 'Transacciones', icon: 'cash-multiple', screen: 'Transactions' },
    { id: 'finance', title: 'Finanzas', icon: 'finance', screen: 'Finance' },
    { id: 'videos', title: 'Contenido Educativo', icon: 'book-education', screen: 'Videos' },
    { id: 'advisories', title: 'Asesorías', icon: 'account-tie-voice', screen: 'Advisories' },
    { id: 'subscriptions', title: 'Suscripciones', icon: 'credit-card', screen: 'Subscriptions' },
    { id: 'notifications', title: 'Notificaciones', icon: 'bell', screen: 'Notifications' },
    { id: 'profile', title: 'Mi Perfil', icon: 'account', screen: 'Profile' },
];

export const Menu: React.FC<MenuProps> = ({ navigation, closeMenu, isVisible, user }) => {
   if (!isVisible) return null;

    const handleNavigation = (screen: string) => {
        navigation.navigate(screen, { user });
        closeMenu();
    };

    return (
        <TouchableWithoutFeedback onPress={closeMenu}>
            <View style={styles.overlay}>
                <TouchableWithoutFeedback>
                    <View style={styles.menuContainer}>
                        <TouchableOpacity style={styles.closeButton} onPress={closeMenu}>
                            <Icon name="close" size={24} color="#D4AF37" />
                        </TouchableOpacity>

                        <View style={styles.userInfo}>
                            <Text style={styles.userName}>Bienvenido</Text>
                            <Text style={styles.userEmail}>usuario@ejemplo.com</Text>
                        </View>

                        {menuItems.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                style={styles.menuItem}
                                onPress={() => handleNavigation(item.screen)}
                            >
                                <Icon name={item.icon} size={24} color="#D4AF37" />
                                <Text style={styles.menuItemText}>{item.title}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableWithoutFeedback>
            </View>
        </TouchableWithoutFeedback>
    );
};
