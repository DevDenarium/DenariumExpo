import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator
} from 'react-native';
import { styles } from './ForgotPasswordScreen.styles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { sendPasswordResetCode, verifyPasswordResetCode, resetPassword } from '../../services/auth.service';
import { ForgotPasswordScreenProps } from './ForgotPasswordScreen.types';

const ForgotPasswordScreen = ({ navigation }: ForgotPasswordScreenProps) => {
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [step, setStep] = useState(1); // 1: email, 2: code, 3: new password
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [countdown, setCountdown] = useState(60);
    const inputRefs = useRef<Array<TextInput | null>>([]);

    useEffect(() => {
        if (countdown > 0 && step === 2) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown, step]);

    const handleSendCode = async () => {
        if (!email) {
            setError('Por favor ingresa tu correo electrónico');
            return;
        }

        setLoading(true);
        try {
            await sendPasswordResetCode(email);
            setStep(2);
            setError('');
            setCountdown(60);
            Alert.alert('Éxito', 'Se ha enviado un código de verificación a tu correo electrónico');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al enviar el código');
        } finally {
            setLoading(false);
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

    const handleVerifyCode = async () => {
        if (!code || code.length !== 6) {
            setError('Por favor ingresa el código de 6 dígitos');
            return;
        }

        setLoading(true);
        try {
            await verifyPasswordResetCode(email, code);
            setStep(3);
            setError('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Código inválido');
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        setLoading(true);
        try {
            await sendPasswordResetCode(email);
            setCountdown(60);
            Alert.alert('Éxito', 'Se ha reenviado el código de verificación');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al reenviar el código');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!newPassword || !confirmPassword) {
            setError('Por favor completa todos los campos');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        if (newPassword.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setLoading(true);
        try {
            await resetPassword(email, code, newPassword);
            Alert.alert('Éxito', 'Tu contraseña ha sido actualizada correctamente');
            navigation.goBack();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al actualizar la contraseña');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.content}>
                <Icon
                    name={step === 1 ? 'email' : step === 2 ? 'email-check' : 'lock-reset'}
                    size={80}
                    color="#D4AF37"
                    style={styles.icon}
                />

                <Text style={styles.title}>
                    {step === 1 ? 'Recuperar contraseña' :
                        step === 2 ? 'Verificar código' :
                            'Nueva contraseña'}
                </Text>

                {error ? (
                    <Text style={styles.errorText}>
                        <Icon name="alert-circle" size={16} color="#FF3B30" /> {error}
                    </Text>
                ) : null}

                {step === 1 && (
                    <>
                        <Text style={styles.subtitle}>
                            Ingresa tu correo electrónico para recibir un código de verificación
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Correo electrónico"
                            placeholderTextColor="#888"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            editable={!loading}
                        />
                        <TouchableOpacity
                            style={[styles.button, loading && styles.disabledButton]}
                            onPress={handleSendCode}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#000" />
                            ) : (
                                <Text style={styles.buttonText}>Enviar código</Text>
                            )}
                        </TouchableOpacity>
                    </>
                )}

                {step === 2 && (
                    <>
                        <Text style={styles.subtitle}>
                            Ingresa el código de 6 dígitos que enviamos a {'\n'}
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
                            onPress={handleVerifyCode}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#000" />
                            ) : (
                                <Text style={styles.buttonText}>Verificar código</Text>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.resendButton, (loading || countdown > 0) && styles.disabledResendButton]}
                            onPress={handleResendCode}
                            disabled={loading || countdown > 0}
                        >
                            {loading ? (
                                <ActivityIndicator color="#D4AF37" />
                            ) : (
                                <Text style={styles.resendText}>
                                    {countdown > 0 ? `Reenviar en ${countdown}s` : 'Reenviar código'}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </>
                )}

                {step === 3 && (
                    <>
                        <Text style={styles.subtitle}>
                            Crea una nueva contraseña para tu cuenta
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Nueva contraseña"
                            placeholderTextColor="#888"
                            value={newPassword}
                            onChangeText={setNewPassword}
                            secureTextEntry
                            editable={!loading}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Confirmar contraseña"
                            placeholderTextColor="#888"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                            editable={!loading}
                        />
                        <TouchableOpacity
                            style={[styles.button, loading && styles.disabledButton]}
                            onPress={handleResetPassword}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#000" />
                            ) : (
                                <Text style={styles.buttonText}>Actualizar contraseña</Text>
                            )}
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </KeyboardAvoidingView>
    );
};

export default ForgotPasswordScreen;
