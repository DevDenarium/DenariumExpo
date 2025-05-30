import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert, ScrollView, Modal, TouchableWithoutFeedback, FlatList } from 'react-native';
import { styles } from './RegisterScreen.styles';
import type { RegisterFormData, RegisterScreenProps } from './RegisterScreen.types';
import { register, getCountries } from '../../services/auth.service';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const RegisterScreen = ({ navigation }: RegisterScreenProps) => {
    const [formData, setFormData] = useState<RegisterFormData>({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        phone: '',
        country: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [countries, setCountries] = useState<Array<{name: string, code: string}>>([]);
    const [showCountryPicker, setShowCountryPicker] = useState(false);
    const [filteredCountries, setFilteredCountries] = useState<Array<{name: string, code: string}>>([]);
    const [searchText, setSearchText] = useState('');
    const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({
        firstName: false,
        lastName: false,
        email: false,
        phone: false,
        country: false,
        password: false,
        confirmPassword: false
    });

    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const countriesData = await getCountries();
                setCountries(countriesData);
                setFilteredCountries(countriesData);
            } catch (error) {
                console.error('Error loading countries:', error);
                Alert.alert('Error', 'No se pudieron cargar los países. Por favor intenta nuevamente.');
            }
        };
        fetchCountries();
    }, []);

    const handleFieldTouch = (fieldName: keyof RegisterFormData) => {
        setTouchedFields({ ...touchedFields, [fieldName]: true });
    };

    const handleSearch = (text: string) => {
        setSearchText(text);
        if (text === '') {
            setFilteredCountries(countries);
        } else {
            const filtered = countries.filter(country =>
                country.name.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredCountries(filtered);
        }
    };

    const validateEmail = (email: string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const validatePhone = (phone: string) => {
        return /^[+]?[0-9\s\-()]{8,20}$/.test(phone);
    };

    const handleSubmit = async () => {
        // Marcar todos los campos como tocados al enviar
        const allFieldsTouched = Object.keys(formData).reduce((acc, key) => {
            acc[key as keyof RegisterFormData] = true;
            return acc;
        }, {} as Record<keyof RegisterFormData, boolean>);
        setTouchedFields(allFieldsTouched);

        if (!formData.email || !formData.password || !formData.confirmPassword ||
            !formData.firstName || !formData.lastName || !formData.phone || !formData.country) {
            setError('Por favor completa todos los campos obligatorios');
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

        if (!validatePhone(formData.phone)) {
            setError('Por favor ingresa un número de teléfono válido (mínimo 8 dígitos)');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { email, password, firstName, lastName, phone, country } = formData;
            await register({
                email,
                password,
                firstName,
                lastName,
                phone,
                country
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

    const renderCountryItem = ({ item }: { item: { name: string, code: string } }) => (
        <TouchableOpacity
            style={styles.countryItem}
            onPress={() => {
                setFormData({ ...formData, country: item.name });
                setShowCountryPicker(false);
                setSearchText('');
                setFilteredCountries(countries);
                handleFieldTouch('country');
            }}
        >
            <Text style={styles.countryItemText}>{item.name}</Text>
        </TouchableOpacity>
    );

    return (
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
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
                    style={[
                        styles.input,
                        !formData.firstName && touchedFields.firstName && styles.inputError
                    ]}
                    placeholder="Nombre *"
                    placeholderTextColor="#555555"
                    value={formData.firstName}
                    onChangeText={(firstName) => setFormData({ ...formData, firstName })}
                    onBlur={() => handleFieldTouch('firstName')}
                    editable={!loading}
                    returnKeyType="next"
                />
            </View>

            <View style={styles.inputContainer}>
                <TextInput
                    style={[
                        styles.input,
                        !formData.lastName && touchedFields.lastName && styles.inputError
                    ]}
                    placeholder="Apellido *"
                    placeholderTextColor="#555555"
                    value={formData.lastName}
                    onChangeText={(lastName) => setFormData({ ...formData, lastName })}
                    onBlur={() => handleFieldTouch('lastName')}
                    editable={!loading}
                    returnKeyType="next"
                />
            </View>

            <View style={styles.inputContainer}>
                <TextInput
                    style={[
                        styles.input,
                        (!formData.email || !validateEmail(formData.email)) && touchedFields.email && styles.inputError
                    ]}
                    placeholder="Correo electrónico *"
                    placeholderTextColor="#555555"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={formData.email}
                    onChangeText={(email) => setFormData({ ...formData, email })}
                    onBlur={() => handleFieldTouch('email')}
                    editable={!loading}
                    returnKeyType="next"
                />
            </View>

            <View style={styles.inputContainer}>
                <TextInput
                    style={[
                        styles.input,
                        (!formData.phone || !validatePhone(formData.phone)) && touchedFields.phone && styles.inputError
                    ]}
                    placeholder="Teléfono *"
                    placeholderTextColor="#555555"
                    keyboardType="phone-pad"
                    value={formData.phone}
                    onChangeText={(phone) => setFormData({ ...formData, phone })}
                    onBlur={() => handleFieldTouch('phone')}
                    editable={!loading}
                    returnKeyType="next"
                />
            </View>

            <View style={styles.inputContainer}>
                <TouchableOpacity
                    onPress={() => {
                        setShowCountryPicker(true);
                        handleFieldTouch('country');
                    }}
                    style={[
                        styles.countryInput,
                        !formData.country && touchedFields.country && styles.inputError
                    ]}
                >
                    <Text style={formData.country ? styles.countrySelectedText : styles.placeholderText}>
                        {formData.country || 'Selecciona un país *'}
                    </Text>
                    <Icon name={showCountryPicker ? "chevron-up" : "chevron-down"} size={20} color="#555555" />
                </TouchableOpacity>

                <Modal
                    visible={showCountryPicker}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => {
                        setShowCountryPicker(false);
                        setSearchText('');
                        setFilteredCountries(countries);
                    }}
                >
                    <TouchableWithoutFeedback onPress={() => {
                        setShowCountryPicker(false);
                        setSearchText('');
                        setFilteredCountries(countries);
                    }}>
                        <View style={styles.modalOverlay} />
                    </TouchableWithoutFeedback>

                    <View style={styles.modalPickerContainer}>
                        <View style={styles.searchContainer}>
                            <Icon name="magnify" size={20} color="#555555" style={styles.searchIcon} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Buscar país..."
                                placeholderTextColor="#555555"
                                value={searchText}
                                onChangeText={handleSearch}
                                autoFocus={true}
                            />
                        </View>
                        <FlatList
                            data={filteredCountries}
                            renderItem={renderCountryItem}
                            keyExtractor={(item) => item.code}
                            keyboardShouldPersistTaps="always"
                            style={styles.countryList}
                        />
                    </View>
                </Modal>
            </View>

            <View style={styles.inputContainer}>
                <TextInput
                    style={[
                        styles.input,
                        (!formData.password || formData.password.length < 6) && touchedFields.password && styles.inputError
                    ]}
                    placeholder="Contraseña *"
                    placeholderTextColor="#555555"
                    secureTextEntry
                    value={formData.password}
                    onChangeText={(password) => setFormData({ ...formData, password })}
                    onBlur={() => handleFieldTouch('password')}
                    editable={!loading}
                    returnKeyType="next"
                />
            </View>

            <View style={styles.inputContainer}>
                <TextInput
                    style={[
                        styles.input,
                        (!formData.confirmPassword || formData.password !== formData.confirmPassword) && touchedFields.confirmPassword && styles.inputError
                    ]}
                    placeholder="Confirmar contraseña *"
                    placeholderTextColor="#555555"
                    secureTextEntry
                    value={formData.confirmPassword}
                    onChangeText={(confirmPassword) => setFormData({ ...formData, confirmPassword })}
                    onBlur={() => handleFieldTouch('confirmPassword')}
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
        </ScrollView>
    );
};

export default RegisterScreen;
