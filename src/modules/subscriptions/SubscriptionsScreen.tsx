import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { styles } from './SubscriptionsScreen.styles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
    SubscriptionPlan,
    SubscriptionsScreenProps,
    SubscriptionStatus,
    SubscriptionPlanType
} from './SubscriptionsScreen.types';
import axios from "axios";
import {PaymentsService} from "../../services/payments.service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from "../navegation/navegation.types"
import {StackNavigationProp} from "@react-navigation/stack";

type NavigationProp = StackNavigationProp<RootStackParamList>;
const useTypedNavigation = () => useNavigation<NavigationProp>();

const API_BASE_URL = 'http://localhost:3000';

const SubscriptionsScreen: React.FC<SubscriptionsScreenProps> = ({ route }) => {
    const { user } = route.params;
    const navigation = useTypedNavigation();
    const [plans, setPlans] = useState<SubscriptionPlan[]>([
        {
            id: 'premium',
            name: 'Plan Premium',
            price: 10,
            period: 'mes',
            features: [
                'Acceso completo a métricas',
                'Acceso a transacciones',
                'Acceso completo a contenido educativo',
                'Asesorías personalizadas',
                'Notificaciones informativas de gastos'
            ],
            highlight: true,
            icon: 'crown'
        },
        {
            id: 'free',
            name: 'Plan Free',
            price: 0,
            period: 'mes',
            features: [
                'Acceso básico a métricas',
                'Acceso a transacciones',
                'Contenido educativo limitado',
            ],
            icon: 'account-star'
        }
    ]);

    const [currentSubscription, setCurrentSubscription] = useState<SubscriptionStatus>({
        plan: 'Free',
        status: 'active',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    });
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = await getAuthToken();
                const [statusResponse, plansResponse] = await Promise.all([
                    axios.get<SubscriptionStatus>(`${API_BASE_URL}/subscriptions/status`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get<SubscriptionPlan[]>(`${API_BASE_URL}/subscriptions/plans`, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                ]);

                const validPlan: SubscriptionPlanType =
                    statusResponse.data.plan === 'Premium' ? 'Premium' : 'Free';

                setCurrentSubscription({
                    ...statusResponse.data,
                    plan: validPlan
                });

                // 1. Filtramos solo Free y Premium
                const filteredPlans = plansResponse.data.filter(plan =>
                    plan.id === 'free_plan_id' || plan.id === 'premium_plan_id'
                );

                // 2. Ordenamos: Premium primero, Free después
                const orderedPlans = filteredPlans.sort((a, b) => {
                    if (a.id === 'premium_plan_id') return -1; // Premium va primero
                    if (b.id === 'premium_plan_id') return 1;
                    return 0;
                });

                // 3. Marcamos el plan actual
                setPlans(orderedPlans.map(plan => ({
                    ...plan,
                    isCurrent: (validPlan === 'Premium' && plan.id === 'premium_plan_id') ||
                        (validPlan === 'Free' && plan.id === 'free_plan_id'),
                    // Aseguramos que el Premium tenga highlight=true si es necesario
                    highlight: plan.id === 'premium_plan_id'
                })));

            } catch (error) {
                console.error('Error fetching data:', error);
                Alert.alert('Error', 'No se pudo cargar la información de suscripciones');
                setCurrentSubscription({
                    plan: 'Free',
                    status: 'active',
                    startDate: new Date().toISOString(),
                    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
                });
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        const unsubscribe = navigation.addListener('focus', fetchData);

        return unsubscribe;
    }, [navigation]);
    const fetchSubscriptionStatus = async () => {
        try {
            const token = await getAuthToken();
            const response = await axios.get<SubscriptionStatus>(
                `${API_BASE_URL}/subscriptions/status`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const validPlan: SubscriptionPlanType =
                response.data.plan === 'Premium' ? 'Premium' : 'Free';

            setCurrentSubscription({
                ...response.data,
                plan: validPlan
            });

            markCurrentPlan(validPlan);
        } catch (error) {
            console.error('Error fetching subscription status:', error);
            setCurrentSubscription({
                plan: 'Free',
                status: 'active',
                startDate: new Date().toISOString(),
                endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
            });
        } finally {
            setLoading(false);
        }
    };

    const markCurrentPlan = (plan: SubscriptionPlanType) => {
        setPlans(prevPlans =>
            prevPlans.map(p => ({
                ...p,
                isCurrent: (plan === 'Premium' && p.id === 'premium') ||
                    (plan === 'Free' && p.id === 'free')
            }))
        );
    };

    const formatDate = (dateString: string) => {
        if (!dateString || dateString === 'Invalid Date') return 'No disponible';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES');
    };

    const handleSubscribe = async (planName: string) => {
        setIsProcessing(true);
        try {
            const token = await getAuthToken();
            const planId = getPlanId(planName);

            if (__DEV__) {
                const fakeSessionId = `fake_session_${Math.random().toString(36).substring(2, 9)}`;

                const newSubscription: SubscriptionStatus = {
                    plan: 'Premium',
                    status: 'active',
                    startDate: new Date().toISOString(),
                    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                };

                setCurrentSubscription(newSubscription);
                markCurrentPlan('Premium');

                navigation.navigate('Payments', {
                    sessionId: fakeSessionId,
                    planName: 'Plan Premium',
                    amount: 10,
                    user
                });

                return;
            }

            const checkoutUrl = await PaymentsService.createCheckoutSession(
                user.email,
                planId,
                token
            );

            const sessionId = new URL(checkoutUrl).searchParams.get('session_id');
            if (!sessionId) {
                throw new Error('No se pudo obtener el ID de sesión de pago');
            }

            navigation.navigate('Payments', {
                sessionId,
                planName,
                amount: plans.find(p => p.name === planName)?.price || 0,
                user
            });
        } catch (error) {
            console.error('Error en handleSubscribe:', error);
            Alert.alert(
                'Error',
                error instanceof Error ? error.message : 'Error desconocido al procesar el pago'
            );
        } finally {
            setIsProcessing(false);
        }
    };

    const getAuthToken = async (): Promise<string> => {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
            throw new Error('No se encontró token de autenticación');
        }
        return token;
    };

    const getPlanId = (planName: string): string => {
        const planMap: Record<string, string> = {
            'Plan Free': 'free_plan_id',
            'Plan Premium': 'premium_plan_id'
        };
        return planMap[planName] || 'free_plan_id';
    };

    const renderPlanCard = (plan: SubscriptionPlan) => (
        <View
            key={plan.id}
            style={[
                styles.card,
                plan.isCurrent && styles.currentPlan,
                plan.highlight && styles.highlightCard
            ]}
        >
            {plan.highlight && (
                <View style={styles.recommendedBadge}>
                    <Text style={styles.recommendedText}>RECOMENDADO</Text>
                </View>
            )}

            {plan.isCurrent && (
                <View style={styles.currentBadge}>
                    <Text style={styles.currentBadgeText}>TU PLAN</Text>
                </View>
            )}

            <View style={styles.cardHeader}>
                <Icon
                    name={plan.icon}
                    size={30}
                    color={plan.highlight ? '#D4AF37' : plan.isCurrent ? '#4CAF50' : '#FFFFFF'}
                    style={styles.planIcon}
                />
                <Text style={[
                    styles.cardTitle,
                    plan.isCurrent && styles.currentPlanTitle
                ]}>
                    {plan.name}
                    {plan.isCurrent && (
                        <Text style={styles.currentPlanIndicator}> ★</Text>
                    )}
                </Text>
            </View>

            <View style={styles.priceContainer}>
                <Text style={[
                    styles.cardPrice,
                    plan.isCurrent && styles.currentPlanPrice
                ]}>
                    ${plan.price}
                </Text>
                <Text style={[
                    styles.cardPeriod,
                    plan.isCurrent && styles.currentPlanPeriod
                ]}>
                    /{plan.period}
                </Text>
            </View>

            <View style={[
                styles.divider,
                plan.isCurrent && styles.currentDivider
            ]} />

            <View style={styles.featureList}>
                {plan.features.map((feature, index) => (
                    <View key={index} style={styles.featureItem}>
                        <Icon
                            name="check-circle"
                            size={18}
                            color={plan.isCurrent ? '#4CAF50' : '#D4AF37'}
                        />
                        <Text style={[
                            styles.featureText,
                            plan.isCurrent && styles.currentFeatureText
                        ]}>
                            {feature}
                        </Text>
                    </View>
                ))}
            </View>

            {plan.isCurrent ? (
                <View style={styles.currentPlanButton}>
                    <Icon name="check-circle" size={20} color="#4CAF50" style={styles.currentPlanIcon} />
                    <Text style={styles.currentPlanText}>ACTUALMENTE ACTIVO</Text>
                </View>
            ) : (
                <TouchableOpacity
                    style={[
                        styles.button,
                        plan.highlight && styles.highlightButton
                    ]}
                    onPress={() => handleSubscribe(plan.name)}
                    disabled={isProcessing}
                >
                    <Text style={[
                        styles.buttonText,
                        plan.highlight && styles.highlightButtonText
                    ]}>
                        {isProcessing ? 'PROCESANDO...' : 'SUSCRIBIRME'}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#D4AF37" />
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Planes de Suscripción</Text>
                    <Text style={styles.subtitle}>Elige el que mejor se adapte a tus necesidades</Text>
                </View>

                <View style={styles.statusContainer}>
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
                                {currentSubscription.plan === 'Premium' ? 'Plan Premium' : 'Plan Free'}
                            </Text>
                            <Text style={styles.statusText}>
                                Estado: <Text style={styles.statusHighlight}>
                                {currentSubscription.status === 'inactive' ? 'Inactivo' : 'Activo'}
                            </Text>
                            </Text>
                            <Text style={styles.statusDate}>
                                {currentSubscription.plan === 'Premium'
                                    ? `Válido hasta: ${formatDate(currentSubscription.endDate)}`
                                    : 'Acceso gratuito permanente'}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.plansContainer}>
                    {plans.map(renderPlanCard)}
                </View>

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
