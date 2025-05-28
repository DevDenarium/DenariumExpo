// src/modules/finance/ConfigModal.tsx
import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Picker } from '@react-native-picker/picker';
import { Currency, SortOption, FilterOption, FinanceSettings } from './FinanceScreen.types';

interface ConfigModalProps {
    visible: boolean;
    onClose: () => void;
    settings: FinanceSettings;
    onSettingsChange: (newSettings: FinanceSettings) => void;
}

const ConfigModal: React.FC<ConfigModalProps> = ({
                                                     visible,
                                                     onClose,
                                                     settings,
                                                     onSettingsChange
                                                 }) => {
    const [tempSettings, setTempSettings] = useState<FinanceSettings>(settings);

    const handleSave = () => {
        onSettingsChange(tempSettings);
        onClose();
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Configuración</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Icon name="close" size={24} color="#D4AF37" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Moneda</Text>
                        <Picker
                            selectedValue={tempSettings.currency}
                            onValueChange={(value) =>
                                setTempSettings({...tempSettings, currency: value as Currency})
                            }
                            style={styles.picker}
                            dropdownIconColor="#D4AF37"
                        >
                            <Picker.Item label="Dólares (USD)" value="USD" />
                            <Picker.Item label="Colones (CRC)" value="CRC" />
                        </Picker>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Ordenar por</Text>
                        <Picker
                            selectedValue={tempSettings.sortBy}
                            onValueChange={(value) =>
                                setTempSettings({...tempSettings, sortBy: value as SortOption})
                            }
                            style={styles.picker}
                            dropdownIconColor="#D4AF37"
                        >
                            <Picker.Item label="Más reciente primero" value="recent" />
                            <Picker.Item label="Más antiguo primero" value="oldest" />
                            <Picker.Item label="Mayor monto primero" value="highest" />
                            <Picker.Item label="Menor monto primero" value="lowest" />
                            <Picker.Item label="Tipo (ingresos/gastos)" value="type" />
                        </Picker>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Filtrar por</Text>
                        <Picker
                            selectedValue={tempSettings.filterBy}
                            onValueChange={(value) =>
                                setTempSettings({...tempSettings, filterBy: value as FilterOption})
                            }
                            style={styles.picker}
                            dropdownIconColor="#D4AF37"
                        >
                            <Picker.Item label="Todos" value="all" />
                            <Picker.Item label="Solo ingresos" value="income" />
                            <Picker.Item label="Solo gastos" value="expense" />
                            <Picker.Item label="Último mes" value="lastMonth" />
                            <Picker.Item label="Últimos 3 meses" value="last3Months" />
                        </Picker>
                    </View>

                    <TouchableOpacity
                        style={styles.saveButton}
                        onPress={handleSave}
                    >
                        <Text style={styles.saveButtonText}>Guardar Configuración</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    modalContent: {
        width: '90%',
        backgroundColor: '#2a2a2a',
        borderRadius: 10,
        padding: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        color: '#D4AF37',
        fontSize: 20,
        fontWeight: 'bold',
    },
    section: {
        marginBottom: 15,
    },
    sectionTitle: {
        color: '#FFFFFF',
        fontSize: 16,
        marginBottom: 5,
    },
    picker: {
        backgroundColor: '#333333',
        color: '#FFFFFF',
        borderRadius: 5,
    },
    saveButton: {
        backgroundColor: '#D4AF37',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10,
    },
    saveButtonText: {
        color: '#000000',
        fontWeight: 'bold',
    },
});

export default ConfigModal;
