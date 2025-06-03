import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { styles } from './LoginScreen.styles';
import { login, loginWithGoogle } from '../../services/auth.service';
import { useGoogleAuth } from '../../services/google-auth';
import type { LoginScreenProps } from './LoginScreen.types';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const LoginScreen = ({ navigation }: LoginScreenProps) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { request, response, promptAsync } = useGoogleAuth();

    const validateEmail = (email: string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    useEffect(() => {
        if (response?.type === 'success') {
            const idToken = response.params?.id_token || response.authentication?.idToken;

            console.log('Google response:', response);
            console.log('Extracted token:', idToken);

            if (idToken) {
                handleGoogleLogin(idToken);
            } else {
                console.error('Missing Google ID token:', response);
                setError('No se pudo obtener el token de Google. Por favor intenta nuevamente.');
            }
        } else if (response?.type === 'error') {
            console.error('Google auth error:', response.error);
            setError(`Error al autenticar con Google: ${response.error}`);
        }
    }, [response]);

    const handleGoogleLogin = async (token?: string) => {
        if (!token) {
            setError('Token de Google no válido');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const result = await loginWithGoogle(token);
            navigation.navigate('Dashboard', { user: result.user });
        } catch (err) {
            console.error('Google login error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Error al iniciar sesión con Google';
            setError(errorMessage);
            Alert.alert('Error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!formData.email || !formData.password) {
            setError('Por favor completa todos los campos');
            return;
        }

        if (!validateEmail(formData.email)) {
            setError('Por favor ingresa un email válido');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const result = await login({
                email: formData.email,
                password: formData.password
            });
            navigation.navigate('Dashboard', { user: result.user });
        } catch (err) {
            console.error('Login error:', err);

            let errorMessage = 'Error al iniciar sesión';

            if (err instanceof Error && err.message.includes('401')) {
                errorMessage = 'No existe una cuenta con este correo electrónico';
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }

            setError(errorMessage);
            Alert.alert('Error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleAppleLogin = () => {
        Alert.alert('Información', 'Login con Apple no implementado aún');
    };

    const handleForgotPassword = () => {
        navigation.navigate('ForgotPassword');
    };

    return (
        <View style={styles.container}>
            <View style={styles.logoContainer}>
                <Image
                    source={require('../../assets/logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
                <Text style={styles.title}>Iniciar Sesión</Text>
            </View>

            {error && (
                <Text style={styles.errorText}>
                    <Icon name="alert-circle" size={16} color="#FF3B30" /> {error}
                </Text>
            )}

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Correo electrónico"
                    placeholderTextColor="#555555"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={formData.email}
                    onChangeText={(email) => setFormData({ ...formData, email })}
                    editable={!loading}
                    returnKeyType="next"
                />
            </View>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Contraseña"
                    placeholderTextColor="#555555"
                    secureTextEntry
                    value={formData.password}
                    onChangeText={(password) => setFormData({ ...formData, password })}
                    editable={!loading}
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit}
                />
            </View>

            <TouchableOpacity
                onPress={handleForgotPassword}
                style={styles.forgotPasswordLink}
            >
                <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.button, loading && styles.disabledButton]}
                onPress={handleSubmit}
                disabled={loading}
                activeOpacity={0.7}
            >
                {loading ? (
                    <Text style={styles.buttonText}>
                        <Icon name="loading" size={16} color="#FFFFFF" /> Cargando...
                    </Text>
                ) : (
                    <Text style={styles.buttonText}>
                        <Icon name="login" size={16} color="#FFFFFF" /> Ingresar
                    </Text>
                )}
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>o continúa con</Text>
                <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialButtonContainer}>
                <TouchableOpacity
                    style={styles.socialButton}
                    onPress={() => promptAsync()}
                    disabled={!request || loading}
                    activeOpacity={0.7}
                >
                    <Icon name="google" size={20} color="#D4AF37" />
                    <Text style={styles.socialButtonText}>Google</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.socialButton}
                    onPress={handleAppleLogin}
                    disabled={loading}
                    activeOpacity={0.7}
                >
                    <Icon name="apple" size={20} color="#D4AF37" />
                    <Text style={styles.socialButtonText}>Apple</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                onPress={() => navigation.navigate('Register')}
                disabled={loading}
                style={styles.registerLink}
                activeOpacity={0.7}
            >
                <Text style={styles.linkText}>
                    ¿No tienes cuenta? <Text style={styles.linkBold}>Regístrate</Text>
                </Text>
            </TouchableOpacity>
        </View>
    );
};

export default LoginScreen;
