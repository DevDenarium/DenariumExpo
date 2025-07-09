import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, ActivityIndicator, SafeAreaView, Platform, StatusBar } from 'react-native';
import { styles } from './DashboardScreen.styles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';
import { UserRole } from '../auth/user.types';
import { SubscriptionsService } from '../../services/subscription.service';
import { useAuth } from '../auth/AuthContext';

const DashboardScreen = ({ navigation }: { navigation: any }) => {
    const { user, signOut } = useAuth();
    const [loading, setLoading] = useState(true);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [imageError, setImageError] = useState(false);
    const [subscriptionPlan, setSubscriptionPlan] = useState<string>('Free');

    if (!user) {
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: 'Login' }],
            })
        );
        return null;
    }

    const getUserName = () => {
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

    const fetchSubscriptionData = async () => {
        try {
            const status = await SubscriptionsService.getSubscriptionStatus();
            if (status) {
                switch(status.planType) {
                    case 'CORPORATE_PREMIUM':
                        setSubscriptionPlan('Premium');
                        break;
                    case 'CORPORATE_GOLD':
                        setSubscriptionPlan('Gold');
                        break;
                    default:
                        setSubscriptionPlan('Free');
                }
            }
        } catch (error) {
            console.error('Error fetching subscription:', error);
            setSubscriptionPlan('Free');
        }
    };

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                if (!token) return;

                const config = {
                    headers: { Authorization: `Bearer ${token}` }
                };

                const profileResponse = await axios.get('http://192.168.20.14:3000/auth/me', config);
                const updatedUser = profileResponse.data;

                if (updatedUser.profilePicture) {
                    setProfileImage(updatedUser.profilePicture);
                } else if (user.profilePicture) {
                    setProfileImage(user.profilePicture);
                }

                await fetchSubscriptionData();
            } catch (error) {
                console.error('Error fetching profile data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [user]);

    const getAccountType = () => {
        switch(user.role) {
            case UserRole.CORPORATE:
                return 'Cuenta Corporativa';
            case UserRole.PERSONAL:
                return 'Cuenta Personal';
            case UserRole.CORPORATE_EMPLOYEE:
                return 'Cuenta Personal Corporativo';
            case UserRole.ADMIN:
                return 'Cuenta Administrador';
            case UserRole.ADVISOR:
                return 'Cuenta Asesor';
            default:
                return 'Cuenta';
        }
    };

    const handleImageError = () => {
        setImageError(true);
        setProfileImage(null);
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#D4AF37" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>

            <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={styles.container}
            >
                <View style={styles.profileSection}>
                    {profileImage && !imageError ? (
                        <Image
                            source={{ uri: profileImage }}
                            style={styles.profileImage}
                            onError={handleImageError}
                            onLoad={() => setImageError(false)}
                        />
                    ) : (
                        <View style={styles.profileImagePlaceholder}>
                            <Icon name="account-circle" size={60} color="#D4AF37" />
                        </View>
                    )}
                    <View style={styles.userInfo}>
                        <Text style={styles.welcomeText}>
                            Bienvenido, {getUserName()}
                        </Text>
                        <Text style={styles.emailText}>{user.email}</Text>
                        {imageError && (
                            <Text style={styles.imageErrorText}>
                                No se pudo cargar la imagen de perfil
                            </Text>
                        )}
                        <Text style={styles.userRoleText}>
                            {getAccountType()}
                            {subscriptionPlan !== 'Free' && ` • ${subscriptionPlan}`}
                        </Text>
                    </View>
                </View>

                <View style={styles.financeSection}>
                    <Text style={styles.sectionTitle}>Resumen</Text>
                    <View style={styles.financeCard}>
                        <Text style={styles.financeLabel}>
                            Bienvenido a tu panel de control
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default DashboardScreen;
