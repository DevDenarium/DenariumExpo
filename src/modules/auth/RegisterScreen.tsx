import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { styles } from './RegisterScreen.styles';
import type { RegisterFormData, RegisterScreenProps } from './RegisterScreen.types';
import { register } from '../../services/auth.service';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const RegisterScreen = ({ navigation }: RegisterScreenProps) => {
    const [formData, setFormData] = useState<RegisterFormData>({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const validateEmail = (email: string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleSubmit = async () => {
        if (!formData.email || !formData.password || !formData.confirmPassword ||
            !formData.firstName || !formData.lastName) {
            setError('Por favor completa todos los campos');
            return;
        }

        if (!validateEmail(formData.email)) {
            setError('Por favor ingresa un email válido');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        if (formData.password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { email, password, firstName, lastName } = formData;
            await register({
                email,
                password,
                firstName,
                lastName
            });

            navigation.navigate('Login', {
                message: 'Registro exitoso. Por favor inicia sesión.'
            });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error en el registro';
            setError(errorMessage);
            Alert.alert('Error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.logoContainer}>
                <Image
                    source={require('../../assets/logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
                <Text style={styles.title}>Crear Cuenta</Text>
            </View>

            {error && (
                <Text style={styles.errorText}>
                    <Icon name="alert-circle" size={16} color="#FF3B30" /> {error}
                </Text>
            )}

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Nombre"
                    placeholderTextColor="#555555"
                    value={formData.firstName}
                    onChangeText={(firstName) => setFormData({ ...formData, firstName })}
                    editable={!loading}
                    returnKeyType="next"
                />
            </View>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Apellido"
                    placeholderTextColor="#555555"
                    value={formData.lastName}
                    onChangeText={(lastName) => setFormData({ ...formData, lastName })}
                    editable={!loading}
                    returnKeyType="next"
                />
            </View>

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
                    returnKeyType="next"
                />
            </View>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Confirmar contraseña"
                    placeholderTextColor="#555555"
                    secureTextEntry
                    value={formData.confirmPassword}
                    onChangeText={(confirmPassword) => setFormData({ ...formData, confirmPassword })}
                    editable={!loading}
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit}
                />
            </View>

            <TouchableOpacity
                style={[styles.button, loading && styles.disabledButton]}
                onPress={handleSubmit}
                disabled={loading}
                activeOpacity={0.7}
            >
                {loading ? (
                    <Text style={styles.buttonText}>
                        <Icon name="loading" size={16} color="#FFFFFF" /> Registrando...
                    </Text>
                ) : (
                    <Text style={styles.buttonText}>
                        <Icon name="account-plus" size={16} color="#FFFFFF" /> Registrarse
                    </Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
                style={styles.loginLinkContainer}
                disabled={loading}
            >
                <Text style={styles.loginText}>
                    ¿Ya tienes una cuenta? <Text style={styles.loginLink}>Inicia sesión</Text>
                </Text>
            </TouchableOpacity>
        </View>
    );
};

export default RegisterScreen;
