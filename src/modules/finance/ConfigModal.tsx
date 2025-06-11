import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Platform, Dimensions, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Currency, SortOption, FilterOption, FinanceSettings, CURRENCIES, MonthYear } from './FinanceScreen.types';

const { width, height } = Dimensions.get('window');

interface ConfigModalProps {
    visible: boolean;
    onClose: () => void;
    settings: FinanceSettings;
    onSettingsChange: (newSettings: FinanceSettings) => void;
    selectedMonthYear?: MonthYear;
    onMonthYearChange?: (monthYear: MonthYear) => void;
}

interface CustomSelectorProps {
    selectedValue: string | number;
    onValueChange: (value: any) => void;
    options: { label: string; value: any }[];
    placeholder?: string;
    zIndex?: number;
    dropdownZIndex?: number;
    onOpen?: () => void;
    onClose?: () => void;
    isOpen?: boolean;
}

const CustomSelector: React.FC<CustomSelectorProps> = ({
                                                           selectedValue,
                                                           onValueChange,
                                                           options,
                                                           placeholder = 'Seleccionar',
                                                           zIndex = 1,
                                                           dropdownZIndex = 1000,
                                                           onOpen,
                                                           onClose,
                                                           isOpen = false
                                                       }) => {
    const selectedLabel = options.find(opt => opt.value === selectedValue)?.label || placeholder;

    return (
        <View style={[styles.filterContainer, { zIndex }]}>
            <TouchableOpacity
                style={styles.filterButton}
                onPress={() => isOpen ? onClose?.() : onOpen?.()}
            >
                <Text style={styles.filterButtonText}>{selectedLabel}</Text>
                <Icon
                    name={isOpen ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#D4AF37"
                />
            </TouchableOpacity>

            {isOpen && (
                <View style={[styles.dropdownContainer, { zIndex: dropdownZIndex, elevation: 50 }]}>
                    <ScrollView
                        style={{ maxHeight: height * 0.3 }}
                        nestedScrollEnabled={true}
                    >
                        {options.map((option) => (
                            <TouchableOpacity
                                key={option.value.toString()}
                                style={[
                                    styles.optionButton,
                                    selectedValue === option.value && styles.optionButtonSelected
                                ]}
                                onPress={() => {
                                    onValueChange(option.value);
                                    onClose?.();
                                }}
                            >
                                <Text style={[
                                    styles.optionText,
                                    selectedValue === option.value && styles.optionTextSelected
                                ]}>
                                    {option.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}
        </View>
    );
};

const ConfigModal: React.FC<ConfigModalProps> = ({
                                                     visible,
                                                     onClose,
                                                     settings,
                                                     onSettingsChange,
                                                     selectedMonthYear,
                                                     onMonthYearChange
                                                 }) => {
    const [tempSettings, setTempSettings] = useState<FinanceSettings>(settings);
    const [tempMonthYear, setTempMonthYear] = useState<MonthYear>(
        selectedMonthYear || { month: new Date().getMonth(), year: new Date().getFullYear() }
    );

    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    const months = [
        { label: 'Enero', value: 0 },
        { label: 'Febrero', value: 1 },
        { label: 'Marzo', value: 2 },
        { label: 'Abril', value: 3 },
        { label: 'Mayo', value: 4 },
        { label: 'Junio', value: 5 },
        { label: 'Julio', value: 6 },
        { label: 'Agosto', value: 7 },
        { label: 'Septiembre', value: 8 },
        { label: 'Octubre', value: 9 },
        { label: 'Noviembre', value: 10 },
        { label: 'Diciembre', value: 11 }
    ];

    const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map(year => ({
        label: year.toString(),
        value: year
    }));

    const currencyOptions = CURRENCIES.map(currency => ({
        label: `${currency.symbol} - ${currency.name} (${currency.code})`,
        value: currency.code
    }));

    const sortOptions = [
        { label: 'Más reciente primero', value: 'recent' },
        { label: 'Más antiguo primero', value: 'oldest' },
        { label: 'Mayor monto primero', value: 'highest' },
        { label: 'Menor monto primero', value: 'lowest' },
        { label: 'Tipo (ingresos/gastos)', value: 'type' }
    ];

    const filterOptions = [
        { label: 'Todos', value: 'all' },
        { label: 'Solo ingresos', value: 'income' },
        { label: 'Solo gastos', value: 'expense' },
        { label: 'Último mes', value: 'lastMonth' },
        { label: 'Últimos 3 meses', value: 'last3Months' },
        { label: 'Mes específico', value: 'specificMonth' },
    ];

    const handleSave = () => {
        onSettingsChange(tempSettings);
        if (tempSettings.filterBy === 'specificMonth' && onMonthYearChange) {
            onMonthYearChange(tempMonthYear);
        }
        onClose();
    };

    const handleDropdownToggle = (dropdownName: string) => {
        setOpenDropdown(prev => prev === dropdownName ? null : dropdownName);
    };

    return (
        <Modal
            animationType="slide"
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

                        <ScrollView
                            style={styles.scrollContainer}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.scrollContentContainer}
                        >
                            <View style={[styles.section, { zIndex: openDropdown === 'currency' ? 999 : 1 }]}>
                                <Text style={styles.sectionTitle}>Moneda (solo visualización)</Text>
                                <CustomSelector
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
                                    options={currencyOptions}
                                    zIndex={openDropdown === 'currency' ? 1000 : 1}
                                    dropdownZIndex={1001}
                                    onOpen={() => handleDropdownToggle('currency')}
                                    onClose={() => handleDropdownToggle('currency')}
                                    isOpen={openDropdown === 'currency'}
                                />
                                <Text style={styles.noteText}>
                                    El cambio de moneda solo afecta al símbolo mostrado, no a los valores.
                                </Text>
                            </View>

                            <View style={[styles.section, { zIndex: openDropdown === 'sort' ? 999 : 1 }]}>
                                <Text style={styles.sectionTitle}>Ordenar por</Text>
                                <CustomSelector
                                    selectedValue={tempSettings.sortBy}
                                    onValueChange={(value) =>
                                        setTempSettings({...tempSettings, sortBy: value as SortOption})
                                    }
                                    options={sortOptions}
                                    zIndex={openDropdown === 'sort' ? 1000 : 1}
                                    dropdownZIndex={1002}
                                    onOpen={() => handleDropdownToggle('sort')}
                                    onClose={() => handleDropdownToggle('sort')}
                                    isOpen={openDropdown === 'sort'}
                                />
                            </View>

                            <View style={[styles.section, { zIndex: openDropdown === 'filter' ? 999 : 1 }]}>
                                <Text style={styles.sectionTitle}>Filtrar por</Text>
                                <CustomSelector
                                    selectedValue={tempSettings.filterBy}
                                    onValueChange={(value) =>
                                        setTempSettings({...tempSettings, filterBy: value as FilterOption})
                                    }
                                    options={filterOptions}
                                    zIndex={openDropdown === 'filter' ? 1000 : 1}
                                    dropdownZIndex={1003}
                                    onOpen={() => handleDropdownToggle('filter')}
                                    onClose={() => handleDropdownToggle('filter')}
                                    isOpen={openDropdown === 'filter'}
                                />
                            </View>

                            {tempSettings.filterBy === 'specificMonth' && (
                                <View style={styles.section}>
                                    <Text style={styles.sectionTitle}>Seleccionar mes</Text>
                                    <View style={styles.row}>
                                        <View style={{ flex: 1, marginRight: 8, zIndex: openDropdown === 'month' ? 999 : 1 }}>
                                            <CustomSelector
                                                selectedValue={tempMonthYear.month}
                                                onValueChange={(value) =>
                                                    setTempMonthYear({...tempMonthYear, month: value})
                                                }
                                                options={months}
                                                zIndex={openDropdown === 'month' ? 1000 : 1}
                                                dropdownZIndex={1004}
                                                onOpen={() => handleDropdownToggle('month')}
                                                onClose={() => handleDropdownToggle('month')}
                                                isOpen={openDropdown === 'month'}
                                            />
                                        </View>
                                        <View style={{ flex: 1, zIndex: openDropdown === 'year' ? 999 : 1 }}>
                                            <CustomSelector
                                                selectedValue={tempMonthYear.year}
                                                onValueChange={(value) =>
                                                    setTempMonthYear({...tempMonthYear, year: value})
                                                }
                                                options={years}
                                                zIndex={openDropdown === 'year' ? 1000 : 1}
                                                dropdownZIndex={1005}
                                                onOpen={() => handleDropdownToggle('year')}
                                                onClose={() => handleDropdownToggle('year')}
                                                isOpen={openDropdown === 'year'}
                                            />
                                        </View>
                                    </View>
                                </View>
                            )}
                        </ScrollView>

                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={handleSave}
                            activeOpacity={0.7}
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
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    modalContainer: {
        width: '100%',
        maxHeight: '85%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#1A1A1A',
    },
    modalContent: {
        backgroundColor: '#1A1A1A',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
    },
    scrollContainer: {
        maxHeight: Dimensions.get('window').height * 0.6,
    },
    scrollContentContainer: {
        paddingBottom: 20,
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
        color: '#D4AF37',
        fontSize: 16,
        marginBottom: 10,
        fontWeight: '500',
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#3A3A3A',
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: '#252525',
    },
    picker: {
        color: '#E0E0E0',
        height: 50,
    },
    saveButton: {
        backgroundColor: '#D4AF37',
        padding: 16,
        borderRadius: 10,
        alignItems: 'center',
        marginVertical: 10,
        flexDirection: 'row',
        justifyContent: 'center',
        shadowColor: '#D4AF37',
        shadowOffset: { width: 0, height: 2 },
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
        color: '#888888',
        fontSize: 12,
        marginTop: 8,
        fontStyle: 'italic',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    filterContainer: {
        position: 'relative',
        marginBottom: 20,
    },
    filterButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#252525',
        borderWidth: 1,
        borderColor: '#3A3A3A',
        borderRadius: 10,
        padding: 15,
        height: 50,
    },
    filterButtonText: {
        color: '#E0E0E0',
        fontSize: 16,
    },
    dropdownContainer: {
        position: 'absolute',
        top: 55,
        left: 0,
        right: 0,
        backgroundColor: '#252525',
        borderWidth: 1,
        borderColor: '#3A3A3A',
        borderRadius: 10,
        paddingVertical: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 50,
        maxHeight: 250,
    },
    optionButton: {
        paddingVertical: 12,
        paddingHorizontal: 15,
    },
    optionButtonSelected: {
        backgroundColor: 'rgba(212, 175, 55, 0.2)',
    },
    optionText: {
        color: '#E0E0E0',
        fontSize: 16,
    },
    optionTextSelected: {
        color: '#D4AF37',
        fontWeight: '600',
    },
});

export default ConfigModal;
