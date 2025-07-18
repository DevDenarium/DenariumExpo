import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert, ScrollView, Modal, TouchableWithoutFeedback, FlatList } from 'react-native';
import { styles } from './RegisterScreen.styles';
import { registerPersonal, getCountries, getProvinces, getCantons, getDistricts } from '../../services/auth.service';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navegation/Navegation.types';
import {UserRole} from "./user.types";
import { SubscriptionsService } from "../../services/subscription.service";

type RegisterPersonalScreenProps = {
    navigation: StackNavigationProp<RootStackParamList, 'RegisterPersonal'>;
};

type LocationItem = {
    id: string;
    name: string;
};

const RegisterPersonalScreen = ({ navigation }: RegisterPersonalScreenProps) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        phone: '',
        country: '',
        province: '',
        canton: '',
        district: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [countries, setCountries] = useState<Array<{name: string, code: string}>>([]);
    const [provinces, setProvinces] = useState<LocationItem[]>([]);
    const [cantons, setCantons] = useState<LocationItem[]>([]);
    const [districts, setDistricts] = useState<LocationItem[]>([]);

    // Estados para los selectores
    const [showCountryPicker, setShowCountryPicker] = useState(false);
    const [showProvincePicker, setShowProvincePicker] = useState(false);
    const [showCantonPicker, setShowCantonPicker] = useState(false);
    const [showDistrictPicker, setShowDistrictPicker] = useState(false);

    const [filteredCountries, setFilteredCountries] = useState<Array<{name: string, code: string}>>([]);
    const [searchText, setSearchText] = useState('');
    const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
    const [showCostaRicaFields, setShowCostaRicaFields] = useState(false);
    const [selectedProvinceId, setSelectedProvinceId] = useState<string | null>(null);
    const [selectedCantonId, setSelectedCantonId] = useState<string | null>(null);

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

    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const provincesData = await getProvinces();
                setProvinces(provincesData);
            } catch (error) {
                console.error('Error loading provinces:', error);
                Alert.alert('Error', 'No se pudieron cargar las provincias. Por favor intenta nuevamente.');
            }
        };

        if (formData.country === 'Costa Rica') {
            fetchProvinces();
            setShowCostaRicaFields(true);
        } else {
            setShowCostaRicaFields(false);
            setFormData(prev => ({
                ...prev,
                province: '',
                canton: '',
                district: ''
            }));
        }
    }, [formData.country]);

    useEffect(() => {
        const fetchCantons = async () => {
            if (selectedProvinceId) {
                try {
                    const cantonsData = await getCantons(selectedProvinceId);
                    setCantons(cantonsData);
                } catch (error) {
                    console.error('Error loading cantons:', error);
                    Alert.alert('Error', 'No se pudieron cargar los cantones. Por favor intenta nuevamente.');
                }
            }
        };

        fetchCantons();
    }, [selectedProvinceId]);

    useEffect(() => {
        const fetchDistricts = async () => {
            if (selectedCantonId) {
                try {
                    const districtsData = await getDistricts(selectedCantonId);
                    setDistricts(districtsData);
                } catch (error) {
                    console.error('Error loading districts:', error);
                    Alert.alert('Error', 'No se pudieron cargar los distritos. Por favor intenta nuevamente.');
                }
            }
        };

        fetchDistricts();
    }, [selectedCantonId]);

    const handleFieldTouch = (fieldName: string) => {
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
        if (!formData.email || !formData.password || !formData.confirmPassword ||
            !formData.firstName || !formData.lastName || !formData.phone || !formData.country) {
            setError('Por favor completa todos los campos obligatorios');
            return;
        }

        if (showCostaRicaFields && (!formData.province || !formData.canton || !formData.district)) {
            setError('Por favor completa todos los campos de dirección');
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
            const registerResponse = await registerPersonal({
                email: formData.email,
                password: formData.password,
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: formData.phone,
                country: formData.country,
                ...(showCostaRicaFields && {
                    province: formData.province,
                    canton: formData.canton,
                    district: formData.district
                })
            });

            if (registerResponse.success && registerResponse.user) {
                await SubscriptionsService.activateFreeSubscription('PERSONAL_FREE');

                if (registerResponse.requiresVerification) {
                    navigation.navigate('Verification', {
                        email: formData.email,
                        userRole: UserRole.PERSONAL
                    });
                } else {
                    navigation.navigate('Dashboard', {
                        user: registerResponse.user
                    });
                }
            } else {
                throw new Error(registerResponse.message || 'Error en el registro');
            }

        } catch (error) {
            let errorMessage = 'Error en el registro';
            if (error instanceof Error) {
                errorMessage = error.message;
            }
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
                setFormData({
                    ...formData,
                    country: item.name,
                    province: '',
                    canton: '',
                    district: ''
                });
                setShowCountryPicker(false);
                setSearchText('');
                setFilteredCountries(countries);
                handleFieldTouch('country');
            }}
        >
            <Text style={styles.countryItemText}>{item.name}</Text>
        </TouchableOpacity>
    );

    const renderLocationItem = ({ item }: { item: LocationItem }, type: 'province' | 'canton' | 'district') => (
        <TouchableOpacity
            style={styles.countryItem}
            onPress={() => {
                const updates: any = { [`${type}`]: item.name };
                if (type === 'province') {
                    updates.canton = '';
                    updates.district = '';
                    setSelectedProvinceId(item.id);
                    setSelectedCantonId(null);
                } else if (type === 'canton') {
                    updates.district = '';
                    setSelectedCantonId(item.id);
                }

                setFormData({
                    ...formData,
                    ...updates
                });

                if (type === 'province') setShowProvincePicker(false);
                if (type === 'canton') setShowCantonPicker(false);
                if (type === 'district') setShowDistrictPicker(false);

                handleFieldTouch(type);
            }}
        >
            <Text style={styles.countryItemText}>{item.name}</Text>
        </TouchableOpacity>
    );

    const renderPickerModal = (
        visible: boolean,
        setVisible: (value: boolean) => void,
        data: LocationItem[] | Array<{name: string, code: string}>,
        type: 'country' | 'province' | 'canton' | 'district'
    ) => (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setVisible(false)}
        >
            <TouchableWithoutFeedback onPress={() => setVisible(false)}>
                <View style={styles.modalOverlay} />
            </TouchableWithoutFeedback>

            <View style={styles.modalPickerContainer}>
                {type === 'country' && (
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
                )}
                <FlatList
                    data={data as any}
                    renderItem={({ item }) =>
                        type === 'country' ?
                            renderCountryItem({ item }) :
                            renderLocationItem({ item }, type as any)
                    }
                    keyExtractor={(item) => type === 'country' ? item.code : item.id}
                    keyboardShouldPersistTaps="always"
                    style={styles.countryList}
                />
            </View>
        </Modal>
    );

    return (
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <View style={styles.titleContainer}>
                <Text style={styles.title}>Cuenta Personal</Text>
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
                    placeholder="Apellidos *"
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
            </View>

            {showCostaRicaFields && (
                <>
                    <View style={styles.inputContainer}>
                        <TouchableOpacity
                            onPress={() => {
                                setShowProvincePicker(true);
                                handleFieldTouch('province');
                            }}
                            style={[
                                styles.countryInput,
                                !formData.province && touchedFields.province && styles.inputError
                            ]}
                        >
                            <Text style={formData.province ? styles.countrySelectedText : styles.placeholderText}>
                                {formData.province || 'Selecciona una provincia *'}
                            </Text>
                            <Icon name={showProvincePicker ? "chevron-up" : "chevron-down"} size={20} color="#555555" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputContainer}>
                        <TouchableOpacity
                            onPress={() => {
                                if (!formData.province) {
                                    Alert.alert('Primero selecciona una provincia');
                                    return;
                                }
                                setShowCantonPicker(true);
                                handleFieldTouch('canton');
                            }}
                            style={[
                                styles.countryInput,
                                !formData.canton && touchedFields.canton && styles.inputError
                            ]}
                            disabled={!formData.province}
                        >
                            <Text style={formData.canton ? styles.countrySelectedText : styles.placeholderText}>
                                {formData.canton || 'Selecciona un cantón *'}
                            </Text>
                            <Icon name={showCantonPicker ? "chevron-up" : "chevron-down"} size={20} color="#555555" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputContainer}>
                        <TouchableOpacity
                            onPress={() => {
                                if (!formData.canton) {
                                    Alert.alert('Primero selecciona un cantón');
                                    return;
                                }
                                setShowDistrictPicker(true);
                                handleFieldTouch('district');
                            }}
                            style={[
                                styles.countryInput,
                                !formData.district && touchedFields.district && styles.inputError
                            ]}
                            disabled={!formData.canton}
                        >
                            <Text style={formData.district ? styles.countrySelectedText : styles.placeholderText}>
                                {formData.district || 'Selecciona un distrito *'}
                            </Text>
                            <Icon name={showDistrictPicker ? "chevron-up" : "chevron-down"} size={20} color="#555555" />
                        </TouchableOpacity>
                    </View>
                </>
            )}

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

            {renderPickerModal(showCountryPicker, setShowCountryPicker, filteredCountries, 'country')}
            {renderPickerModal(showProvincePicker, setShowProvincePicker, provinces, 'province')}
            {renderPickerModal(showCantonPicker, setShowCantonPicker, cantons, 'canton')}
            {renderPickerModal(showDistrictPicker, setShowDistrictPicker, districts, 'district')}
        </ScrollView>
    );
};

export default RegisterPersonalScreen;
