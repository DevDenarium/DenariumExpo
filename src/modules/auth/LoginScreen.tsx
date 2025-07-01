import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert, Platform } from 'react-native';
import { styles } from './LoginScreen.styles';
import { login, loginWithGoogle } from '../../services/auth.service';
import { useGoogleAuth } from '../../services/google-auth';
import type { LoginScreenProps } from './LoginScreen.types';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { UserRole } from './user.types';
import {UserResponse} from "./user.types";
import {useAuth} from './AuthContext'
const LoginScreen = ({ navigation }: LoginScreenProps) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { request, response, promptAsync } = useGoogleAuth();
    const { signIn } = useAuth();
    const validateEmail = (email: string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    useEffect(() => {
        if (response?.type === 'success') {
            const idToken = response.params?.id_token || response.authentication?.idToken;

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

            if (result && result.user) {
                if (signIn && typeof signIn === 'function') {
                    await signIn(result);
                    redirectUserBasedOnType(result.user);
                } else {
                    throw new Error('Auth context is not properly initialized');
                }
            } else {
                throw new Error('Invalid user data received from Google login');
            }
        } catch (err) {
            console.error('Google login error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Error al iniciar sesión con Google';
            setError(errorMessage);
            Alert.alert('Error', errorMessage);
        } finally {
            setLoading(false);
        }
    };


    const redirectUserBasedOnType = (user: UserResponse) => {
        const userRole = user.role;

        let routeName = 'Dashboard';

        switch(userRole) {
            case UserRole.ADMIN:
                routeName = 'Dashboard';
                break;
            case UserRole.ADVISOR:
                routeName = 'Dashboard';
                break;
            case UserRole.CORPORATE:
                routeName = 'Dashboard';
                break;
            case UserRole.CORPORATE_EMPLOYEE:
                routeName = 'Dashboard';
                break;
            case UserRole.PERSONAL:
            default:
                routeName = 'Dashboard';
                break;
        }

        navigation.navigate(routeName, { user });
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

            await signIn(result);
            redirectUserBasedOnType(result.user);
        } catch (err) {
            console.error('Login error:', err);

            let errorMessage = 'Error al iniciar sesión';

            if (err instanceof Error) {
                if (err.message.includes('401')) {
                    errorMessage = 'Credenciales incorrectas. Por favor verifica tu correo y contraseña.';
                } else if (err.message.includes('403')) {
                    errorMessage = 'Tu cuenta no está verificada. Por favor verifica tu correo electrónico.';
                } else if (err.message.includes('404')) {
                    errorMessage = 'No existe una cuenta con este correo electrónico.';
                } else if (err.message.includes('corporate employee')) {
                    errorMessage = 'Los empleados corporativos deben usar el dominio de correo de su empresa.';
                } else {
                    errorMessage = err.message;
                }
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

    const navigateToRegister = () => {
        navigation.navigate('RegisterType');
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
                disabled={loading}
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
                onPress={navigateToRegister}
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
