import React, {useEffect, useState, useRef} from 'react';
import {
    Alert,
    Keyboard,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
    KeyboardAvoidingView,
    NativeMethods
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {FinanceService} from '../../services/Finance.service';
import {CreateEntryDto, FinanceCategory, FinanceEntryType, FinanceTag} from './FinanceScreen.types';
import { styles } from './FinanceEntryForm.styles';
import {registerLocale, setDefaultLocale} from "react-datepicker";
import {es} from 'date-fns/locale';
import ColorPicker from 'react-native-wheel-color-picker';

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
    categories: FinanceCategory[];
    tags: FinanceTag[];
    setCategories: React.Dispatch<React.SetStateAction<FinanceCategory[]>>;
    setTags: React.Dispatch<React.SetStateAction<FinanceTag[]>>;
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
    const [activeCategoryTab, setActiveCategoryTab] = useState<'default' | 'user'>('default');
    const [activeTagTab, setActiveTagTab] = useState<'default' | 'user'>('default');
    const defaultCategories = categories.filter(cat => cat.isDefault);
    const userCategories = categories.filter(cat => !cat.isDefault);
    const defaultTags = tags.filter(tag => tag.isDefault);
    const userTags = tags.filter(tag => !tag.isDefault);
    const [loading, setLoading] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);
    const [showTagPicker, setShowTagPicker] = useState(false);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
    const [newTagName, setNewTagName] = useState('');
    const [showNewTagModal, setShowNewTagModal] = useState(false);
    const [newCategoryColor, setNewCategoryColor] = useState('#D4AF37');
    const [newTagColor, setNewTagColor] = useState('#D4AF37');
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [colorPickerFor, setColorPickerFor] = useState<'category' | 'tag'>('category');
    const [rawAmount, setRawAmount] = useState('');
    const scrollViewRef = useRef<ScrollView>(null);
    const descriptionInputRef = useRef<TextInput>(null);

    const handleSubmit = async () => {
        Keyboard.dismiss();
        const amount = parseAmountInput(formatAmountInput(rawAmount));

        if (!formData.title || amount <= 0) {
            Alert.alert('Error', 'Por favor completa todos los campos');
            return;
        }

        setLoading(true);
        try {
            await FinanceService.createEntry({
                ...formData,
                amount: amount,
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
            setRawAmount('');
            setSelectedTags([]);
            onEntryAdded();
        } catch (error) {
            console.error('Error creating entry:', error);
            Alert.alert('Error', 'No se pudo registrar el movimiento');
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

    const filteredCategories = categories.filter(
        cat => cat.type === formData.type
    );

    const openColorPicker = (forWhat: 'category' | 'tag') => {
        Keyboard.dismiss();
        setColorPickerFor(forWhat);
        setShowColorPicker(true);
    };

    const handleColorChange = (color: string) => {
        if (colorPickerFor === 'category') {
            setNewCategoryColor(color);
        } else {
            setNewTagColor(color);
        }
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

    const handleFocus = (ref: React.RefObject<TextInput | View>) => {
        if (Platform.OS !== 'web' && ref.current) {
            setTimeout(() => {
                // Verificamos si el componente tiene el método measure
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
            style={{ flex: 1 }}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <ScrollView
                    ref={scrollViewRef}
                    contentContainerStyle={styles.scrollContainer}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.formContainer}>
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
                                onFocus={() => {
                                    if (descriptionInputRef.current) {
                                        handleFocus(descriptionInputRef as React.RefObject<View>);
                                    }
                                }} />
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
                                onFocus={() => {
                                    if (descriptionInputRef.current) {
                                        handleFocus(descriptionInputRef as React.RefObject<View>);
                                    }
                                }}
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
                            <TouchableOpacity
                                style={styles.modalOverlay}
                                activeOpacity={1}
                                onPress={() => setShowCategoryPicker(false)}
                            >
                                <View style={styles.modalPickerContainer}>
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
                                            <>
                                                {defaultCategories.filter(cat => cat.type === formData.type).map(category => (
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
                                            </>
                                        ) : (
                                            <>
                                                {userCategories.filter(cat => cat.type === formData.type).map(category => (
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
                                            </>
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
                            </TouchableOpacity>
                        </Modal>

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

                                    <View style={styles.colorPickerContainer}>
                                        <Text style={styles.label}>Color:</Text>
                                        <TouchableOpacity
                                            style={[styles.colorPreview, {backgroundColor: newCategoryColor}]}
                                            onPress={() => openColorPicker('category')}
                                        />
                                    </View>

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
                            <TouchableOpacity
                                style={styles.modalOverlay}
                                activeOpacity={1}
                                onPress={() => setShowTagPicker(false)}
                            >
                                <View style={styles.modalPickerContainer}>
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
                                            ))
                                        ) : (
                                            userTags.filter(tag => !selectedTags.includes(tag.id)).map(tag => (
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
                            </TouchableOpacity>
                        </Modal>

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

                                    <View style={styles.colorPickerContainer}>
                                        <Text style={styles.label}>Color:</Text>
                                        <TouchableOpacity
                                            style={[styles.colorPreview, {backgroundColor: newTagColor}]}
                                            onPress={() => openColorPicker('tag')}
                                        />
                                    </View>

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

                        <Modal
                            visible={showColorPicker}
                            transparent={true}
                            animationType="fade"
                            onRequestClose={() => setShowColorPicker(false)}
                        >
                            <View style={styles.colorPickerModal}>
                                <View style={styles.colorPickerContainer}>
                                    <ColorPicker
                                        color={colorPickerFor === 'category' ? newCategoryColor : newTagColor}
                                        onColorChange={handleColorChange}
                                        thumbSize={30}
                                        sliderSize={30}
                                        noSnap={true}
                                        row={false}
                                    />
                                    <TouchableOpacity
                                        style={styles.colorPickerDoneButton}
                                        onPress={() => setShowColorPicker(false)}
                                    >
                                        <Text style={styles.colorPickerDoneButtonText}>Listo</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Modal>

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
                                onFocus={() => {
                                    if (descriptionInputRef.current) {
                                        handleFocus(descriptionInputRef as React.RefObject<View>);
                                    }
                                }}
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            <Icon name="check" size={20} color="#000" style={styles.submitIcon} />
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
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

export default FinanceEntryForm;
