import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { styles } from './FinanceScreen.styles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { FinanceService } from './finance.service';
import { CreateEntryDto } from './FinanceScreen.types';

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
            onEntryAdded();
        } catch (error) {
            console.error('Error creating entry:', error);
            Alert.alert('Error', 'No se pudo registrar el movimiento');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.formContainer}>
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
        </View>
    );
};

export default FinanceEntryForm;
