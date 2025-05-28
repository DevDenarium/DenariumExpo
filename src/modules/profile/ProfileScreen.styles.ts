import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1c1c1c',
        padding: 20,
    },
    profileHeader: {
        alignItems: 'center',
        marginBottom: 30,
    },
    profileImageContainer: {
        position: 'relative',
        marginBottom: 20,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    changePhotoButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#D4AF37',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    formContainer: {
        marginBottom: 20,
    },
    inputContainer: {
        marginBottom: 15,
    },
    label: {
        color: '#D4AF37',
        fontSize: 14,
        marginBottom: 5,
    },
    input: {
        backgroundColor: '#2a2a2a',
        borderRadius: 8,
        padding: 15,
        color: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#333333',
    },
    saveButton: {
        backgroundColor: '#D4AF37',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    saveButtonText: {
        color: '#000000',
        fontSize: 16,
        fontWeight: 'bold',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: '#FF5555',
        textAlign: 'center',
        marginBottom: 15,
    },
});
