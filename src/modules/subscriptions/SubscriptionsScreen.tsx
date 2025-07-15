import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { styles } from './SubscriptionsScreen.styles';
import {
    SubscriptionsScreenProps,
    SubscriptionPlan,
    SubscriptionStatus,
    SubscriptionResponse
} from './SubscriptionsScreen.types';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from "../navegation/Navegation.types";
import { StackNavigationProp } from "@react-navigation/stack";
import { UserRole } from '../auth/user.types';
import { SubscriptionsService } from '../../services/subscription.service';
import { useAuth } from '../auth/AuthContext';
import {PaymentSuccessData} from "../payments/PaymentsScreen.types";
import {AxiosError} from "axios";

type NavigationProp = StackNavigationProp<RootStackParamList>;
const useTypedNavigation = () => useNavigation<NavigationProp>();

const SubscriptionsScreen: React.FC<SubscriptionsScreenProps> = () => {
    const { user, loading: authLoading, refreshUser } = useAuth();
    const navigation = useTypedNavigation();

    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [currentSubscription, setCurrentSubscription] = useState<SubscriptionStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            navigation.navigate('Login');
        }
    }, [authLoading, user, navigation]);

    const formatDate = (dateString: string) => {
        if (!dateString || dateString === 'Invalid Date') return 'No disponible';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES');
    };

    const fetchSubscriptionStatus = async () => {
        try {
            const status = await SubscriptionsService.getSubscriptionStatus();
            setCurrentSubscription(status);
        } catch (error) {
            console.error('Error fetching subscription status:', error);
            // Set default free subscription if error occurs
            if (user) {
                const defaultSubscription: SubscriptionStatus = {
                    plan: user.role === UserRole.CORPORATE ? 'CORPORATE_FREE' : 'PERSONAL_FREE',
                    planName: user.role === UserRole.CORPORATE ? 'Plan Free Corporativo' : 'Plan Free Personal',
                    status: 'ACTIVE',
                    startDate: new Date().toISOString(),
                    endDate: '9999-12-31',
                    daysRemaining: Infinity,
                    isPremium: false,
                    features: []
                };
                setCurrentSubscription(defaultSubscription);
            }
        }
    };

    const fetchAvailablePlans = async () => {
        try {
            if (!user) return;

            const availablePlans = await SubscriptionsService.getAvailablePlans(user.role);
            setPlans(availablePlans.map((plan: any) => ({
                id: plan.name.toLowerCase().replace(/ /g, '_'),
                name: plan.name,
                type: plan.planType || plan.type || // Primero intenta con planType
                    (plan.name.includes('Personal Free') ? 'PERSONAL_FREE' :
                        plan.name.includes('Personal Premium') ? 'PERSONAL_PREMIUM' :
                            plan.name.includes('Corporate Free') ? 'CORPORATE_FREE' :
                                plan.name.includes('Corporate Gold') ? 'CORPORATE_GOLD' :
                                    'CORPORATE_PREMIUM'), // Fallback basado en nombre
                price: plan.price,
                period: 'mes',
                features: plan.features,
                highlight: plan.price > 0,
                icon: plan.price > 0 ? 'star' : 'account-outline',
                employeeLimit: plan.employeeLimit,
                freeAdvisoryCount: plan.freeAdvisoryCount
            })));
        } catch (error) {
            console.error('Error fetching available plans:', error);
            Alert.alert('Error', 'No se pudieron cargar los planes disponibles');
        }
    };

    const handleSubscribe = async (plan: SubscriptionPlan) => {
        if (!plan.type) {
            console.error('Plan type is missing:', plan);
            Alert.alert('Error', 'El plan seleccionado no tiene tipo definido');
            return;
        }

        setIsProcessing(true);
        try {
            console.log('Plan seleccionado:', {
                name: plan.name,
                type: plan.type,
                price: plan.price
            });

            if (plan.price === 0) {
                const response = await SubscriptionsService.activateFreeSubscription(plan.type);
                Alert.alert('Éxito', 'Suscripción gratuita activada correctamente');
                await fetchSubscriptionStatus();
                await refreshUser();
            } else {
                // Navegar a la pantalla de pago en lugar de procesar directamente
                navigation.navigate('PaymentsScreen', {
                    plan: {
                        ...plan,
                        type: plan.type // Asegurarse que el type está definido
                    },
                    onSuccess: async (data: PaymentSuccessData) => {
                        // Esta función se ejecutará cuando el pago sea exitoso
                        if (data.subscription) {
                            Alert.alert('Éxito', 'Suscripción premium activada correctamente');
                            await fetchSubscriptionStatus();
                            await refreshUser();
                        }
                    }
                });
            }
        } catch (error) {
            console.error('Error en suscripción:', error);
            Alert.alert('Error', 'No se pudo completar la suscripción');
        } finally {
            setIsProcessing(false);
        }
    };

    const fetchData = async () => {
        if (!user) return;

        setLoading(true);
        try {
            await Promise.all([fetchSubscriptionStatus(), fetchAvailablePlans()]);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading && user) {
            fetchData();
        }
    }, [authLoading, user?.role]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            if (user) {
                fetchData();
            }
        });
        return unsubscribe;
    }, [navigation, user]);

    const renderPlanCard = (plan: SubscriptionPlan) => (
        <View
            key={plan.id}
            style={[
                styles.card,
                currentSubscription?.plan === plan.type && styles.currentPlan,
                plan.highlight && styles.highlightCard
            ]}
        >
            <View style={styles.badgeContainer}>
                {plan.highlight && currentSubscription?.plan === plan.type ? (
                    <>
                        <View style={[styles.recommendedBadge, {top: -15}]}>
                            <Text style={styles.recommendedText}>RECOMENDADO</Text>
                        </View>
                        <View style={[styles.currentBadge, {top: -20}]}>
                            <Text style={styles.currentBadgeText}>TU PLAN</Text>
                        </View>
                    </>
                ) : plan.highlight ? (
                    <View style={styles.recommendedBadge}>
                        <Text style={styles.recommendedText}>RECOMENDADO</Text>
                    </View>
                ) : currentSubscription?.plan === plan.type ? (
                    <View style={styles.currentBadge}>
                        <Text style={styles.currentBadgeText}>TU PLAN</Text>
                    </View>
                ) : null}
            </View>

            <View style={styles.cardHeader}>
                <Icon
                    name={plan.icon}
                    size={30}
                    color={plan.highlight ? '#D4AF37' : currentSubscription?.plan === plan.type ? '#4CAF50' : '#d3ae37'}
                    style={styles.planIcon}
                />
                <Text style={[
                    styles.cardTitle,
                    currentSubscription?.plan === plan.type && styles.currentPlanTitle
                ]}>
                    {plan.name}
                </Text>
            </View>

            <View style={styles.priceContainer}>
                <Text style={[
                    styles.cardPrice,
                    currentSubscription?.plan === plan.type && styles.currentPlanPrice
                ]}>
                    ${plan.price}
                </Text>
                <Text style={[
                    styles.cardPeriod,
                    currentSubscription?.plan === plan.type && styles.currentPlanPeriod
                ]}>
                    /{plan.period}
                </Text>
            </View>

            <View style={[
                styles.divider,
                currentSubscription?.plan === plan.type && styles.currentDivider
            ]} />

            <View style={styles.featureList}>
                {plan.features.map((feature, index) => (
                    <View key={index} style={styles.featureItem}>
                        <Icon
                            name="check-circle"
                            size={18}
                            color={currentSubscription?.plan === plan.type ? '#4CAF50' : '#D4AF37'}
                        />
                        <Text style={[
                            styles.featureText,
                            currentSubscription?.plan === plan.type && styles.currentFeatureText
                        ]}>
                            {feature}
                        </Text>
                    </View>
                ))}
            </View>

            {currentSubscription?.plan === plan.type ? (
                <View style={styles.currentPlanButton}>
                    <Icon name="check-circle" size={20} color="#4CAF50" style={styles.currentPlanIcon} />
                    <Text style={styles.currentPlanText}>ACTUALMENTE ACTIVO</Text>
                </View>
            ) : (
                <TouchableOpacity
                    style={[
                        styles.button,
                        plan.highlight && styles.highlightButton,
                        plan.price === 0 && styles.freeButton
                    ]}
                    onPress={() => handleSubscribe(plan)}
                    disabled={isProcessing}
                >
                    <Text style={[
                        styles.buttonText,
                        plan.highlight && styles.highlightButtonText,
                        plan.price === 0 && styles.freeButtonText
                    ]}>
                        {isProcessing ? 'PROCESANDO...' : plan.price === 0 ? 'ACTIVAR' : 'SUSCRIBIRME'}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );

    if (authLoading || loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#D4AF37" />
            </View>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Planes de Suscripción</Text>
                    <Text style={styles.subtitle}>Elige el que mejor se adapte a tus necesidades</Text>
                </View>

                {currentSubscription && (
                    <View style={[styles.statusContainer, {position: 'relative'}]}>
                        <View style={styles.currentSubscriptionIndicator} />
                        <Text style={styles.statusTitle}>TU SUSCRIPCIÓN ACTUAL:</Text>
                        <View style={styles.statusContent}>
                            <Icon
                                name="badge-account"
                                size={24}
                                color="#D4AF37"
                                style={styles.statusIcon}
                            />
                            <View>
                                <Text style={styles.statusPlan}>
                                    {currentSubscription.planName}
                                </Text>
                                <Text style={styles.statusText}>
                                    Estado: <Text style={styles.statusHighlight}>
                                    {currentSubscription.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                                </Text>
                                </Text>
                                {currentSubscription.plan?.includes('FREE') ? (
                                    <Text style={styles.statusDate}>
                                        Acceso gratuito permanente
                                    </Text>
                                ) : currentSubscription.daysRemaining && currentSubscription.daysRemaining > 0 ? (
                                    <Text style={styles.statusDate}>
                                        {currentSubscription.daysRemaining} días restantes (hasta {formatDate(currentSubscription.endDate)})
                                    </Text>
                                ) : null}
                            </View>
                        </View>
                    </View>
                )}

                {user.role === UserRole.CORPORATE_EMPLOYEE ? (
                    <View style={styles.employeeMessage}>
                        <Icon name="information" size={24} color="#D4AF37" />
                        <Text style={styles.employeeText}>
                            Tu suscripción es gestionada por tu empresa. Contacta con el administrador corporativo para más información.
                        </Text>
                    </View>
                ) : (
                    <>
                        <View style={styles.plansContainer}>
                            {plans.map(renderPlanCard)}
                        </View>

                        {user.role === UserRole.CORPORATE && (
                            <TouchableOpacity
                                style={styles.customPlanButton}
                                onPress={() => Alert.alert('Solicitar plan personalizado', 'Contacta con nuestro equipo para un plan a medida')}
                            >
                                <Text style={styles.customPlanText}>¿Necesitas un plan personalizado?</Text>
                            </TouchableOpacity>
                        )}
                    </>
                )}

                <View style={styles.infoBox}>
                    <Icon name="shield-check" size={24} color="#D4AF37" />
                    <Text style={styles.infoText}>
                        Pago 100% seguro. Cancelación en cualquier momento.
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
};

export default SubscriptionsScreen;
