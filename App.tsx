import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import LoginScreen from './src/modules/auth/LoginScreen';
import DashboardScreen from './src/modules/dashboard/DashboardScreen';
import RegisterScreen from './src/modules/auth/RegisterScreen';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from './src/modules/dashboard/DashboardScreen.types';
import { CommonActions } from '@react-navigation/native';
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

const Stack = createNativeStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator<DrawerParamList>();

const CustomHeader = ({ navigation, user, handleLogout }: {
    navigation: any;
    user: User;
    handleLogout: () => void;
}) => {
    return (
        <View style={headerStyles.container}>
            <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
                <Icon name="menu" size={28} color="#D4AF37" />
            </TouchableOpacity>
            <View style={{ width: 28 }} />
            <TouchableOpacity onPress={handleLogout}>
                <Icon name="logout" size={24} color="#D4AF37" />
            </TouchableOpacity>
        </View>
    );
};

const headerStyles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: '#1c1c1c',
        borderBottomWidth: 1,
        borderBottomColor: '#D4AF37',
    },
    title: {
        color: '#D4AF37',
        fontSize: 20,
        fontWeight: '600',
    },
});

const CustomDrawerContent = ({ navigation, user }: { navigation: any; user: User }) => {
    const isAdmin = user.role === 'ADMIN';

    const commonMenuItems = [
        { name: 'MainDashboard', label: 'Inicio', icon: 'view-dashboard' },
        { name: 'Finance', label: 'Finanzas', icon: 'finance' },
        { name: 'Transactions', label: 'Transacciones', icon: 'cash-multiple' },
        { name: 'Videos', label: 'Contenido Educativo', icon: 'bookshelf' },
        { name: 'Profile', label: 'Mi Perfil', icon: 'account' },
        { name: 'Notifications', label: 'Notificaciones', icon: 'bell' },
    ];

    const adminMenuItems = [
        { name: 'VideoLibrary', label: 'Administrar Videos', icon: 'play-box-multiple' },
        { name: 'AppointmentManagement', label: 'Citas Agendadas', icon: 'calendar-clock' },
    ];

    const clientMenuItems = [
        { name: 'Appointments', label: 'Asesorías', icon: 'account-tie-voice' },
        { name: 'Subscriptions', label: 'Suscripciones', icon: 'credit-card' },
    ];

    const menuItems = [
        ...commonMenuItems,
        ...(isAdmin ? adminMenuItems : clientMenuItems),
    ];

    return (
        <View style={drawerStyles.container}>
            <View style={drawerStyles.header}>
                {user.picture ? (
                    <Image
                        source={{ uri: user.picture }}
                        style={drawerStyles.profileImage}
                        resizeMode="cover"
                    />
                ) : (
                    <Icon name="account-circle" size={80} color="#D4AF37" />
                )}
                <Text style={drawerStyles.userName}>
                    {user.firstName || 'Usuario'} {isAdmin && '(Admin)'}
                </Text>
                <Text style={drawerStyles.userEmail}>{user.email}</Text>
            </View>

            <View style={drawerStyles.menuItems}>
                {menuItems.map((item) => (
                    <TouchableOpacity
                        key={item.name}
                        style={drawerStyles.menuItem}
                        onPress={() => navigation.navigate(item.name, { user })}
                    >
                        <Icon name={item.icon} size={24} color="#D4AF37" />
                        <Text style={drawerStyles.menuItemText}>{item.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const drawerStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1c1c1c',
        paddingTop: 40,
    },
    header: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
        alignItems: 'center',
    },
    profileImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
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

const DashboardDrawer = ({ route }: { route: { params: { user: User } } }) => {
    const { user } = route.params;
    const isAdmin = user.role === 'ADMIN';

    const handleLogout = async (navigation: any) => {
        await AsyncStorage.removeItem('token');
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: 'Login' }],
            })
        );
    };

    return (
        <Drawer.Navigator
            drawerContent={(props) => <CustomDrawerContent {...props} user={user} />}
            screenOptions={({ navigation }) => ({
                drawerStyle: {
                    width: 280,
                    backgroundColor: '#1c1c1c',
                },
                header: () => (
                    <CustomHeader
                        navigation={navigation}
                        user={user}
                        handleLogout={() => handleLogout(navigation)}
                    />
                ),
                drawerActiveTintColor: '#D4AF37',
                drawerInactiveTintColor: '#FFFFFF',
            })}
        >
            <Drawer.Screen
                name="MainDashboard"
                component={DashboardScreen}
                initialParams={{ user }}
                options={{ title: 'Inicio' }}
            />
            <Drawer.Screen
                name="Transactions"
                component={FinanceScreen}
                options={{ title: 'Transacciones' }}
            />
            <Drawer.Screen
                name="Appointments"
                component={AppointmentScreen}
                options={{ title: 'Asesorías' }}
            />
            {!isAdmin && (
                <Drawer.Screen
                    name="Subscriptions"
                    component={SubscriptionsScreen}
                    initialParams={{ user }}
                    options={{ title: 'Suscripciones' }}
                />
            )}
            {isAdmin && (
                <>
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
                </>
            )}
            <Drawer.Screen
                name="Profile"
                component={ProfileScreen}
                initialParams={{ user }}
                options={{ title: 'Mi Perfil' }}
            />
        </Drawer.Navigator>
    );
};

export default function App() {
    return (
        <>
            <StatusBar style="light" />
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
                        name="Register"
                        component={RegisterScreen}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="ForgotPassword"
                        component={ForgotPasswordScreen}
                        options={{ title: 'Recuperar contraseña' }}
                    />
                    <Stack.Screen
                        name="Verification"
                        component={VerificationScreen}
                        options={{ title: 'Verificación' }}
                    />
                    <Stack.Screen
                        name="Dashboard"
                        component={DashboardDrawer}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="Payments"
                        component={PaymentsScreen}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="PaymentSuccess"
                        component={PaymentSuccessScreen}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="Profile"
                        component={ProfileScreen}
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
                </Stack.Navigator>
            </NavigationContainer>
        </>
    );
}
