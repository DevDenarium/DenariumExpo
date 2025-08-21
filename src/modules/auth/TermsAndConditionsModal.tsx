import React from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
    },
    modalContent: {
        width: '90%',
        maxHeight: '80%',
        backgroundColor: '#1A1A1A',
        borderRadius: 15,
        padding: 20,
        borderWidth: 1,
        borderColor: '#D4AF37',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#D4AF37',
    },
    modalTitle: {
        color: '#D4AF37',
        fontSize: 22,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 8,
    },
    scrollContainer: {
        maxHeight: 350,
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        color: '#D4AF37',
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 10,
    },
    sectionText: {
        color: '#FFFFFF',
        fontSize: 14,
        lineHeight: 20,
    },
    buttonContainer: {
        marginTop: 20,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#333333',
    },
    acceptButton: {
        backgroundColor: '#D4AF37',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    acceptButtonText: {
        color: '#000000',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

interface TermsAndConditionsModalProps {
    visible: boolean;
    onAccept: () => void;
    onClose: () => void;
}

const TermsAndConditionsModal: React.FC<TermsAndConditionsModalProps> = ({
    visible,
    onAccept,
    onClose,
}) => {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Términos y Condiciones</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Icon name="close" size={24} color="#D4AF37" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.scrollContainer}>
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Políticas de Privacidad</Text>
                            <Text style={styles.sectionText}>
                                En Denarium Capital, nos tomamos muy en serio la privacidad de nuestros usuarios. {'\n\n'}
                                1. Información que recopilamos:{'\n'}
                                • Datos de identificación personal\n
                                • Información financiera\n
                                • Datos de uso de la aplicación{'\n\n'}
                                2. Uso de la información:{'\n'}
                                • Proporcionar servicios financieros\n
                                • Mejorar la experiencia del usuario\n
                                • Cumplir con requisitos legales{'\n\n'}
                                3. Protección de datos:{'\n'}
                                • Utilizamos encriptación de nivel bancario\n
                                • Acceso restringido a información sensible\n
                                • Actualizaciones regulares de seguridad
                            </Text>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Políticas de Devolución</Text>
                            <Text style={styles.sectionText}>
                                Nuestras políticas de devolución están diseñadas para proteger tanto a nuestros clientes como a la integridad de nuestros servicios financieros. {'\n\n'}
                                1. Transacciones:{'\n'}
                                • Las transacciones completadas son finales\n
                                • Casos de error se evalúan individualmente\n
                                • Tiempo límite para reclamos: 30 días{'\n\n'}
                                2. Suscripciones:{'\n'}
                                • Cancelación disponible antes del siguiente ciclo\n
                                • Reembolsos prorrateados según el caso{'\n\n'}
                                3. Disputas:{'\n'}
                                • Proceso de resolución transparente\n
                                • Documentación requerida para reclamos
                            </Text>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Términos y Condiciones Generales</Text>
                            <Text style={styles.sectionText}>
                                Al utilizar Denarium Capital, usted acepta los siguientes términos:{'\n\n'}
                                1. Uso del servicio:{'\n'}
                                • Debe ser mayor de edad\n
                                • Información verdadera y actualizada\n
                                • Uso responsable de la plataforma{'\n\n'}
                                2. Responsabilidades:{'\n'}
                                • Mantener seguras sus credenciales\n
                                • Reportar actividades sospechosas\n
                                • Cumplir con leyes aplicables{'\n\n'}
                                3. Modificaciones:{'\n'}
                                • Podemos actualizar estos términos\n
                                • Notificación de cambios importantes\n
                                • Derecho a terminar el servicio
                            </Text>
                        </View>
                    </ScrollView>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.acceptButton}
                            onPress={onAccept}
                        >
                            <Text style={styles.acceptButtonText}>Acepto los Términos y Condiciones</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default TermsAndConditionsModal;
