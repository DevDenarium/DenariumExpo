// SubscriptionsScreen.styles.ts
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        backgroundColor: '#1c1c1c',
    },
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#1c1c1c',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1c1c1c',
    },
    header: {
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#D4AF37',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#FFFFFF',
        opacity: 0.8,
        textAlign: 'center',
        marginBottom: 20,
    },
    statusContainer: {
        backgroundColor: '#2a2a2a',
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#333',
    },
    statusTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#D4AF37',
        marginBottom: 10,
    },
    statusContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusIcon: {
        marginRight: 15,
    },
    statusPlan: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 5,
    },
    statusText: {
        fontSize: 14,
        color: '#FFFFFF',
        marginBottom: 3,
    },
    statusHighlight: {
        color: '#4CAF50',
        fontWeight: 'bold',
    },
    statusDate: {
        fontSize: 14,
        color: '#FFFFFF',
        fontStyle: 'italic',
        marginBottom: 5,
    },
    plansContainer: {
        marginBottom: 20,
    },
    card: {
        backgroundColor: '#2a2a2a',
        borderRadius: 10,
        padding: 20,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#333',
        position: 'relative',
    },
    currentPlan: {
        borderColor: '#4CAF50',
        borderWidth: 2,
    },
    highlightCard: {
        borderColor: '#D4AF37',
    },
    badgeContainer: {
        position: 'absolute',
        top: -10,  // Ajusta para que sobresalga
        right: -5, // Ajusta para que sobresalga
        flexDirection: 'column',
        alignItems: 'flex-end',
        zIndex: 1, // Asegura que esté sobre otros elementos
    },
    recommendedBadge: {
        backgroundColor: '#D4AF37',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 12,
        marginBottom: 5,
        borderWidth: 2,
        borderColor: '#1c1c1c', // Mismo color que el fondo de la pantalla
        elevation: 3, // Sombra para Android
        shadowColor: '#000', // Sombra para iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
    },
    currentBadge: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#1c1c1c', // Mismo color que el fondo de la pantalla
        elevation: 3, // Sombra para Android
        shadowColor: '#000', // Sombra para iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
    },
    currentBadgeText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#FFFFFF',
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
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        flex: 1,
    },
    currentPlanTitle: {
        color: '#4CAF50',
    },
    currentPlanIndicator: {
        color: '#D4AF37',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 10,
    },
    cardPrice: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#D4AF37',
    },
    currentPlanPrice: {
        color: '#4CAF50',
    },
    cardPeriod: {
        fontSize: 16,
        color: '#AAAAAA',
        marginLeft: 5,
    },
    currentPlanPeriod: {
        color: '#4CAF50',
    },
    employeeLimit: {
        fontSize: 14,
        color: '#D4AF37',
        marginBottom: 5,
        fontStyle: 'italic',
    },
    advisoryInfo: {
        fontSize: 14,
        color: '#D4AF37',
        marginBottom: 10,
        fontStyle: 'italic',
    },
    divider: {
        height: 1,
        backgroundColor: '#333',
        marginVertical: 15,
    },
    currentDivider: {
        backgroundColor: '#4CAF50',
    },
    featureList: {
        marginBottom: 20,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    featureText: {
        fontSize: 14,
        color: '#FFFFFF',
        marginLeft: 8,
        flex: 1,
    },
    currentFeatureText: {
        color: '#4CAF50',
    },
    button: {
        backgroundColor: '#D4AF37',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    highlightButton: {
        backgroundColor: '#d3ae37',
    },
    freeButton: {
        backgroundColor: '#4CAF50',
    },
    buttonText: {
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    highlightButtonText: {
        color: '#ffffff',
    },
    freeButtonText: {
        color: '#FFFFFF',
    },
    currentPlanButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        borderRadius: 8,
    },
    currentPlanIcon: {
        marginRight: 8,
    },
    currentPlanText: {
        color: '#4CAF50',
        fontWeight: 'bold',
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2a2a2a',
        padding: 15,
        borderRadius: 8,
        marginTop: 20,
    },
    infoText: {
        color: '#FFFFFF',
        marginLeft: 10,
        flex: 1,
    },
    customPlanButton: {
        marginTop: 15,
        padding: 12,
        borderWidth: 1,
        borderColor: '#D4AF37',
        borderRadius: 8,
        alignItems: 'center',
    },
    customPlanText: {
        color: '#D4AF37',
        fontWeight: 'bold',
    },
    recommendedText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    employeeMessage: {
        backgroundColor: 'rgba(212, 175, 55, 0.1)',
        padding: 15,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    employeeText: {
        color: '#FFFFFF',
        marginLeft: 10,
        flex: 1,
    },
    currentSubscriptionIndicator: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 5,
        backgroundColor: '#FFD700', // Amarillo dorado
        borderTopLeftRadius: 8,
        borderBottomLeftRadius: 8,
    },
});
