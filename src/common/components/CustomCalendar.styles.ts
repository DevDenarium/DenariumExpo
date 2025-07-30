import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    container: {
        backgroundColor: '#2c2c2c',
        borderRadius: 12,
        padding: 20,
        width: '100%',
        maxWidth: 350,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 10,
        color: '#ffffff',
    },
    controlsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 0,
        paddingHorizontal: 10,
    },
    monthControl: {
        flex: 1,
        alignItems: 'center',
    },
    yearControl: {
        flex: 1,
        alignItems: 'center',
    },
    controlLabel: {
        color: '#ffffff',
        fontSize: 10,
        marginBottom: 2,
    },
    controlRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    arrowButton: {
        padding: 4,
    },
    arrowText: {
        color: '#D4AF37',
        fontSize: 16,
        fontWeight: 'bold',
    },
    monthText: {
        color: '#D4AF37',
        fontSize: 14,
        fontWeight: '600',
        minWidth: 70,
        textAlign: 'center',
    },
    yearText: {
        color: '#D4AF37',
        fontSize: 14,
        fontWeight: '600',
        minWidth: 50,
        textAlign: 'center',
    },
    calendarContainer: {
        marginTop: -5,
    },
    cancelButton: {
        marginTop: 10,
        padding: 10,
        backgroundColor: '#1a1a1a',
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#ffffff',
        fontSize: 15,
    },
});