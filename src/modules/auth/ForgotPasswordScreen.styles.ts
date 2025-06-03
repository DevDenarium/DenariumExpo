import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1c1c1c',
        justifyContent: 'flex-start',
        paddingTop: 50,
    },
    content: {
        paddingHorizontal: 30,
    },
    icon: {
        alignSelf: 'center',
        marginBottom: 10,
        marginTop: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        color: '#D4AF37',
        textAlign: 'center',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#aaa',
        textAlign: 'center',
        marginBottom: 30,
    },
    emailText: {
        fontWeight: 'bold',
        color: '#D4AF37',
    },
    input: {
        height: 50,
        borderColor: '#D4AF37',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 15,
        color: '#fff',
        fontSize: 16,
        marginBottom: 20,
        backgroundColor: 'rgba(212, 175, 55, 0.1)',
    },
    button: {
        backgroundColor: '#D4AF37',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 15,
    },
    disabledButton: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '600',
    },
    errorText: {
        color: '#FF5555',
        textAlign: 'center',
        marginBottom: 18,
        fontSize: 14,
        backgroundColor: 'rgba(255, 85, 85, 0.12)',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 85, 85, 0.25)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    codeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    codeInput: {
        width: 45,
        height: 50,
        borderColor: '#D4AF37',
        borderWidth: 1,
        borderRadius: 8,
        color: '#fff',
        fontSize: 24,
        textAlign: 'center',
        backgroundColor: 'rgba(212, 175, 55, 0.1)',
    },
    resendButton: {
        alignItems: 'center',
    },
    disabledResendButton: {
        opacity: 0.5,
    },
    resendText: {
        color: '#D4AF37',
        fontSize: 14,
    },
});
