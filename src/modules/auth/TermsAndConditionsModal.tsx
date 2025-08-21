
import React from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.8)',
    },
    modalContent: {
        width: '90%',
        maxHeight: '80%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#D4AF37',
    },
    text: {
        fontSize: 14,
        color: '#333',
        marginBottom: 12,
    },
    button: {
        backgroundColor: '#D4AF37',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 16,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

interface TermsAndConditionsModalProps {
    visible: boolean;
    onAccept: () => void;
    onClose: () => void;
}

const TermsAndConditionsModal: React.FC<TermsAndConditionsModalProps> = ({ visible, onAccept, onClose }) => {
        return (
            <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.title}>Términos y Condiciones de Uso</Text>
                        <ScrollView>
                            <Text style={styles.text}>
                                Al usar esta aplicación, aceptas nuestras políticas de privacidad, devolución y los términos generales de uso. Por favor, lee cuidadosamente antes de continuar.
                                {'\n\n'}1. Privacidad: Tu información será protegida y usada solo para mejorar tu experiencia y cumplir requisitos legales.
                                {'\n\n'}2. Devoluciones: Las transacciones son finales, pero puedes solicitar revisión en casos de error o disputa.
                                {'\n\n'}3. Uso: Debes ser mayor de edad y usar la app de forma responsable. Podemos actualizar estos términos y notificarte cambios importantes.
                            </Text>
                        </ScrollView>
                        <TouchableOpacity style={styles.button} onPress={onAccept}>
                            <Text style={styles.buttonText}>Acepto los Términos y Condiciones</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, {backgroundColor:'#ccc', marginTop:8}]} onPress={onClose}>
                            <Text style={[styles.buttonText, {color:'#333'}]}>Cerrar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        );
    }

    export default TermsAndConditionsModal;
