import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    ScrollView,
    SafeAreaView,
    StyleSheet,
    ActivityIndicator,
    Alert
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { PaymentsScreenProps } from './paymentsScreen.types';
import { styles } from './paymentsScreen.styles';
import { simulatePremiumPayment, upgradeToPremium } from '../../services/subscription.service';

const PaymentsScreen: React.FC<PaymentsScreenProps> = ({ route, navigation }) => {
    const { planName, amount, user } = route.params;
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
        setLoading(true);

        try {
            // Simular procesamiento de pago
            await new Promise(resolve => setTimeout(resolve, 2000));

            if (__DEV__) {
                await simulatePremiumPayment();
            } else {
                await upgradeToPremium();
            }

            navigation.navigate('PaymentSuccess', {
                sessionId: 'simulated_session_' + Math.random().toString(36).substring(7),
                planName,
                amount,
                user
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
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <MaterialIcons name="arrow-back" size={24} color="#4A4A4A" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Detalles de Pago</Text>
                    <Text style={styles.subtitle}>{planName} - ${amount}</Text>
                </View>

                <View style={styles.cardPreview}>
                    <MaterialCommunityIcons name="credit-card-chip" size={32} color="#FFD700" />
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
                        <Text style={styles.payButtonText}>Pagar ${amount}</Text>
                    )}
                </TouchableOpacity>

                <Text style={styles.testModeText}>MODO DE PRUEBA: No se realizarán cargos reales</Text>
            </ScrollView>
        </SafeAreaView>
    );
};

export default PaymentsScreen;
