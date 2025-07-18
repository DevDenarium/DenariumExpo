import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { EducationalService } from '../services/educational.service';
import { EducationalContent } from '../modules/educational/EducationalScreen.types';

export const StoryDebugger: React.FC = () => {
    const [stories, setStories] = useState<EducationalContent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStories = async () => {
            try {
                setLoading(true);
                
                // Obtener solo historias
                const response = await EducationalService.fetchContents({
                    type: 'STORY',
                    isActive: true
                });
                
                console.log('Story Debug - Raw response:', response);
                setStories(response);
                
            } catch (err) {
                console.error('Story Debug - Error:', err);
                setError(err instanceof Error ? err.message : 'Error desconocido');
            } finally {
                setLoading(false);
            }
        };

        fetchStories();
    }, []);

    if (loading) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Depurador de Historias</Text>
                <Text style={styles.text}>Cargando historias...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Depurador de Historias</Text>
                <Text style={styles.error}>Error: {error}</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Depurador de Historias</Text>
            <Text style={styles.count}>Total de historias encontradas: {stories.length}</Text>
            
            {stories.length === 0 ? (
                <Text style={styles.text}>No se encontraron historias</Text>
            ) : (
                stories.map((story, index) => (
                    <View key={story.id} style={styles.storyCard}>
                        <Text style={styles.storyTitle}>#{index + 1} - {story.title}</Text>
                        <Text style={styles.storyDetail}>ID: {story.id}</Text>
                        <Text style={styles.storyDetail}>Tipo: {story.type}</Text>
                        <Text style={styles.storyDetail}>Premium: {story.isPremium ? 'Sí' : 'No'}</Text>
                        <Text style={styles.storyDetail}>Activo: {story.isActive ? 'Sí' : 'No'}</Text>
                        <Text style={styles.storyDetail}>URL: {story.videoUrl || 'Sin URL'}</Text>
                        <Text style={styles.storyDetail}>Categoría: {story.categoryId}</Text>
                    </View>
                ))
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#1c1c1c',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#D4AF37',
        marginBottom: 20,
    },
    count: {
        fontSize: 16,
        color: '#FFF',
        marginBottom: 20,
    },
    text: {
        color: '#FFF',
        fontSize: 14,
    },
    error: {
        color: '#E74C3C',
        fontSize: 14,
    },
    storyCard: {
        backgroundColor: '#2a2a2a',
        padding: 15,
        marginBottom: 10,
        borderRadius: 8,
    },
    storyTitle: {
        color: '#D4AF37',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    storyDetail: {
        color: '#CCC',
        fontSize: 12,
        marginBottom: 3,
    },
});

export default StoryDebugger;
