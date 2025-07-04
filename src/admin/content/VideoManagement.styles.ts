import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    // Contenedores principales
    container: {
        flex: 1,
        backgroundColor: '#1c1c1c',
        padding: 16,
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
        marginBottom: 20,
        color: '#D4AF37',
    },

    // Pestañas
    tabsContainer: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    tab: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#2a2a2a',
        marginRight: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    activeTab: {
        backgroundColor: '#D4AF37',
    },
    tabText: {
        fontSize: 14,
        color: '#ffffff',
    },
    activeTabText: {
        color: '#1c1c1c',
    },

    // Lista de contenido
    contentList: {
        flex: 1,
    },

    // Tarjetas de contenido
    contentCard: {
        backgroundColor: '#2a2a2a',
        borderRadius: 10,
        padding: 16,
        marginBottom: 16,
    },
    contentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
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
    },
    contentMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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

    // Botones de acción
    contentActions: {
        flexDirection: 'row',
        marginTop: 10,
    },
    actionButton: {
        padding: 8,
        borderRadius: 4,
        marginRight: 10,
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
    },

    // Botón de agregar
    addButton: {
        backgroundColor: '#D4AF37',
        padding: 12,
        borderRadius: 20,
        alignItems: 'center',
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    addButtonText: {
        color: '#1c1c1c',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },

    // Checkboxes
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    checkboxLabel: {
        marginLeft: 8,
        fontSize: 16,
        color: '#ffffff',
    },

    // Modal
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.89)',
    },
    modalContent: {
        backgroundColor: '#2a2a2a',
        borderRadius: 10,
        padding: 20,
        marginHorizontal: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#D4AF37',
    },
    input: {
        borderWidth: 1,
        borderColor: '#1c1c1c',
        borderRadius: 4,
        padding: 12,
        marginBottom: 15,
        fontSize: 16,
        color: '#ffffff',
        backgroundColor: '#1c1c1c',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
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
    },

    // Estados
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 18,
        color: '#999',
        textAlign: 'center',
        marginTop: 20,
    },
});
