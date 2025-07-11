// EducationalScreen.tsx
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
import YoutubePlayerWrapper from '../../admin/content/YoutubePlayerWrapper';
import StoryItem from '../../admin/content/StoryItem';

const VideoItem = ({ item }: { item: EducationalContent }) => {
    const [error, setError] = useState<string | null>(null);
    const [hasAccess, setHasAccess] = useState<boolean>(false);

    useEffect(() => {
        const checkAccess = async () => {
            try {
                await EducationalService.checkContentAccess(item.id);
                setHasAccess(true);
            } catch (err) {
                setHasAccess(false);
                setError('No tienes acceso a este contenido premium');
            }
        };
        checkAccess();
    }, [item.id]);

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
            {item.videoUrl ? (
                <YoutubePlayerWrapper url={item.videoUrl} />
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
                isPremium: user?.isPremium ? undefined : false
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

    const openStoryModal = (story: EducationalContent) => {
        setSelectedStory(story);
        setStoryModalVisible(true);
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
                                onPress={() => openStoryModal(story)}
                            />
                        ))}
                    </ScrollView>
                </View>
            )}

            <Modal
                visible={isStoryModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={closeStoryModal}
                statusBarTranslucent={true}
            >
                <View style={styles.fullscreenModal}>
                    {selectedStory?.videoUrl ? (
                        <YoutubePlayerWrapper
                            url={selectedStory.videoUrl}
                            autoplay={true}
                            fullscreen={true}
                            controls={false}
                        />
                    ) : (
                        <View style={styles.storyModalPlaceholder}>
                            <Text style={styles.modalPlaceholderText}>Contenido no disponible</Text>
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
