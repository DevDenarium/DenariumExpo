import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1c1c1c',
        padding: 20,
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
        padding: 15,
        backgroundColor: '#2a2a2a',
        borderRadius: 10,
    },
    profileImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 15,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#333333',
    },
    profileImagePlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 15,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#2a2a2a',
    },
    userInfo: {
        flex: 1,
    },
    welcomeText: {
        color: '#D4AF37',
        fontSize: 18,
        fontWeight: '600',
    },
    emailText: {
        color: '#AAAAAA',
        fontSize: 14,
    },
    imageErrorText: {
        color: '#FF5555',
        fontSize: 12,
        marginTop: 5,
    },
    financeSection: {
        marginBottom: 25,
    },
    sectionTitle: {
        color: '#D4AF37',
        fontSize: 20,
        fontWeight: '600',
        marginVertical: 15,
    },
    financeCard: {
        backgroundColor: '#2a2a2a',
        borderRadius: 10,
        padding: 15,
    },
    financeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    financeLabel: {
        color: '#FFFFFF',
        fontSize: 16,
    },
    financeValue: {
        color: '#D4AF37',
        fontSize: 16,
        fontWeight: '600',
    },
});
