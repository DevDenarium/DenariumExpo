import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1c1c1c',
        padding: 20,
    },
    balanceContainer: {
        backgroundColor: '#2a2a2a',
        borderRadius: 10,
        padding: 20,
        marginBottom: 20,
        borderLeftWidth: 4,
        borderLeftColor: '#D4AF37',
    },
    balanceTitle: {
        color: '#D4AF37',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
    },
    balanceAmount: {
        color: '#FFFFFF',
        fontSize: 28,
        fontWeight: 'bold',
    },
    balancePositive: {
        color: '#4CAF50',
    },
    balanceNegative: {
        color: '#F44336',
    },
    balanceDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    balanceDetail: {
        color: '#AAAAAA',
        fontSize: 14,
    },
    formContainer: {
        backgroundColor: '#2a2a2a',
        borderRadius: 10,
        padding: 20,
        marginBottom: 20,
    },
    sectionTitle: {
        color: '#D4AF37',
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 15,
    },
    typeSelector: {
        flexDirection: 'row',
        marginBottom: 15,
        justifyContent: 'space-between',
    },
    typeButton: {
        flex: 1,
        padding: 10,
        borderRadius: 5,
        backgroundColor: '#333333',
        marginHorizontal: 5,
        alignItems: 'center',
    },
    typeButtonActive: {
        backgroundColor: '#D4AF37',
    },
    typeButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    typeButtonTextActive: {
        color: '#000000',
    },
    input: {
        backgroundColor: '#333333',
        borderRadius: 5,
        padding: 15,
        marginBottom: 15,
        color: '#FFFFFF',
    },
    submitButton: {
        backgroundColor: '#D4AF37',
        borderRadius: 5,
        padding: 15,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#000000',
        fontWeight: 'bold',
    },
    entryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#2a2a2a',
        borderRadius: 8,
        marginBottom: 10,
    },
    entryIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#333333',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    entryInfo: {
        flex: 1,
    },
    entryTitle: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    entryDate: {
        color: '#AAAAAA',
        fontSize: 12,
    },
    entryAmount: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    incomeAmount: {
        color: '#4CAF50',
    },
    expenseAmount: {
        color: '#F44336',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        color: '#AAAAAA',
        fontSize: 16,
    },
    configButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 1,
        padding: 10,
        backgroundColor: '#2a2a2a',
        borderRadius: 20,
    },
    entryDescription: {
        color: '#AAAAAA',
        fontSize: 12,
        marginTop: 4,
    },
});
