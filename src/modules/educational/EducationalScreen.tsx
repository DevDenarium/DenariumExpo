import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { styles } from './EducationalScreen.styles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../auth/AuthContext';
import { EducationalService } from '../../services/educational.service';
import {EducationalContent, EducationalCategory, ContentCategory} from './EducationalScreen.types';
import { ResizeMode, Video } from 'expo-av';

const EducationalScreen: React.FC = () => {
    const { user } = useAuth();
    const [categories, setCategories] = useState<ContentCategory[]>([]);
    const [contents, setContents] = useState<EducationalContent[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchCategories = async () => {
        try {
            const res = await EducationalService.fetchCategories();
            const convertedCategories: EducationalCategory[] = res.map(cat => ({
                id: cat.id,
                name: cat.name,
                icon: cat.icon || "help-circle", // Valor por defecto si es undefined
                color: cat.color || "#000000",
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
                isPremium: undefined // Mostrar todo el contenido, el servicio manejará el acceso
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
    }, []);

    const handleCategorySelect = (categoryId: string) => {
        setSelectedCategory(categoryId);
        fetchContents(categoryId);
    };

    const handleVideoView = async (contentId: string) => {
        try {
            await EducationalService.recordContentView(contentId);
        } catch (error) {
            console.error('Error recording view:', error);
        }
    };

    const renderVideo = (item: EducationalContent) => {
        return (
            <View key={item.id} style={styles.card}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>
                <Video
                    source={{ uri: item.videoUrl || '' }}
                    rate={1.0}
                    volume={1.0}
                    isMuted={false}
                    resizeMode={ResizeMode.CONTAIN}
                    shouldPlay={false}
                    useNativeControls
                    style={styles.video}
                    onLoad={() => handleVideoView(item.id)}
                />
                {item.isPremium && !user?.isPremium && (
                    <Text style={styles.premiumLabel}>Solo para usuarios premium</Text>
                )}
            </View>
        );
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>Aprendizaje</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                {categories.map((category) => (
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

            {loading ? (
                <ActivityIndicator size="large" color="#D4AF37" />
            ) : contents.length === 0 ? (
                <Text style={styles.noContent}>No hay contenido disponible</Text>
            ) : (
                contents.map(renderVideo)
            )}
        </ScrollView>
    );
};

export default EducationalScreen;
