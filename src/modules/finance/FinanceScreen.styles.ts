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
        fontSize: 12,
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
});
