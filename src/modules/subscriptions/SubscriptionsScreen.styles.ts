import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        paddingBottom: 40,
    },
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#0F0F0F',
    },
    header: {
        marginBottom: 25,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#D4AF37',
        marginBottom: 5,
        fontFamily: 'Poppins-Bold',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#AAAAAA',
        fontFamily: 'Poppins-Regular',
        textAlign: 'center',
        maxWidth: '80%',
    },
    statusContainer: {
        backgroundColor: '#1A1A1A',
        borderRadius: 10,
        padding: 20,
        marginBottom: 25,
        borderLeftWidth: 4,
        borderLeftColor: '#D4AF37',
    },
    statusTitle: {
        color: '#D4AF37',
        fontSize: 12,
        fontFamily: 'Poppins-Bold',
        marginBottom: 10,
        letterSpacing: 1,
    },
    statusContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusIcon: {
        marginRight: 15,
    },
    statusPlan: {
        color: '#FFFFFF',
        fontSize: 18,
        fontFamily: 'Poppins-SemiBold',
        marginBottom: 5,
    },
    statusText: {
        color: '#CCCCCC',
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
    },
    statusHighlight: {
        color: '#4CAF50',
        fontWeight: 'bold',
    },
    statusDate: {
        color: '#AAAAAA',
        fontSize: 13,
        fontFamily: 'Poppins-Regular',
        marginTop: 5,
    },
    plansContainer: {
        marginBottom: 20,
    },
    card: {
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
        padding: 25,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#252525',
        position: 'relative',
    },
    highlightCard: {
        borderColor: '#D4AF37',
        borderWidth: 2,
        transform: [{ scale: 1.02 }],
    },
    recommendedBadge: {
        position: 'absolute',
        top: -12,
        right: 20,
        backgroundColor: '#D4AF37',
        paddingHorizontal: 15,
        paddingVertical: 5,
        borderRadius: 20,
        zIndex: 1,
    },
    recommendedText: {
        color: '#000000',
        fontSize: 12,
        fontFamily: 'Poppins-Bold',
        letterSpacing: 1,
    },
    currentBadge: {
        position: 'absolute',
        top: -12,
        left: 20,
        backgroundColor: '#4CAF50',
        paddingHorizontal: 15,
        paddingVertical: 5,
        borderRadius: 20,
        zIndex: 1,
    },
    currentBadgeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontFamily: 'Poppins-Bold',
        letterSpacing: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    planIcon: {
        marginRight: 10,
    },
    cardTitle: {
        fontSize: 22,
        fontWeight: '600',
        color: '#FFFFFF',
        fontFamily: 'Poppins-SemiBold',
    },
    currentPlanTitle: {
        color: '#4CAF50',
    },
    currentPlanIndicator: {
        color: '#4CAF50',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginBottom: 15,
    },
    cardPrice: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#D4AF37',
        fontFamily: 'Poppins-Bold',
    },
    currentPlanPrice: {
        color: '#4CAF50',
    },
    cardPeriod: {
        fontSize: 16,
        color: '#AAAAAA',
        marginBottom: 3,
        marginLeft: 5,
        fontFamily: 'Poppins-Regular',
    },
    currentPlanPeriod: {
        color: '#4CAF50',
    },
    divider: {
        height: 1,
        backgroundColor: '#252525',
        marginVertical: 15,
    },
    currentDivider: {
        backgroundColor: '#4CAF50',
    },
    featureList: {
        marginBottom: 25,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    featureText: {
        color: '#FFFFFF',
        fontSize: 15,
        marginLeft: 10,
        flex: 1,
        fontFamily: 'Poppins-Regular',
        lineHeight: 22,
    },
    currentFeatureText: {
        color: '#E0E0E0',
    },
    button: {
        backgroundColor: '#252525',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    highlightButton: {
        backgroundColor: '#D4AF37',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'Poppins-Bold',
        letterSpacing: 0.5,
    },
    highlightButtonText: {
        color: '#000000',
    },
    currentPlan: {
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        borderColor: '#4CAF50',
        borderWidth: 1.5,
    },
    currentPlanButton: {
        backgroundColor: 'transparent',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#4CAF50',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    currentPlanIcon: {
        marginRight: 10,
    },
    currentPlanText: {
        color: '#4CAF50',
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'Poppins-Bold',
        letterSpacing: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0F0F0F',
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#1A1A1A',
        borderRadius: 8,
        padding: 15,
        alignItems: 'center',
    },
    infoIcon: {
        marginRight: 10,
    },
    infoText: {
        color: '#AAAAAA',
        fontSize: 14,
        flex: 1,
        fontFamily: 'Poppins-Regular',
    },
});
