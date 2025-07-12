import React, { useEffect, useState, useRef } from 'react';
import { Alert, Keyboard, Modal, Platform, Pressable, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, ActivityIndicator, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { FinanceService } from '../../services/Finance.service';
import { CreateEntryDto, FinanceCategory, FinanceEntryType, FinanceTag, FinanceEntry } from './FinanceScreen.types';
import { registerLocale, setDefaultLocale } from "react-datepicker";
import { es } from 'date-fns/locale';
import { styles } from './FinanceEntryForm.styles';
import ColorPickerModal from './ColorPickerModal';
import axios from "axios";

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
        console.error('Error loading react-datepicker:', error);
    }
} else {
    try {
        DateTimePicker = require('@react-native-community/datetimepicker').default;
    } catch (error) {
        console.error('Error loading DateTimePicker:', error);
    }
}

interface FinanceEntryFormProps {
    onEntryAdded: () => void;
    categories: FinanceCategory[];
    tags: FinanceTag[];
    setCategories: React.Dispatch<React.SetStateAction<FinanceCategory[]>>;
    setTags: React.Dispatch<React.SetStateAction<FinanceTag[]>>;
    initialData?: Partial<FinanceEntry>;
    isEditing?: boolean;
    onCancel?: () => void;
    hideHeader?: boolean;
    customStyles?: boolean;
}

