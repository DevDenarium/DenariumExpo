import React, {useEffect} from 'react';
import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { styles } from './PaymentsSuccessScreen.styles';
import { PaymentSuccessScreenProps } from './PaymentsSuccessScreen.types';
import { useAuth } from '../auth/AuthContext';
import { CommonActions } from '@react-navigation/native';

const PaymentSuccessScreen: React.FC<PaymentSuccessScreenProps> = ({ navigation, route }) => {
    const { sessionId, amount, planName, paymentType } = route.params;
    const { user, updateUser } = useAuth();
    const isTestMode = sessionId.startsWith('simulated_session_');

    useEffect(() => {
        // Actualizar el estado del usuario a premium cuando se monta la pantalla
        const updateUserPremiumStatus = async () => {
            if (paymentType === 'subscription' && user && !user.isPremium) {
                try {
                    await updateUser({
                        ...user,
                        isPremium: true
                    });
                } catch (error) {
                    console.error('Error updating user premium status:', error);
                }
            }
        };

        updateUserPremiumStatus();
    }, [user, updateUser, paymentType]);

    const handleContinue = () => {
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: 'Dashboard' }],
            })
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Icon name="check-circle" size={80} color="#4CAF50" />
                <Text style={styles.successText}>¡Pago completado con éxito!</Text>

                {user?.firstName && (
                    <Text style={styles.welcomeText}>
                        ¡Bienvenido {user.firstName} {user.lastName || ''}!
                    </Text>
                )}

                {isTestMode && (
                    <Text style={styles.testModeText}>Esta es una simulación de pago</Text>
                )}

                <View style={styles.detailsContainer}>
                    <Text style={styles.detailText}>ID de transacción: {sessionId}</Text>
                    <Text style={styles.detailText}>Monto: ${amount}</Text>
                    <Text style={styles.detailText}>Plan: {planName}</Text>
                </View>

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleContinue}
                >
                    <Text style={styles.buttonText}>IR AL INICIO</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default PaymentSuccessScreen;
