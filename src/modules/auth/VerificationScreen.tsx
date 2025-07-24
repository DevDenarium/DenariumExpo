import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Modal,
    ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { verifyEmail, resendVerificationCode } from '../../services/auth.service';
import { styles } from './VerificationScreen.styles';
import axios from "axios";
import {StackNavigationProp, StackScreenProps} from '@react-navigation/stack';
import { RootStackParamList } from '../navegation/Navegation.types';
import {RouteProp} from "@react-navigation/native";

type VerificationScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    'Verification'
>;

type VerificationScreenRouteProp = RouteProp<
    RootStackParamList,
    'Verification'
>;

type VerificationScreenProps = StackScreenProps<
    RootStackParamList,
    'Verification'
>;

const VerificationScreen: React.FC<VerificationScreenProps> = ({ navigation, route }) => {
    const { email, userRole } = route.params;
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const inputRefs = useRef<Array<TextInput | null>>([]);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const showFeedbackModal = (message: string, success: boolean) => {
        setModalMessage(message);
        setIsSuccess(success);
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        if (isSuccess && modalMessage.includes('verificado correctamente')) {
            navigation.navigate('Login', {
                message: 'Correo verificado exitosamente. Por favor inicia sesión.'
            });
        }
    };


    const handleVerify = async () => {
        if (!code || code.length !== 6) {
            showFeedbackModal('Por favor ingresa un código válido de 6 dígitos', false);
            return;
        }

        setLoading(true);
        try {
            await verifyEmail(email, code);
            showFeedbackModal('¡Tu correo ha sido verificado correctamente!', true);
        } catch (error) {
            let errorMessage = 'El código de verificación es incorrecto. Por favor inténtalo de nuevo.';

            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === 'string') {
                errorMessage = error;
            } else if (axios.isAxiosError(error)) {
                errorMessage = error.response?.data?.message || error.message;
            }

            showFeedbackModal(errorMessage, false);
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        setResendLoading(true);
        try {
            await resendVerificationCode(email);
            setCountdown(60);
            showFeedbackModal('Se ha reenviado el código de verificación', true);
        } catch (error) {
            let errorMessage = 'Error al reenviar el código';

            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === 'string') {
                errorMessage = error;
            } else if (axios.isAxiosError(error)) {
                errorMessage = error.response?.data?.message || error.message;
            }

            showFeedbackModal(errorMessage, false);
        } finally {
            setResendLoading(false);
        }
    };

    const handleCodeChange = (text: string, index: number) => {
        const newCode = code.split('');
        newCode[index] = text;
        setCode(newCode.join(''));

        if (text && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.content}>
                <Icon name="email-check" size={80} color="#D4AF37" style={styles.icon} />
                <Text style={styles.title}>Verifica tu correo electrónico</Text>
                <Text style={styles.subtitle}>
                    Hemos enviado un código de verificación a {'\n'}
                    <Text style={styles.emailText}>{email}</Text>
                </Text>

                <View style={styles.codeContainer}>
                    {Array.from({ length: 6 }).map((_, index) => (
                        <TextInput
                            key={index}
                            ref={(ref) => {
                                if (ref) {
                                    inputRefs.current[index] = ref;
                                }
                            }}
                            style={styles.codeInput}
                            placeholder="-"
                            placeholderTextColor="#888"
                            value={code[index] || ''}
                            onChangeText={(text) => handleCodeChange(text, index)}
                            onKeyPress={(e) => handleKeyPress(e, index)}
                            keyboardType="number-pad"
                            maxLength={1}
                            autoFocus={index === 0}
                            editable={!loading}
                        />
                    ))}
                </View>

                <TouchableOpacity
                    style={[styles.button, loading && styles.disabledButton]}
                    onPress={handleVerify}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#000" />
                    ) : (
                        <Text style={styles.buttonText}>Verificar</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.resendButton, (resendLoading || countdown > 0) && styles.disabledResendButton]}
                    onPress={handleResendCode}
                    disabled={resendLoading || countdown > 0}
                >
                    {resendLoading ? (
                        <ActivityIndicator color="#D4AF37" />
                    ) : (
                        <Text style={styles.resendText}>
                            {countdown > 0 ? `Reenviar en ${countdown}s` : 'Reenviar código'}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>

            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={closeModal}
            >
                <View style={styles.modalContainer}>
                    <View style={[
                        styles.modalContent,
                        isSuccess ? styles.successModal : styles.errorModal
                    ]}>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={closeModal}
                        >
                            <Icon name="close" size={24} color="#666" />
                        </TouchableOpacity>

                        <Icon
                            name={isSuccess ? "check-circle" : "alert-circle"}
                            size={50}
                            color={isSuccess ? "#4CAF50" : "#F44336"}
                            style={styles.modalIcon}
                        />
                        <Text style={styles.modalText}>{modalMessage}</Text>

                        <TouchableOpacity
                            style={[styles.modalButton, isSuccess ? styles.modalSuccessButton : styles.modalErrorButton]}
                            onPress={closeModal}
                        >
                            <Text style={styles.modalButtonText}>Aceptar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
};

export default VerificationScreen;
