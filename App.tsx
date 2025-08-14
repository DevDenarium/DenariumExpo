import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { SplashScreen } from './src/modules/splash/SplashScreen';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, Image, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { CommonActions } from '@react-navigation/native';
import LoginScreen from './src/modules/auth/LoginScreen';
import DashboardScreen from './src/modules/dashboard/DashboardScreen';
import SubscriptionsScreen from './src/modules/subscriptions/SubscriptionsScreen';
import VerificationScreen from './src/modules/auth/VerificationScreen';
import ForgotPasswordScreen from './src/modules/auth/ForgotPasswordScreen';
import { RootStackParamList, DrawerParamList } from './src/modules/navegation/Navegation.types';
import PaymentsScreen from "./src/modules/payments/PaymentsScreen";
import PaymentSuccessScreen from "./src/modules/payments/PaymentsSuccessScreen";
import FinanceScreen from "./src/modules/finance/FinanceScreen";
import ProfileScreen from './src/modules/profile/ProfileScreen';
import AppointmentManagement from "./src/admin/appointment/AppointmentManagement";
import AppointmentScreen from "./src/modules/appointment/AppointmentScreen";
import {VideoManagement} from "./src/admin/content/VideoManagement";
import RegisterTypeScreen from "./src/modules/auth/RegisterTypeScreen";
import RegisterPersonalScreen from "./src/modules/auth/RegisterPersonalScreen";
import RegisterCorporateScreen from "./src/modules/auth/RegisterCorporateScreen";
import RegisterCorporateEmployeeScreen from "./src/modules/auth/RegisterCorporateEmployeeScreen";
import EducationalScreen from './src/modules/educational/EducationalScreen';
import { FinanceAnalyticsScreen } from './src/modules/finance-analytics/FinanceAnalyticsScreen';
import { AuthProvider, useAuth } from './src/modules/auth/AuthContext';
import {UserRole} from "./src/modules/auth/user.types";
import NotificationsScreen from './src/modules/notifications/NotificationsScreen';
import NotificationBadge from './src/common/components/NotificationBadge';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator<DrawerParamList>();

