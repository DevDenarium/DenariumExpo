import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    // Main container styles
    container: {
        flex: 1,
        backgroundColor: '#1c1c1c',
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1c1c1c',
    },

    // Header styles
    header: {
        fontSize: 24,
        fontWeight: '600',
        marginBottom: 24,
        color: '#D4AF37',
        textAlign: 'left',
    },

    // Tab styles (updated existing)
    tab: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeTab: {
        backgroundColor: '#D4AF37',
        shadowColor: '#D4AF37',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    tabText: {
        fontSize: 16,
        color: '#b0b0b0',
        fontWeight: '600',
    },
    activeTabText: {
        color: '#1c1c1c',
        fontWeight: '700',
    },

    // Content card styles
    contentCard: {
        backgroundColor: '#2a2a2a',
        borderRadius: 10,
        padding: 16,
        marginBottom: 16,
    },
    contentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        flexWrap: 'wrap',
    },
    contentTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#D4AF37',
        flex: 1,
    },
    contentDescription: {
        fontSize: 14,
        color: '#999',
        marginBottom: 10,
        lineHeight: 20,
    },
    contentMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
    },
    contentCategory: {
        backgroundColor: '#1c1c1c',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        fontSize: 12,
        color: '#D4AF37',
    },
    contentDuration: {
        fontSize: 12,
        color: '#999',
    },
    contentActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 15,
    },

    // Badge styles
    premiumBadge: {
        backgroundColor: '#D4AF37',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 4,
        marginLeft: 8,
    },
    premiumBadgeText: {
        color: '#1c1c1c',
        fontSize: 10,
        fontWeight: 'bold',
    },
    inactiveBadge: {
        backgroundColor: '#e74c3c',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 4,
        marginLeft: 8,
    },
    inactiveBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },

    // Button styles
    actionButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 4,
        marginLeft: 10,
    },
    editButton: {
        backgroundColor: '#D4AF37',
    },
    deleteButton: {
        backgroundColor: '#e74c3c',
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
    addButton: {
        backgroundColor: '#1c1c1c',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 20,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        width: '48%',
        minHeight: 48,
        borderWidth: 2,
        borderColor: '#D4AF37',
        shadowColor: '#D4AF37',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    addButtonText: {
        color: '#D4AF37',
        fontSize: 16,
        fontWeight: '700',
        marginLeft: 8,
        letterSpacing: 0.3,
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginBottom: 24,
        paddingHorizontal: 4,
        minHeight: 56,
    },
    categoriesButton: {
        backgroundColor: '#1c1c1c',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 20,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        width: '48%',
        borderWidth: 2,
        borderColor: '#D4AF37',
        minHeight: 48,
        zIndex: 1,
        shadowColor: '#D4AF37',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    categoriesButtonText: {
        color: '#D4AF37',
        fontSize: 16,
        fontWeight: '700',
        marginLeft: 8,
        letterSpacing: 0.3,
    },
    newCategoryButton: {
        backgroundColor: '#1c1c1c',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 20,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
        borderWidth: 2,
        borderColor: '#D4AF37',
        shadowColor: '#D4AF37',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    newCategoryButtonText: {
        color: '#D4AF37',
        fontSize: 16,
        fontWeight: '700',
        marginLeft: 8,
        letterSpacing: 0.3,
    },

    // Category management styles
    categoryCard: {
        backgroundColor: '#2a2a2a',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#333',
    },
    categoryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    categoryInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    categoryIconContainer: {
        width: 40,
        height: 40,
        backgroundColor: '#1c1c1c',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    categoryDetails: {
        flex: 1,
    },
    categoryName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 4,
    },
    categoryDescription: {
        fontSize: 14,
        color: '#999',
        lineHeight: 18,
    },
    categoryActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    categoryActionButton: {
        padding: 8,
        marginLeft: 8,
        borderRadius: 6,
        backgroundColor: '#1c1c1c',
    },
    deleteCategoryActionButton: {
        backgroundColor: '#2a1f1f',
    },
    categoryStatusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },

    // Category form styles
    iconPickerContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 16,
        justifyContent: 'space-between',
    },
    iconOption: {
        width: '15.5%',
        aspectRatio: 1,
        backgroundColor: '#2a2a2a',
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
        marginBottom: 8,
    },
    selectedIconOption: {
        backgroundColor: '#D4AF37',
        borderColor: '#D4AF37',
    },
    colorPickerContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 16,
    },
    colorGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 16,
        justifyContent: 'flex-start',
    },
    colorOption: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: 'transparent',
    },
    selectedColorOption: {
        borderColor: '#fff',
    },
    colorPickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2a2a2a',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#333',
        marginBottom: 16,
        gap: 12,
    },
    colorPreviewSmall: {
        width: 30,
        height: 30,
        borderRadius: 15,
        borderWidth: 2,
        borderColor: '#fff',
    },
    colorPickerButtonText: {
        flex: 1,
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
    categoryPreview: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2a2a2a',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    createCategoriesButton: {
        backgroundColor: '#2a2a2a',
        padding: 12,
        borderRadius: 8,
        marginBottom: 20,
    },
    createCategoriesButtonText: {
        color: '#D4AF37',
        textAlign: 'center',
        fontWeight: '500',
    },

    // Video preview styles
    videoPreviewContainer: {
        marginVertical: 10,
        borderRadius: 8,
        overflow: 'hidden',
    },
    videoThumbnail: {
        width: '100%',
        aspectRatio: 16/9,
    },
    s3VideoIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#1c1c1c',
        borderRadius: 8,
        justifyContent: 'center',
    },
    s3VideoText: {
        marginLeft: 10,
        color: '#D4AF37',
        fontSize: 14,
    },

    // Modal styles
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.8)',
        paddingTop: 50, // Espacio para el status bar
    },
    modalContent: {
        backgroundColor: '#2a2a2a',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '90%',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
    },
    // Nuevos estilos basados en FinanceScreen
    fullScreenModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'flex-end',
        paddingTop: '25%', // Comienza a un cuarto de la pantalla
    },
    fullScreenModalContainer: {
        backgroundColor: '#1c1c1c',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '75%', // Ocupa máximo tres cuartos de la pantalla
        height: '75%',
        width: '100%',
    },
    editModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#333333',
    },
    editModalTitle: {
        color: '#D4AF37',
        fontSize: 18,
        fontWeight: 'bold',
    },
    editModalCloseButton: {
        padding: 5,
        marginLeft: 10,
    },
    keyboardAvoidingContainer: {
        flex: 1,
    },
    modalScrollView: {
        flex: 1,
        paddingBottom: 10,
    },
    scrollContentContainer: {
        paddingBottom: 20,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#D4AF37',
        paddingVertical: 5,
    },
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 15,
        paddingBottom: 20,
        borderTopWidth: 1,
        borderTopColor: '#3a3a3a',
        marginTop: 10,
    },
    modalCancelButton: {
        backgroundColor: '#e74c3c',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 8,
        flex: 1,
        marginRight: 10,
    },
    modalCancelButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    modalSubmitButton: {
        backgroundColor: '#D4AF37',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 8,
        flex: 1,
        marginLeft: 10,
    },
    modalSubmitButtonDisabled: {
        backgroundColor: '#666',
    },
    modalSubmitButtonText: {
        color: '#1c1c1c',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
    },
    modalButton: {
        flex: 1,
        padding: 12,
        borderRadius: 4,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    cancelButton: {
        backgroundColor: '#e74c3c',
    },
    saveButton: {
        backgroundColor: '#D4AF37',
    },
    modalButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },

    // Form styles
    input: {
        borderWidth: 1,
        borderColor: '#3a3a3a',
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
        fontSize: 16,
        color: '#ffffff',
        backgroundColor: '#2a2a2a',
    },
    picker: {
        backgroundColor: '#1c1c1c',
        color: '#ffffff',
        marginBottom: 15,
        borderRadius: 4,
    },
    videoUploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderWidth: 1,
        borderColor: '#D4AF37',
        borderRadius: 8,
        marginBottom: 15,
        justifyContent: 'center',
    },
    videoUploadButtonText: {
        marginLeft: 10,
        color: '#D4AF37',
        fontSize: 16,
    },
    thumbnailPreview: {
        width: '100%',
        aspectRatio: 16/9,
        borderRadius: 8,
        marginBottom: 15,
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 15,
        paddingHorizontal: 5,
    },
    switchLabel: {
        color: '#ffffff',
        fontSize: 16,
    },

    // Progress indicator styles
    progressContainer: {
        marginBottom: 15,
    },
    progressText: {
        color: '#D4AF37',
        marginBottom: 5,
        textAlign: 'center',
    },
    videoInfoText: {
        color: '#B0B0B0',
        fontSize: 12,
        textAlign: 'center',
        marginBottom: 10,
        fontStyle: 'italic',
    },
    progressBar: {
        height: 5,
        backgroundColor: '#1c1c1c',
        borderRadius: 5,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#D4AF37',
    },

    // Empty state styles
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 18,
        color: '#b0b0b0',
        textAlign: 'center',
        marginTop: 20,
        fontWeight: '600',
        letterSpacing: 0.3,
    },

    // Error styles
    errorText: {
        color: '#e74c3c',
        fontSize: 12,
        marginTop: -10,
        marginBottom: 10,
        paddingHorizontal: 5,
    },
    contentList: {
        flex: 1,
        marginTop: 8,
        marginBottom: 8,
        paddingHorizontal: 4,
    },

    // Missing styles for the new component
    tabContainer: {
        flexDirection: 'row',
        marginBottom: 24,
        backgroundColor: '#2a2a2a',
        borderRadius: 16,
        padding: 4,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 6,
    },
    loadingText: {
        color: '#D4AF37',
        marginTop: 10,
        fontSize: 16,
    },
    contentItem: {
        backgroundColor: '#2a2a2a',
        borderRadius: 10,
        padding: 16,
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        color: '#D4AF37',
        marginBottom: 8,
        fontWeight: '500',
        marginTop: 5,
    },
    inputError: {
        borderColor: '#e74c3c',
        borderWidth: 2,
    },
    textArea: {
        backgroundColor: '#2a2a2a',
        color: '#ffffff',
        padding: 15,
        borderRadius: 8,
        fontSize: 16,
        minHeight: 100,
        textAlignVertical: 'top',
        borderWidth: 1,
        borderColor: '#3a3a3a',
        marginBottom: 15,
    },
    videoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2a2a2a',
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
        justifyContent: 'center',
    },
    videoButtonText: {
        color: '#D4AF37',
        fontSize: 16,
        marginLeft: 10,
        fontWeight: '500',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    cancelButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '500',
    },
    submitButton: {
        backgroundColor: '#D4AF37',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        flex: 1,
        marginLeft: 10,
    },
    submitButtonDisabled: {
        backgroundColor: '#666',
    },
    submitButtonText: {
        color: '#1c1c1c',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    pickerContainer: {
        backgroundColor: '#2a2a2a',
        borderRadius: 8,
        marginBottom: 15,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#3a3a3a',
    },
    switchContainerNew: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        paddingVertical: 10,
    },

    // Additional content item styles
    contentInfo: {
        flex: 1,
        marginRight: 10,
    },
    contentDetails: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8,
        gap: 8,
    },
    contentType: {
        fontSize: 12,
        color: '#999',
        backgroundColor: '#2a2a2a',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 4,
    },
    contentStatus: {
        fontSize: 12,
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 4,
    },
    activeBadge: {
        backgroundColor: '#4CAF50',
        color: '#ffffff',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 20,
    },
    emptySubtext: {
        fontSize: 15,
        color: '#888',
        marginTop: 8,
        textAlign: 'center',
        lineHeight: 22,
        opacity: 0.8,
    },

    // New Video Card Design
    videoCard: {
        backgroundColor: '#2a2a2a',
        borderRadius: 16,
        marginBottom: 16,
        paddingVertical: 20,
        paddingHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    
    videoHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    
    videoTitleContainer: {
        flex: 1,
        marginRight: 16,
    },
    
    videoTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#D4AF37',
        marginBottom: 4,
        lineHeight: 24,
    },
    
    videoSubtitle: {
        fontSize: 14,
        color: '#b0b0b0',
        lineHeight: 20,
        opacity: 0.9,
    },
    
    videoActions: {
        flexDirection: 'row',
        gap: 8,
    },
    
    videoActionButton: {
        backgroundColor: '#3a3a3a',
        borderRadius: 12,
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    
    deleteActionButton: {
        backgroundColor: '#4a2c2c',
    },
    
    videoInfo: {
        marginTop: 4,
    },
    
    videoMetrics: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 12,
    },
    
    metricItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#3a3a3a',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        gap: 6,
    },
    
    metricText: {
        fontSize: 12,
        color: '#ffffff',
        fontWeight: '500',
    },
    
    premiumText: {
        color: '#FFD700',
        fontWeight: '600',
    },
    
    freeText: {
        color: '#4CAF50',
        fontWeight: '600',
    },
    
    statusContainer: {
        alignItems: 'flex-start',
    },
    
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    
    activeStatus: {
        backgroundColor: '#4CAF50',
    },
    
    inactiveStatus: {
        backgroundColor: '#f44336',
    },
    
    statusText: {
        fontSize: 12,
        color: '#ffffff',
        fontWeight: '600',
    },
    
    infoContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#1a3d2e',
        padding: 12,
        borderRadius: 8,
        marginTop: 8,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#4CAF50',
    },
    
    infoText: {
        flex: 1,
        color: '#4CAF50',
        fontSize: 12,
        marginLeft: 8,
        lineHeight: 16,
    },
    
    videoSeparator: {
        height: 1,
        backgroundColor: '#404040',
        marginTop: 16,
        opacity: 0.3,
    },
});
