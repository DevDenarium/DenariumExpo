import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Platform, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { FinanceService } from './Finance.service';
import { CreateEntryDto } from './FinanceScreen.types';
import { styles } from './FinanceScreen.styles';
import { registerLocale, setDefaultLocale } from "react-datepicker";
import { es } from 'date-fns/locale';
registerLocale('es', es);
setDefaultLocale('es');

// Tipos para los componentes de selección de fecha
type DateTimePickerProps = {
    value: Date;
    mode: 'date' | 'time' | 'datetime';
    display: 'default' | 'spinner' | 'compact' | 'inline';
    onChange: (event: any, date?: Date) => void;
    locale?: string;
    textColor?: string;
    themeVariant?: 'light' | 'dark';
};

type ReactDatePickerProps = {
    selected: Date;
    onChange: (date: Date) => void;
    dateFormat: string;
    className?: string;
    customInput?: React.ReactElement;
    popperPlacement?: string;
    popperModifiers?: any;
    locale?: string;
};

// Declaración de componentes condicionales
let DateTimePicker: React.ComponentType<DateTimePickerProps> | null = null;
let ReactDatePicker: React.ComponentType<ReactDatePickerProps> | null = null;

// Cargamos los componentes según la plataforma
if (Platform.OS === 'web') {
    try {
        ReactDatePicker = require('react-datepicker').default;
        require('react-datepicker/dist/react-datepicker.css');
    } catch (error) {
        console.error('Error al cargar react-datepicker:', error);
    }
} else {
    try {
        DateTimePicker = require('@react-native-community/datetimepicker').default;
    } catch (error) {
        console.error('Error al cargar DateTimePicker:', error);
    }
}

interface FinanceEntryFormProps {
    onEntryAdded: () => void;
}

