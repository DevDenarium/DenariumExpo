import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
    // Contenedores principales
    container: {
        flex: 1,
        backgroundColor: '#1c1c1c',
    },
    contentContainer: {
        paddingBottom: 20,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },

    // Encabezado
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        padding: 20,
        color: '#D4AF37',
    },

    // Categorías
    categoryScroll: {
        flexGrow: 0,
        marginBottom: 16,
    },
    categoryContent: {
        paddingHorizontal: 15,
    },
    categoryButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#2a2a2a',
        marginRight: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    selectedCategory: {
        backgroundColor: '#D4AF37',
    },
    categoryText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#ffffff',
    },

    // Tarjetas de contenido
    card: {
        backgroundColor: '#1c1c1c',
        borderRadius: 10,
        padding: 15,
        marginHorizontal: 20,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 5,
        color: '#D4AF37',
    },
    description: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
    },
    video: {
        width: '100%',
        aspectRatio: 16 / 9,
        borderRadius: 8,
    },
    videoPlaceholder: {
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#2a2a2a',
        borderRadius: 8,
    },
    accessText: {
        marginTop: 10,
        color: '#D4AF37',
        fontWeight: '500',
    },
    errorText: {
        color: '#E74C3C',
        marginTop: 5,
        textAlign: 'center',
    },

    // Historias
    storiesContainer: {
        flexGrow: 0,
        marginBottom: 16,
        height: 180,
        paddingLeft: 10,
    },
    storiesContent: {
        paddingLeft: 20,
    },

    storyItem: {
        width: 100,
        height: 160,
        marginRight: 10,
        borderRadius: 10,
        overflow: 'hidden',
        position: 'relative',
    },
    storyCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 2,
        borderColor: '#D4AF37',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
        overflow: 'hidden',
    },
    storyImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    storyPlaceholder: {
        backgroundColor: '#EEE',
        justifyContent: 'center',
        alignItems: 'center',
    },
    storyTitle: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        color: '#FFF',
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: 5,
        fontSize: 12,
        textAlign: 'center',
    },
    storyPremiumBadge: {
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: 'rgba(0,0,0,0.7)',
        borderRadius: 10,
        padding: 2,
    },

    // Modal de historia
    storyModal: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.89)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    storyVideo: {
        width: '100%',
        height: '100%',
    },
    storyModalPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
    modalPlaceholderText: {
        color: '#FFF',
        fontSize: 18,
    },
    modalPlaceholderSubtext: {
        color: '#999',
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
    },
    loader: {
        marginVertical: 40,
    },
    noContent: {
        fontSize: 16,
        textAlign: 'center',
        color: '#999',
        marginTop: 15,
    },

    // Elementos adicionales
    premiumBadge: {
        backgroundColor: '#D4AF37',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        marginLeft: 10,
    },
    premiumBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
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
    fullscreenContainer: {
        flex: 1,
        backgroundColor: 'black',
        justifyContent: 'center',
    },
    fullscreenVideo: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    closeButton: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 20,
        right: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    fullscreenModal: {
        flex: 1,
        backgroundColor: 'black',
        justifyContent: 'center',
    },
});
