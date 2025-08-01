import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
    Dimensions
} from 'react-native';
import ColorPicker from 'react-native-wheel-color-picker';

interface ColorPickerModalProps {
    visible: boolean;
    onClose: () => void;
    onColorSelected: (color: string) => void;
    initialColor: string;
    title?: string;
    presetColors?: string[];
}

const { width } = Dimensions.get('window');

const defaultPresetColors = [
    '#D4AF37', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#00FFFF', '#FF00FF', '#C0C0C0',
    '#FFA500', '#800080', '#FFC0CB', '#A52A2A',
    '#4CAF50', '#2196F3', '#FF9800', '#9C27B0'
];

const ColorPickerModal: React.FC<ColorPickerModalProps> = ({
    visible,
    onClose,
    onColorSelected,
    initialColor,
    title = 'Seleccionar Color',
    presetColors = defaultPresetColors
}) => {
    const [currentColor, setCurrentColor] = useState(initialColor);

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
            supportedOrientations={['portrait', 'landscape']}
            statusBarTranslucent={true}
            presentationStyle="overFullScreen"
            hardwareAccelerated={true}
        >
            <View style={styles.modalOverlay}>
                <View style={[
                    styles.modalContainer,
                    Platform.OS === 'ios' ? styles.iosModalContainer : styles.androidModalContainer
                ]}>
                    <Text style={styles.modalTitle}>{title}</Text>

                    <View style={styles.colorDisplay}>
                        <View style={[styles.colorPreview, { backgroundColor: currentColor }]} />
                        <Text style={styles.colorHex}>{currentColor.toUpperCase()}</Text>
                    </View>

                    <View style={styles.pickerContainer}>
                        <ColorPicker
                            color={currentColor}
                            onColorChange={setCurrentColor}
                            thumbSize={40}
                            sliderSize={25}
                            noSnap={true}
                            row={false}
                            swatches={false}
                            discrete={false}
                            palette={presetColors}
                        />
                    </View>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={onClose}
                        >
                            <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.confirmButton]}
                            onPress={() => {
                                onColorSelected(currentColor);
                                onClose();
                            }}
                        >
                            <Text style={[styles.buttonText, styles.confirmButtonText]}>Confirmar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.95)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        zIndex: 999999,
    },
    modalContainer: {
        backgroundColor: '#2a2a2a',
        borderRadius: 10,
        padding: 20,
        width: '90%',
        maxWidth: 400,
        maxHeight: '80%',
        elevation: 50,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.8,
        shadowRadius: 25,
        borderWidth: 3,
        borderColor: '#D4AF37',
        zIndex: 999999,
    },
    iosModalContainer: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.9,
        shadowRadius: 30,
        elevation: 50,
        zIndex: 999999,
    },
    androidModalContainer: {
        elevation: 100,
        borderWidth: 4,
        borderColor: '#D4AF37',
        zIndex: 999999,
    },
    modalTitle: {
        color: '#D4AF37',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 15,
    },
    colorDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    colorPreview: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 15,
        borderWidth: 2,
        borderColor: '#FFF',
    },
    colorHex: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    pickerContainer: {
        height: width * 0.7,
        marginBottom: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    button: {
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 6,
        minWidth: 120,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#555',
    },
    confirmButton: {
        backgroundColor: '#D4AF37',
    },
    buttonText: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    cancelButtonText: {
        color: '#FFF',
    },
    confirmButtonText: {
        color: '#000',
    },
});

export default ColorPickerModal;
