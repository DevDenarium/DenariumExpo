import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    scrollContainer: {
        flexGrow: 1,
        padding: 20,
    },
    header: {
        marginBottom: 25,
        alignItems: 'center',
    },
    backButton: {
        position: 'absolute',
        left: 0,
        top: 5,
        padding: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        color: '#333',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 18,
        color: '#666',
    },
    cardPreview: {
        backgroundColor: '#3A3A3A',
        borderRadius: 12,
        padding: 20,
        height: 180,
        justifyContent: 'space-between',
        marginBottom: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    cardNumberPreview: {
        color: '#FFF',
        fontSize: 22,
        letterSpacing: 2,
        textAlign: 'center',
        fontFamily: 'Courier',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    cardNamePreview: {
        color: '#FFF',
        fontSize: 14,
        textTransform: 'uppercase',
    },
    cardExpiryPreview: {
        color: '#FFF',
        fontSize: 14,
    },
    formContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        color: '#555',
        marginBottom: 8,
        marginTop: 15,
        fontWeight: '500',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 8,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: '#DDD',
    },
    input: {
        flex: 1,
        height: 50,
        fontSize: 16,
        color: '#333',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    halfInput: {
        width: '48%',
    },
    payButton: {
        backgroundColor: '#fdd600',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        shadowColor: '#fdd600',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    payButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '600',
    },
    testModeText: {
        color: '#FF9800',
        fontSize: 12,
        textAlign: 'center',
        marginTop: 15,
        fontStyle: 'italic',
    },
});
