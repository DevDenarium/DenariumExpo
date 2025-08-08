import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    scrollViewContainer: {
        backgroundColor: '#1c1c1c',
    },
    container: {
        flexGrow: 1,
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
    inputText: {
        color: '#FFFFFF',
    },
    placeholderText: {
        color: '#666666',
    },
    countryInput: {
        backgroundColor: '#2a2a2a',
        borderRadius: 8,
        padding: 15,
        borderWidth: 1,
        borderColor: '#333333',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
    // Estilos para el modal de confirmación
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    modalContainer: {
        width: '80%',
        backgroundColor: '#2a2a2a',
        borderRadius: 10,
        padding: 20,
        borderWidth: 1,
        borderColor: '#D4AF37',
    },
    modalTitle: {
        color: '#D4AF37',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    modalText: {
        color: '#FFFFFF',
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
    },
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    modalButton: {
        flex: 1,
        padding: 12,
        borderRadius: 6,
        marginHorizontal: 5,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#555555',
    },
    confirmButton: {
        backgroundColor: '#D4AF37',
    },
    modalButtonText: {
        color: '#000000',
        fontWeight: 'bold',
    },
    // Estilos para el selector de países
    countryModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    countryModalContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#2a2a2a',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        maxHeight: '60%',
        padding: 15,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        backgroundColor: '#333333',
        borderRadius: 8,
        paddingHorizontal: 10,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        height: 40,
        color: '#FFFFFF',
    },
    countryList: {
        maxHeight: '80%',
    },
    countryItem: {
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#333333',
    },
    countryItemText: {
        color: '#FFFFFF',
        fontSize: 16,
    },
    // Estilos para los modales de provincia, cantón y distrito
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#333333',
    },
    modalHeaderText: {
        color: '#D4AF37',
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalCloseButton: {
        padding: 5,
    },
});
