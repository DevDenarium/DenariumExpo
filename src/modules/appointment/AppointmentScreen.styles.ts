// AppointmentScreen.styles.ts
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
    } as ViewStyle,
    title: {
        fontSize: 24,
        fontWeight: '600',
        color: '#D4AF37',
    } as TextStyle,
    addButton: {
        backgroundColor: '#D4AF37',
        padding: 10,
        borderRadius: 20,
    } as ViewStyle,
    listContainer: {
        flex: 1,
    } as ViewStyle,
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    } as ViewStyle,
    emptyText: {
        color: '#AAAAAA',
        fontSize: 16,
        textAlign: 'center',
    } as TextStyle,
    appointmentCard: {
        backgroundColor: '#2a2a2a',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
    } as ViewStyle,
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    } as ViewStyle,
    cardTitle: {
        color: '#D4AF37',
        fontSize: 18,
        fontWeight: '600',
        flex: 1,
        marginRight: 10,
    } as TextStyle,
    cardStatus: {
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 5,
        alignSelf: 'flex-start',
        marginRight: 10,
    } as ViewStyle,
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
    } as TextStyle,
    cardBody: {
        marginBottom: 10,
    } as ViewStyle,
    cardDescription: {
        color: '#FFFFFF',
        fontSize: 14,
        marginBottom: 5,
    } as TextStyle,
    cardDate: {
        color: '#AAAAAA',
        fontSize: 12,
    } as TextStyle,
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    } as ViewStyle,
    actionButton: {
        padding: 8,
        borderRadius: 5,
        marginLeft: 10,
    } as ViewStyle,
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    } as ViewStyle,
    modalContainer: {
        width: '90%',
        maxHeight: '80%',
        backgroundColor: '#2a2a2a',
        borderRadius: 10,
        padding: 20,
    } as ViewStyle,
    modalTitle: {
        color: '#D4AF37',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    } as TextStyle,
    modalInput: {
        backgroundColor: '#333333',
        borderRadius: 5,
        padding: 15,
        color: '#FFFFFF',
        marginBottom: 15,
    } as TextStyle,
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
    } as ViewStyle,
    modalButton: {
        flex: 1,
        padding: 12,
        borderRadius: 6,
        marginHorizontal: 5,
        alignItems: 'center',
    } as ViewStyle,
    cancelButton: {
        backgroundColor: '#555555',
    } as ViewStyle,
    confirmButton: {
        backgroundColor: '#D4AF37',
    } as ViewStyle,
    disabledButton: {
        opacity: 0.5,
    } as ViewStyle,
    modalButtonText: {
        color: '#000000',
        fontWeight: 'bold',
    } as TextStyle,
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    } as ViewStyle,
    statusPending: {
        backgroundColor: 'rgba(255, 193, 7, 0.2)',
    } as ViewStyle,
    statusConfirmed: {
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
    } as ViewStyle,
    statusCancelled: {
        backgroundColor: 'rgba(244, 67, 54, 0.2)',
    } as ViewStyle,
    statusRescheduled: {
        backgroundColor: 'rgba(33, 150, 243, 0.2)',
    } as ViewStyle,
    statusRejected: {
        backgroundColor: 'rgba(244, 67, 54, 0.2)',
    } as ViewStyle,
    statusCompleted: {
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
    } as ViewStyle,
    statusTextPending: {
        color: '#FFC107',
    } as TextStyle,
    statusTextConfirmed: {
        color: '#4CAF50',
    } as TextStyle,
    statusTextCancelled: {
        color: '#F44336',
    } as TextStyle,
    statusTextRescheduled: {
        color: '#2196F3',
    } as TextStyle,
    statusTextRejected: {
        color: '#F44336',
    } as TextStyle,
    statusTextCompleted: {
        color: '#4CAF50',
    } as TextStyle,
    datePickerContainer: {
        marginBottom: 15,
    } as ViewStyle,
    datePickerButton: {
        backgroundColor: '#333333',
        borderRadius: 5,
        padding: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    } as ViewStyle,
    datePickerText: {
        color: '#FFFFFF',
    } as TextStyle,
    durationInput: {
        backgroundColor: '#333333',
        borderRadius: 5,
        padding: 15,
        color: '#FFFFFF',
        marginBottom: 15,
    } as TextStyle,
    timeSlotsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    } as ViewStyle,
    timeSlot: {
        width: '30%',
        backgroundColor: '#333333',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
        alignItems: 'center',
    } as ViewStyle,
    selectedTimeSlot: {
        backgroundColor: '#D4AF37',
    } as ViewStyle,
    timeSlotText: {
        color: '#FFFFFF',
    } as TextStyle,
    deleteButton: {
        padding: 5,
        borderRadius: 15,
        backgroundColor: 'rgba(244, 67, 54, 0.2)',
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    } as ViewStyle,
});
