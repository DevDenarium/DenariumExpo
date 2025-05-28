import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { styles } from './paymentsSuccessScreen.styles';
import { PaymentSuccessScreenProps } from './paymentsSuccessScreen.types';

const PaymentSuccessScreen: React.FC<PaymentSuccessScreenProps> = ({ navigation, route }) => {
    const { sessionId, amount, planName, user } = route.params;
    const isTestMode = sessionId.includes('fake_session_');

    const handleContinue = () => {
        navigation.reset({
            index: 0,
            routes: [{ name: 'Dashboard', params: { user } }],
        });
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
                    {amount && <Text style={styles.detailText}>Monto: ${amount.toFixed(2)}</Text>}
                    {planName && <Text style={styles.detailText}>Plan: {planName}</Text>}
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
