import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1c1c1c',
        justifyContent: 'center',
    },
    content: {
        paddingHorizontal: 30,
    },
    icon: {
        alignSelf: 'center',
        marginBottom: 20,
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
        fontSize: 18,
        textAlign: 'center',
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
    // Estilos para el modal mejorado
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    modalContent: {
        width: '85%',
        padding: 25,
        borderRadius: 15,
        alignItems: 'center',
        position: 'relative',
    },
    successModal: {
        backgroundColor: '#1e1e1e',
        borderLeftWidth: 6,
        borderLeftColor: '#4CAF50',
    },
    errorModal: {
        backgroundColor: '#1e1e1e',
        borderLeftWidth: 6,
        borderLeftColor: '#F44336',
    },
    modalIcon: {
        marginBottom: 20,
    },
    modalText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 25,
        lineHeight: 24,
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        padding: 5,
    },
    modalButton: {
        width: '100%',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    modalSuccessButton: {
        backgroundColor: '#4CAF50',
    },
    modalErrorButton: {
        backgroundColor: '#F44336',
    },
    modalButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
