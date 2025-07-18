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
    Image
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
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { AwsService } from '../../services/aws.service';
import { VideoCompressionService } from '../../services/video-compression.service';

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
                        
                        console.log(`Video seleccionado: ${sizeFormatted}`);
                        
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
                            
                            console.log(`Video seleccionado: ${sizeFormatted}`);
                            
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
                    console.warn('No se pudo obtener información del video:', error);
                    setVideoFileSize('Tamaño desconocido');
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

    // Función simple para generar thumbnail
    const generateThumbnail = async (uri: string) => {
        // Implementación básica - en producción usaría una librería específica
        return uri;
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

            console.log('Video uploaded successfully with key:', s3Key);
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
                isActive: undefined
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
            'Eliminar Videos de Prueba',
            '⚠️ ¿Estás seguro de que quieres eliminar TODOS los videos? Esta acción eliminará:\n\n• Todos los videos del tipo seleccionado\n• Los archivos de S3 asociados\n• Esta acción NO se puede deshacer\n\n¿Continuar?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel'
                },
                {
                    text: 'Eliminar Todo',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            let deletedCount = 0;
                            let errorCount = 0;

                            for (const content of contents) {
                                try {
                                    await EducationalService.deleteContent(content.id);
                                    
                                    // También eliminar el archivo de S3 si existe
                                    if (content.videoUrl && !content.videoUrl.includes('youtube') && !content.videoUrl.includes('youtu.be')) {
                                        try {
                                            const awsService = new AwsService();
                                            await awsService.deleteFile(content.videoUrl);
                                        } catch (deleteError) {
                                            console.warn('No se pudo eliminar el archivo de S3:', deleteError);
                                        }
                                    }
                                    
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
            `¿Estás seguro de que deseas eliminar "${content.title}"? Esta acción no se puede deshacer.`,
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
                            await EducationalService.deleteContent(content.id);
                            
                            // También eliminar el archivo de S3 si existe
                            if (content.videoUrl && !content.videoUrl.includes('youtube') && !content.videoUrl.includes('youtu.be')) {
                                try {
                                    const awsService = new AwsService();
                                    await awsService.deleteFile(content.videoUrl);
                                } catch (deleteError) {
                                    console.warn('No se pudo eliminar el archivo de S3:', deleteError);
                                }
                            }
                            
                            Alert.alert('Éxito', 'Contenido eliminado correctamente');
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

    // Renderizado del componente
    return (
        <View style={styles.container}>
            <Text style={styles.header}>Gestión de Contenido Educativo</Text>
            
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

            {/* Botón agregar */}
            <TouchableOpacity style={styles.addButton} onPress={handleAddContent}>
                <Icon name="plus" size={24} color="#1c1c1c" />
                <Text style={styles.addButtonText}>
                    Agregar {activeTab === 'videos' ? 'Video' : 'Historia'}
                </Text>
            </TouchableOpacity>

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
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <ScrollView>
                            {/* Título */}
                            <Text style={styles.modalTitle}>
                                {isEditMode ? 'Editar' : 'Agregar'} {activeTab === 'videos' ? 'Video' : 'Historia'}
                            </Text>

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

                            {/* Botones */}
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={() => setModalVisible(false)}
                                >
                                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                                    onPress={handleSubmit}
                                    disabled={isSubmitting}
                                >
                                    <Text style={styles.submitButtonText}>
                                        {isSubmitting ? 'Guardando...' : 'Guardar'}
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
