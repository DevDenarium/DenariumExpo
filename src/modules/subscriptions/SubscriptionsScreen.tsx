import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { styles } from './SubscriptionsScreen.styles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SubscriptionsScreenProps, SubscriptionPlan, SubscriptionStatus, SubscriptionPlanType } from './SubscriptionsScreen.types';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from "../navegation/Navegation.types";
import { StackNavigationProp } from "@react-navigation/stack";
import { UserRole } from '../auth/user.types';
import { SubscriptionsService } from '../../services/subscription.service';
import { useAuth } from '../auth/AuthContext';

type NavigationProp = StackNavigationProp<RootStackParamList>;
const useTypedNavigation = () => useNavigation<NavigationProp>();

const corporatePlans: SubscriptionPlan[] = [
    {
        id: 'corporate_premium',
        name: 'Plan Premium Corporativo',
        price: 100,
        period: 'mes',
        features: [
            'Acceso completo a métricas',
            'Acceso a transacciones',
            'Acceso completo a contenido educativo',
            'Notificaciones informativas de gastos',
            'Suscripción de 50 empleados',
            '1 asesoría al mes gratuita'
        ],
        highlight: true,
        icon: 'trophy',
        employeeLimit: 50,
        freeAdvisoryCount: 1,
        type: 'CORPORATE_PREMIUM'
    },
    {
        id: 'corporate_gold',
        name: 'Plan Gold Corporativo',
        price: 50,
        period: 'mes',
        features: [
            'Acceso completo a métricas',
            'Acceso a transacciones',
            'Acceso completo a contenido educativo',
            'Notificaciones limitadas informativas de gastos',
            'Suscripción de 10 empleados'
        ],
        icon: 'medal',
        employeeLimit: 10,
        type: 'CORPORATE_GOLD'
    },
    {
        id: 'corporate_free',
        name: 'Plan Free Corporativo',
        price: 0,
        period: 'mes',
        features: [
            'Acceso completo a métricas',
            'Acceso a transacciones',
            'Acceso limitado a contenido educativo',
            'Notificaciones limitadas informativas de gastos'
        ],
        icon: 'office-building',
        type: 'CORPORATE_FREE'
    }
];

const personalPlans: SubscriptionPlan[] = [
    {
        id: 'personal_premium',
        name: 'Plan Premium Personal',
        price: 20,
        period: 'mes',
        features: [
            'Acceso completo a métricas',
            'Acceso a transacciones',
            'Acceso completo a contenido educativo',
            'Notificaciones informativas de gastos',
            '1 asesoría al mes gratuita'
        ],
        highlight: true,
        icon: 'star',
        freeAdvisoryCount: 1,
        type: 'PERSONAL_PREMIUM'
    },
    {
        id: 'personal_free',
        name: 'Plan Free Personal',
        price: 0,
        period: 'mes',
        features: [
            'Acceso básico a métricas',
            'Acceso a transacciones básicas',
            'Acceso limitado a contenido educativo'
        ],
        icon: 'account-outline',
        type: 'PERSONAL_FREE'
    }
];

