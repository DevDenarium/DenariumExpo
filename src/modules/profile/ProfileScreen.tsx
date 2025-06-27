import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ActivityIndicator, Alert, Modal, Pressable, ScrollView } from 'react-native';
import { styles } from './ProfileScreen.styles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navegation/Navegation.types';
import { StackNavigationProp } from '@react-navigation/stack';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { API_BASE_URL } from '../../services/auth.service';
import { getCountries } from '../../services/auth.service';
import { useAuth } from '../auth/AuthContext';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

const ProfileScreen = () => {
    const navigation = useNavigation<ProfileScreenNavigationProp>();
    const { user: authUser, updateUser } = useAuth();

    const [user, setUser] = useState({
        id: authUser?.id || '',
        email: authUser?.email || '',
        firstName: authUser?.firstName || '',
        lastName: authUser?.lastName || '',
        phone: authUser?.phone || '',
        country: authUser?.country || '',
        picture: authUser?.profilePicture || ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [countries, setCountries] = useState<Array<{name: string, code: string}>>([]);
    const [showCountryPicker, setShowCountryPicker] = useState(false);
    const [filteredCountries, setFilteredCountries] = useState<Array<{name: string, code: string}>>([]);
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const countriesData = await getCountries();
                setCountries(countriesData);
                setFilteredCountries(countriesData);
            } catch (error) {
                console.error('Error loading countries:', error);
            }
        };
        fetchCountries();
    }, []);

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

    const handleUpdateProfile = async () => {
        if (!isEditing) {
            setIsEditing(true);
            return;
        }

        // Validación básica
        if (!user.phone) {
            setError('Por favor ingresa tu número de teléfono');
            return;
        }

        if (!user.country) {
            setError('Por favor selecciona tu país');
            return;
        }

        setShowConfirmation(true);
    };

    const confirmUpdateProfile = async () => {
        setShowConfirmation(false);
        setLoading(true);
        setError(null);

        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) throw new Error('No authentication token found');

            const response = await axios.put(
                `${API_BASE_URL}/auth/profile`,
                {
                    firstName: user.firstName?.trim(),
                    lastName: user.lastName?.trim(),
                    phone: user.phone?.trim(),
                    country: user.country?.trim()
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Maneja ambos formatos de respuesta
            const updatedUser = response.data.user || response.data;

            if (!updatedUser) {
                throw new Error('El servidor no devolvió datos de usuario');
            }

            setUser(updatedUser);
            setIsEditing(false);
            Alert.alert('Éxito', 'Perfil actualizado correctamente');

        } catch (error) {
            console.error('Error updating profile:', error);
            const errorMessage = error instanceof Error ?
                error.message :
                'Error al actualizar el perfil';
            setError(errorMessage);
            Alert.alert('Error', errorMessage);
        } finally {
            setLoading(false);
        }
    };
    const pickImage = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (!permissionResult.granted) {
                Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería para cambiar la foto de perfil');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const selectedImage = result.assets[0];
                await uploadImage(selectedImage.uri);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            setError('Error al seleccionar la imagen');
        }
    };

    const uploadImage = async (uri: string) => {
        setLoading(true);
        setError(null);

        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) throw new Error('No authentication token found');

            const formData = new FormData();
            formData.append('image', {
                uri,
                name: 'profile.jpg',
                type: 'image/jpeg',
            } as any);

            const response = await axios.put(
                `${API_BASE_URL}/auth/profile/picture`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            setUser(prev => ({
                ...prev,
                picture: response.data.picture
            }));

            Alert.alert('Éxito', 'Foto de perfil actualizada correctamente');
        } catch (error) {
            console.error('Error uploading image:', error);
            setError('Error al subir la imagen');
        } finally {
            setLoading(false);
        }
    };

    const renderCountryItem = ({ item }: { item: { name: string, code: string } }) => (
        <TouchableOpacity
            style={styles.countryItem}
            onPress={() => {
                setUser({ ...user, country: item.name });
                setShowCountryPicker(false);
                setSearchText('');
                setFilteredCountries(countries);
            }}
        >
            <Text style={styles.countryItemText}>{item.name}</Text>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#D4AF37" />
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {/* Modal de confirmación */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={showConfirmation}
                onRequestClose={() => setShowConfirmation(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Confirmar cambios</Text>
                        <Text style={styles.modalText}>¿Estás seguro que deseas guardar los cambios en tu perfil?</Text>

                        <View style={styles.modalButtonContainer}>
                            <Pressable
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setShowConfirmation(false)}
                            >
                                <Text style={styles.modalButtonText}>Cancelar</Text>
                            </Pressable>

                            <Pressable
                                style={[styles.modalButton, styles.confirmButton]}
                                onPress={confirmUpdateProfile}
                            >
                                <Text style={styles.modalButtonText}>Confirmar</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Modal de selección de país */}
            <Modal
                visible={showCountryPicker}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowCountryPicker(false)}
            >
                <View style={styles.countryModalOverlay}>
                    <View style={styles.countryModalContainer}>
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
                        <ScrollView style={styles.countryList}>
                            {filteredCountries.map((country) => (
                                <TouchableOpacity
                                    key={country.code}
                                    style={styles.countryItem}
                                    onPress={() => {
                                        setUser({ ...user, country: country.name });
                                        setShowCountryPicker(false);
                                    }}
                                >
                                    <Text style={styles.countryItemText}>{country.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            <View style={styles.profileHeader}>
                <View style={styles.profileImageContainer}>
                    {user?.picture ? (
                        <Image
                            source={{ uri: user.picture }}
                            style={styles.profileImage}
                        />
                    ) : (
                        <Icon name="account-circle" size={120} color="#D4AF37" />
                    )}
                    <TouchableOpacity
                        style={styles.changePhotoButton}
                        onPress={pickImage}
                        disabled={loading}
                    >
                        <Icon name="camera" size={20} color="#000000" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Nombre</Text>
                    <TextInput
                        style={styles.input}
                        value={user.firstName || ''}
                        onChangeText={(text) => setUser({ ...user, firstName: text })}
                        editable={isEditing}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Apellido</Text>
                    <TextInput
                        style={styles.input}
                        value={user.lastName || ''}
                        onChangeText={(text) => setUser({ ...user, lastName: text })}
                        editable={isEditing}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Correo electrónico</Text>
                    <TextInput
                        style={styles.input}
                        value={user.email}
                        editable={false}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Teléfono *</Text>
                    <TextInput
                        style={styles.input}
                        value={user.phone || ''}
                        onChangeText={(text) => setUser({ ...user, phone: text })}
                        editable={isEditing}
                        keyboardType="phone-pad"
                        placeholder="Ingresa tu número de teléfono"
                        placeholderTextColor="#666"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>País *</Text>
                    <TouchableOpacity
                        style={styles.countryInput}
                        onPress={() => isEditing && setShowCountryPicker(true)}
                        disabled={!isEditing}
                    >
                        <Text style={user.country ? styles.inputText : styles.placeholderText}>
                            {user.country || 'Selecciona tu país'}
                        </Text>
                        {isEditing && (
                            <Icon name="chevron-down" size={20} color="#555555" />
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <TouchableOpacity
                style={styles.saveButton}
                onPress={handleUpdateProfile}
                disabled={loading}
            >
                <Text style={styles.saveButtonText}>
                    {isEditing ? (loading ? 'Guardando...' : 'Guardar cambios') : 'Editar perfil'}
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

export default ProfileScreen;
