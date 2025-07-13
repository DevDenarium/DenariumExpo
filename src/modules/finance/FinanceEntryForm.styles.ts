import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    formContainer: {
        backgroundColor: '#2a2a2a',
        borderRadius: 10,
        padding: 20,
        marginHorizontal: 0.5,
        marginBottom: 15,
        flex: 1,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#333333',
    },
    closeButton: {
        padding: 5,
        marginTop: 0,
    },
    typeSelector: {
        flexDirection: 'row',
        marginBottom: 20,
        justifyContent: 'space-between',
    },
    typeButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#333333',
        marginHorizontal: 5,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    typeButtonActive: {
        backgroundColor: '#D4AF37',
    },
    typeButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        marginLeft: 8,
    },
    typeButtonTextActive: {
        color: '#000000',
    },
    typeIcon: {
        marginRight: 5,
    },
    inputGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#333333',
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 15,
        width: '100%',
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        paddingVertical: 15,
        color: '#FFFFFF',
        fontSize: 16,
        minWidth: '90%',
    },
    label: {
        color: '#D4AF37',
        marginBottom: 8,
        fontSize: 14,
    },
    dropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#333333',
        borderRadius: 5,
        padding: 15,
        marginBottom: 15,
    },
    dropdownText: {
        color: '#FFFFFF',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalPickerContainer: {
        backgroundColor: '#2a2a2a',
        borderRadius: 10,
        width: '80%',
        maxHeight: '60%',
        borderWidth: 1,
        borderColor: '#333333',
    },
    pickerScrollView: {
        padding: 10,
    },
    pickerItem: {
        paddingVertical: 12,
        paddingHorizontal: 15,
        flexDirection: 'row',
        alignItems: 'center',
    },
    pickerItemText: {
        color: '#FFFFFF',
        marginLeft: 10,
    },
    categoryIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tagsInputContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        backgroundColor: '#333333',
        borderRadius: 5,
        padding: 10,
        minHeight: 50,
        alignItems: 'center',
    },
    selectedTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#D4AF37',
        borderRadius: 15,
        paddingVertical: 5,
        paddingHorizontal: 10,
        marginRight: 8,
        marginBottom: 8,
    },
    selectedTagText: {
        color: '#000000',
        marginRight: 5,
    },
    addTagButton: {
        width: 30,
        height: 30,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#D4AF37',
        justifyContent: 'center',
        alignItems: 'center',
    },
    tagColor: {
        width: 16,
        height: 16,
        borderRadius: 8,
        marginRight: 8,
    },
    dateInputContainer: {
        width: '100%',
        marginBottom: 15,
        marginTop: 0,
    },
    dateInput: {
        backgroundColor: '#333333',
        borderRadius: 5,
        padding: 15,
        marginBottom: 15,
        color: '#FFFFFF',
        width: '100%',
    },
    datePickerContainer: {
        position: 'relative',
        zIndex: 2,
        width: '100%',
    },
    dateInputContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    datePickerWrapper: {
        position: 'absolute',
        top: 60,
        left: 0,
        right: 0,
        zIndex: 100,
        backgroundColor: '#2a2a2a',
        borderRadius: 10,
        elevation: 5,
    },
    datePickerButton: {
        backgroundColor: '#D4AF37',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 15,
    },
    datePickerButtonText: {
        color: '#000000',
        fontWeight: 'bold',
    },
    modalContainer: {
        backgroundColor: '#2a2a2a',
        borderRadius: 10,
        padding: 20,
        width: '80%',
    },
    modalTitle: {
        color: '#D4AF37',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
        textAlign: 'center',
        marginTop: 10,
        padding: 10,
    },
    modalButtonContainer: {
        flexDirection: 'row',
        marginTop: 20,
        justifyContent: 'space-between',
        gap: 10,
    },
    modalButton: {
        borderRadius: 5,
        padding: 10,
        width: '48%',
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#333333',
    },
    confirmButton: {
        backgroundColor: '#D4AF37',
    },
    modalButtonText: {
        fontWeight: 'bold',
        color: '#000',
    },
    tabContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#333333',
        marginBottom: 10,
    },
    tabButton: {
        flex: 1,
        padding: 12,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#D4AF37',
    },
    tabText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    colorPickerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    colorPreview: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginLeft: 10,
        borderWidth: 1,
        borderColor: '#FFFFFF',
    },
    colorPickerModal: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    colorPickerDoneButton: {
        backgroundColor: '#D4AF37',
        padding: 10,
        borderRadius: 5,
        marginTop: 15,
        alignSelf: 'center',
    },
    colorPickerDoneButtonText: {
        color: '#000000',
        fontWeight: 'bold',
    },
    scrollContainer: {
        flexGrow: 1,
        paddingVertical: 15,
        paddingHorizontal: 15,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        gap: 10,
    },
    actionButton: {
        flex: 1,
        borderRadius: 6,
        paddingVertical: 10,
        paddingHorizontal: 12,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 40,
    },
    buttonText: {
        fontWeight: 'bold',
        color: '#000',
    },
    cancelButtonText: {
        color: '#D4AF37',
        fontWeight: 'bold',
    },
    customFormContainer: {
        backgroundColor: '#2a2a2a',
        borderRadius: 10,
        margin: 20,
        padding: 20,
        flex: 1,
    },
    submitButton: {
        backgroundColor: '#D4AF37',
        borderRadius: 6,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    colorHexText: {
        color: '#FFFFFF',
        marginLeft: 10,
        fontSize: 14,
    },
    inputContainer: {
        marginBottom: 15,

    },
    inputContainerModal: {
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#D4AF37'
    },
    inputVisible: {
        color: '#FFFFFF',  // Texto blanco
        fontSize: 16,
        paddingVertical: 12,
        backgroundColor: 'transparent'
    },
    pickerItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        borderBottomWidth: 1,  // Mover el borde aquí
        borderBottomColor: '#333333',  // Color del borde
    },
    tagOptionsButton: {
        padding: 10,
        marginLeft: 10,
    },
});


export default styles;
