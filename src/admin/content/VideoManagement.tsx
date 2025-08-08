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
    Platform,
    Image,
    KeyboardAvoidingView,
    Dimensions
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
    CreateCategoryForm,
    UpdateCategoryForm,
} from './VideoManagement.types';

// Íconos disponibles para las categorías  
const availableIcons = [
    'cash', 'piggy-bank', 'chart-line', 'trending-up', 'credit-card',
    'bank', 'wallet', 'calculator', 'star', 'home', 'currency-usd', 'trophy'
];

// Colores predefinidos para las categorías
const presetColors = [
    '#D4AF37', '#FF5733', '#33FF57', '#3357FF', 
    '#FF33F5', '#33FFF5', '#F5FF33', '#FF8C33', 
    '#8C33FF', '#33FF8C', '#FF3333', '#3333FF', 
    '#33FFFF', '#FFFF33', '#FF33CC', '#000000'
];
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { AwsService } from '../../services/aws.service';
import { VideoCompressionService } from '../../services/video-compression.service';
import * as VideoThumbnails from 'expo-video-thumbnails';

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
        duration: 0,
        isPremium: false,
        freeViewDuration: 2, // Default: 2 minutos para usuarios free
        isActive: true,
    });
    const [videoUri, setVideoUri] = useState<string | null>(null);
    const [thumbnailUri, setThumbnailUri] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [compressionProgress, setCompressionProgress] = useState(0);
    const [isCompressing, setIsCompressing] = useState(false);
    const [videoFileSize, setVideoFileSize] = useState<string>('');
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Estados para gestión de categorías
    const [categoriesModalVisible, setCategoriesModalVisible] = useState<boolean>(false);
    const [categoryFormModalVisible, setCategoryFormModalVisible] = useState<boolean>(false);
    const [isCategoryEditMode, setIsCategoryEditMode] = useState<boolean>(false);
    const [currentCategory, setCurrentCategory] = useState<ContentCategory | null>(null);
    const [categoryFormData, setCategoryFormData] = useState<CreateCategoryForm>({
        name: '',
        description: '',
        icon: 'video',
        color: '#D4AF37',
    });
    const [categoryFormErrors, setCategoryFormErrors] = useState<Record<string, string>>({});
    const [isCategorySubmitting, setIsCategorySubmitting] = useState(false);

    // Función para obtener la duración de un video
    const getVideoDuration = (videoUri: string): Promise<number> => {
        return new Promise((resolve) => {
            if (Platform.OS === 'web') {
                const video = (globalThis as any).document.createElement('video');
                video.preload = 'metadata';
                
                video.onloadedmetadata = () => {
                    // Convertir duración de segundos a minutos y redondear
                    const durationInMinutes = Math.round(video.duration / 60);
                    resolve(durationInMinutes);
                };
                
                video.onerror = () => {
                    resolve(0);
                };
                
                video.src = videoUri;
            } else {
                // En móvil, usar la información del ImagePicker result si está disponible
                // Por ahora resolver con 0 y el usuario puede editarlo manualmente
                resolve(0);
            }
        });
    };

    // Función para seleccionar video
    const pickVideo = async () => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Videos,
                allowsEditing: true,
                aspect: activeTab === 'videos' ? [16, 9] : [9, 16],
                quality: 1,
            });

            if (!result.canceled) {
                const videoUri = result.assets[0].uri;
                setVideoUri(videoUri);
                
                // Obtener información del archivo de manera compatible con web
                try {
                    if (Platform.OS === 'web') {
                        // En web, usar fetch para obtener el tamaño
                        const response = await fetch(videoUri);
                        const blob = await response.blob();
                        const sizeFormatted = VideoCompressionService.formatFileSize(blob.size);
                        setVideoFileSize(sizeFormatted);
                        
                        // Mostrar advertencia si el archivo es muy grande
                        if (blob.size > 30 * 1024 * 1024) { // 30MB
                            Alert.alert(
                                'Archivo Grande',
                                `El video seleccionado tiene un tamaño de ${sizeFormatted}. Se aplicará compresión automática durante la subida.`,
                                [{ text: 'Entendido' }]
                            );
                        }
                    } else {
                        // En móvil, usar FileSystem
                        const fileInfo = await FileSystem.getInfoAsync(videoUri);
                        if (fileInfo.exists && 'size' in fileInfo) {
                            const sizeFormatted = VideoCompressionService.formatFileSize(fileInfo.size);
                            setVideoFileSize(sizeFormatted);
                            
                            // Mostrar advertencia si el archivo es muy grande
                            if (fileInfo.size > 30 * 1024 * 1024) { // 30MB
                                Alert.alert(
                                    'Archivo Grande',
                                    `El video seleccionado tiene un tamaño de ${sizeFormatted}. Se aplicará compresión automática durante la subida.`,
                                    [{ text: 'Entendido' }]
                                );
                            }
                        } else {
                            setVideoFileSize('Tamaño desconocido');
                        }
                    }
                } catch (error) {
                    setVideoFileSize('Tamaño desconocido');
                }
                
                // Obtener duración del video automáticamente
                try {
                    const duration = await getVideoDuration(videoUri);
                    if (duration > 0) {
                        handleFormChange('duration', duration);
                    }
                } catch (error) {
                    // Silenciar error de duración, no es crítico
                }
                
                // Generar thumbnail
                const thumbnail = await generateThumbnail(videoUri);
                setThumbnailUri(thumbnail);
                handleFormChange('videoUrl', 'uploading'); // Marcador temporal
            }
        } catch (error) {
            console.error('Error seleccionando video:', error);
            Alert.alert('Error', 'No se pudo seleccionar el video');
        }
    };

    // Función para generar thumbnail del video
    const generateThumbnail = async (uri: string) => {
        try {
            console.log('Generando miniatura para:', uri);
            const { uri: thumbnailUri } = await VideoThumbnails.getThumbnailAsync(uri, {
                time: 0, // Tomar el primer frame
                quality: 1.0, // Máxima calidad
            });
            console.log('Miniatura generada:', thumbnailUri);
            return thumbnailUri;
        } catch (e) {
            console.error('Error generando miniatura:', e);
            return null;
        }
    };

    // Función para validar formulario
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

        if (!formData.categoryId) {
            errors.categoryId = 'La categoría es requerida';
        }

        if (!videoUri && !isEditMode) {
            errors.video = 'Debe seleccionar un video';
        }

        if (formData.duration < 1 || formData.duration > 7200) {
            errors.duration = 'La duración debe ser entre 1 y 120 minutos';
        }

        // Validar freeViewDuration solo si es premium
        if (formData.isPremium) {
            if (!formData.freeViewDuration || formData.freeViewDuration < 0) {
                errors.freeViewDuration = 'El tiempo de vista gratuita es requerido';
            } else if (formData.freeViewDuration >= formData.duration) {
                errors.freeViewDuration = 'El tiempo gratuito debe ser menor a la duración total';
            }
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Función para subir video
    const uploadVideo = async (uri: string) => {
        try {
            setUploadProgress(0);
            setIsCompressing(false);
            setCompressionProgress(0);

            const awsService = new AwsService();
            const s3Key = await awsService.uploadFile(uri, (progress: number) => {
                setUploadProgress(progress);
            });

            return s3Key;
        } catch (error) {
            setIsCompressing(false);
            setCompressionProgress(0);
            setUploadProgress(0);
            console.error('Error uploading video:', error);
            
            // Manejo específico de errores
            let errorMessage = 'No se pudo subir el video';
            
            if (error instanceof Error) {
                if (error.message.includes('demasiado grande')) {
                    errorMessage = 'El video es demasiado grande. El tamaño máximo permitido es 30MB.';
                } else if (error.message.includes('413') || error.message.includes('Payload Too Large')) {
                    errorMessage = 'El archivo es muy grande para el servidor. Seleccione un video más pequeño.';
                } else if (error.message.includes('timeout')) {
                    errorMessage = 'La subida del video tomó demasiado tiempo. Verifique su conexión a internet.';
                } else if (error.message.includes('network')) {
                    errorMessage = 'Error de conexión. Verifique su conexión a internet e intente nuevamente.';
                } else {
                    errorMessage = error.message;
                }
            }
            
            Alert.alert('Error de Subida', errorMessage);
            throw error;
        }
    };

    // Función para obtener contenidos
    const fetchContents = async () => {
        try {
            setLoading(true);
            const response = await EducationalService.fetchContents({
                type: activeTab === 'videos' ? 'VIDEO' : 'STORY',
                // Eliminar filtro isActive para mostrar todos los videos en el panel de admin
            });
            setContents(response);
        } catch (error) {
            console.error('Error fetching contents:', error);
            Alert.alert('Error', 'No se pudo cargar el contenido');
        } finally {
            setLoading(false);
        }
    };

    // Función para obtener categorías
    const fetchCategories = async () => {
        try {
            const response = await EducationalService.fetchCategories(false); // false = mostrar todas (activas e inactivas)
            setCategories(response);
            if (response.length > 0 && !formData.categoryId) {
                setFormData(prev => ({ ...prev, categoryId: response[0].id }));
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            Alert.alert('Error', 'No se pudieron cargar las categorías');
        }
    };

    // Efectos
    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchContents();
    }, [activeTab]);

    // Función para cambiar tab
    const handleTabChange = (tab: 'videos' | 'stories') => {
        setActiveTab(tab);
    };

    // Función para agregar contenido
    const handleAddContent = () => {
        setFormData({
            title: '',
            description: '',
            type: activeTab === 'videos' ? 'VIDEO' : 'STORY',
            categoryId: categories.length > 0 ? categories[0].id : '',
            videoUrl: '',
            duration: 0,
            isPremium: false,
            freeViewDuration: 2, // Default: 2 minutos
            isActive: true,
        });
        setVideoUri(null);
        setThumbnailUri(null);
        setUploadProgress(0);
        setFormErrors({});
        setIsEditMode(false);
        setCurrentContent(null);
        setModalVisible(true);
    };

    // Función para cambiar campos del formulario
    const handleFormChange = (field: keyof CreateContentForm, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (formErrors[field]) {
            setFormErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    // Función para eliminar todos los videos de prueba
    const handleDeleteAllTestVideos = async () => {
        Alert.alert(
            'Eliminar TODOS los Videos',
            '⚠️ ¿Estás seguro de que quieres eliminar PERMANENTEMENTE TODOS los videos?\n\nEsta acción eliminará:\n• Todos los videos del tipo seleccionado\n• Los archivos de S3 asociados\n• Los registros de la base de datos\n• Esta acción NO se puede deshacer\n\n¿Continuar?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel'
                },
                {
                    text: 'Eliminar Todo Permanentemente',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            let deletedCount = 0;
                            let errorCount = 0;

                            for (const content of contents) {
                                try {
                                    await EducationalService.deleteContent(content.id);
                                    deletedCount++;
                                } catch (error) {
                                    console.error('Error eliminando contenido:', content.id, error);
                                    errorCount++;
                                }
                            }

                            Alert.alert(
                                'Limpieza Completada',
                                `✅ Videos eliminados: ${deletedCount}\n${errorCount > 0 ? `❌ Errores: ${errorCount}` : '🎉 Todos los videos fueron eliminados exitosamente'}`
                            );
                            
                            fetchContents();
                        } catch (error) {
                            console.error('Error en limpieza masiva:', error);
                            Alert.alert('Error', 'Hubo un problema durante la limpieza');
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    // Función para eliminar contenido
    const handleDeleteContent = async (content: EducationalContent) => {
        Alert.alert(
            'Confirmar Eliminación',
            `¿Estás seguro de que deseas eliminar PERMANENTEMENTE "${content.title}"?\n\n⚠️ Esta acción:\n• Eliminará el video de la base de datos\n• Eliminará el archivo de S3\n• NO se puede deshacer\n• El video ya no estará disponible para NINGÚN usuario`,
            [
                {
                    text: 'Cancelar',
                    style: 'cancel'
                },
                {
                    text: 'Eliminar Permanentemente',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await EducationalService.deleteContent(content.id);
                            
                            Alert.alert('Éxito', 'Contenido eliminado permanentemente');
                            fetchContents();
                        } catch (error) {
                            console.error('Error deleting content:', error);
                            Alert.alert('Error', 'No se pudo eliminar el contenido');
                        }
                    }
                }
            ]
        );
    };

    // Función para editar contenido
    const handleEditContent = (content: EducationalContent) => {
        setFormData({
            title: content.title,
            description: content.description,
            type: content.type,
            categoryId: content.categoryId,
            videoUrl: content.videoUrl || '',
            duration: content.duration || 0,
            isPremium: content.isPremium,
            freeViewDuration: content.freeViewDuration || 2,
            isActive: content.isActive,
        });
        setVideoUri(null);
        setThumbnailUri(null);
        setUploadProgress(0);
        setFormErrors({});
        setIsEditMode(true);
        setCurrentContent(content);
        setModalVisible(true);
    };

    // Función para enviar formulario
    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            let videoUrl = formData.videoUrl;

            // Si hay un video nuevo, subirlo
            if (videoUri && videoUrl === 'uploading') {
                videoUrl = await uploadVideo(videoUri);
            }

            const contentData = {
                ...formData,
                videoUrl,
            };

            if (isEditMode && currentContent) {
                await EducationalService.updateContent(currentContent.id, contentData);
                Alert.alert('Éxito', 'Contenido actualizado correctamente');
            } else {
                await EducationalService.createContent(contentData);
                Alert.alert('Éxito', 'Contenido creado correctamente');
            }

            setModalVisible(false);
            fetchContents();
        } catch (error) {
            console.error('Error submitting form:', error);
            Alert.alert('Error', 'No se pudo guardar el contenido');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Funciones para gestión de categorías
    const handleOpenCategoriesModal = () => {
        setCategoriesModalVisible(true);
    };

    const handleAddCategory = () => {
        setCategoryFormData({
            name: '',
            description: '',
            icon: 'video',
            color: '#D4AF37',
        });
        setCategoryFormErrors({});
        setIsCategoryEditMode(false);
        setCurrentCategory(null);
        
        // Cerrar el modal de categorías y abrir el formulario inmediatamente
        setCategoriesModalVisible(false);
        setCategoryFormModalVisible(true);
    };

    const handleEditCategory = (category: ContentCategory) => {
        setCategoryFormData({
            name: category.name,
            description: category.description || '',
            icon: category.icon || 'video',
            color: category.color || '#D4AF37',
        });
        setCategoryFormErrors({});
        setIsCategoryEditMode(true);
        setCurrentCategory(category);
        
        // Cerrar el modal de categorías primero y luego abrir el formulario
        setCategoriesModalVisible(false);
        setTimeout(() => {
            setCategoryFormModalVisible(true);
        }, 300);
    };

    const handleCategoryFormChange = (field: keyof CreateCategoryForm, value: any) => {
        setCategoryFormData(prev => ({ ...prev, [field]: value }));
        
        // Limpiar errores del campo que se está editando
        if (categoryFormErrors[field]) {
            setCategoryFormErrors(prev => ({ ...prev, [field]: '' }));
        }

        // Validación en tiempo real para nombres duplicados
        if (field === 'name' && value.trim()) {
            const existingCategory = categories.find(cat => 
                cat.name.toLowerCase() === value.toLowerCase() &&
                (!isCategoryEditMode || cat.id !== currentCategory?.id)
            );
            if (existingCategory) {
                setCategoryFormErrors(prev => ({ 
                    ...prev, 
                    name: `Ya existe una categoría llamada "${existingCategory.name}"` 
                }));
            }
        }
    };

    const validateCategoryForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!categoryFormData.name.trim()) {
            errors.name = 'El nombre es requerido';
        } else if (categoryFormData.name.length > 50) {
            errors.name = 'El nombre no puede exceder 50 caracteres';
        } else {
            // Verificar si ya existe una categoría con el mismo nombre
            const existingCategory = categories.find(cat => 
                cat.name.toLowerCase() === categoryFormData.name.toLowerCase() &&
                (!isCategoryEditMode || cat.id !== currentCategory?.id)
            );
            if (existingCategory) {
                errors.name = `Ya existe una categoría llamada "${existingCategory.name}"`;
            }
        }

        if (categoryFormData.description && categoryFormData.description.length > 200) {
            errors.description = 'La descripción no puede exceder 200 caracteres';
        }

        if (!categoryFormData.icon.trim()) {
            errors.icon = 'El ícono es requerido';
        }

        if (!categoryFormData.color.trim()) {
            errors.color = 'El color es requerido';
        }

        setCategoryFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmitCategory = async () => {
        if (!validateCategoryForm()) return;

        setIsCategorySubmitting(true);
        try {
            console.log('🚀 Enviando datos de categoría:', categoryFormData);
            
            if (isCategoryEditMode && currentCategory) {
                await EducationalService.updateCategory(currentCategory.id, categoryFormData);
                Alert.alert('Éxito', 'Categoría actualizada correctamente');
            } else {
                const result = await EducationalService.createCategory(categoryFormData);
                console.log('✅ Categoría creada exitosamente:', result);
                Alert.alert('Éxito', 'Categoría creada correctamente');
            }

            setCategoryFormModalVisible(false);
            fetchCategories();
            
            // Regresar al modal de gestionar categorías después de un breve delay
            setTimeout(() => {
                setCategoriesModalVisible(true);
            }, 300);
        } catch (error) {
            console.error('❌ Error submitting category:', error);
            
            // Mejor manejo de errores
            let errorMessage = 'No se pudo guardar la categoría';
            if (error instanceof Error) {
                if (error.message.includes('Ya existe una categoría')) {
                    errorMessage = error.message;
                } else {
                    errorMessage = error.message;
                }
            } else if (typeof error === 'object' && error !== null && 'response' in error) {
                const axiosError = error as any;
                if (axiosError.response?.data?.message) {
                    if (axiosError.response.data.message.includes('Ya existe una categoría')) {
                        errorMessage = axiosError.response.data.message;
                    } else {
                        errorMessage = axiosError.response.data.message;
                    }
                } else if (axiosError.response?.status) {
                    errorMessage = `Error del servidor (${axiosError.response.status})`;
                }
            }
            
            Alert.alert('Error', errorMessage);
        } finally {
            setIsCategorySubmitting(false);
        }
    };

    const handleDeleteCategory = async (category: ContentCategory) => {
        Alert.alert(
            'Confirmar Eliminación',
            `¿Estás seguro de que deseas eliminar la categoría "${category.name}"?\n\n⚠️ Esta acción:\n• Eliminará la categoría permanentemente\n• NO se puede deshacer\n• Solo se puede eliminar si no tiene videos asociados`,
            [
                {
                    text: 'Cancelar',
                    style: 'cancel'
                },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await EducationalService.deleteCategory(category.id);
                            Alert.alert('Éxito', 'Categoría eliminada correctamente');
                            fetchCategories();
                        } catch (error) {
                            console.error('Error deleting category:', error);
                            const errorMessage = error instanceof Error ? error.message : 'No se pudo eliminar la categoría';
                            Alert.alert('Error', errorMessage);
                        }
                    }
                }
            ]
        );
    };

    // Renderizado del componente
    return (
        <View style={styles.container}>
            <Text style={styles.header}>Administrar Videos</Text>
            
            {/* Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'videos' && styles.activeTab]}
                    onPress={() => handleTabChange('videos')}
                >
                    <Text style={[styles.tabText, activeTab === 'videos' && styles.activeTabText]}>
                        Videos
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

            {/* Botones de acción */}
            <View style={styles.actionButtonsContainer}>
                <TouchableOpacity style={styles.addButton} onPress={handleAddContent}>
                    <Icon name="plus" size={24} color="#D4AF37" />
                    <Text style={styles.addButtonText}>
                        Agregar {activeTab === 'videos' ? 'Video' : 'Historia'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.categoriesButton} 
                    onPress={handleOpenCategoriesModal}
                    activeOpacity={0.7}
                >
                    <Icon name="folder-cog" size={24} color="#D4AF37" />
                    <Text style={styles.categoriesButtonText}>
                        Gestionar Categorías
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Lista de contenido */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#D4AF37" />
                    <Text style={styles.loadingText}>Cargando contenido...</Text>
                </View>
            ) : (
                <ScrollView style={styles.contentList}>
                    {contents.map((content) => (
                        <View key={content.id} style={styles.videoCard}>
                            {/* Header del video con título y acciones */}
                            <View style={styles.videoHeader}>
                                <View style={styles.videoTitleContainer}>
                                    <Text style={styles.videoTitle}>{content.title}</Text>
                                    <Text style={styles.videoSubtitle}>{content.description}</Text>
                                </View>
                                <View style={styles.videoActions}>
                                    <TouchableOpacity
                                        style={styles.videoActionButton}
                                        onPress={() => handleEditContent(content)}
                                    >
                                        <Icon name="pencil" size={18} color="#D4AF37" />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.videoActionButton, styles.deleteActionButton]}
                                        onPress={() => handleDeleteContent(content)}
                                    >
                                        <Icon name="delete" size={18} color="#ff4444" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Información del video */}
                            <View style={styles.videoInfo}>
                                <View style={styles.videoMetrics}>
                                    <View style={styles.metricItem}>
                                        <Icon name="video" size={16} color="#D4AF37" />
                                        <Text style={styles.metricText}>
                                            {content.type === 'VIDEO' ? 'Video' : 'Historia'}
                                        </Text>
                                    </View>
                                    <View style={styles.metricItem}>
                                        <Icon name="clock-outline" size={16} color="#D4AF37" />
                                        <Text style={styles.metricText}>{content.duration} min</Text>
                                    </View>
                                    <View style={styles.metricItem}>
                                        <Icon 
                                            name={content.isPremium ? "crown" : "gift-outline"} 
                                            size={16} 
                                            color={content.isPremium ? "#FFD700" : "#4CAF50"} 
                                        />
                                        <Text style={[
                                            styles.metricText,
                                            content.isPremium ? styles.premiumText : styles.freeText
                                        ]}>
                                            {content.isPremium ? 'Premium' : 'Gratuito'}
                                        </Text>
                                    </View>
                                </View>
                                
                                {/* Estado del video */}
                                <View style={styles.statusContainer}>
                                    <View style={[
                                        styles.statusBadge,
                                        content.isActive ? styles.activeStatus : styles.inactiveStatus
                                    ]}>
                                        <Icon 
                                            name={content.isActive ? "check-circle" : "pause-circle"} 
                                            size={14} 
                                            color={content.isActive ? "#ffffff" : "#ffffff"} 
                                        />
                                        <Text style={styles.statusText}>
                                            {content.isActive ? 'Activo' : 'Inactivo'}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {/* Separador sutil */}
                            <View style={styles.videoSeparator} />
                        </View>
                    ))}
                    {contents.length === 0 && (
                        <View style={styles.emptyContainer}>
                            <Icon name="video-off" size={60} color="#666" />
                            <Text style={styles.emptyText}>
                                No hay {activeTab === 'videos' ? 'videos' : 'historias'} disponibles
                            </Text>
                            <Text style={styles.emptySubtext}>
                                Agrega tu primer contenido usando el botón de arriba
                            </Text>
                        </View>
                    )}
                </ScrollView>
            )}

            {/* Modal para formulario */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.fullScreenModalOverlay}>
                    <View style={styles.fullScreenModalContainer}>
                        {/* Header del Modal con X para cerrar */}
                        <View style={styles.editModalHeader}>
                            <Text style={styles.editModalTitle}>
                                {isEditMode ? 'Editar' : 'Agregar'} {activeTab === 'videos' ? 'Video' : 'Historia'}
                            </Text>
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                                style={styles.editModalCloseButton}
                            >
                                <Icon name="close" size={24} color="#D4AF37" />
                            </TouchableOpacity>
                        </View>
                        
                        <KeyboardAvoidingView 
                            style={styles.keyboardAvoidingContainer}
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
                        >
                            <ScrollView 
                                style={styles.modalScrollView}
                                showsVerticalScrollIndicator={true}
                                keyboardShouldPersistTaps="handled"
                                contentContainerStyle={styles.scrollContentContainer}
                            >
                                {/* Campo título */}
                                <Text style={styles.label}>Título *</Text>
                                <TextInput
                                    style={[styles.input, formErrors.title && styles.inputError]}
                                    value={formData.title}
                                    onChangeText={(value) => handleFormChange('title', value)}
                                    placeholder="Título del contenido"
                                    placeholderTextColor="#666"
                                />
                                {formErrors.title && <Text style={styles.errorText}>{formErrors.title}</Text>}

                                {/* Campo descripción */}
                                <Text style={styles.label}>Descripción *</Text>
                                <TextInput
                                    style={[styles.textArea, formErrors.description && styles.inputError]}
                                    value={formData.description}
                                    onChangeText={(value) => handleFormChange('description', value)}
                                    placeholder="Descripción del contenido"
                                    placeholderTextColor="#666"
                                    multiline
                                    numberOfLines={4}
                                />
                                {formErrors.description && <Text style={styles.errorText}>{formErrors.description}</Text>}

                                {/* Selección de categoría */}
                                <Text style={styles.label}>Categoría *</Text>
                                <View style={styles.pickerContainer}>
                                    <Picker
                                        selectedValue={formData.categoryId}
                                        onValueChange={(value) => handleFormChange('categoryId', value)}
                                        style={styles.picker}
                                        dropdownIconColor="#D4AF37"
                                    >
                                        {categories.map((category) => (
                                            <Picker.Item
                                                key={category.id}
                                                label={category.name}
                                                value={category.id}
                                                color="#ffffff"
                                            />
                                        ))}
                                    </Picker>
                                </View>
                                {formErrors.categoryId && <Text style={styles.errorText}>{formErrors.categoryId}</Text>}

                                {/* Campo duración */}
                                <Text style={styles.label}>Duración (minutos) *</Text>
                                <TextInput
                                    style={[styles.input, formErrors.duration && styles.inputError]}
                                    value={formData.duration.toString()}
                                    onChangeText={(value) => handleFormChange('duration', parseInt(value) || 0)}
                                    placeholder="Duración en minutos"
                                    placeholderTextColor="#666"
                                    keyboardType="numeric"
                                />
                                {formErrors.duration && <Text style={styles.errorText}>{formErrors.duration}</Text>}

                                {/* Switch Premium */}
                                <View style={styles.switchContainerNew}>
                                    <Text style={styles.label}>Contenido Premium</Text>
                                    <Switch
                                        value={formData.isPremium}
                                        onValueChange={(value) => handleFormChange('isPremium', value)}
                                        trackColor={{ false: '#767577', true: '#D4AF37' }}
                                        thumbColor={formData.isPremium ? '#1c1c1c' : '#f4f3f4'}
                                    />
                                </View>

                                {/* Campo condicional: Tiempo de vista gratuita (solo si es Premium) */}
                                {formData.isPremium && (
                                    <>
                                        <Text style={styles.label}>Tiempo de Vista Gratuita (minutos) *</Text>
                                        <TextInput
                                            style={[styles.input, formErrors.freeViewDuration && styles.inputError]}
                                            value={formData.freeViewDuration?.toString() || ''}
                                            onChangeText={(value) => handleFormChange('freeViewDuration', parseInt(value) || 0)}
                                            placeholder="Ej: 2 (minutos que usuarios free pueden ver)"
                                            placeholderTextColor="#666"
                                            keyboardType="numeric"
                                        />
                                        {formErrors.freeViewDuration && <Text style={styles.errorText}>{formErrors.freeViewDuration}</Text>}
                                        <Text style={styles.videoInfoText}>
                                            Los usuarios gratuitos podrán ver {formData.freeViewDuration || 0} minuto(s) de este video premium.
                                        </Text>
                                    </>
                                )}

                                {/* Switch Activo */}
                                <View style={styles.switchContainerNew}>
                                    <Text style={styles.label}>Activo</Text>
                                    <Switch
                                        value={formData.isActive}
                                        onValueChange={(value) => handleFormChange('isActive', value)}
                                        trackColor={{ false: '#767577', true: '#D4AF37' }}
                                        thumbColor={formData.isActive ? '#1c1c1c' : '#f4f3f4'}
                                    />
                                </View>

                                {/* Selección de video */}
                                <Text style={styles.label}>Video *</Text>
                                <TouchableOpacity style={styles.videoButton} onPress={pickVideo}>
                                    <Icon name="video-plus" size={24} color="#D4AF37" />
                                    <Text style={styles.videoButtonText}>
                                        {videoUri ? 'Cambiar Video' : 'Seleccionar Video'}
                                    </Text>
                                </TouchableOpacity>
                                {formErrors.video && <Text style={styles.errorText}>{formErrors.video}</Text>}

                                {/* Información del archivo de video */}
                                {videoFileSize && (
                                    <Text style={styles.videoInfoText}>
                                        Tamaño del archivo: {videoFileSize}
                                    </Text>
                                )}

                                {/* Progress de compresión */}
                                {isCompressing && (
                                    <View style={styles.progressContainer}>
                                        <Text style={styles.progressText}>
                                            Comprimiendo video: {Math.round(compressionProgress)}%
                                        </Text>
                                        <View style={styles.progressBar}>
                                            <View
                                                style={[styles.progressBarFill, { width: `${compressionProgress}%` }]}
                                            />
                                        </View>
                                    </View>
                                )}

                                {/* Progress de subida */}
                                {uploadProgress > 0 && uploadProgress < 100 && !isCompressing && (
                                    <View style={styles.progressContainer}>
                                        <Text style={styles.progressText}>
                                            Subiendo: {Math.round(uploadProgress)}%
                                        </Text>
                                        <View style={styles.progressBar}>
                                            <View
                                                style={[styles.progressBarFill, { width: `${uploadProgress}%` }]}
                                            />
                                        </View>
                                    </View>
                                )}
                            </ScrollView>

                            {/* Botones - Fijos en la parte inferior */}
                            <View style={styles.modalButtonContainer}>
                                <TouchableOpacity
                                    style={styles.modalCancelButton}
                                    onPress={() => setModalVisible(false)}
                                >
                                    <Text style={styles.modalCancelButtonText}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalSubmitButton, isSubmitting && styles.modalSubmitButtonDisabled]}
                                    onPress={handleSubmit}
                                    disabled={isSubmitting}
                                >
                                    <Text style={styles.modalSubmitButtonText}>
                                        {isSubmitting ? 'Guardando...' : 'Guardar'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </KeyboardAvoidingView>
                    </View>
                </View>
            </Modal>

            {/* Modal para gestionar categorías */}
            <Modal
                visible={categoriesModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setCategoriesModalVisible(false)}
            >
                <View style={styles.fullScreenModalOverlay}>
                    <View style={styles.fullScreenModalContainer}>
                        <View style={styles.editModalHeader}>
                            <Text style={styles.editModalTitle}>Gestionar Categorías</Text>
                            <TouchableOpacity
                                onPress={() => setCategoriesModalVisible(false)}
                                style={styles.editModalCloseButton}
                            >
                                <Icon name="close" size={24} color="#D4AF37" />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity 
                            style={styles.newCategoryButton} 
                            onPress={handleAddCategory}
                            activeOpacity={0.7}
                        >
                            <Icon name="plus" size={20} color="#D4AF37" />
                            <Text style={styles.newCategoryButtonText}>Nueva Categoría</Text>
                        </TouchableOpacity>

                        <ScrollView style={styles.modalScrollView}>
                            {categories.map((category) => (
                                <View key={category.id} style={styles.categoryCard}>
                                    <View style={styles.categoryHeader}>
                                        <View style={styles.categoryInfo}>
                                            <View style={styles.categoryIconContainer}>
                                                <Icon
                                                    name={category.icon || 'video'}
                                                    size={24}
                                                    color={category.color || '#D4AF37'}
                                                />
                                            </View>
                                            <View style={styles.categoryDetails}>
                                                <Text style={styles.categoryName}>
                                                    {category.name}
                                                </Text>
                                                {category.description && (
                                                    <Text style={styles.categoryDescription}>
                                                        {category.description}
                                                    </Text>
                                                )}
                                            </View>
                                        </View>
                                        <View style={styles.categoryActions}>
                                            <TouchableOpacity
                                                style={styles.categoryActionButton}
                                                onPress={() => handleEditCategory(category)}
                                            >
                                                <Icon name="pencil" size={18} color="#D4AF37" />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[styles.categoryActionButton, styles.deleteCategoryActionButton]}
                                                onPress={() => handleDeleteCategory(category)}
                                            >
                                                <Icon name="delete" size={18} color="#ff4444" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                    <View style={[
                                        styles.categoryStatusBadge,
                                        category.isActive ? styles.activeStatus : styles.inactiveStatus
                                    ]}>
                                        <Text style={styles.statusText}>
                                            {category.isActive ? 'Activa' : 'Inactiva'}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                            {categories.length === 0 && (
                                <View style={styles.emptyContainer}>
                                    <Icon name="folder-outline" size={60} color="#666" />
                                    <Text style={styles.emptyText}>No hay categorías disponibles</Text>
                                    <Text style={styles.emptySubtext}>
                                        Crea tu primera categoría usando el botón de arriba
                                    </Text>
                                </View>
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Modal para formulario de categoría */}
            <Modal
                visible={categoryFormModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setCategoryFormModalVisible(false)}
            >
                <View style={styles.fullScreenModalOverlay}>
                    <View style={styles.fullScreenModalContainer}>
                        <View style={styles.editModalHeader}>
                            <Text style={styles.editModalTitle}>
                                {isCategoryEditMode ? 'Editar' : 'Nueva'} Categoría
                            </Text>
                            <TouchableOpacity
                                onPress={() => setCategoryFormModalVisible(false)}
                                style={styles.editModalCloseButton}
                            >
                                <Icon name="close" size={24} color="#D4AF37" />
                            </TouchableOpacity>
                        </View>

                    <ScrollView style={{ flex: 1, paddingTop: 20 }}>
                        {/* Nombre */}
                        <Text style={styles.label}>Nombre *</Text>
                        <TextInput
                            style={[styles.input, categoryFormErrors.name && styles.inputError]}
                            value={categoryFormData.name}
                            onChangeText={(value) => handleCategoryFormChange('name', value)}
                            placeholder="Nombre de la categoría"
                            placeholderTextColor="#666"
                        />
                        {categoryFormErrors.name && (
                            <Text style={styles.errorText}>{categoryFormErrors.name}</Text>
                        )}

                        {/* Descripción */}
                        <Text style={styles.label}>Descripción</Text>
                        <TextInput
                            style={[styles.textArea, categoryFormErrors.description && styles.inputError]}
                            value={categoryFormData.description}
                            onChangeText={(value) => handleCategoryFormChange('description', value)}
                            placeholder="Descripción de la categoría (opcional)"
                            placeholderTextColor="#666"
                            multiline
                            numberOfLines={3}
                        />
                        {categoryFormErrors.description && (
                            <Text style={styles.errorText}>{categoryFormErrors.description}</Text>
                        )}

                        {/* Ícono */}
                        <Text style={styles.label}>Ícono *</Text>
                        <View style={styles.iconPickerContainer}>
                            {availableIcons.map((iconName) => (
                                <TouchableOpacity
                                    key={iconName}
                                    style={[
                                        styles.iconOption,
                                        categoryFormData.icon === iconName && styles.selectedIconOption
                                    ]}
                                    onPress={() => handleCategoryFormChange('icon', iconName)}
                                >
                                    <Icon
                                        name={iconName}
                                        size={18}
                                        color={categoryFormData.icon === iconName ? '#1c1c1c' : '#D4AF37'}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>
                        {categoryFormErrors.icon && (
                            <Text style={styles.errorText}>{categoryFormErrors.icon}</Text>
                        )}

                        {/* Color */}
                        <Text style={styles.label}>Color *</Text>
                        <View style={styles.colorGrid}>
                            {presetColors.map((color) => (
                                <TouchableOpacity
                                    key={color}
                                    style={[
                                        styles.colorOption,
                                        { backgroundColor: color },
                                        categoryFormData.color === color && styles.selectedColorOption
                                    ]}
                                    onPress={() => {
                                        setCategoryFormData({
                                            ...categoryFormData,
                                            color: color
                                        });
                                    }}
                                >
                                    {categoryFormData.color === color && (
                                        <Icon name="check" size={16} color="#fff" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                        {categoryFormErrors.color && (
                            <Text style={styles.errorText}>{categoryFormErrors.color}</Text>
                        )}

                        {/* Vista previa */}
                        <Text style={styles.label}>Vista Previa</Text>
                        <View style={styles.categoryPreview}>
                            <View style={styles.categoryIconContainer}>
                                <Icon
                                    name={categoryFormData.icon}
                                    size={24}
                                    color={categoryFormData.color}
                                />
                            </View>
                            <View style={styles.categoryDetails}>
                                <Text style={styles.categoryName}>
                                    {categoryFormData.name || 'Nombre de la categoría'}
                                </Text>
                                {categoryFormData.description && (
                                    <Text style={styles.categoryDescription}>
                                        {categoryFormData.description}
                                    </Text>
                                )}
                            </View>
                        </View>

                        {/* Botones al final del scroll */}
                        <View style={styles.modalButtonContainer}>
                            <TouchableOpacity
                                style={styles.modalCancelButton}
                                onPress={() => setCategoryFormModalVisible(false)}
                            >
                                <Text style={styles.modalCancelButtonText}>
                                    Cancelar
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.modalSubmitButton,
                                    isCategorySubmitting && styles.modalSubmitButtonDisabled
                                ]}
                                onPress={handleSubmitCategory}
                                disabled={isCategorySubmitting}
                            >
                                <Text style={styles.modalSubmitButtonText}>
                                    {isCategorySubmitting ? 'Guardando...' : 'Guardar'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </View>
            </Modal>
        </View>
    );
};

export { VideoManagement };