const SubscriptionsScreen: React.FC<SubscriptionsScreenProps> = () => {
    const { user, loading: authLoading, updateUser } = useAuth();
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

            if (status) {
                if (user?.role === UserRole.CORPORATE && !status.planType) {
                    status.planType = 'CORPORATE_FREE';
                    status.status = 'ACTIVE';
                    status.daysRemaining = Infinity;
                } else if (user?.role === UserRole.PERSONAL && !status.planType) {
                    status.planType = 'PERSONAL_FREE';
                    status.status = 'ACTIVE';
                    status.daysRemaining = Infinity;
                }
                setCurrentSubscription(status);
            } else if (user) {
                const defaultSubscription: SubscriptionStatus = {
                    planType: user.role === UserRole.CORPORATE ? 'CORPORATE_FREE' : 'PERSONAL_FREE',
                    status: 'ACTIVE',
                    startDate: new Date().toISOString(),
                    endDate: '9999-12-31',
                    daysRemaining: Infinity
                };
                setCurrentSubscription(defaultSubscription);
            }
        } catch (error) {
            console.error('Error fetching subscription status:', error);
            if (user) {
                const defaultSubscription: SubscriptionStatus = {
                    planType: user.role === UserRole.CORPORATE ? 'CORPORATE_FREE' : 'PERSONAL_FREE',
                    status: 'ACTIVE',
                    startDate: new Date().toISOString(),
                    endDate: '9999-12-31',
                    daysRemaining: Infinity
                };
                setCurrentSubscription(defaultSubscription);
            }
        }
    };

    const fetchAvailablePlans = async () => {
        try {
            if (!user) return;

            let availablePlans: SubscriptionPlan[] = [];

            switch(user.role) {
                case UserRole.CORPORATE:
                    availablePlans = [...corporatePlans];
                    break;
                case UserRole.CORPORATE_EMPLOYEE:
                    availablePlans = [];
                    break;
                case UserRole.PERSONAL:
                    availablePlans = [...personalPlans];
                    break;
                default:
                    availablePlans = [];
            }

            setPlans(availablePlans);
        } catch (error) {
            console.error('Error fetching available plans:', error);
            Alert.alert('Error', 'No se pudieron cargar los planes disponibles');
        }
    };

    const handleSubscribe = async (plan: SubscriptionPlan) => {
        setIsProcessing(true);
        try {
            if (plan.price === 0) {
                const response = await SubscriptionsService.activateFreeSubscription(plan.type as SubscriptionPlanType);

                if (response.success) {
                    Alert.alert('Éxito', 'Plan activado correctamente');
                    await fetchSubscriptionStatus();

                    if (user) {
                        await updateUser({
                            ...user,
                            subscriptionType: plan.type
                        });
                    }
                }
            } else {
                navigation.navigate('PaymentsScreen', {
                    plan,
                    onSuccess: async () => {
                        await fetchSubscriptionStatus();
                        if (user) {
                            await updateUser({
                                ...user,
                                subscriptionType: plan.type
                            });
                        }
                    }
                });
            }
        } catch (error) {
            console.error('Subscription error:', error);
            Alert.alert(
                'Error',
                error instanceof Error ? error.message : 'Error al procesar la suscripción'
            );
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
                currentSubscription?.planType === plan.type && styles.currentPlan,
                plan.highlight && styles.highlightCard
            ]}
        >
            <View style={styles.badgeContainer}>
                {currentSubscription?.planType === plan.type && (
                    <View style={styles.currentBadge}>
                        <Text style={styles.currentBadgeText}>TU PLAN</Text>
                    </View>
                )}

                {plan.highlight && (
                    <View style={styles.recommendedBadge}>
                        <Text style={styles.recommendedText}>RECOMENDADO</Text>
                    </View>
                )}
            </View>

            <View style={styles.cardHeader}>
                <Icon
                    name={plan.icon}
                    size={30}
                    color={plan.highlight ? '#D4AF37' : currentSubscription?.planType === plan.type ? '#4CAF50' : '#d3ae37'}
                    style={styles.planIcon}
                />
                <Text style={[
                    styles.cardTitle,
                    currentSubscription?.planType === plan.type && styles.currentPlanTitle
                ]}>
                    {plan.name}
                </Text>
            </View>

            <View style={styles.priceContainer}>
                <Text style={[
                    styles.cardPrice,
                    currentSubscription?.planType === plan.type && styles.currentPlanPrice
                ]}>
                    ${plan.price}
                </Text>
                <Text style={[
                    styles.cardPeriod,
                    currentSubscription?.planType === plan.type && styles.currentPlanPeriod
                ]}>
                    /{plan.period}
                </Text>
            </View>

            <View style={[
                styles.divider,
                currentSubscription?.planType === plan.type && styles.currentDivider
            ]} />

            <View style={styles.featureList}>
                {plan.features.map((feature, index) => (
                    <View key={index} style={styles.featureItem}>
                        <Icon
                            name="check-circle"
                            size={18}
                            color={currentSubscription?.planType === plan.type ? '#4CAF50' : '#D4AF37'}
                        />
                        <Text style={[
                            styles.featureText,
                            currentSubscription?.planType === plan.type && styles.currentFeatureText
                        ]}>
                            {feature}
                        </Text>
                    </View>
                ))}
            </View>

            {currentSubscription?.planType === plan.type ? (
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
                                    {currentSubscription.planType === 'CORPORATE_FREE' ? 'Plan Free Corporativo' :
                                        currentSubscription.planType === 'CORPORATE_GOLD' ? 'Plan Gold Corporativo' :
                                            currentSubscription.planType === 'CORPORATE_PREMIUM' ? 'Plan Premium Corporativo' :
                                                currentSubscription.planType === 'PERSONAL_FREE' ? 'Plan Free Personal' :
                                                        currentSubscription.planType === 'PERSONAL_PREMIUM' ? 'Plan Premium Personal' :
                                                            'Plan Corporativo'}
                                </Text>
                                <Text style={styles.statusText}>
                                    Estado: <Text style={styles.statusHighlight}>
                                    {currentSubscription.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                                </Text>
                                </Text>
                                {currentSubscription.planType?.includes('FREE') ? (
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

                        <TouchableOpacity
                            style={styles.customPlanButton}
                            onPress={() => Alert.alert('Solicitar plan personalizado', 'Contacta con nuestro equipo para un plan a medida')}
                        >
                            <Text style={styles.customPlanText}>¿Necesitas un plan personalizado?</Text>
                        </TouchableOpacity>
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
