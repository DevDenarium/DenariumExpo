import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Modal,
    TextInput,
    Switch,
    ActivityIndicator,
    Alert,
    Linking,
} from 'react-native';
import { styles } from './VideoManagement.styles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../../modules/auth/AuthContext';
import { EducationalService } from '../../services/educational.service';
import {
    EducationalContent,
    ContentCategory,
    CreateContentForm,
    UpdateContentForm,
    VideoManagementProps,
} from './VideoManagement.types';

const VideoManagement: React.FC<VideoManagementProps> = ({ navigation }) => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'videos' | 'stories'>('videos');
    const [contents, setContents] = useState<EducationalContent[]>([]);
    const [categories, setCategories] = useState<ContentCategory[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    const [currentContent, setCurrentContent] = useState<EducationalContent | null>(null);
    const [formData, setFormData] = useState<CreateContentForm>({
        title: '',
        description: '',
        type: 'VIDEO',
        categoryId: categories.length > 0 ? categories[0].id : '',
        videoUrl: '',
        duration: 0, // Valor por defecto para number
        isPremium: false,
        isActive: true,
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateYouTubeUrl = (url: string): boolean => {
        const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
        return pattern.test(url);
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.title.trim()) {
            errors.title = 'El título es requerido';
        } else if (formData.title.length > 100) {
            errors.title = 'El título no puede exceder 100 caracteres';
        }

        if (!formData.description.trim()) {
            errors.description = 'La descripción es requerida';
        } else if (formData.description.length > 500) {
            errors.description = 'La descripción no puede exceder 500 caracteres';
        }

        if (!formData.videoUrl.trim()) {
            errors.videoUrl = 'La URL es requerida';
        } else if (!validateYouTubeUrl(formData.videoUrl)) {
            errors.videoUrl = 'Ingrese una URL válida de YouTube';
        }

        if (formData.type === 'VIDEO' && (formData.duration <= 0 || formData.duration > 120)) {
            errors.duration = 'La duración debe ser entre 1 y 120 minutos';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const fetchContents = async () => {
        try {
            setLoading(true);
            const response = await EducationalService.fetchContents({
                type: activeTab === 'videos' ? 'VIDEO' : 'STORY',
                isActive: undefined // Traer todos, activos e inactivos
            });
            setContents(response);
        } catch (error) {
            console.error('Error fetching contents:', error);
            Alert.alert('Error', 'No se pudo cargar el contenido');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await EducationalService.fetchCategories();
            setCategories(response);
            if (response.length > 0 && !formData.categoryId) {
                setFormData(prev => ({ ...prev, categoryId: response[0].id }));
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            Alert.alert('Error', 'No se pudieron cargar las categorías');
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchContents();
    }, [activeTab]);

    const handleTabChange = (tab: 'videos' | 'stories') => {
        setActiveTab(tab);
    };

    const handleAddContent = () => {
        setFormData({
            title: '',
            description: '',
            type: activeTab === 'videos' ? 'VIDEO' : 'STORY',
            categoryId: categories.length > 0 ? categories[0].id : '',
            videoUrl: '',
            duration: 0,
            isPremium: false,
            isActive: true,
        });
        setFormErrors({});
        setIsEditMode(false);
        setCurrentContent(null);
        setModalVisible(true);
    };

    const handleEditContent = (content: EducationalContent) => {
        setFormData({
            title: content.title,
            description: content.description,
            type: content.type,
            categoryId: content.categoryId,
            videoUrl: content.videoUrl || '', // Valor por defecto para string
            duration: content.duration || 0,  // Valor por defecto para number
            isPremium: content.isPremium,
            isActive: content.isActive,
        });
        setFormErrors({});
        setIsEditMode(true);
        setCurrentContent(content);
        setModalVisible(true);
    };

    const handleDeleteContent = async (id: string) => {
        Alert.alert(
            'Confirmar eliminación',
            '¿Estás seguro de que deseas eliminar este contenido?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await EducationalService.deleteContent(id);
                            fetchContents();
                            Alert.alert('Éxito', 'Contenido eliminado correctamente');
                        } catch (error) {
                            console.error('Error deleting content:', error);
                            Alert.alert('Error', 'No se pudo eliminar el contenido');
                        }
                    },
                },
            ]
        );
    };

    const handleFormChange = (field: keyof CreateContentForm, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (formErrors[field]) {
            setFormErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            if (isEditMode && currentContent) {
                // Cambia esta parte para enviar los dos argumentos por separado
                await EducationalService.updateContent(
                    currentContent.id,
                    {
                        title: formData.title,
                        description: formData.description,
                        categoryId: formData.categoryId,
                        videoUrl: formData.videoUrl,
                        duration: formData.duration,
                        isPremium: formData.isPremium,
                        isActive: formData.isActive
                    }
                );
                Alert.alert('Éxito', 'Contenido actualizado correctamente');
            } else {
                await EducationalService.createContent(formData);
                Alert.alert('Éxito', 'Contenido creado correctamente');
            }
            setModalVisible(false);
            fetchContents();
        } catch (error) {
            console.error('Error saving content:', error);
            Alert.alert('Error', 'No se pudo guardar el contenido');
        } finally {
            setIsSubmitting(false);
        }
    };

    const previewVideo = () => {
        if (formData.videoUrl && validateYouTubeUrl(formData.videoUrl)) {
            Linking.openURL(formData.videoUrl);
        } else {
            Alert.alert('Error', 'Ingrese una URL válida de YouTube primero');
        }
    };

    const renderContentCard = (content: EducationalContent) => {
        const category = categories.find(cat => cat.id === content.categoryId);
        const isVideo = content.type === 'VIDEO';

        return (
            <View key={content.id} style={styles.contentCard}>
                <View style={styles.contentHeader}>
                    <Text style={styles.contentTitle}>{content.title}</Text>
                    {content.isPremium && (
                        <View style={styles.premiumBadge}>
                            <Text style={styles.premiumBadgeText}>PREMIUM</Text>
                        </View>
                    )}
                    {!content.isActive && (
                        <View style={styles.inactiveBadge}>
                            <Text style={styles.inactiveBadgeText}>INACTIVO</Text>
                        </View>
                    )}
                </View>
                <Text style={styles.contentDescription}>{content.description}</Text>
                <View style={styles.contentMeta}>
                    {category && (
                        <Text style={styles.contentCategory}>
                            <Icon name={category.icon || 'video'} size={12} color={category.color || '#000'} /> {category.name}
                        </Text>
                    )}
                    <Text style={styles.contentDuration}>
                        {isVideo ? `${content.duration} min` : 'Historia (1 min max)'}
                    </Text>
                </View>
                <View style={styles.contentRestrictions}>
                    <Text style={styles.restrictionText}>
                        {content.isPremium ? 'Solo Premium: Acceso completo' : 'Todos: '}
                        {isVideo
                            ? content.isPremium ? 'Video completo' : `Primeros ${Math.min(content.duration || 0, 2)} min`
                            : content.isPremium ? 'Historia completa' : 'Vista previa'}
                    </Text>
                </View>
                <View style={styles.contentActions}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.editButton]}
                        onPress={() => handleEditContent(content)}
                    >
                        <Text style={styles.actionButtonText}>Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.deleteButton]}
                        onPress={() => handleDeleteContent(content.id)}
                    >
                        <Text style={styles.actionButtonText}>Eliminar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const enhancedStyles = {
        ...styles,
        inactiveBadge: {
            backgroundColor: '#777',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 4,
            marginLeft: 10,
        },
        inactiveBadgeText: {
            color: '#fff',
            fontSize: 12,
            fontWeight: 'bold',
        },
        contentRestrictions: {
            marginTop: 8,
            padding: 8,
            backgroundColor: '#f5f5f5',
            borderRadius: 4,
        },
        restrictionText: {
            fontSize: 12,
            color: '#555',
        },
        errorText: {
            color: '#e74c3c',
            fontSize: 12,
            marginTop: -10,
            marginBottom: 10,
        },
        previewButton: {
            backgroundColor: '#D4AF37',
            padding: 8,
            borderRadius: 4,
            marginBottom: 15,
            alignItems: 'flex-start' as const,
        },
        previewButtonText: {
            color: '#fff',
            fontWeight: 'bold' as const,
        },
    };

    if (loading && contents.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#D4AF37" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Gestión de Contenido Educativo</Text>

            {categories.length === 0 && (
                <TouchableOpacity
                    style={{
                        backgroundColor: '#4CAF50',
                        padding: 10,
                        borderRadius: 6,
                        alignSelf: 'flex-start',
                        marginTop: 10,
                        marginBottom: 5,
                    }}
                    onPress={async () => {
                        try {
                            const response = await EducationalService.createDefaultCategories();
                            Alert.alert('Éxito', `${response.created} categorías creadas`);
                            await fetchCategories(); // Recargar categorías luego de crearlas
                        } catch (error) {
                            console.error(error);
                            Alert.alert('Error', 'No se pudieron crear las categorías por defecto');
                        }
                    }}
                >
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>
                        Crear categorías por defecto
                    </Text>
                </TouchableOpacity>
            )}

            <View style={styles.tabsContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'videos' && styles.activeTab]}
                    onPress={() => handleTabChange('videos')}
                >
                    <Text style={[styles.tabText, activeTab === 'videos' && styles.activeTabText]}>
                        Videos Tutoriales
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'stories' && styles.activeTab]}
                    onPress={() => handleTabChange('stories')}
                >
                    <Text style={[styles.tabText, activeTab === 'stories' && styles.activeTabText]}>
                        Historias
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.contentList}>
                {contents.length > 0 ? (
                    contents.map(renderContentCard)
                ) : (
                    <View style={styles.emptyState}>
                        <Icon name="video-off" size={50} color="#999" />
                        <Text style={styles.emptyText}>
                            No hay {activeTab === 'videos' ? 'videos' : 'historias'} disponibles
                        </Text>
                    </View>
                )}
            </ScrollView>

            <TouchableOpacity style={styles.addButton} onPress={handleAddContent}>
                <Text style={styles.addButtonText}>
                    <Icon name="plus" size={18} color="#fff" /> Agregar {activeTab === 'videos' ? 'Video' : 'Historia'}
                </Text>
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            {isEditMode ? 'Editar Contenido' : 'Agregar Nuevo Contenido'}
                        </Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Título*"
                            value={formData.title}
                            onChangeText={text => handleFormChange('title', text)}
                        />
                        {formErrors.title && <Text style={enhancedStyles.errorText}>{formErrors.title}</Text>}

                        <TextInput
                            style={styles.input}
                            placeholder="Descripción*"
                            multiline
                            numberOfLines={3}
                            value={formData.description}
                            onChangeText={text => handleFormChange('description', text)}
                        />
                        {formErrors.description && <Text style={enhancedStyles.errorText}>{formErrors.description}</Text>}

                        <Picker
                            style={styles.picker}
                            selectedValue={formData.categoryId}
                            onValueChange={value => handleFormChange('categoryId', value)}
                        >
                            {categories.map(category => (
                                <Picker.Item
                                    key={category.id}
                                    label={category.name}
                                    value={category.id}
                                />
                            ))}
                        </Picker>

                        <TextInput
                            style={styles.input}
                            placeholder="URL del video (YouTube)*"
                            value={formData.videoUrl}
                            onChangeText={text => handleFormChange('videoUrl', text)}
                        />
                        {formErrors.videoUrl && <Text style={enhancedStyles.errorText}>{formErrors.videoUrl}</Text>}

                        <TouchableOpacity
                            style={enhancedStyles.previewButton}
                            onPress={previewVideo}
                            disabled={!formData.videoUrl}
                        >
                            <Text style={enhancedStyles.previewButtonText}>
                                <Icon name="play" size={14} color="#fff" /> Previsualizar Video
                            </Text>
                        </TouchableOpacity>

                        {formData.type === 'VIDEO' && (
                            <>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Duración en minutos*"
                                    keyboardType="numeric"
                                    value={formData.duration.toString()}
                                    onChangeText={text => handleFormChange('duration', parseInt(text) || 0)}
                                />
                                {formErrors.duration && <Text style={enhancedStyles.errorText}>{formErrors.duration}</Text>}
                            </>
                        )}

                        <View style={styles.switchContainer}>
                            <Text style={styles.switchLabel}>Contenido Premium:</Text>
                            <Switch
                                value={formData.isPremium}
                                onValueChange={value => handleFormChange('isPremium', value)}
                                thumbColor={formData.isPremium ? '#D4AF37' : '#f4f3f4'}
                                trackColor={{ false: '#767577', true: '#D4AF37' }}
                            />
                        </View>

                        <View style={styles.switchContainer}>
                            <Text style={styles.switchLabel}>Activo:</Text>
                            <Switch
                                value={formData.isActive}
                                onValueChange={value => handleFormChange('isActive', value)}
                                thumbColor={formData.isActive ? '#D4AF37' : '#f4f3f4'}
                                trackColor={{ false: '#767577', true: '#D4AF37' }}
                            />
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setModalVisible(false)}
                                disabled={isSubmitting}
                            >
                                <Text style={styles.modalButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.saveButton]}
                                onPress={handleSubmit}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.modalButtonText}>
                                        {isEditMode ? 'Actualizar' : 'Guardar'}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export { VideoManagement };