const FinanceEntryForm: React.FC<FinanceEntryFormProps> = ({ onEntryAdded }) => {
    const [formData, setFormData] = useState<CreateEntryDto>({
        title: '',
        amount: 0,
        type: 'expense',
        date: new Date(),
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const handleSubmit = async () => {
        if (!formData.title || formData.amount <= 0) {
            Alert.alert('Error', 'Por favor completa todos los campos');
            return;
        }

        setLoading(true);
        try {
            await FinanceService.createEntry(formData);
            setFormData({
                title: '',
                amount: 0,
                type: 'expense',
                date: new Date(),
                description: ''
            });
            setShowDatePicker(false);
            onEntryAdded();
        } catch (error) {
            console.error('Error creating entry:', error);
            Alert.alert('Error', 'No se pudo registrar el movimiento');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'web') return;

        const currentDate = selectedDate || formData.date;
        setShowDatePicker(Platform.OS === 'ios');
        setFormData({ ...formData, date: currentDate });
    };

    const handleWebDateChange = (date: Date) => {
        setFormData({ ...formData, date });
    };

    const toggleDatePicker = () => {
        setShowDatePicker(!showDatePicker);
    };

    const WebDatePicker = () => {
        if (!ReactDatePicker) {
            return (
                <TextInput
                    style={[styles.input, styles.dateInput, { marginBottom: 0 }]}
                    value={formatDate(formData.date)}
                    placeholder="Seleccionar fecha"
                    editable={false}
                />
            );
        }

        return (
            <View style={[styles.datePickerContainer, styles.dateInputContainer]}>
                <ReactDatePicker
                    selected={formData.date}
                    onChange={handleWebDateChange}
                    dateFormat="dd/MM/yyyy"
                    locale="es"  // Añade esta línea
                    customInput={
                        <TextInput
                            style={[styles.input, styles.dateInput, { marginBottom: 0 }]}
                            value={formatDate(formData.date)}
                            placeholder="Seleccionar fecha"
                        />
                    }
                    popperPlacement="bottom-start"
                    popperModifiers={[
                        {
                            name: 'offset',
                            options: {
                                offset: [0, 5],
                            },
                        },
                        {
                            name: 'preventOverflow',
                            options: {
                                rootBoundary: 'viewport',
                                tether: false,
                                altAxis: true,
                            },
                        },
                    ]}
                />
            </View>
        );
    };

    const MobileDatePicker = () => {
        return (
            <View style={[styles.datePickerContainer, styles.dateInputContainer]}>
                <TouchableOpacity
                    style={[styles.input, styles.dateInput]}
                    onPress={toggleDatePicker}
                    testID="datePickerButton"
                >
                    <View style={styles.dateInputContent}>
                        <Text style={{ color: formData.date ? '#FFFFFF' : '#AAAAAA' }}>
                            {formData.date ? formatDate(formData.date) : 'Seleccionar fecha'}
                        </Text>
                        <Icon name="calendar" size={20} color="#D4AF37" />
                    </View>
                </TouchableOpacity>

                {showDatePicker && DateTimePicker && (
                    <View style={styles.datePickerWrapper}>
                        <DateTimePicker
                            value={formData.date}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={handleDateChange}
                            locale="es-ES"
                            textColor="#FFFFFF"
                            themeVariant="dark"
                        />
                    </View>
                )}

                {Platform.OS === 'ios' && showDatePicker && (
                    <TouchableOpacity
                        style={styles.datePickerButton}
                        onPress={toggleDatePicker}
                    >
                        <Text style={styles.datePickerButtonText}>Listo</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <View style={[styles.formContainer, { position: 'relative', zIndex: 1 }]}>
            <Text style={styles.sectionTitle}>Nuevo Movimiento</Text>

            <View style={styles.typeSelector}>
                <TouchableOpacity
                    style={[styles.typeButton, formData.type === 'income' && styles.typeButtonActive]}
                    onPress={() => setFormData({ ...formData, type: 'income' })}
                >
                    <Text style={[styles.typeButtonText, formData.type === 'income' && styles.typeButtonTextActive]}>
                        Ingreso
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.typeButton, formData.type === 'expense' && styles.typeButtonActive]}
                    onPress={() => setFormData({ ...formData, type: 'expense' })}
                >
                    <Text style={[styles.typeButtonText, formData.type === 'expense' && styles.typeButtonTextActive]}>
                        Gasto
                    </Text>
                </TouchableOpacity>
            </View>

            <TextInput
                style={styles.input}
                placeholder="Título"
                value={formData.title}
                onChangeText={(title) => setFormData({ ...formData, title })}
            />

            <TextInput
                style={styles.input}
                placeholder="Monto"
                keyboardType="numeric"
                value={formData.amount > 0 ? formData.amount.toString() : ''}
                onChangeText={(text) => {
                    const amount = parseFloat(text) || 0;
                    setFormData({ ...formData, amount });
                }}
            />

            {Platform.OS === 'web' ? <WebDatePicker /> : <MobileDatePicker />}

            <TextInput
                style={styles.input}
                placeholder="Descripción (opcional)"
                value={formData.description}
                onChangeText={(description) => setFormData({ ...formData, description })}
            />

            <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
                disabled={loading}
            >
                <Text style={styles.submitButtonText}>
                    {loading ? 'Registrando...' : 'Agregar Movimiento'}
                </Text>
            </TouchableOpacity>

            {/* Inyección de estilos solo en web */}
            {Platform.OS === 'web' && (
                <style>
                    {`
                        .react-datepicker-wrapper {
                            width: 100%;
                            display: block !important;
                        }
                        .react-datepicker__input-container {
                            width: 100%;
                            display: block !important;
                        }
                        .react-datepicker {
                            font-family: inherit;
                            background-color: #2a2a2a;
                            border: 1px solid #444;
                            position: absolute;
                            top: 100% !important;
                            left: 0 !important;
                            z-index: 10000 !important;
                        }
                        .react-datepicker-popper {
                            z-index: 10000 !important;
                        }
                        .react-datepicker__triangle {
                            display: none;
                        }
                        .react-datepicker__header {
                            background-color: #333;
                            border-bottom: 1px solid #444;
                        }
                        .react-datepicker__current-month,
                        .react-datepicker__day-name,
                        .react-datepicker__day {
                            color: white;
                        }
                        .react-datepicker__day:hover {
                            background-color: #444;
                        }
                        .react-datepicker__day--selected {
                            background-color: #D4AF37;
                            color: black;
                        }
                        .react-datepicker__navigation-icon::before {
                            border-color: white;
                        }
                    `}
                </style>
            )}
        </View>
    );
};
export default FinanceEntryForm;
