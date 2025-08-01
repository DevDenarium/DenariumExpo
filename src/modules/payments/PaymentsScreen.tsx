import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    ScrollView,
    SafeAreaView,
    ActivityIndicator,
    Alert,
    Image
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { PaymentsScreenProps, PaymentSuccessData } from './PaymentsScreen.types';
import { SubscriptionsService } from '../../services/subscription.service';
import { styles } from './PaymentsScreen.styles';
import { useAuth } from '../auth/AuthContext';
import {appointmentService} from "../../services/appointment.service";

const PaymentsScreen: React.FC<PaymentsScreenProps> = ({ route, navigation }) => {
    const { plan, onSuccess, metadata } = route.params;
    const { user } = useAuth();
    const [cardNumber, setCardNumber] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCvc, setCardCvc] = useState('');
    const [cardholderName, setCardholderName] = useState('');
    const [showCvc, setShowCvc] = useState(false);
    const [loading, setLoading] = useState(false);

    const formatCardNumber = (text: string) => {
        const cleaned = text.replace(/\D/g, '');
        const match = cleaned.match(/(\d{1,4})(\d{1,4})?(\d{1,4})?(\d{1,4})?/);
        return match ? [match[1], match[2], match[3], match[4]].filter(Boolean).join(' ') : '';
    };

    const handleCardNumberChange = (text: string) => {
        setCardNumber(formatCardNumber(text));
    };

    const formatExpiryDate = (text: string) => {
        const cleaned = text.replace(/\D/g, '');
        if (cleaned.length > 2) {
            return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
        }
        return cleaned;
    };

    const handleExpiryChange = (text: string) => {
        setCardExpiry(formatExpiryDate(text));
    };

    // ——— handlePayment ———
    const handlePayment = async () => {
        if (!user) {
            Alert.alert('Error', 'Usuario no autenticado');
            return;
        }

        setLoading(true);

        try {
            // Simula latencia de red / SDK de pago
            await new Promise(r => setTimeout(r, 1500));

            // Datos que devolveremos al caller
            let resultData: PaymentSuccessData = { paymentType: 'subscription' };

            /* ============================================================
               FLUJO 1: Asesorías (nuevo)
               ============================================================ */
            if (metadata?.appointmentData) {
                const appointmentData = JSON.parse(metadata.appointmentData);
                const payload = { ...appointmentData, userId: user.id };

                // Primero crear la cita
                const createResp = await appointmentService.createAppointment(payload);
                const newAppointment = createResp.data.appointment;

                // Si requiere pago, confirmarlo
                if (createResp.data.paymentRequired) {
                    await appointmentService.confirmPayment(newAppointment.id);
                }

                resultData = {
                    paymentType: 'appointment',
                    appointment: newAppointment,
                };
            }

            /* ============================================================
               FLUJO 2: Suscripciones (sin cambios)
               ============================================================ */
            else {
                const subscriptionResp = await SubscriptionsService
                    .simulatePremiumPayment(plan.type);

                resultData = {
                    paymentType: 'subscription',
                    subscription: {
                        ...plan,
                        type: subscriptionResp.planType || plan.type,
                    },
                };
            }

            // Callback al caller (AppointmentScreen o quien sea)
            if (onSuccess) { await onSuccess(resultData); }

            // Navega a pantalla de éxito
            navigation.navigate('PaymentSuccess', {
                sessionId: 'simulated_session_' + Math.random().toString(36).slice(2),
                planName:   plan.name,
                amount:     plan.price,
                paymentType: resultData.paymentType,
                subscription: resultData.subscription,
                appointment:  resultData.appointment,
            });

        } catch (error) {
            console.error('Error en pago:', error);
            Alert.alert('Pago fallido', 'Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };


    const getPaymentDescription = () => {
        if (metadata?.appointmentData) {
            const appointmentData = JSON.parse(metadata.appointmentData);
            return `Asesoría: ${appointmentData.title}`;
        }
        return `Suscripción: ${plan.name}`;
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.header}>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.title}>Detalles de Pago</Text>
                        <Text style={styles.subtitle}>{getPaymentDescription()} - ${plan.price}</Text>
                    </View>
                </View>

                <View style={styles.cardPreview}>
                    <Image
                        source={require('../../assets/logo.png')}
                        style={styles.cardLogo}
                        resizeMode="contain"
                    />
                    <Text style={styles.cardNumberPreview}>
                        {cardNumber || '•••• •••• •••• ••••'}
                    </Text>
                    <View style={styles.cardFooter}>
                        <Text style={styles.cardNamePreview}>
                            {cardholderName || 'NOMBRE DEL TITULAR'}
                        </Text>
                        <Text style={styles.cardExpiryPreview}>
                            {cardExpiry || 'MM/AA'}
                        </Text>
                    </View>
                </View>

                <View style={styles.formContainer}>
                    <Text style={styles.label}>Número de Tarjeta</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="1234 5678 9012 3456"
                            placeholderTextColor="#999"
                            keyboardType="numeric"
                            value={cardNumber}
                            onChangeText={handleCardNumberChange}
                            maxLength={19}
                        />
                        <MaterialCommunityIcons name="credit-card" size={24} color="#999" />
                    </View>

                    <View style={styles.row}>
                        <View style={styles.halfInput}>
                            <Text style={styles.label}>Vencimiento (MM/AA)</Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="MM/AA"
                                    placeholderTextColor="#999"
                                    keyboardType="numeric"
                                    value={cardExpiry}
                                    onChangeText={handleExpiryChange}
                                    maxLength={5}
                                />
                                <MaterialCommunityIcons name="calendar" size={20} color="#999" />
                            </View>
                        </View>

                        <View style={styles.halfInput}>
                            <Text style={styles.label}>CVC</Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="123"
                                    placeholderTextColor="#999"
                                    keyboardType="numeric"
                                    value={cardCvc}
                                    onChangeText={setCardCvc}
                                    maxLength={4}
                                    secureTextEntry={!showCvc}
                                />
                                <TouchableOpacity onPress={() => setShowCvc(!showCvc)}>
                                    <MaterialCommunityIcons
                                        name={showCvc ? "eye-off" : "eye"}
                                        size={20}
                                        color="#999"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    <Text style={styles.label}>Nombre del Titular</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Nombre como aparece en la tarjeta"
                            placeholderTextColor="#999"
                            value={cardholderName}
                            onChangeText={setCardholderName}
                        />
                        <MaterialCommunityIcons name="account" size={20} color="#999" />
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.payButton}
                    onPress={handlePayment}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.payButtonText}>Pagar ${plan.price}</Text>
                    )}
                </TouchableOpacity>

                <Text style={styles.testModeText}>MODO DE PRUEBA: No se realizarán cargos reales</Text>
            </ScrollView>
        </SafeAreaView>
    );
};

export default PaymentsScreen;
