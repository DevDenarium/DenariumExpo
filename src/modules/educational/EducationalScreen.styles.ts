import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff'
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#333'
    },
    categoryScroll: {
        flexGrow: 0,
        marginBottom: 16
    },
    categoryButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        backgroundColor: '#f2f2f2',
        marginRight: 8,
        flexDirection: 'row',
        alignItems: 'center'
    },
    selectedCategory: {
        backgroundColor: '#D4AF37'
    },
    categoryText: {
        marginLeft: 6,
        fontSize: 14,
        color: '#333'
    },
    card: {
        backgroundColor: '#fdfdfd',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111',
        marginBottom: 4
    },
    description: {
        fontSize: 14,
        color: '#555',
        marginBottom: 8
    },
    video: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        backgroundColor: '#000'
    },
    premiumLabel: {
        marginTop: 8,
        color: '#D9534F',
        fontWeight: 'bold',
        fontSize: 13
    },
    noContent: {
        fontSize: 16,
        textAlign: 'center',
        color: '#999',
        marginTop: 24
    }
});
