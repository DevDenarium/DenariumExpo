import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Picker } from '@react-native-picker/picker';
import { Currency, SortOption, FilterOption, FinanceSettings, CURRENCIES } from './FinanceScreen.types';

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
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Configuración</Text>
                            <TouchableOpacity
                                onPress={onClose}
                                style={styles.closeButton}
                            >
                                <Icon name="close" size={24} color="#D4AF37" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Moneda (solo visualización)</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={tempSettings.currency.code}
                                    onValueChange={(value) => {
                                        const selectedCurrency = CURRENCIES.find(c => c.code === value);
                                        if (selectedCurrency) {
                                            setTempSettings({
                                                ...tempSettings,
                                                currency: selectedCurrency
                                            });
                                        }
                                    }}
                                    style={styles.picker}
                                    dropdownIconColor="#D4AF37"
                                >
                                    {CURRENCIES.map((currency) => (
                                        <Picker.Item
                                            key={currency.code}
                                            label={`${currency.symbol} - ${currency.name} (${currency.code})`}
                                            value={currency.code}
                                        />
                                    ))}
                                </Picker>
                            </View>
                            <Text style={styles.noteText}>
                                El cambio de moneda solo afecta al símbolo mostrado, no a los valores.
                            </Text>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Ordenar por</Text>
                            <View style={styles.pickerContainer}>
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
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Filtrar por</Text>
                            <View style={styles.pickerContainer}>
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
                        </View>

                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={handleSave}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.saveButtonText}>Guardar Configuración</Text>
                            <Icon name="check-circle" size={20} color="#000" style={styles.saveIcon} />
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
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        width: '90%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 5,
    },
    modalContent: {
        backgroundColor: '#2a2a2a',
        borderRadius: 12,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.2)',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    modalTitle: {
        color: '#D4AF37',
        fontSize: 22,
        fontWeight: '600',
        fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif',
    },
    closeButton: {
        padding: 4,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        color: '#FFFFFF',
        fontSize: 16,
        marginBottom: 8,
        fontWeight: '500',
        opacity: 0.9,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.3)',
        borderRadius: 8,
        overflow: 'hidden',
    },
    picker: {
        backgroundColor: '#333333',
        color: '#FFFFFF',
        height: 50,
    },
    saveButton: {
        backgroundColor: '#D4AF37',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        shadowColor: '#D4AF37',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.4,
        shadowRadius: 3,
        elevation: 4,
    },
    saveButtonText: {
        color: '#000000',
        fontWeight: '600',
        fontSize: 16,
    },
    saveIcon: {
        marginLeft: 8,
    },
    noteText: {
        color: '#AAAAAA',
        fontSize: 12,
        marginTop: 8,
        fontStyle: 'italic',
    },
});

export default ConfigModal;
