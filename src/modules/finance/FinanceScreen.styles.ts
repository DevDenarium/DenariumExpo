import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    headerContainer: {
        paddingHorizontal: 20,
        paddingTop: 20,
        backgroundColor: '#1c1c1c',
    },
    balanceContainer: {
        backgroundColor: '#2a2a2a',
        borderRadius: 10,
        padding: 20,
        borderLeftWidth: 4,
        borderLeftColor: '#D4AF37',
        marginBottom: 15,
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
    filterBadge: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: '#D4AF37',
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterBadgeText: {
        color: '#000',
        fontSize: 12,
        fontWeight: 'bold',
    },
    addEntryButton: {
        backgroundColor: 'transparent',
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 15,
        borderWidth: 2,
        borderColor: '#D4AF37',
        flexDirection: 'row',
        marginBottom: 25,
    },
    addEntryButtonText: {
        color: '#D4AF37',
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 8,
    },
    addEntryButtonIcon: {
        marginRight: 8,
    },
    fullScreenModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'flex-end',
    },
    fullScreenModalContainer: {
        backgroundColor: '#1c1c1c',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '90%',
        height: '90%',
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
});

export default styles;
