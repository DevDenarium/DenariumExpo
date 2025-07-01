import React, {useEffect, useState} from 'react';
import {Alert, Modal, Platform, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {FinanceService} from '../../services/Finance.service';
import {CreateEntryDto, FinanceEntryType} from './FinanceScreen.types';
import { styles } from './FinanceEntryForm.styles';
import {registerLocale, setDefaultLocale} from "react-datepicker";
import {es} from 'date-fns/locale';

registerLocale('es', es);
setDefaultLocale('es');

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


let DateTimePicker: React.ComponentType<DateTimePickerProps> | null = null;
let ReactDatePicker: React.ComponentType<ReactDatePickerProps> | null = null;

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
    categories: {id: string, name: string, type: FinanceEntryType, color?: string, icon?: string;}[];
    tags: {id: string, name: string, color?: string}[];
    setCategories: React.Dispatch<React.SetStateAction<{id: string, name: string, type: FinanceEntryType, color?: string, icon?: string;}[]>>;
    setTags: React.Dispatch<React.SetStateAction<{id: string, name: string, color?: string}[]>>;
}

const FinanceEntryForm: React.FC<FinanceEntryFormProps> = ({
                                                               onEntryAdded,
                                                               categories,
                                                               tags,
                                                               setCategories,
                                                               setTags
                                                           }) => {
    const [formData, setFormData] = useState<CreateEntryDto>({
        title: '',
        amount: 0,
        type: FinanceEntryType.EXPENSE,
        date: new Date(),
        description: '',
        categoryId: undefined,
        tagIds: []
    });
    const [loading, setLoading] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);
    const [showTagPicker, setShowTagPicker] = useState(false);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
    const [newTagName, setNewTagName] = useState('');
    const [showNewTagModal, setShowNewTagModal] = useState(false);

    const handleSubmit = async () => {
        if (!formData.title || formData.amount <= 0) {
            Alert.alert('Error', 'Por favor completa todos los campos');
            return;
        }

        setLoading(true);
        try {
            await FinanceService.createEntry({
                ...formData,
                tagIds: selectedTags
            });
            setFormData({
                title: '',
                amount: 0,
                type: FinanceEntryType.EXPENSE,
                date: new Date(),
                description: '',
                categoryId: undefined,
                tagIds: []
            });
            setSelectedTags([]);
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

    const handleCreateCategory = async () => {
        if (!newCategoryName) return;

        try {
            const newCategory = await FinanceService.createCategory({
                name: newCategoryName,
                type: formData.type,
                color: '#D4AF37', // Color por defecto
                icon: 'tag' // Icono por defecto
            });

            setCategories([...categories, newCategory]);
            setFormData({...formData, categoryId: newCategory.id});
            setShowNewCategoryModal(false);
            setNewCategoryName('');
        } catch (error) {
            Alert.alert('Error', 'No se pudo crear la categoría');
        }
    };

    const handleCreateTag = async () => {
        if (!newTagName) return;

        try {
            const newTag = await FinanceService.createTag({
                name: newTagName,
                color: '#D4AF37'
            });

            // Actualizar el estado de tags y selectedTags
            setTags(prevTags => [...prevTags, newTag]);
            setSelectedTags(prev => [...prev, newTag.id]);
            setShowNewTagModal(false);
            setNewTagName('');
        } catch (error) {
            Alert.alert('Error', 'No se pudo crear la etiqueta');
        }
    };

    const toggleDatePicker = () => {
        setShowDatePicker(!showDatePicker);
    };

    const filteredCategories = categories.filter(
        cat => cat.type === formData.type
    );

    const WebDatePicker = () => {
        if (!ReactDatePicker) {
            return (
                <View style={styles.dateInputContainer}>
                    <TextInput
                        style={[styles.input, styles.dateInput]}
                        value={formatDate(formData.date)}
                        placeholder="Seleccionar fecha"
                        editable={false}
                    />
                </View>
            );
        }

        return (
            <View style={[styles.datePickerContainer, styles.dateInputContainer]}>
                <ReactDatePicker
                    selected={formData.date}
                    onChange={handleWebDateChange}
                    dateFormat="dd/MM/yyyy"
                    locale="es"
                    customInput={
                        <TextInput
                            style={[styles.input, styles.dateInput]}
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
                    style={[styles.typeButton, formData.type === 'INCOME' && styles.typeButtonActive]}
                    onPress={() => setFormData({ ...formData, type: 'INCOME' as FinanceEntryType})}
                >
                    <Text style={[styles.typeButtonText, formData.type === 'INCOME' && styles.typeButtonTextActive]}>
                        Ingreso
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.typeButton, formData.type === 'EXPENSE' && styles.typeButtonActive]}
                    onPress={() => setFormData({ ...formData, type: 'EXPENSE' as FinanceEntryType })}
                >
                    <Text style={[styles.typeButtonText, formData.type === 'EXPENSE' && styles.typeButtonTextActive]}>
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

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Categoría</Text>
                <TouchableOpacity
                    style={styles.dropdown}
                    onPress={() => setShowCategoryPicker(true)}
                >
                    <Text style={styles.dropdownText}>
                        {formData.categoryId ?
                            categories.find(c => c.id === formData.categoryId)?.name :
                            'Seleccionar categoría'}
                    </Text>
                    <Icon name="chevron-down" size={20} color="#D4AF37" />
                </TouchableOpacity>

                <Modal
                    visible={showCategoryPicker}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setShowCategoryPicker(false)}
                >
                    <TouchableOpacity
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPress={() => setShowCategoryPicker(false)}
                    >
                        <View style={styles.modalPickerContainer}>
                            <ScrollView style={styles.pickerScrollView}>
                                {filteredCategories.map(category => (
                                    <TouchableOpacity
                                        key={category.id}
                                        style={styles.pickerItem}
                                        onPress={() => {
                                            setFormData({ ...formData, categoryId: category.id });
                                            setShowCategoryPicker(false);
                                        }}
                                    >
                                        <View style={[styles.categoryIcon, { backgroundColor: category.color || '#333333' }]}>
                                            <Icon name={category.icon || 'tag'} size={16} color="#FFFFFF" />
                                        </View>
                                        <Text style={styles.pickerItemText}>{category.name}</Text>
                                    </TouchableOpacity>
                                ))}
                                <TouchableOpacity
                                    style={styles.pickerItem}
                                    onPress={() => {
                                        setShowCategoryPicker(false);
                                        setShowNewCategoryModal(true);
                                    }}
                                >
                                    <Icon name="plus" size={16} color="#D4AF37" />
                                    <Text style={[styles.pickerItemText, {color: '#D4AF37'}]}>Crear nueva categoría</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.pickerItem}
                                    onPress={() => {
                                        setFormData({ ...formData, categoryId: undefined });
                                        setShowCategoryPicker(false);
                                    }}
                                >
                                    <Text style={styles.pickerItemText}>Sin categoría</Text>
                                </TouchableOpacity>
                            </ScrollView>
                        </View>
                    </TouchableOpacity>
                </Modal>
            </View>

            <Modal
                visible={showNewCategoryModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowNewCategoryModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Nueva Categoría</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Nombre de la categoría"
                            value={newCategoryName}
                            onChangeText={setNewCategoryName}
                        />
                        <View style={styles.modalButtonContainer}>
                            <Pressable
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setShowNewCategoryModal(false)}
                            >
                                <Text style={styles.modalButtonText}>Cancelar</Text>
                            </Pressable>
                            <Pressable
                                style={[styles.modalButton, styles.confirmButton]}
                                onPress={handleCreateCategory}
                            >
                                <Text style={styles.modalButtonText}>Crear</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Etiquetas</Text>
                <View style={styles.tagsInputContainer}>
                    {selectedTags.map(tagId => {
                        const tag = tags.find(t => t.id === tagId);
                        return tag ? (
                            <View key={tagId} style={styles.selectedTag}>
                                <Text style={styles.selectedTagText}>{tag.name}</Text>
                                <TouchableOpacity
                                    onPress={() => setSelectedTags(selectedTags.filter(id => id !== tagId))}
                                >
                                    <Icon name="close" size={16} color="#FFFFFF" />
                                </TouchableOpacity>
                            </View>
                        ) : null;
                    })}
                    <TouchableOpacity
                        style={styles.addTagButton}
                        onPress={() => setShowTagPicker(true)}
                    >
                        <Icon name="plus" size={20} color="#D4AF37" />
                    </TouchableOpacity>
                </View>

                <Modal
                    visible={showTagPicker}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setShowTagPicker(false)}
                >
                    <TouchableOpacity
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPress={() => setShowTagPicker(false)}
                    >
                        <View style={styles.modalPickerContainer}>
                            <ScrollView style={styles.pickerScrollView}>
                                {tags.filter(tag => !selectedTags.includes(tag.id)).map(tag => (
                                    <TouchableOpacity
                                        key={tag.id}
                                        style={styles.pickerItem}
                                        onPress={() => {
                                            setSelectedTags([...selectedTags, tag.id]);
                                            setShowTagPicker(false);
                                        }}
                                    >
                                        <View style={[styles.tagColor, { backgroundColor: tag.color || '#D4AF37' }]} />
                                        <Text style={styles.pickerItemText}>{tag.name}</Text>
                                    </TouchableOpacity>
                                ))}
                                <TouchableOpacity
                                    style={styles.pickerItem}
                                    onPress={() => {
                                        setShowTagPicker(false);
                                        setShowNewTagModal(true);
                                    }}
                                >
                                    <Icon name="plus" size={16} color="#D4AF37" />
                                    <Text style={[styles.pickerItemText, {color: '#D4AF37'}]}>Crear nueva etiqueta</Text>
                                </TouchableOpacity>
                            </ScrollView>
                        </View>
                    </TouchableOpacity>
                </Modal>
            </View>

            <Modal
                visible={showNewTagModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowNewTagModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Nueva Etiqueta</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Nombre de la etiqueta"
                            value={newTagName}
                            onChangeText={setNewTagName}
                        />
                        <View style={styles.modalButtonContainer}>
                            <Pressable
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setShowNewTagModal(false)}
                            >
                                <Text style={styles.modalButtonText}>Cancelar</Text>
                            </Pressable>
                            <Pressable
                                style={[styles.modalButton, styles.confirmButton]}
                                onPress={handleCreateTag}
                            >
                                <Text style={styles.modalButtonText}>Crear</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            {Platform.OS === 'web' ? <WebDatePicker /> : <MobileDatePicker />}

            <TextInput
                style={styles.input}
                placeholder="Descripción (opcional)"
                value={formData.description}
                onChangeText={(description) => setFormData({ ...formData, description })}
                multiline
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

            {Platform.OS === 'web' && (
                <View>
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
                </View>
            )}
        </View>
    );
};

export default FinanceEntryForm;
