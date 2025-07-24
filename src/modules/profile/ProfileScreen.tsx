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
import { API_BASE_URL, getCountries, getProvinces, getCantons, getDistricts } from '../../services/auth.service';
import { useAuth } from '../auth/AuthContext';
import { LocationItem } from './ProfileScreen.types';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

const ProfileScreen = () => {
    const navigation = useNavigation<ProfileScreenNavigationProp>();
    const { user: authUser, updateUser, refreshUser } = useAuth();

    const [user, setUser] = useState({
        id: authUser?.id || '',
        email: authUser?.email || '',
        firstName: authUser?.firstName || '',
        lastName: authUser?.lastName || '',
        phone: authUser?.phone || '',
        country: authUser?.country || '',
        province: authUser?.personalUser?.location?.province?.name || 
                  authUser?.corporateUser?.location?.province?.name || 
                  authUser?.corporateEmployee?.location?.province?.name || '',
        canton: authUser?.personalUser?.location?.canton?.name || 
                authUser?.corporateUser?.location?.canton?.name || 
                authUser?.corporateEmployee?.location?.canton?.name || '',
        district: authUser?.personalUser?.location?.district?.name || 
                  authUser?.corporateUser?.location?.district?.name || 
                  authUser?.corporateEmployee?.location?.district?.name || '',
        picture: authUser?.profilePicture || ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [countries, setCountries] = useState<Array<{name: string, code: string}>>([]);
    const [provinces, setProvinces] = useState<LocationItem[]>([]);
    const [cantons, setCantons] = useState<LocationItem[]>([]);
    const [districts, setDistricts] = useState<LocationItem[]>([]);
    const [showCountryPicker, setShowCountryPicker] = useState(false);
    const [showProvincePicker, setShowProvincePicker] = useState(false);
    const [showCantonPicker, setShowCantonPicker] = useState(false);
    const [showDistrictPicker, setShowDistrictPicker] = useState(false);
    const [filteredCountries, setFilteredCountries] = useState<Array<{name: string, code: string}>>([]);
    const [filteredProvinces, setFilteredProvinces] = useState<LocationItem[]>([]);
    const [filteredCantons, setFilteredCantons] = useState<LocationItem[]>([]);
    const [filteredDistricts, setFilteredDistricts] = useState<LocationItem[]>([]);
    const [searchText, setSearchText] = useState('');
    const [provinceSearchText, setProvinceSearchText] = useState('');
    const [cantonSearchText, setCantonSearchText] = useState('');
    const [districtSearchText, setDistrictSearchText] = useState('');
    const [selectedProvinceId, setSelectedProvinceId] = useState<string | null>(null);
    const [selectedCantonId, setSelectedCantonId] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [hasLoadedProvinces, setHasLoadedProvinces] = useState(false);
    const [loadedCantonForProvince, setLoadedCantonForProvince] = useState<string | null>(null);
    const [loadedDistrictForCanton, setLoadedDistrictForCanton] = useState<string | null>(null);

    // Helper para construir URL completa de imagen
    const getImageUrl = (picture: string | undefined) => {
        if (!picture) return undefined;
        
        // Si ya es una URL completa (Google, S3, etc.), devolverla tal como está
        if (picture.startsWith('http://') || picture.startsWith('https://')) {
            return picture;
        }
        
        // Si es una ruta local, construir URL completa del servidor
        if (picture.startsWith('/')) {
            return `${API_BASE_URL}${picture}`;
        }
        
        // Si no empieza con /, agregar el prefijo
        return `${API_BASE_URL}/${picture}`;
    };

    // Sincronizar estado local con cambios en authUser
    useEffect(() => {
        if (authUser) {
            const locationData = authUser.personalUser?.location || 
                                 authUser.corporateUser?.location || 
                                 authUser.corporateEmployee?.location;
            
            const newUserState = {
                id: authUser.id || '',
                email: authUser.email || '',
                firstName: authUser.firstName || '',
                lastName: authUser.lastName || '',
                phone: authUser.phone || '',
                country: authUser.country || '',
                province: authUser.personalUser?.location?.province?.name || 
                          authUser.corporateUser?.location?.province?.name || 
                          authUser.corporateEmployee?.location?.province?.name || 
                          authUser.province || '',
                canton: authUser.personalUser?.location?.canton?.name || 
                        authUser.corporateUser?.location?.canton?.name || 
                        authUser.corporateEmployee?.location?.canton?.name || 
                        authUser.canton || '',
                district: authUser.personalUser?.location?.district?.name || 
                          authUser.corporateUser?.location?.district?.name || 
                          authUser.corporateEmployee?.location?.district?.name || 
                          authUser.district || '',
                picture: authUser.profilePicture || ''
            };
            
            setUser(newUserState);

            // Actualizar los IDs seleccionados si hay datos de ubicación
            if (locationData?.province?.id) {
                setSelectedProvinceId(locationData.province.id);
            }
            if (locationData?.canton?.id) {
                setSelectedCantonId(locationData.canton.id);
            }
        }
    }, [authUser]);

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

    useEffect(() => {
        if (user.country === 'Costa Rica' && !hasLoadedProvinces) {
            const fetchProvinces = async () => {
                try {
                    const provincesData = await getProvinces();
                    setProvinces(provincesData);
                    setFilteredProvinces(provincesData); // Inicializar lista filtrada
                    setHasLoadedProvinces(true);
                } catch (error) {
                    console.error('Error loading provinces:', error);
                    Alert.alert('Error', 'No se pudieron cargar las provincias. Por favor intenta nuevamente.');
                }
            };
            fetchProvinces();
        } else if (user.country !== 'Costa Rica') {
            setProvinces([]);
            setFilteredProvinces([]);
            setCantons([]);
            setFilteredCantons([]);
            setDistricts([]);
            setFilteredDistricts([]);
            setHasLoadedProvinces(false);
            // Solo limpiar ubicación si cambia de Costa Rica a otro país
            if (user.country && user.country !== 'Costa Rica') {
                setUser(prev => ({
                    ...prev,
                    province: '',
                    canton: '',
                    district: ''
                }));
            }
        }
    }, [user.country, hasLoadedProvinces]); // Solo user.country, no todo el objeto user

    useEffect(() => {
        if (selectedProvinceId && loadedCantonForProvince !== selectedProvinceId) {
            const fetchCantons = async () => {
                try {
                    const cantonsData = await getCantons(selectedProvinceId);
                    setCantons(cantonsData);
                    setFilteredCantons(cantonsData); // Inicializar lista filtrada
                    setLoadedCantonForProvince(selectedProvinceId);
                    
                    // Solo limpiar si no es la carga inicial
                    if (!isInitialLoad) {
                        setDistricts([]);
                        setFilteredDistricts([]);
                        setSelectedCantonId(null);
                    }
                } catch (error) {
                    console.error('Error loading cantons:', error);
                    Alert.alert('Error', 'No se pudieron cargar los cantones. Por favor intenta nuevamente.');
                }
            };
            fetchCantons();
        }
    }, [selectedProvinceId, loadedCantonForProvince, isInitialLoad]);

    useEffect(() => {
        if (selectedCantonId && loadedDistrictForCanton !== selectedCantonId) {
            const fetchDistricts = async () => {
                try {
                    const districtsData = await getDistricts(selectedCantonId);
                    setDistricts(districtsData);
                    setFilteredDistricts(districtsData); // Inicializar lista filtrada
                    setLoadedDistrictForCanton(selectedCantonId);
                    
                    // Solo limpiar si no es la carga inicial
                    if (!isInitialLoad) {
                        // Limpiar datos dependientes al cambiar selección
                    }
                } catch (error) {
                    console.error('Error loading districts:', error);
                    Alert.alert('Error', 'No se pudieron cargar los distritos. Por favor intenta nuevamente.');
                }
            };
            fetchDistricts();
        }
    }, [selectedCantonId, loadedDistrictForCanton, isInitialLoad]);

    // Efecto para cargar datos de ubicación existentes al montar el componente
    useEffect(() => {
        const loadExistingLocationData = async () => {
            if (user.country === 'Costa Rica' && user.province) {
                try {
                    // Cargar provincias y encontrar la provincia actual
                    const provincesData = await getProvinces();
                    setProvinces(provincesData);
                    
                    const currentProvince = provincesData.find((p: LocationItem) => p.name === user.province);
                    if (currentProvince) {
                        setSelectedProvinceId(currentProvince.id);
                        setLoadedCantonForProvince(currentProvince.id);
                        
                        // Si hay cantón, cargar cantones de esta provincia
                        if (user.canton) {
                            const cantonsData = await getCantons(currentProvince.id);
                            setCantons(cantonsData);
                            
                            const currentCanton = cantonsData.find((c: LocationItem) => c.name === user.canton);
                            if (currentCanton) {
                                setSelectedCantonId(currentCanton.id);
                                setLoadedDistrictForCanton(currentCanton.id);
                                
                                // Si hay distrito, cargar distritos de este cantón
                                if (user.district) {
                                    const districtsData = await getDistricts(currentCanton.id);
                                    setDistricts(districtsData);
                                }
                            }
                        }
                    }
                    
                    // Marcar que la carga inicial ha terminado
                    setTimeout(() => setIsInitialLoad(false), 100);
                } catch (error) {
                    console.error('Error loading existing location data:', error);
                    setIsInitialLoad(false);
                }
            } else {
                setIsInitialLoad(false);
            }
        };

        // Solo ejecutar al montar el componente si ya hay datos de Costa Rica
        if (user.country === 'Costa Rica' && user.province && selectedProvinceId === null) {
            loadExistingLocationData();
        } else {
            setIsInitialLoad(false);
        }
    }, []); // Solo al montar el componente

    // useEffect para sincronizar el estado local con cambios en authUser
    useEffect(() => {
        if (authUser) {
            const updatedUser = {
                id: authUser.id || user.id,
                email: authUser.email || user.email,
                firstName: authUser.firstName || user.firstName,
                lastName: authUser.lastName || user.lastName,
                phone: authUser.phone || user.phone,
                country: authUser.country || user.country,
                province: authUser.personalUser?.location?.province?.name || 
                          authUser.corporateUser?.location?.province?.name || 
                          authUser.corporateEmployee?.location?.province?.name || user.province,
                canton: authUser.personalUser?.location?.canton?.name || 
                        authUser.corporateUser?.location?.canton?.name || 
                        authUser.corporateEmployee?.location?.canton?.name || user.canton,
                district: authUser.personalUser?.location?.district?.name || 
                          authUser.corporateUser?.location?.district?.name || 
                          authUser.corporateEmployee?.location?.district?.name || user.district,
                picture: authUser.profilePicture || user.picture
            };

            setUser(updatedUser);

            // Actualizar IDs de selección si hay ubicación de Costa Rica
            const locationData = authUser.personalUser?.location || 
                                 authUser.corporateUser?.location || 
                                 authUser.corporateEmployee?.location;
            
            if (locationData?.province?.id) {
                setSelectedProvinceId(locationData.province.id);
            }
            if (locationData?.canton?.id) {
                setSelectedCantonId(locationData.canton.id);
            }
        }
    }, [authUser]); // Ejecutar cuando authUser cambie

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

    const handleProvinceSearch = (text: string) => {
        setProvinceSearchText(text);
        if (text === '') {
            setFilteredProvinces(provinces);
        } else {
            const filtered = provinces.filter(province =>
                province.name.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredProvinces(filtered);
        }
    };

    const handleCantonSearch = (text: string) => {
        setCantonSearchText(text);
        if (text === '') {
            setFilteredCantons(cantons);
        } else {
            const filtered = cantons.filter(canton =>
                canton.name.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredCantons(filtered);
        }
    };

    const handleDistrictSearch = (text: string) => {
        setDistrictSearchText(text);
        if (text === '') {
            setFilteredDistricts(districts);
        } else {
            const filtered = districts.filter(district =>
                district.name.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredDistricts(filtered);
        }
    };

    const handleCountrySelect = (countryName: string) => {
        console.log('País seleccionado:', countryName);
        setUser({ ...user, country: countryName, province: '', canton: '', district: '' });
        setShowCountryPicker(false);
        setSearchText('');
        setFilteredCountries(countries);
        setSelectedProvinceId(null);
        setSelectedCantonId(null);
        
        // Limpiar las listas cuando se cambie de país
        if (countryName !== 'Costa Rica') {
            setProvinces([]);
            setCantons([]);
            setDistricts([]);
        }
    };

    const handleProvinceSelect = (province: LocationItem) => {
        console.log('Provincia seleccionada:', province.name);
        setUser({ ...user, province: province.name, canton: '', district: '' });
        setSelectedProvinceId(province.id);
        setSelectedCantonId(null);
        setShowProvincePicker(false);
        setProvinceSearchText(''); // Limpiar búsqueda
        setFilteredProvinces(provinces); // Resetear lista filtrada
        setIsInitialLoad(false); // Marcar que ya no es carga inicial
        setLoadedCantonForProvince(null); // Resetear para cargar cantones de la nueva provincia
        setLoadedDistrictForCanton(null); // Resetear distritos
    };

    const handleCantonSelect = (canton: LocationItem) => {
        console.log('Cantón seleccionado:', canton.name);
        setUser({ ...user, canton: canton.name, district: '' });
        setSelectedCantonId(canton.id);
        setShowCantonPicker(false);
        setCantonSearchText(''); // Limpiar búsqueda
        setFilteredCantons(cantons); // Resetear lista filtrada
        setIsInitialLoad(false); // Marcar que ya no es carga inicial
        setLoadedDistrictForCanton(null); // Resetear para cargar distritos del nuevo cantón
    };

    const handleDistrictSelect = (district: LocationItem) => {
        console.log('Distrito seleccionado:', district.name);
        setUser({ ...user, district: district.name });
        setShowDistrictPicker(false);
        setDistrictSearchText(''); // Limpiar búsqueda
        setFilteredDistricts(districts); // Resetear lista filtrada
        setIsInitialLoad(false); // Marcar que ya no es carga inicial
    };

    const handleUpdateProfile = async () => {
        if (!isEditing) {
            setIsEditing(true);
            return;
        }

        // Validación básica
        if (!user.firstName?.trim()) {
            setError('Por favor ingresa tu nombre');
            return;
        }

        if (!user.lastName?.trim()) {
            setError('Por favor ingresa tu apellido');
            return;
        }

        // Validaciones especiales para Costa Rica
        if (user.country === 'Costa Rica') {
            if (!user.province) {
                setError('Por favor selecciona tu provincia');
                return;
            }
            if (!user.canton) {
                setError('Por favor selecciona tu cantón');
                return;
            }
            if (!user.district) {
                setError('Por favor selecciona tu distrito');
                return;
            }
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

            // Preparar datos de ubicación
            const locationUpdateData: any = {
                country: user.country
            };

            // Agregar datos de ubicación para Costa Rica
            if (user.country === 'Costa Rica') {
                locationUpdateData.province = user.province;
                locationUpdateData.canton = user.canton;
                locationUpdateData.district = user.district;
            }

            // Preparar datos de perfil según el tipo de usuario
            const profileData = {
                firstName: user.firstName?.trim(),
                lastName: user.lastName?.trim(),
                phone: user.phone?.trim(),
                location: locationUpdateData
            };

            // Estructurar los datos según el tipo de usuario del contexto
            let updateData: any = {};

            if (authUser?.personalUser) {
                updateData.personalData = profileData;
            } else if (authUser?.corporateUser) {
                updateData.corporateData = {
                    ...profileData,
                    // Mantener campos corporativos existentes si los hay
                    companyName: authUser.corporateUser.companyName,
                    contactName: authUser.corporateUser.contactName,
                    contactPhone: authUser.corporateUser.contactPhone,
                    employeeCount: authUser.corporateUser.employeeCount,
                    companyDomain: authUser.corporateUser.companyDomain
                };
            } else if (authUser?.corporateEmployee) {
                updateData.corporateEmployeeData = profileData;
            } else {
                // Fallback para casos donde no se puede determinar el tipo
                updateData.personalData = profileData;
            }

            const response = await axios.put(
                `${API_BASE_URL}/auth/profile`,
                updateData,
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

            // Actualizar el contexto de autenticación
            await updateUser(updatedUser);
            
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
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const selectedImage = result.assets[0];
                await uploadProfileImage(selectedImage.uri);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            setError('Error al seleccionar la imagen');
        }
    };

    const uploadProfileImage = async (uri: string) => {
        setLoading(true);
        setUploadProgress(0);
        setError(null);

        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) throw new Error('No authentication token found');

            // Crear FormData para la imagen
            const formData = new FormData();
            formData.append('image', {
                uri,
                name: `profile-${Date.now()}.jpg`,
                type: 'image/jpeg',
            } as any);

            console.log('Uploading profile image...');

            const response = await axios.put(
                `${API_BASE_URL}/auth/profile/picture`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    },
                    timeout: 60000, // 60 segundos de timeout
                    onUploadProgress: (progressEvent) => {
                        if (progressEvent.total) {
                            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                            setUploadProgress(progress);
                        }
                    },
                }
            );

            console.log('Profile image upload successful:', response.data);

            const updatedUser = response.data;
            
            if (!updatedUser.profilePicture) {
                throw new Error('El servidor no devolvió una URL de imagen válida');
            }
            
            // Actualizar el estado local
            setUser(prev => ({
                ...prev,
                picture: updatedUser.profilePicture
            }));

            // Actualizar el contexto de autenticación
            await updateUser(updatedUser);

            Alert.alert('Éxito', 'Foto de perfil actualizada correctamente');
        } catch (error) {
            console.error('Error uploading image:', error);
            let errorMessage = 'Error al subir la imagen';
            
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 413) {
                    errorMessage = 'La imagen es demasiado grande. El tamaño máximo permitido es 5MB.';
                } else if (error.response?.status === 400) {
                    errorMessage = error.response.data?.message || 'Formato de imagen no válido. Usa JPG, PNG o GIF.';
                } else if (error.code === 'ECONNABORTED') {
                    errorMessage = 'Tiempo de espera agotado. Verifica tu conexión e intenta nuevamente.';
                } else if (error.response?.data?.message) {
                    errorMessage = error.response.data.message;
                }
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
            
            setError(errorMessage);
            Alert.alert('Error', errorMessage);
        } finally {
            setLoading(false);
            setUploadProgress(0);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#D4AF37" />
                {uploadProgress > 0 && (
                    <Text style={{color: '#D4AF37', marginTop: 10}}>
                        Subiendo imagen: {Math.round(uploadProgress)}%
                    </Text>
                )}
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
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalHeaderText}>Seleccionar País</Text>
                            <TouchableOpacity
                                onPress={() => setShowCountryPicker(false)}
                                style={styles.modalCloseButton}
                            >
                                <Icon name="close" size={24} color="#D4AF37" />
                            </TouchableOpacity>
                        </View>
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
                                    onPress={() => handleCountrySelect(country.name)}
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
                            source={{ uri: getImageUrl(user.picture) }}
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
                    <Text style={styles.label}>Teléfono</Text>
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
                    <Text style={styles.label}>País</Text>
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

                {/* Campos específicos para Costa Rica */}
                {user.country === 'Costa Rica' && (
                    <>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Provincia</Text>
                            <TouchableOpacity
                                style={styles.countryInput}
                                onPress={() => isEditing && setShowProvincePicker(true)}
                                disabled={!isEditing}
                            >
                                <Text style={user.province ? styles.inputText : styles.placeholderText}>
                                    {user.province || 'Selecciona tu provincia'}
                                </Text>
                                {isEditing && (
                                    <Icon name="chevron-down" size={20} color="#555555" />
                                )}
                            </TouchableOpacity>
                        </View>

                        {user.province && (
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Cantón</Text>
                                <TouchableOpacity
                                    style={styles.countryInput}
                                    onPress={() => isEditing && setShowCantonPicker(true)}
                                    disabled={!isEditing}
                                >
                                    <Text style={user.canton ? styles.inputText : styles.placeholderText}>
                                        {user.canton || 'Selecciona tu cantón'}
                                    </Text>
                                    {isEditing && (
                                        <Icon name="chevron-down" size={20} color="#555555" />
                                    )}
                                </TouchableOpacity>
                            </View>
                        )}

                        {user.canton && (
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Distrito</Text>
                                <TouchableOpacity
                                    style={styles.countryInput}
                                    onPress={() => isEditing && setShowDistrictPicker(true)}
                                    disabled={!isEditing}
                                >
                                    <Text style={user.district ? styles.inputText : styles.placeholderText}>
                                        {user.district || 'Selecciona tu distrito'}
                                    </Text>
                                    {isEditing && (
                                        <Icon name="chevron-down" size={20} color="#555555" />
                                    )}
                                </TouchableOpacity>
                            </View>
                        )}
                    </>
                )}
            </View>

            {/* Modal de selección de provincia */}
            <Modal
                visible={showProvincePicker}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowProvincePicker(false)}
            >
                <View style={styles.countryModalOverlay}>
                    <View style={styles.countryModalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalHeaderText}>Seleccionar Provincia</Text>
                            <TouchableOpacity
                                onPress={() => setShowProvincePicker(false)}
                                style={styles.modalCloseButton}
                            >
                                <Icon name="close" size={24} color="#D4AF37" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.searchContainer}>
                            <Icon name="magnify" size={20} color="#555555" style={styles.searchIcon} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Buscar provincia..."
                                placeholderTextColor="#555555"
                                value={provinceSearchText}
                                onChangeText={handleProvinceSearch}
                            />
                        </View>
                        <ScrollView style={styles.countryList}>
                            {filteredProvinces.map((province) => (
                                <TouchableOpacity
                                    key={province.id}
                                    style={styles.countryItem}
                                    onPress={() => handleProvinceSelect(province)}
                                >
                                    <Text style={styles.countryItemText}>{province.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Modal de selección de cantón */}
            <Modal
                visible={showCantonPicker}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowCantonPicker(false)}
            >
                <View style={styles.countryModalOverlay}>
                    <View style={styles.countryModalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalHeaderText}>Seleccionar Cantón</Text>
                            <TouchableOpacity
                                onPress={() => setShowCantonPicker(false)}
                                style={styles.modalCloseButton}
                            >
                                <Icon name="close" size={24} color="#D4AF37" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.searchContainer}>
                            <Icon name="magnify" size={20} color="#555555" style={styles.searchIcon} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Buscar cantón..."
                                placeholderTextColor="#555555"
                                value={cantonSearchText}
                                onChangeText={handleCantonSearch}
                            />
                        </View>
                        <ScrollView style={styles.countryList}>
                            {filteredCantons.map((canton) => (
                                <TouchableOpacity
                                    key={canton.id}
                                    style={styles.countryItem}
                                    onPress={() => handleCantonSelect(canton)}
                                >
                                    <Text style={styles.countryItemText}>{canton.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Modal de selección de distrito */}
            <Modal
                visible={showDistrictPicker}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowDistrictPicker(false)}
            >
                <View style={styles.countryModalOverlay}>
                    <View style={styles.countryModalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalHeaderText}>Seleccionar Distrito</Text>
                            <TouchableOpacity
                                onPress={() => setShowDistrictPicker(false)}
                                style={styles.modalCloseButton}
                            >
                                <Icon name="close" size={24} color="#D4AF37" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.searchContainer}>
                            <Icon name="magnify" size={20} color="#555555" style={styles.searchIcon} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Buscar distrito..."
                                placeholderTextColor="#555555"
                                value={districtSearchText}
                                onChangeText={handleDistrictSearch}
                            />
                        </View>
                        <ScrollView style={styles.countryList}>
                            {filteredDistricts.map((district) => (
                                <TouchableOpacity
                                    key={district.id}
                                    style={styles.countryItem}
                                    onPress={() => handleDistrictSelect(district)}
                                >
                                    <Text style={styles.countryItemText}>{district.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

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
