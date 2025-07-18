import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Modal,
    Image,
    Platform
} from 'react-native';
import { styles } from './EducationalScreen.styles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../auth/AuthContext';
import { EducationalService } from '../../services/educational.service';
import {
    EducationalContent,
    EducationalCategory,
    ContentCategory
} from './EducationalScreen.types';
import StoryItem from '../../admin/content/StoryItem';
import { SimpleWebVideoPlayer } from '../../components/SimpleWebVideoPlayer';
import StoryViewer from '../../components/StoryViewer';
import SimpleStoryPlayer from '../../components/SimpleStoryPlayer';
const VideoItem = ({ item }: { item: EducationalContent }) => {
    const [error, setError] = useState<string | null>(null);
    const [hasAccess, setHasAccess] = useState<boolean>(false);
    const [videoUrl, setVideoUrl] = useState<string>('');

    useEffect(() => {
        console.log('ContentCard useEffect - item:', item.id, item.title, item.videoUrl);
        const checkAccess = async () => {
            try {
                await EducationalService.checkContentAccess(item.id);
                console.log('Access granted for content:', item.id);
                setHasAccess(true);
                
                // Obtener la URL firmada para S3
                if (item.videoUrl) {
                    console.log('Getting signed URL for:', item.videoUrl);
                    try {
                        const signedUrl = await EducationalService.getSignedUrl(item.videoUrl);
                        console.log('Signed URL obtained:', signedUrl);
                        setVideoUrl(signedUrl);
                    } catch (urlError) {
                        console.error('Error obteniendo URL firmada:', urlError);
                        setError('Error al cargar el video');
                        // Como fallback, intentar usar la URL original
                        console.log('Using original URL as fallback:', item.videoUrl);
                        setVideoUrl(item.videoUrl || '');
                    }
                }
            } catch (err) {
                console.log('Access denied for content:', item.id, err);
                setHasAccess(false);
                setError('No tienes acceso a este contenido premium');
            }
        };
        checkAccess();
    }, [item.id, item.videoUrl]);

    if (!hasAccess) {
        return (
            <View style={styles.card}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>
                <View style={styles.videoPlaceholder}>
                    <Icon name="lock" size={50} color="#D4AF37" />
                    <Text style={styles.accessText}>{error || 'Contenido premium - Actualiza tu plan'}</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
            {videoUrl ? (
                <SimpleWebVideoPlayer videoUrl={videoUrl} />
            ) : (
                <Text style={styles.errorText}>URL de video no disponible</Text>
            )}
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const EducationalScreen: React.FC = () => {
    const { user } = useAuth();
    const [categories, setCategories] = useState<ContentCategory[]>([]);
    const [contents, setContents] = useState<EducationalContent[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedStory, setSelectedStory] = useState<EducationalContent | null>(null);
    const [isStoryModalVisible, setStoryModalVisible] = useState<boolean>(false);
    
    // Estados para StoryViewer
    const [storyViewerVisible, setStoryViewerVisible] = useState<boolean>(false);
    const [processedStories, setProcessedStories] = useState<EducationalContent[]>([]);
    const [storyViewerIndex, setStoryViewerIndex] = useState<number>(0);
    
    // Estados para SimpleStoryPlayer (temporal para debugging)
    const [simplePlayerVisible, setSimplePlayerVisible] = useState<boolean>(false);
    const [currentStoryForPlayer, setCurrentStoryForPlayer] = useState<EducationalContent | null>(null);

    const fetchCategories = async () => {
        try {
            const res = await EducationalService.fetchCategories();
            const convertedCategories: EducationalCategory[] = res.map(cat => ({
                id: cat.id,
                name: cat.name,
                icon: cat.icon || 'help-circle',
                color: cat.color || '#000000'
            }));
            setCategories(convertedCategories);
        } catch (error) {
            Alert.alert('Error', 'No se pudieron cargar las categorías');
        }
    };

    const fetchContents = async (categoryId?: string) => {
        setLoading(true);
        try {
            const params = {
                categoryId,
                isActive: true,
                // Mostrar todos los videos (premium y gratuitos) para todos los usuarios
                // La lógica de restricción se manejará en el reproductor de video
            };
            const res = await EducationalService.fetchContents(params);
            setContents(res);
        } catch (error) {
            Alert.alert('Error', 'No se pudo cargar el contenido educativo');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
        fetchContents();
    }, [user?.isPremium]);

    const handleCategorySelect = (categoryId: string) => {
        setSelectedCategory(categoryId);
        fetchContents(categoryId);
    };

    const openStoryModal = async (story: EducationalContent) => {
        console.log('=== openStoryModal Debug ===');
        console.log('Opening story modal with processed item:', story);
        console.log('Story ID:', story.id);
        console.log('Story title:', story.title);
        console.log('Story videoUrl:', story.videoUrl);
        console.log('Story type:', story.type);
        
        try {
            // Obtener todas las historias
            const allStories = contents.filter(item => item.type === 'STORY');
            console.log('All stories found:', allStories.length);
            const storyIndex = allStories.findIndex(s => s.id === story.id);
            console.log('Story index:', storyIndex);
            
            if (storyIndex === -1) {
                console.log('Story not found in list, using fallback modal');
                // Fallback al modal tradicional
                setSelectedStory(story);
                setStoryModalVisible(true);
                return;
            }

            // Procesar todas las historias para verificar acceso y obtener URLs firmadas
            const processedStoriesData: EducationalContent[] = [];
            
            for (const storyItem of allStories) {
                try {
                    console.log(`Processing story: ${storyItem.title} (${storyItem.id})`);
                    console.log(`Original URL: ${storyItem.videoUrl}`);
                    
                    // Verificar acceso
                    await EducationalService.checkContentAccess(storyItem.id);
                    console.log(`Access granted for: ${storyItem.title}`);
                    
                    let finalVideoUrl = storyItem.videoUrl || '';
                    
                    // Obtener URL firmada para S3
                    if (storyItem.videoUrl) {
                        console.log(`Getting signed URL for S3 file: ${storyItem.videoUrl}`);
                        try {
                            const signedUrl = await EducationalService.getSignedUrl(storyItem.videoUrl);
                            console.log(`Signed URL obtained: ${signedUrl}`);
                            finalVideoUrl = signedUrl;
                        } catch (urlError) {
                            console.error('Error obteniendo URL firmada para historia:', urlError);
                            // Mantener la URL original como fallback
                            finalVideoUrl = storyItem.videoUrl || '';
                        }
                    }
                    
                    const processedStory = {
                        ...storyItem,
                        videoUrl: finalVideoUrl
                    };
                    console.log(`Final processed story URL: ${processedStory.videoUrl}`);
                    processedStoriesData.push(processedStory);
                } catch (accessError) {
                    console.log('Access denied for story:', storyItem.id, accessError);
                    // No incluir historias sin acceso
                }
            }
            
            console.log(`Total processed stories: ${processedStoriesData.length}`);
            
            if (processedStoriesData.length > 0) {
                // Encontrar el nuevo índice en la lista filtrada
                const newIndex = processedStoriesData.findIndex(s => s.id === story.id);
                console.log(`New index for selected story: ${newIndex}`);
                
                setProcessedStories(processedStoriesData);
                setStoryViewerIndex(Math.max(0, newIndex));
                
                // Usar SimpleStoryPlayer para debugging
                if (processedStoriesData[Math.max(0, newIndex)]) {
                    setCurrentStoryForPlayer(processedStoriesData[Math.max(0, newIndex)]);
                    setSimplePlayerVisible(true);
                } else {
                    setStoryViewerVisible(true);
                }
                
                console.log('Opening StoryViewer...');
            } else {
                console.log('No accessible stories found');
                Alert.alert('Error', 'No tienes acceso a ninguna historia');
            }
            
        } catch (error) {
            console.error('Error opening story:', error);
            // Fallback al modal tradicional
            setSelectedStory(story);
            setStoryModalVisible(true);
        }
        console.log('=== End openStoryModal Debug ===');
    };

    const closeStoryViewer = () => {
        setStoryViewerVisible(false);
        setProcessedStories([]);
        setStoryViewerIndex(0);
    };

    const closeSimplePlayer = () => {
        setSimplePlayerVisible(false);
        setCurrentStoryForPlayer(null);
    };

    const closeStoryModal = () => {
        setStoryModalVisible(false);
        setTimeout(() => {
            setSelectedStory(null);
        }, 300);
    };

    const stories = contents.filter(item => item.type === 'STORY');
    const videos = contents.filter(item => item.type === 'VIDEO');

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <Text style={styles.header}>Aprendizaje</Text>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryScroll}
                contentContainerStyle={styles.categoryContent}
            >
                {categories.map(category => (
                    <TouchableOpacity
                        key={category.id}
                        style={[
                            styles.categoryButton,
                            selectedCategory === category.id && styles.selectedCategory
                        ]}
                        onPress={() => handleCategorySelect(category.id)}
                    >
                        <Icon name={category.icon} size={20} color={category.color} />
                        <Text style={styles.categoryText}>{category.name}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {stories.length > 0 && (
                <View style={styles.storiesContainer}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingRight: 20 }}
                    >
                        {stories.map(story => (
                            <StoryItem
                                key={story.id}
                                item={story}
                                onPress={(processedStory) => openStoryModal(processedStory)}
                            />
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* SimpleStoryPlayer Modal (temporal para debugging) */}
            {simplePlayerVisible && currentStoryForPlayer && (
                <Modal
                    visible={simplePlayerVisible}
                    transparent={false}
                    animationType="slide"
                    onRequestClose={closeSimplePlayer}
                    statusBarTranslucent={true}
                >
                    <SimpleStoryPlayer
                        videoUrl={currentStoryForPlayer.videoUrl || ''}
                        title={currentStoryForPlayer.title}
                        onClose={closeSimplePlayer}
                    />
                </Modal>
            )}

            {/* StoryViewer Modal */}
            <StoryViewer
                stories={processedStories}
                initialIndex={storyViewerIndex}
                visible={storyViewerVisible}
                onClose={closeStoryViewer}
            />

            {/* Modal tradicional de historias (fallback) */}
            <Modal
                visible={isStoryModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={closeStoryModal}
                statusBarTranslucent={true}
            >
                <View style={styles.fullscreenModal}>
                    {selectedStory?.videoUrl ? (
                        <SimpleWebVideoPlayer 
                            videoUrl={selectedStory.videoUrl} 
                            height={600}
                            autoplay={true}
                            controls={false}
                        />
                    ) : (
                        <View style={styles.storyModalPlaceholder}>
                            <Icon name="video-off" size={50} color="#999" />
                            <Text style={styles.modalPlaceholderText}>Contenido no disponible</Text>
                            <Text style={styles.modalPlaceholderSubtext}>
                                No se pudo cargar el video de esta historia
                            </Text>
                        </View>
                    )}
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={closeStoryModal}
                    >
                        <Icon name="close" size={24} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </Modal>

            {loading ? (
                <ActivityIndicator size="large" color="#D4AF37" style={styles.loader} />
            ) : videos.length === 0 && stories.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Icon name="video-off" size={50} color="#D4AF37" />
                    <Text style={styles.noContent}>No hay contenido disponible</Text>
                </View>
            ) : (
                videos.map(video => (
                    <VideoItem key={video.id} item={video} />
                ))
            )}
        </ScrollView>
    );
};

export default EducationalScreen;
