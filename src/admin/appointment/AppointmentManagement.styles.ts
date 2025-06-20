import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1c1c1c',
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        color: '#D4AF37', // Amarillo dorado como en AppointmentScreen
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingTop: 70,
    },
    emptyText: {
        color: '#AAAAAA',
        fontSize: 16,
        textAlign: 'center',
    },
    listContainer: {
        flex: 1,
    },
    appointmentCard: {
        backgroundColor: '#2a2a2a', // Gris oscuro como en AppointmentScreen
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    cardTitle: {
        color: '#D4AF37', // Amarillo dorado para el título de la cita
        fontSize: 18,
        fontWeight: '600',
        flex: 1,
        marginRight: 10,
    },
    cardStatus: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    cardBody: {
        marginBottom: 10,
    },
    cardDescription: {
        color: '#FFFFFF',
        fontSize: 14,
        marginBottom: 5,
    },
    cardDate: {
        color: '#AAAAAA',
        fontSize: 12,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 10,
    },
    actionButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginLeft: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    editButton: {
        backgroundColor: '#2196F3', // Azul para editar
    },
    deleteButton: {
        backgroundColor: '#F44336', // Rojo para eliminar
    },
    acceptButton: {
        backgroundColor: '#4CAF50', // Verde para aceptar
    },
    rejectButton: {
        backgroundColor: '#F44336', // Rojo para rechazar
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    modalContainer: {
        width: '90%',
        maxHeight: '80%',
        backgroundColor: '#2a2a2a', // Gris oscuro como el fondo de las cards
        borderRadius: 10,
        padding: 20,
    },
    modalTitle: {
        color: '#D4AF37', // Amarillo dorado para el título del modal
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    modalInput: {
        backgroundColor: '#333333', // Gris más oscuro para los inputs
        borderRadius: 5,
        padding: 15,
        color: '#FFFFFF',
        marginBottom: 15,
    },
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
    },
    modalButton: {
        flex: 1,
        padding: 12,
        borderRadius: 20,
        marginHorizontal: 5,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#555555', // Gris para cancelar
    },
    confirmButton: {
        backgroundColor: '#D4AF37', // Amarillo dorado para confirmar
    },
    disabledButton: {
        opacity: 0.5,
    },
    modalButtonText: {
        color: '#000000',
        fontWeight: 'bold',
    },
    statusPending: {
        backgroundColor: 'rgba(255, 193, 7, 0.2)',
    },
    statusConfirmed: {
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
    },
    statusCancelled: {
        backgroundColor: 'rgba(244, 67, 54, 0.2)',
    },
    statusRescheduled: {
        backgroundColor: 'rgba(33, 150, 243, 0.2)',
    },
    statusRejected: {
        backgroundColor: 'rgba(244, 67, 54, 0.2)',
    },
    statusCompleted: {
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
    },
    statusTextPending: {
        color: '#FFC107',
    },
    statusTextConfirmed: {
        color: '#4CAF50',
    },
    statusTextCancelled: {
        color: '#F44336',
    },
    statusTextRescheduled: {
        color: '#2196F3',
    },
    statusTextRejected: {
        color: '#F44336',
    },
    statusTextCompleted: {
        color: '#4CAF50',
    },
    datePickerContainer: {
        marginBottom: 15,
    },
    dateDisplayButton: {
        backgroundColor: '#333333',
        borderRadius: 5,
        padding: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dateDisplayText: {
        color: '#FFFFFF',
    },
    dateFilterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    filterButton: {
        flex: 1,
        marginHorizontal: 5,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#333333',
        alignItems: 'center',
    },
    activeFilter: {
        backgroundColor: '#D4AF37', // Amarillo dorado para filtro activo
    },
    filterButtonText: {
        color: '#FFFFFF',
        fontWeight: '500',
    },
    statusFilterContainer: {
        marginTop: 10,
    },
    statusFilterContent: {
        paddingHorizontal: 5,
    },
    statusFilterButton: {
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        backgroundColor: '#333333',
        marginRight: 10,
    },
    activeStatusFilter: {
        backgroundColor: '#D4AF37', // Amarillo dorado para filtro de estado activo
    },
    statusFilterButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    webDatePickerContainer: {
        marginBottom: 20,
        borderRadius: 5,
    },
    timeSlotsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    timeSlot: {
        width: '30%',
        padding: 10,
        marginBottom: 10,
        backgroundColor: '#333333',
        borderRadius: 5,
        alignItems: 'center',
    },
    selectedTimeSlot: {
        backgroundColor: '#D4AF37', // Amarillo dorado para slot seleccionado
    },
    timeSlotText: {
        color: '#FFFFFF',
    },
    durationInput: {
        backgroundColor: '#333333',
        borderRadius: 5,
        padding: 15,
        color: '#FFFFFF',
        marginBottom: 15,
    },
    monthPickerOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    monthPickerContainer: {
        backgroundColor: '#2a2a2a',
        borderRadius: 10,
        padding: 20,
        width: '90%',
        maxWidth: 400,
    },
    monthPickerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        paddingHorizontal: 10,
    },
    monthPickerYearText: {
        color: '#D4AF37',
        fontSize: 20,
        fontWeight: 'bold',
    },
    monthPickerGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    monthPickerButton: {
        width: '30%',
        padding: 12,
        margin: 5,
        borderRadius: 5,
        backgroundColor: '#333333',
        alignItems: 'center',
    },
    monthPickerButtonSelected: {
        backgroundColor: '#D4AF37',
    },
    monthPickerButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
    },
    monthPickerButtonTextSelected: {
        color: '#000000',
        fontWeight: 'bold',
    },
    monthPickerCloseButton: {
        marginTop: 15,
        padding: 12,
        backgroundColor: '#D4AF37',
        borderRadius: 5,
        alignItems: 'center',
    },
    monthPickerCloseButtonText: {
        color: '#000000',
        fontWeight: 'bold',
        fontSize: 16,
    },// En los estilos, agrega/modifica estas propiedades:

    filterContainer: {
        padding: 10,
        backgroundColor: '#1E1E1E',
    },
    dateFilterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    statusFilterRow: {
        marginTop: 5,
    },
// Los demás estilos se mantienen igual que antes
});
