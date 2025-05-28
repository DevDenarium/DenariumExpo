import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ActivityIndicator, Alert, Modal, Pressable } from 'react-native';
import { styles } from './ProfileScreen.styles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../modules/navegation/navegation.types';
import { StackNavigationProp } from '@react-navigation/stack';
import { User } from '../dashboard/DashboardScreen.types';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { API_BASE_URL } from '../../services/auth.service';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

const ProfileScreen = ({ route }: { route: { params: { user: User } } }) => {
    const navigation = useNavigation<ProfileScreenNavigationProp>();
    const { user: initialUser } = route.params;

    const [user, setUser] = useState<User>(initialUser);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);

    const handleUpdateProfile = async () => {
        if (!isEditing) {
            setIsEditing(true);
            return;
        }

        // Mostrar el popup de confirmación antes de guardar
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
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            console.log('Update response:', response.data);
            Alert.alert('Éxito', 'Perfil actualizado correctamente');
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating profile:', error);
            setError(error instanceof Error ? error.message : 'Error al actualizar el perfil');
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

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#D4AF37" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
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

            <View style={styles.profileHeader}>
                <View style={styles.profileImageContainer}>
                    {user.picture ? (
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
        </View>
    );
};

export default ProfileScreen;
