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
import { PaymentsScreenProps } from './PaymentsScreen.types';
import { SubscriptionsService } from '../../services/subscription.service';
import { styles } from './PaymentsScreen.styles';
import { useAuth } from '../auth/AuthContext';

const PaymentsScreen: React.FC<PaymentsScreenProps> = ({ route, navigation }) => {
    const { plan, onSuccess } = route.params;
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

    const handlePayment = async () => {
        if (!user) {
            Alert.alert('Error', 'Usuario no autenticado');
            return;
        }

        setLoading(true);

        try {
            // Simular procesamiento de pago
            await new Promise(resolve => setTimeout(resolve, 2000));

            if (__DEV__) {
                await SubscriptionsService.simulatePremiumPayment();
            } else {
                await SubscriptionsService.upgradeToPremium(plan.type);
            }

            // Ejecutar callback de éxito si existe
            if (onSuccess) {
                await onSuccess();
            }

            navigation.navigate('PaymentSuccess', {
                sessionId: 'simulated_session_' + Math.random().toString(36).substring(7),
                planName: plan.name,
                amount: plan.price
            });

        } catch (error) {
            console.error('Payment error:', error);
            Alert.alert(
                'Error',
                error instanceof Error ? error.message : 'Ocurrió un error al procesar el pago'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.header}>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.title}>Detalles de Pago</Text>
                        <Text style={styles.subtitle}>{plan.name} - ${plan.price}</Text>
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
                        {/* Fecha de vencimiento */}
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