const CustomHeader = ({ navigation }: { navigation: any }) => {
    const auth = useAuth(); // Siempre obtenemos el contexto primero

    const handleSignOut = async () => {
        try {
            if (auth.signOut && !auth.isSigningOut) {
                await auth.signOut();
                navigation.dispatch(
                    CommonActions.reset({
                        index: 0,
                        routes: [{ name: 'Login' }],
                    })
                );
            }
        } catch (error) {
            console.error('Error during sign out:', error);
        }
    };

    // If user is not authenticated, loading, or signing out, don't render the header
    if (!auth.user || auth.loading || auth.isSigningOut) {
        return null;
    }

    return (
        <SafeAreaView style={headerStyles.safeArea}>
            <View style={headerStyles.container}>
                <TouchableOpacity
                    onPress={() => navigation.toggleDrawer()}
                    style={headerStyles.iconButton}
                >
                    <Icon name="menu" size={28} color="#D4AF37" />
                </TouchableOpacity>
                <View style={headerStyles.spacer} />
                <TouchableOpacity
                    onPress={() => navigation.navigate('Notifications')}
                    style={headerStyles.iconButton}
                >
                    <Icon name="bell" size={24} color="#D4AF37" />
                    <NotificationBadge size={16} />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={handleSignOut}
                    style={headerStyles.iconButton}
                >
                    <Icon name="logout" size={24} color="#D4AF37" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const headerStyles = StyleSheet.create({
    safeArea: {
        backgroundColor: '#1c1c1c',
    },
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: Platform.select({
            ios: 10,
            android: 15,
        }),
        backgroundColor: '#1c1c1c',
        borderBottomWidth: 1,
        borderBottomColor: '#D4AF37',
    },
    iconButton: {
        padding: 8,
    },
    spacer: {
        flex: 1,
    },
    title: {
        color: '#D4AF37',
        fontSize: 20,
        fontWeight: '600',
    },
});

const CustomDrawerContent = ({ navigation }: { navigation: any }) => {
    const { user, loading, isSigningOut } = useAuth();

    const isAdmin = user?.role === UserRole.ADMIN;

    const commonMenuItems = [
        { name: 'MainDashboard', label: 'Inicio', icon: 'view-dashboard' },
        { name: 'Transactions', label: 'Transacciones', icon: 'cash-multiple' },
        { name: 'Finance', label: 'Finanzas', icon: 'chart-line' },
        { name: 'Videos', label: 'Contenido Educativo', icon: 'bookshelf' },
    ];

    const adminMenuItems = [
        { name: 'VideoLibrary', label: 'Administrar Videos', icon: 'play-box-multiple' },
        { name: 'AppointmentManagement', label: 'Citas Agendadas', icon: 'calendar-clock' },
        { name: 'Profile', label: 'Mi Perfil', icon: 'account' },
        { name: 'Notifications', label: 'Notificaciones', icon: 'bell' },
    ];

    const clientMenuItems = [
        { name: 'Appointments', label: 'Asesorías', icon: 'account-tie-voice' },
        { name: 'Subscriptions', label: 'Suscripciones', icon: 'credit-card' },
        { name: 'Profile', label: 'Mi Perfil', icon: 'account' },
        { name: 'Notifications', label: 'Notificaciones', icon: 'bell' },
    ];

    const menuItems = [
        ...commonMenuItems,
        ...(isAdmin ? adminMenuItems : clientMenuItems),
    ];

    const getUserName = () => {
        if (!user) return 'Usuario';
        
        if (user.role === UserRole.PERSONAL && user.personalUser) {
            return user.personalUser.firstName || 'Usuario';
        }
        if (user.role === UserRole.CORPORATE_EMPLOYEE && user.corporateEmployee) {
            return user.corporateEmployee.firstName || 'Empleado';
        }
        if (user.role === UserRole.ADMIN && user.adminUser) {
            return user.adminUser.firstName || 'Administrador';
        }
        if (user.role === UserRole.ADVISOR && user.advisorUser) {
            return user.advisorUser.firstName || 'Asesor';
        }
        if (user.role === UserRole.CORPORATE && user.corporateUser) {
            return user.corporateUser.companyName || 'Empresa';
        }
        return user.firstName || 'Usuario';
    };

    if (!user || loading || isSigningOut) {
        return null;
    }

    return (
        <SafeAreaView style={drawerStyles.safeArea}>
            <View style={drawerStyles.container}>
                <View style={drawerStyles.header}>
                    {user.profilePicture ? (
                        <Image
                            source={{ uri: user.profilePicture }}
                            style={drawerStyles.profileImage}
                            resizeMode="cover"
                        />
                    ) : (
                        <Icon name="account-circle" size={80} color="#D4AF37" />
                    )}
                    <Text style={drawerStyles.userName}>
                        {getUserName()} {isAdmin && '(Admin)'}
                    </Text>
                    <Text style={drawerStyles.userEmail}>{user.email}</Text>
                </View>

                <View style={drawerStyles.menuItems}>
                    {menuItems.map((item) => (
                        <TouchableOpacity
                            key={item.name}
                            style={drawerStyles.menuItem}
                            onPress={() => navigation.navigate(item.name)}
                        >
                            <View style={{ position: 'relative' }}>
                                <Icon name={item.icon} size={24} color="#D4AF37" />
                                {item.name === 'Notifications' && (
                                    <NotificationBadge size={14} position="top-right" />
                                )}
                            </View>
                            <Text style={drawerStyles.menuItemText}>{item.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </SafeAreaView>
    );
};

const drawerStyles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#1c1c1c',
    },
    container: {
        flex: 1,
        backgroundColor: '#1c1c1c',
        paddingTop: Platform.select({
            ios: 20,
            android: 40,
        }),
    },
    header: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
        alignItems: 'center',
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#333',
        marginBottom: 10,
    },
    userName: {
        color: '#D4AF37',
        fontSize: 18,
        fontWeight: '600',
        marginTop: 10,
    },
    userEmail: {
        color: '#AAAAAA',
        fontSize: 14,
        marginTop: 5,
    },
    menuItems: {
        paddingTop: 20,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
    },
    menuItemText: {
        color: '#FFFFFF',
        fontSize: 16,
        marginLeft: 15,
    },
});

const DashboardDrawer = () => {
    return (
        <Drawer.Navigator
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={({ navigation }) => ({
                drawerStyle: {
                    width: 280,
                    backgroundColor: '#1c1c1c',
                },
                header: () => (
                    <CustomHeader navigation={navigation} />
                ),
                drawerActiveTintColor: '#D4AF37',
                drawerInactiveTintColor: '#FFFFFF',
            })}
        >
            <Drawer.Screen
                name="MainDashboard"
                component={DashboardScreen}
                options={{ title: 'Inicio' }}
            />
            <Drawer.Screen
                name="Transactions"
                component={FinanceScreen}
                options={{ title: 'Transacciones' }}
            />
            <Drawer.Screen
                name="Finance"
                component={FinanceAnalyticsScreen}
                options={{ title: 'Finanzas' }}
            />
            <Drawer.Screen
                name="Appointments"
                component={AppointmentScreen}
                options={{ title: 'Asesorías' }}
            />
            <Drawer.Screen
                name="Subscriptions"
                component={SubscriptionsScreen}
                options={{ title: 'Suscripciones' }}
            />
            <Drawer.Screen
                name="VideoLibrary"
                component={VideoManagement}
                options={{ title: 'Administrar Videos' }}
            />
            <Drawer.Screen
                name="AppointmentManagement"
                component={AppointmentManagement}
                options={{ title: 'Citas Agendadas' }}
            />
            <Drawer.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ title: 'Mi Perfil' }}
            />
            <Drawer.Screen
                name="Videos"
                component={EducationalScreen}
                options={{ title: 'Contenido Educativo' }}
            />
            <Drawer.Screen
                name="Notifications"
                component={NotificationsScreen}
                options={{ title: 'Notificaciones' }}
            />
        </Drawer.Navigator>
    );
};

