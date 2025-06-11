import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F0F0F',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    successText: {
        color: '#4CAF50',
        fontSize: 22,
        marginTop: 20,
        marginBottom: 10,
        fontFamily: 'Poppins-SemiBold',
        textAlign: 'center',
    },
    welcomeText: {
        color: '#D4AF37',
        fontSize: 18,
        marginVertical: 10,
        fontFamily: 'Poppins-Bold',
        textAlign: 'center',
    },
    sessionText: {
        color: '#AAAAAA',
        fontSize: 14,
        marginBottom: 30,
        fontFamily: 'Poppins-Regular',
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#D4AF37',
        padding: 15,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        color: '#000000',
        fontSize: 16,
        fontFamily: 'Poppins-Bold',
    },
    testModeText: {
        color: '#D4AF37',
        fontSize: 14,
        marginTop: 10,
        fontFamily: 'Poppins-Italic',
        textAlign: 'center',
    },
    detailsContainer: {
        backgroundColor: '#1A1A1A',
        padding: 15,
        borderRadius: 8,
        width: '100%',
        marginVertical: 15,
    },
    detailText: {
        color: '#FFFFFF',
        fontSize: 16,
        marginVertical: 5,
        fontFamily: 'Poppins-Regular',
    },
});
