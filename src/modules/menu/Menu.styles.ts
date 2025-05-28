import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    menuContainer: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: '75%',
        backgroundColor: '#1c1c1c',
        borderRightWidth: 1,
        borderRightColor: '#D4AF37',
        paddingTop: 50,
        paddingHorizontal: 20,
        zIndex: 100,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(212, 175, 55, 0.2)',
    },
    menuItemText: {
        color: '#D4AF37',
        fontSize: 16,
        marginLeft: 15,
        fontWeight: '500',
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        padding: 10,
    },
    userInfo: {
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(212, 175, 55, 0.3)',
        marginBottom: 15,
    },
    userName: {
        color: '#D4AF37',
        fontSize: 18,
        fontWeight: '600',
    },
    userEmail: {
        color: '#AAAAAA',
        fontSize: 14,
        marginTop: 5,
    },
});