const FinanceEntryForm: React.FC<FinanceEntryFormProps> = ({
                                                               onEntryAdded,
                                                               categories,
                                                               tags,
                                                               setCategories = () => {},
                                                               setTags = () => {},
                                                               initialData,
                                                               isEditing = false,
                                                               onCancel = () => {},
                                                               hideHeader = false,
                                                               customStyles = false,
                                                           }) => {
    const [formData, setFormData] = useState<CreateEntryDto>({
        title: '',
        amount: 0,
        type: FinanceEntryType.EXPENSE,
        date: initialData?.date ? new Date(initialData.date) : new Date(),
        description: '',
        categoryId: undefined,
        tagIds: initialData?.tags?.map(t => t.id) || []
    });
    const [activeCategoryTab, setActiveCategoryTab] = useState<'default' | 'user'>('default');
    const [activeTagTab, setActiveTagTab] = useState<'default' | 'user'>('default');
    const [loading, setLoading] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);
    const [showTagPicker, setShowTagPicker] = useState(false);
    const [selectedTags, setSelectedTags] = useState<string[]>(formData.tagIds || []);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
    const [newTagName, setNewTagName] = useState('');
    const [showNewTagModal, setShowNewTagModal] = useState(false);
    const [newCategoryColor, setNewCategoryColor] = useState('#D4AF37');
    const [newTagColor, setNewTagColor] = useState('#D4AF37');
    const [showColorPickerModal, setShowColorPickerModal] = useState(false);
    const [colorPickerFor, setColorPickerFor] = useState<'category' | 'tag'>('category');
    const [rawAmount, setRawAmount] = useState(
        initialData?.amount ? Math.round(initialData.amount * 100).toString().replace('.', '') : ''
    );
    const scrollViewRef = useRef<ScrollView>(null);
    const descriptionInputRef = useRef<TextInput>(null);

    const defaultCategories = categories.filter(cat => cat.isDefault);
    const userCategories = categories.filter(cat => !cat.isDefault);
    const defaultTags = tags.filter(tag => tag.isDefault);
    const userTags = tags.filter(tag => !tag.isDefault);
    const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
    const [editingTagId, setEditingTagId] = useState<string | null>(null);
    const [isEditingItem, setIsEditingItem] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                amount: initialData.amount || 0,
                type: initialData.type || FinanceEntryType.EXPENSE,
                date: initialData.date ? new Date(initialData.date) : new Date(),
                description: initialData.description || '',
                categoryId: initialData.categoryId,
                tagIds: initialData.tags?.map(t => t.id) || []
            });
            setSelectedTags(initialData.tags?.map(t => t.id) || []);
            setRawAmount(
                initialData.amount ? Math.round(initialData.amount * 100).toString().replace('.', '') : ''
            );
        }
    }, [initialData]);

    const handleEditCategory = (category: FinanceCategory) => {
        setNewCategoryName(category.name);
        setNewCategoryColor(category.color || '#D4AF37');
        setFormData({...formData, type: category.type});
        setEditingCategoryId(category.id);
        setIsEditingItem(true);
        setShowNewCategoryModal(true);
        setShowCategoryPicker(false);
    };

    const handleUpdateCategory = async () => {
        if (!newCategoryName || !editingCategoryId) return;
        try {
            const updatedCategory = await FinanceService.updateCategory(editingCategoryId, {
                name: newCategoryName,
                color: newCategoryColor,
                type: formData.type
            });

            setCategories(categories.map(cat =>
                cat.id === editingCategoryId ? updatedCategory : cat
            ));

            setShowNewCategoryModal(false);
            setNewCategoryName('');
            setNewCategoryColor('#D4AF37');
            setEditingCategoryId(null);
            setIsEditingItem(false);
        } catch (error) {
            Alert.alert('Error', 'No se pudo actualizar la categoría');
        }
    };

    const handleDeleteCategory = async (categoryId: string) => {
        try {
            await FinanceService.deleteCategory(categoryId);
            setCategories(prev => prev.filter(cat => cat.id !== categoryId));
            if (formData.categoryId === categoryId) {
                setFormData({...formData, categoryId: undefined});
            }
            Alert.alert('Éxito', 'Categoría eliminada correctamente');
        } catch (error) {
            Alert.alert('Error', error instanceof Error ? error.message : 'No se pudo eliminar la categoría');
        }
    };

    // En FinanceEntryForm.tsx
    const handleUpdateTag = async () => {
        if (!newTagName || !editingTagId) return;
        try {
            const updatedTag = await FinanceService.updateTag(editingTagId, {
                name: newTagName,
                color: newTagColor
            });

            setTags(tags.map(tag =>
                tag.id === editingTagId ? updatedTag : tag
            ));

            setShowNewTagModal(false);
            setNewTagName('');
            setNewTagColor('#D4AF37');
            setEditingTagId(null);
            setIsEditingItem(false);
            Alert.alert('Éxito', 'Etiqueta actualizada correctamente');
        } catch (error) {
            console.error('Error updating tag:', error);
            let errorMessage = 'No se pudo actualizar la etiqueta';
            if (axios.isAxiosError(error)) {
                errorMessage = error.response?.data?.message || errorMessage;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
            Alert.alert('Error', errorMessage);
        }
    };

    const handleDeleteTag = async (tagId: string) => {
        try {
            await FinanceService.deleteTag(tagId);
            setTags(prevTags => prevTags.filter(tag => tag.id !== tagId));
            setSelectedTags(prev => prev.filter(id => id !== tagId));
            Alert.alert('Éxito', 'Etiqueta eliminada correctamente');
        } catch (error) {
            console.error('Error deleting tag:', error);
            Alert.alert('Error', error instanceof Error ? error.message : 'No se pudo eliminar la etiqueta');
        }
    };
    const handleEditTag = (tag: FinanceTag) => {
        setNewTagName(tag.name);
        setNewTagColor(tag.color);
        setEditingTagId(tag.id);
        setIsEditingItem(true);
        setShowNewTagModal(true);
        setShowTagPicker(false);
    };

    const handleSubmit = async () => {
        Keyboard.dismiss();
        const amount = parseAmountInput(formatAmountInput(rawAmount));

        if (!formData.title || amount <= 0) {
            Alert.alert('Error', 'Por favor completa todos los campos');
            return;
        }

        setLoading(true);
        try {
            if (isEditing && initialData?.id) {
                await FinanceService.updateEntry(initialData.id, {
                    title: formData.title,
                    description: formData.description,
                    amount: amount,
                    type: formData.type,
                    categoryId: formData.categoryId,
                    date: formData.date.toISOString(),
                    tagIds: selectedTags
                });
                Alert.alert('Éxito', 'Movimiento actualizado correctamente');
            } else {
                await FinanceService.createEntry({
                    ...formData,
                    amount: amount,
                    tagIds: selectedTags
                });
                Alert.alert('Éxito', 'Movimiento registrado correctamente');
            }

            setFormData({
                title: '',
                amount: 0,
                type: FinanceEntryType.EXPENSE,
                date: new Date(),
                description: '',
                categoryId: undefined,
                tagIds: []
            });
            setRawAmount('');
            setSelectedTags([]);
            onEntryAdded();
        } catch (error) {
            console.error('Error saving entry:', error);
            Alert.alert('Error', 'No se pudo guardar el movimiento');
        } finally {
            setLoading(false);
        }
    };

    const formatAmountInput = (value: string): string => {
        let numericValue = value.replace(/[^0-9]/g, '');
        if (numericValue === '') return '';
        numericValue = numericValue.replace(/^0+/, '');
        if (numericValue === '') numericValue = '0';
        while (numericValue.length < 3) {
            numericValue = '0' + numericValue;
        }
        const integerPart = numericValue.slice(0, -2);
        const decimalPart = numericValue.slice(-2);
        const formattedInteger = integerPart.length > 0
            ? parseInt(integerPart).toLocaleString('es-ES')
            : '0';
        return `${formattedInteger},${decimalPart}`;
    };

    const parseAmountInput = (formattedValue: string): number => {
        if (!formattedValue) return 0;
        const numericString = formattedValue
            .replace(/\./g, '')
            .replace(/,/g, '.');
        return parseFloat(numericString) || 0;
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
                color: newCategoryColor,
                icon: 'tag'
            });
            setCategories([...categories, newCategory]);
            setFormData({...formData, categoryId: newCategory.id});
            setShowNewCategoryModal(false);
            setNewCategoryName('');
            setNewCategoryColor('#D4AF37');
        } catch (error) {
            Alert.alert('Error', 'No se pudo crear la categoría');
        }
    };

    const handleCreateTag = async () => {
        if (!newTagName) return;
        try {
            const newTag = await FinanceService.createTag({
                name: newTagName,
                color: newTagColor
            });
            setTags(prevTags => [...prevTags, newTag]);
            setSelectedTags(prev => [...prev, newTag.id]);
            setShowNewTagModal(false);
            setNewTagName('');
            setNewTagColor('#D4AF37');
        } catch (error) {
            Alert.alert('Error', 'No se pudo crear la etiqueta');
        }
    };

    const toggleDatePicker = () => {
        Keyboard.dismiss();
        setShowDatePicker(!showDatePicker);
    };

    const handleCategoryPress = () => {
        Keyboard.dismiss();
        setShowCategoryPicker(true);
    };

    const handleTagPress = () => {
        Keyboard.dismiss();
        setShowTagPicker(true);
    };

    const openColorPicker = (forWhat: 'category' | 'tag') => {
        setColorPickerFor(forWhat);
        setShowColorPickerModal(true);
    };

    const handleColorSelected = (color: string) => {
        if (colorPickerFor === 'category') {
            setNewCategoryColor(color);
        } else {
            setNewTagColor(color);
        }
        setShowColorPickerModal(false);
    };

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

    const handleFocus = (ref: React.RefObject<TextInput | View>) => {
        if (Platform.OS !== 'web' && ref.current) {
            setTimeout(() => {
                if ('measure' in ref.current) {
                    ref.current.measure((x, y, width, height, pageX, pageY) => {
                        scrollViewRef.current?.scrollTo({ y: pageY - 100, animated: true });
                    });
                }
            }, 100);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1, backgroundColor: '#1c1c1c' }}
            keyboardVerticalOffset={Platform.OS === 'ios' ? (customStyles ? 100 : 0) : 0}
        >
            <ScrollView
                ref={scrollViewRef}
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
            >
                {!hideHeader && (
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>
                            {isEditing ? 'Editar Movimiento' : 'Nuevo Movimiento'}
                        </Text>
                        <TouchableOpacity
                            onPress={onCancel}
                            style={styles.closeButton}
                        >
                            <Icon name="close" size={24} color="#D4AF37" />
                        </TouchableOpacity>
                    </View>
                )}
                <View style={[styles.formContainer, customStyles && styles.customFormContainer]}>
                    <View style={styles.typeSelector}>
                        <TouchableOpacity
                            style={[styles.typeButton, formData.type === 'INCOME' && styles.typeButtonActive]}
                            onPress={() => setFormData({ ...formData, type: 'INCOME' as FinanceEntryType})}
                        >
                            <Icon
                                name="arrow-down"
                                size={20}
                                color={formData.type === 'INCOME' ? '#000' : '#4CAF50'}
                                style={styles.typeIcon}
                            />
                            <Text style={[styles.typeButtonText, formData.type === 'INCOME' && styles.typeButtonTextActive]}>
                                Ingreso
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.typeButton, formData.type === 'EXPENSE' && styles.typeButtonActive]}
                            onPress={() => setFormData({ ...formData, type: 'EXPENSE' as FinanceEntryType })}
                        >
                            <Icon
                                name="arrow-up"
                                size={20}
                                color={formData.type === 'EXPENSE' ? '#000' : '#F44336'}
                                style={styles.typeIcon}
                            />
                            <Text style={[styles.typeButtonText, formData.type === 'EXPENSE' && styles.typeButtonTextActive]}>
                                Gasto
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputGroup}>
                        <Icon name="format-title" size={20} color="#D4AF37" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Título del movimiento"
                            placeholderTextColor="#AAAAAA"
                            value={formData.title}
                            onChangeText={(title) => setFormData({ ...formData, title })}
                            returnKeyType="next"
                            onFocus={() => handleFocus(descriptionInputRef as React.RefObject<View>)}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Icon name="cash" size={20} color="#D4AF37" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Monto"
                            placeholderTextColor="#AAAAAA"
                            keyboardType="decimal-pad"
                            value={formatAmountInput(rawAmount)}
                            onChangeText={(text) => {
                                const numericValue = text.replace(/[^0-9]/g, '');
                                setRawAmount(numericValue);
                                const amount = parseAmountInput(formatAmountInput(numericValue));
                                setFormData({ ...formData, amount });
                            }}
                            returnKeyType="next"
                            onFocus={() => handleFocus(descriptionInputRef as React.RefObject<View>)}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Categoría</Text>
                        <TouchableOpacity
                            style={styles.dropdown}
                            onPress={handleCategoryPress}
                        >
                            <Text style={styles.dropdownText}>
                                {formData.categoryId ?
                                    categories.find(c => c.id === formData.categoryId)?.name :
                                    'Seleccionar categoría'}
                            </Text>
                            <Icon name="chevron-down" size={20} color="#D4AF37" />
                        </TouchableOpacity>
                    </View>

                    <Modal
                        visible={showCategoryPicker}
                        transparent={true}
                        animationType="fade"
                        onRequestClose={() => setShowCategoryPicker(false)}
                    >
                        <Pressable
                            style={styles.modalOverlay}
                            onPress={() => setShowCategoryPicker(false)}
                        >
                            <View style={styles.modalPickerContainer} onStartShouldSetResponder={() => true}>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>Seleccionar Categoría</Text>
                                    <TouchableOpacity
                                        onPress={() => setShowCategoryPicker(false)}
                                        style={styles.closeButton}
                                    >
                                        <Icon name="close" size={24} color="#D4AF37" />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.tabContainer}>
                                    <TouchableOpacity
                                        style={[styles.tabButton, activeCategoryTab === 'default' && styles.activeTab]}
                                        onPress={() => setActiveCategoryTab('default')}
                                    >
                                        <Text style={styles.tabText}>Por Defecto</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.tabButton, activeCategoryTab === 'user' && styles.activeTab]}
                                        onPress={() => setActiveCategoryTab('user')}
                                    >
                                        <Text style={styles.tabText}>Mis Categorías</Text>
                                    </TouchableOpacity>
                                </View>

                                <ScrollView style={styles.pickerScrollView}>
                                    {activeCategoryTab === 'default' ? (
                                        defaultCategories.filter(cat => cat.type === formData.type).map(category => (
                                            <View key={category.id} style={styles.pickerItemContainer}>
                                                <TouchableOpacity
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
                                            </View>
                                        ))
                                    ) : (
                                        userCategories.filter(cat => cat.type === formData.type).map(category => (
                                            <View key={category.id} style={styles.pickerItemContainer}>
                                                <TouchableOpacity
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
                                                <TouchableOpacity
                                                    style={styles.tagOptionsButton}
                                                    onPress={() => {
                                                        Alert.alert(
                                                            category.name,
                                                            '¿Qué acción deseas realizar?',
                                                            [
                                                                {
                                                                    text: 'Editar',
                                                                    onPress: () => handleEditCategory(category)
                                                                },
                                                                {
                                                                    text: 'Eliminar',
                                                                    onPress: () => handleDeleteCategory(category.id),
                                                                    style: 'destructive'
                                                                },
                                                                {
                                                                    text: 'Cancelar',
                                                                    style: 'cancel'
                                                                }
                                                            ]
                                                        );
                                                    }}
                                                >
                                                    <Icon name="dots-vertical" size={20} color="#AAAAAA" />
                                                </TouchableOpacity>
                                            </View>
                                        ))
                                    )}

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
                        </Pressable>
                    </Modal>

                    <Modal
                        visible={showNewCategoryModal}
                        transparent={true}
                        animationType="fade"
                        onRequestClose={() => setShowNewCategoryModal(false)}
                    >
                        <Pressable
                            style={styles.modalOverlay}
                            onPress={() => setShowNewCategoryModal(false)}
                        >
                            <View style={styles.modalContainer} onStartShouldSetResponder={() => true}>
                                <Text style={styles.modalTitle}>Nueva Categoría</Text>
                                <View style={styles.inputContainerModal}>
                                    <TextInput
                                        style={styles.inputVisible}
                                        placeholder="Nombre de la categoría"
                                        placeholderTextColor="#AAAAAA"
                                        value={newCategoryName}
                                        onChangeText={setNewCategoryName}
                                        autoFocus={true}
                                        selectionColor="#D4AF37"
                                    />
                                </View>

                                <View style={styles.colorPickerContainer}>
                                    <Text style={styles.label}>Color:</Text>
                                    <TouchableOpacity
                                        style={[styles.colorPreview, {backgroundColor: newCategoryColor}]}
                                        onPress={() => {
                                            setColorPickerFor('category');
                                            setShowColorPickerModal(true);
                                        }}
                                    >
                                        <View />
                                    </TouchableOpacity>
                                </View>

                                <ColorPickerModal
                                    visible={showColorPickerModal && colorPickerFor === 'category'}
                                    onClose={() => setShowColorPickerModal(false)}
                                    onColorSelected={(color) => {
                                        setNewCategoryColor(color);
                                        setShowColorPickerModal(false);
                                    }}
                                    initialColor={newCategoryColor}
                                    title="Color para categoría"
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
                                        onPress={isEditingItem ? handleUpdateCategory : handleCreateCategory}  // <-- Corregido
                                    >
                                        <Text style={styles.modalButtonText}>
                                            {isEditingItem ? 'Actualizar' : 'Crear'}
                                        </Text>
                                    </Pressable>
                                </View>
                            </View>
                        </Pressable>
                    </Modal>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Etiquetas</Text>
                        <View style={styles.tagsInputContainer}>
                            {selectedTags.map(tagId => {
                                const tag = tags.find(t => t.id === tagId);
                                return tag ? (
                                    <View key={tagId} style={[styles.selectedTag, {backgroundColor: tag.color}]}>
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
                                onPress={handleTagPress}
                            >
                                <Icon name="plus" size={20} color="#D4AF37" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <Modal
                        visible={showTagPicker}
                        transparent={true}
                        animationType="fade"
                        onRequestClose={() => setShowTagPicker(false)}
                    >
                        <Pressable
                            style={styles.modalOverlay}
                            onPress={() => setShowTagPicker(false)}
                        >
                            <View style={styles.modalPickerContainer} onStartShouldSetResponder={() => true}>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>Seleccionar Etiquetas</Text>
                                    <TouchableOpacity
                                        onPress={() => setShowTagPicker(false)}
                                        style={styles.closeButton}
                                    >
                                        <Icon name="close" size={24} color="#D4AF37" />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.tabContainer}>
                                    <TouchableOpacity
                                        style={[styles.tabButton, activeTagTab === 'default' && styles.activeTab]}
                                        onPress={() => setActiveTagTab('default')}
                                    >
                                        <Text style={styles.tabText}>Por Defecto</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.tabButton, activeTagTab === 'user' && styles.activeTab]}
                                        onPress={() => setActiveTagTab('user')}
                                    >
                                        <Text style={styles.tabText}>Mis Etiquetas</Text>
                                    </TouchableOpacity>
                                </View>

                                <ScrollView style={styles.pickerScrollView}>
                                    {activeTagTab === 'default' ? (
                                        defaultTags.filter(tag => !selectedTags.includes(tag.id)).map(tag => (
                                            <View key={tag.id} style={styles.pickerItemContainer}>
                                                <TouchableOpacity
                                                    style={styles.pickerItem}
                                                    onPress={() => {
                                                        setSelectedTags([...selectedTags, tag.id]);
                                                        setShowTagPicker(false);
                                                    }}
                                                >
                                                    <View style={[styles.tagColor, { backgroundColor: tag.color || '#D4AF37' }]} />
                                                    <Text style={styles.pickerItemText}>{tag.name}</Text>
                                                </TouchableOpacity>
                                            </View>
                                        ))
                                    ) : (
                                        userTags.filter(tag => !selectedTags.includes(tag.id)).map(tag => (
                                            <View key={tag.id} style={styles.pickerItemContainer}>
                                                <TouchableOpacity
                                                    style={styles.pickerItem}
                                                    onPress={() => {
                                                        setSelectedTags([...selectedTags, tag.id]);
                                                        setShowTagPicker(false);
                                                    }}
                                                >
                                                    <View style={[styles.tagColor, { backgroundColor: tag.color || '#D4AF37' }]} />
                                                    <Text style={styles.pickerItemText}>{tag.name}</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    style={styles.tagOptionsButton}
                                                    onPress={() => {
                                                        Alert.alert(
                                                            tag.name,
                                                            '¿Qué acción deseas realizar?',
                                                            [
                                                                {
                                                                    text: 'Editar',
                                                                    onPress: () => handleEditTag(tag)
                                                                },
                                                                {
                                                                    text: 'Eliminar',
                                                                    onPress: () => handleDeleteTag(tag.id),
                                                                    style: 'destructive'
                                                                },
                                                                {
                                                                    text: 'Cancelar',
                                                                    style: 'cancel'
                                                                }
                                                            ]
                                                        );
                                                    }}
                                                >
                                                    <Icon name="dots-vertical" size={20} color="#AAAAAA" />
                                                </TouchableOpacity>
                                            </View>
                                        ))
                                    )}

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
                        </Pressable>
                    </Modal>

                    <Modal
                        visible={showNewTagModal}
                        transparent={true}
                        animationType="fade"
                        onRequestClose={() => setShowNewTagModal(false)}
                    >
                        <Pressable
                            style={styles.modalOverlay}
                            onPress={() => setShowNewTagModal(false)}
                        >
                            <View style={styles.modalContainer} onStartShouldSetResponder={() => true}>
                                <Text style={styles.modalTitle}>Nueva Etiqueta</Text>
                                <View style={styles.inputContainerModal}>
                                    <TextInput
                                        style={styles.inputVisible}
                                        placeholder="Nombre de la etiqueta"
                                        placeholderTextColor="#AAAAAA"
                                        value={newTagName}
                                        onChangeText={setNewTagName}
                                        autoFocus={true}
                                        selectionColor="#D4AF37"
                                    />
                                </View>

                                <View style={styles.colorPickerContainer}>
                                    <Text style={styles.label}>Color:</Text>
                                    <TouchableOpacity
                                        style={[styles.colorPreview, {backgroundColor: newTagColor}]}
                                        onPress={() => {
                                            setColorPickerFor('tag');
                                            setShowColorPickerModal(true);
                                        }}
                                    >
                                        <View />
                                    </TouchableOpacity>
                                </View>

                                <ColorPickerModal
                                    visible={showColorPickerModal && colorPickerFor === 'tag'}
                                    onClose={() => setShowColorPickerModal(false)}
                                    onColorSelected={(color) => {
                                        setNewTagColor(color);
                                        setShowColorPickerModal(false);
                                    }}
                                    initialColor={newTagColor}
                                    title="Color para etiqueta"
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
                                        onPress={isEditingItem ? handleUpdateTag : handleCreateTag}
                                    >
                                        <Text style={styles.modalButtonText}>
                                            {isEditingItem ? 'Actualizar' : 'Crear'}
                                        </Text>
                                    </Pressable>

                                </View>
                            </View>
                        </Pressable>
                    </Modal>

                    <ColorPickerModal
                        visible={showColorPickerModal}
                        onClose={() => setShowColorPickerModal(false)}
                        onColorSelected={handleColorSelected}
                        initialColor={colorPickerFor === 'category' ? newCategoryColor : newTagColor}
                    />

                    {Platform.OS === 'web' ? <WebDatePicker /> : <MobileDatePicker />}

                    <View style={styles.inputGroup}>
                        <Icon name="text" size={20} color="#D4AF37" style={styles.inputIcon} />
                        <TextInput
                            ref={descriptionInputRef}
                            style={[styles.input, {height: Platform.OS === 'web' ? 100 : 50}]}
                            placeholder="Descripción (opcional)"
                            placeholderTextColor="#AAAAAA"
                            value={formData.description}
                            onChangeText={(description) => setFormData({ ...formData, description })}
                            multiline
                            returnKeyType="done"
                            onFocus={() => handleFocus(descriptionInputRef as React.RefObject<View>)}
                        />
                    </View>

                    <View style={styles.buttonContainer}>
                        {isEditing && (
                            <TouchableOpacity
                                style={[styles.actionButton, styles.cancelButton]}
                                onPress={onCancel}
                            >
                                <Text style={styles.cancelButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={[styles.actionButton, styles.submitButton]}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#000" />
                            ) : (
                                <Text style={styles.buttonText}>
                                    {isEditing ? 'Guardar' : 'Agregar Movimiento'}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default FinanceEntryForm;