export default function App() {
    const [showSplash, setShowSplash] = useState(true);

    return (
        <SafeAreaProvider>
            <AuthProvider>
                <StatusBar style="light" />
                {showSplash ? (
                    <SplashScreen onAnimationComplete={() => setShowSplash(false)} />
                ) : (
                    <NavigationContainer>
                        <Stack.Navigator
                            initialRouteName="Login"
                            screenOptions={{
                                headerStyle: {
                                    backgroundColor: '#1c1c1c',
                                },
                                headerTintColor: '#D4AF37',
                            }}
                        >
                    <Stack.Screen
                        name="Login"
                        component={LoginScreen}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="RegisterType"
                        component={RegisterTypeScreen}
                        options={{ title: 'Tipo de Registro' }}
                    />
                    <Stack.Screen
                        name="RegisterPersonal"
                        component={RegisterPersonalScreen}
                        options={{ title: 'Registro Personal' }}
                    />
                    <Stack.Screen
                        name="RegisterCorporate"
                        component={RegisterCorporateScreen}
                        options={{ title: 'Registro Corporativo' }}
                    />
                    <Stack.Screen
                        name="RegisterCorporateEmployee"
                        component={RegisterCorporateEmployeeScreen}
                        options={{ title: 'Registro Empleado' }}
                    />
                    <Stack.Screen
                        name="Verification"
                        component={VerificationScreen}
                        options={{ title: 'Verificación' }}
                    />
                    <Stack.Screen
                        name="ForgotPassword"
                        component={ForgotPasswordScreen}
                        options={{ title: 'Recuperar contraseña' }}
                    />

                    <Stack.Screen
                        name="Dashboard"
                        component={DashboardDrawer}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="PaymentsScreen"
                        component={PaymentsScreen}
                        options={{ title: 'Pago' }}
                    />
                    <Stack.Screen
                        name="PaymentSuccess"
                        component={PaymentSuccessScreen}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="VideoLibrary"
                        component={VideoManagement}
                        options={{ title: 'Administrar Videos' }}
                    />
                    <Stack.Screen
                        name="Appointments"
                        component={AppointmentScreen}
                        options={{ title: 'Asesorías' }}
                    />
                    <Stack.Screen
                        name="AppointmentManagement"
                        component={AppointmentManagement}
                        options={{ title: 'Citas Agendadas' }}
                    />
                    <Stack.Screen
                        name="EducationalScreen"
                        component={EducationalScreen}
                        options={{ title: 'Contenido Educativo' }}
                    />
                </Stack.Navigator>
            </NavigationContainer>
                )}
            </AuthProvider>
        </SafeAreaProvider>
    );
}
