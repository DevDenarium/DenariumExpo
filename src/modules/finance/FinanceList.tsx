import React, { useEffect, useState, useRef } from 'react';
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
    ActivityIndicator,
    RefreshControl,
    FlatList,
    StyleSheet
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { FinanceService } from '../../services/Finance.service';
import { CreateEntryDto, FinanceCategory, FinanceEntryType, FinanceTag, FinanceEntry, SortOption, FilterOption, MonthYear } from './FinanceScreen.types';
import { registerLocale, setDefaultLocale } from "react-datepicker";
import { es } from 'date-fns/locale';
import ColorPicker from 'react-native-wheel-color-picker';
import { styles } from './FinanceList.styles';

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

interface FinanceListProps {
    refreshTrigger: boolean;
    currency: string;
    sortBy: SortOption;
    filterBy: FilterOption;
    onRefresh: () => void;
    selectedMonthYear?: MonthYear;
    categories: FinanceCategory[];
    userId: string;
    setCategories: React.Dispatch<React.SetStateAction<FinanceCategory[]>>;
    refreshing?: boolean;
    onRefreshTrigger?: () => void;
    headerComponent?: React.ReactElement | React.ComponentType<any> | null;
}

const FinanceList: React.FC<FinanceListProps> = ({
                                                     refreshTrigger,
                                                     currency,
                                                     sortBy,
                                                     filterBy,
                                                     onRefresh,
                                                     selectedMonthYear,
                                                     categories,
                                                     userId,
                                                     refreshing = false,
                                                     onRefreshTrigger = () => { },
                                                     headerComponent = null
                                                 }) => {
    const [entries, setEntries] = useState<FinanceEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEntry, setSelectedEntry] = useState<FinanceEntry | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editData, setEditData] = useState<Partial<FinanceEntry>>({});
    const [editLoading, setEditLoading] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [editDate, setEditDate] = useState<Date>(new Date());
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [allTags, setAllTags] = useState<FinanceTag[]>([]);
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);
    const [showTagPicker, setShowTagPicker] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
    const [newTagName, setNewTagName] = useState('');
    const [showNewTagModal, setShowNewTagModal] = useState(false);
    const [newCategoryColor, setNewCategoryColor] = useState('#D4AF37');
    const [newTagColor, setNewTagColor] = useState('#D4AF37');
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [colorPickerFor, setColorPickerFor] = useState<'category' | 'tag'>('category');
    const [rawAmount, setRawAmount] = useState('');
    const [activeCategoryTab, setActiveCategoryTab] = useState<'default' | 'user'>('default');
    const [activeTagTab, setActiveTagTab] = useState<'default' | 'user'>('default');
    const scrollViewRef = useRef<ScrollView>(null);
    const descriptionInputRef = useRef<TextInput>(null);
    const [localCategories, setLocalCategories] = useState<FinanceCategory[]>(categories);

    const defaultCategories = categories.filter(cat => cat.isDefault);
    const userCategories = categories.filter(cat => !cat.isDefault);
    const defaultTags = allTags.filter(tag => tag.isDefault);
    const userTags = allTags.filter(tag => !tag.isDefault);
    useEffect(() => {
        const loadEntriesAndTags = async () => {
            try {
                const [entriesData, tagsData] = await Promise.all([
                    FinanceService.getAllEntries(userId),
                    FinanceService.getTags()
                ]);

                const filteredEntries = filterEntries(entriesData, filterBy);
                const sortedEntries = sortEntries(filteredEntries, sortBy);

                setEntries(sortedEntries);
                setAllTags(tagsData);
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadEntriesAndTags();
    }, [refreshTrigger, sortBy, filterBy, selectedMonthYear, userId]);

    const formatDate = (date: Date | string): string => {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return dateObj.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'web') return;

        const currentDate = selectedDate || editDate;
        setShowDatePicker(Platform.OS === 'ios');
        setEditDate(currentDate);
        setEditData({ ...editData, date: currentDate.toISOString() });
    };

    const handleWebDateChange = (date: Date) => {
        setEditDate(date);
        setEditData({ ...editData, date: date.toISOString() });
    };

    const toggleDatePicker = () => {
        setShowDatePicker(!showDatePicker);
    };

    const WebDatePicker = () => {
        if (!ReactDatePicker) {
            return (
                <View style={[styles.dateInputContainer, { marginBottom: 0 }]}>
                    <TextInput
                        style={[styles.input, styles.dateInput]}
                        value={editDate ? formatDate(editDate) : ''}
                        placeholder="Seleccionar fecha"
                        editable={false}
                    />
                </View>
            );
        }

        return (
            <View style={[styles.datePickerContainer, styles.dateInputContainer]}>
                <ReactDatePicker
                    selected={editDate}
                    onChange={handleWebDateChange}
                    dateFormat="dd/MM/yyyy"
                    locale="es"
                    customInput={
                        <TextInput
                            style={[styles.input, styles.dateInput]}
                            value={formatDate(editDate)}
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
                        <Text style={{ color: editDate ? '#FFFFFF' : '#AAAAAA' }}>
                            {editDate ? formatDate(editDate) : 'Seleccionar fecha'}
                        </Text>
                        <Icon name="calendar" size={20} color="#D4AF37" />
                    </View>
                </TouchableOpacity>

                {showDatePicker && DateTimePicker && (
                    <View style={styles.datePickerWrapper}>
                        <DateTimePicker
                            value={editDate}
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

    const filterEntries = (entries: FinanceEntry[], filter: FilterOption): FinanceEntry[] => {
        const now = new Date();
        const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1));
        const threeMonthsAgo = new Date(now.setMonth(now.getMonth() - 3));

        switch (filter) {
            case 'income':
                return entries.filter(e => e.type === 'INCOME');
            case 'expense':
                return entries.filter(e => e.type === 'EXPENSE');
            case 'lastMonth':
                return entries.filter(e => new Date(e.date) >= oneMonthAgo);
            case 'last3Months':
                return entries.filter(e => new Date(e.date) >= threeMonthsAgo);
            case 'specificMonth':
                if (!selectedMonthYear) return entries;
                const selectedMonth = Number(selectedMonthYear.month);
                const selectedYear = Number(selectedMonthYear.year);
                return entries.filter(e => {
                    const entryDate = new Date(e.date);
                    return (
                        entryDate.getUTCMonth() === selectedMonth &&
                        entryDate.getUTCFullYear() === selectedYear
                    );
                });
            default:
                return entries;
        }
    };

    const sortEntries = (entries: FinanceEntry[], sort: SortOption): FinanceEntry[] => {
        const sorted = [...entries];

        switch (sort) {
            case 'recent':
                return sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            case 'oldest':
                return sorted.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            case 'highest':
                return sorted.sort((a, b) => b.amount - a.amount);
            case 'lowest':
                return sorted.sort((a, b) => a.amount - b.amount);
            case 'type':
                return sorted.sort((a, b) => a.type.localeCompare(b.type));
            default:
                return sorted;
        }
    };

    const handleEntryPress = (entry: FinanceEntry) => {
        const fullEntry = {
            ...entry,
            category: entry.categoryId ? categories.find(c => c.id === entry.categoryId) : undefined,
            tags: entry.tags || []
        };
        setSelectedEntry(fullEntry);
        setShowDetailModal(true);
    };

    const handleDelete = async () => {
        if (!selectedEntry) return;

        try {
            await FinanceService.deleteEntry(selectedEntry.id);
            setShowDeleteModal(false);
            setShowDetailModal(false);
            onRefresh();
            Alert.alert('Éxito', 'Movimiento eliminado correctamente');
        } catch (error) {
            console.error('Error deleting entry:', error);
            Alert.alert('Error', 'No se pudo eliminar el movimiento');
        }
    };

    const handleEdit = async () => {
        if (!selectedEntry || !editData) return;

        setEditLoading(true);
        try {
            const formattedData = {
                title: editData.title,
                description: editData.description,
                amount: Number(editData.amount),
                type: editData.type,
                categoryId: editData.categoryId,
                date: editDate.toISOString(),
                tagIds: selectedTags
            };

            await FinanceService.updateEntry(selectedEntry.id, formattedData);
            setShowEditModal(false);
            setShowDetailModal(false);
            onRefresh();
            Alert.alert('Éxito', 'Movimiento actualizado correctamente');
        } catch (error) {
            console.error('Error updating entry:', error);
            Alert.alert('Error', 'No se pudo actualizar el movimiento');
        } finally {
            setEditLoading(false);
        }
    };

    const getCategoryName = (categoryId?: string) => {
        if (!categoryId) return 'Sin categoría';
        const category = categories.find(c => c.id === categoryId);
        return category ? category.name : 'Sin categoría';
    };

    const formatAmount = (amount: number): string => {
        return new Intl.NumberFormat('de-DE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
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

    const openEditModal = () => {
        if (!selectedEntry) return;
        setEditData({
            title: selectedEntry.title,
            description: selectedEntry.description,
            amount: selectedEntry.amount,
            type: selectedEntry.type,
            date: selectedEntry.date,
            categoryId: selectedEntry.categoryId
        });
        setEditDate(new Date(selectedEntry.date));
        setSelectedTags(selectedEntry.tags?.map(tag => tag.id) || []);
        setRawAmount(selectedEntry.amount.toString().replace('.', '').replace(',', ''));
        setShowEditModal(true);
    };

    useEffect(() => {
        setLocalCategories(categories);
    }, [categories]);

    const handleCreateCategory = async () => {
        if (!newCategoryName) return;

        try {
            const newCategory = await FinanceService.createCategory({
                name: newCategoryName,
                type: editData.type as FinanceEntryType,
                color: newCategoryColor,
                icon: 'tag'
            });

            setLocalCategories([...localCategories, newCategory]);
            setEditData({ ...editData, categoryId: newCategory.id });
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

            setAllTags(prevTags => [...prevTags, newTag]);
            setSelectedTags(prev => [...prev, newTag.id]);
            setShowNewTagModal(false);
            setNewTagName('');
            setNewTagColor('#D4AF37');
        } catch (error) {
            Alert.alert('Error', 'No se pudo crear la etiqueta');
        }
    };

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

    const renderItem = ({ item }: { item: FinanceEntry }) => (
        <TouchableOpacity
            style={styles.entryItem}
            onPress={() => handleEntryPress(item)}
        >
            <View style={[
                styles.entryIcon,
                { backgroundColor: item.category?.color || '#333333' }
            ]}>
                <Icon
                    name={item.category?.icon || (item.type === 'INCOME' ? 'arrow-down' : 'arrow-up')}
                    size={20}
                    color="#FFFFFF"
                />
            </View>
            <View style={styles.entryInfo}>
                <Text style={styles.entryTitle}>{item.title}</Text>
                <Text style={styles.entryDate}>{formatDate(new Date(item.date))}</Text>
                <Text style={styles.entryCategory}>
                    {getCategoryName(item.categoryId)}
                </Text>
                {item.description && (
                    <Text style={styles.entryDescription}>{item.description}</Text>
                )}
                {item.tags && item.tags.length > 0 && (
                    <View style={styles.tagsContainer}>
                        {item.tags.map(tag => (
                            <View key={tag.id} style={[
                                styles.tagPill,
                                { backgroundColor: tag.color || '#D4AF37' }
                            ]}>
                                <Text style={styles.tagText}>{tag.name}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </View>
            <Text style={[
                styles.entryAmount,
                item.type === 'INCOME' ? styles.incomeAmount : styles.expenseAmount
            ]}>
                {currency}{formatAmount(item.amount)}
            </Text>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#D4AF37" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={entries}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No hay movimientos registrados</Text>
                    </View>
                }
                ListHeaderComponent={headerComponent || undefined}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefreshTrigger}
                        tintColor="#D4AF37"
                    />
                }
            />

            <Modal
                animationType="fade"
                transparent={true}
                visible={showDetailModal}
                onRequestClose={() => setShowDetailModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>{selectedEntry?.title}</Text>

                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Monto:</Text>
                            <Text style={[
                                styles.detailValue,
                                selectedEntry?.type === 'INCOME' ? styles.incomeAmount : styles.expenseAmount
                            ]}>
                                {selectedEntry && `${currency}${formatAmount(selectedEntry.amount)}`}
                            </Text>
                        </View>

                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Fecha:</Text>
                            <Text style={styles.detailValue}>
                                {selectedEntry && formatDate(selectedEntry.date)}
                            </Text>
                        </View>

                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Categoría:</Text>
                            <View style={styles.categoryContainer}>
                                {selectedEntry?.category && (
                                    <>
                                        <View style={[
                                            styles.entryIcon,
                                            {
                                                width: 20,
                                                height: 20,
                                                backgroundColor: selectedEntry.category.color || '#333333'
                                            }
                                        ]}>
                                            <Icon
                                                name={selectedEntry.category.icon || 'tag'}
                                                size={12}
                                                color="#FFFFFF"
                                            />
                                        </View>
                                        <Text style={styles.categoryText}>
                                            {selectedEntry.category.name}
                                        </Text>
                                    </>
                                )}
                            </View>
                        </View>

                        {selectedEntry?.description && (
                            <View style={styles.detailDescriptionContainer}>
                                <Text style={styles.detailLabel}>Descripción:</Text>
                                <View style={styles.descriptionTextContainer}>
                                    <Text style={styles.detailValue}>
                                        {selectedEntry.description}
                                    </Text>
                                </View>
                            </View>
                        )}
                        {selectedEntry?.tags && selectedEntry.tags.length > 0 && (
                            <View style={styles.detailTagsContainer}>
                                <Text style={styles.detailLabel}>Etiquetas:</Text>
                                <View style={styles.tagsContainerModal}>
                                    {selectedEntry.tags.map(tag => (
                                        <View
                                            key={tag.id}
                                            style={[
                                                styles.tagPillModal,
                                                { backgroundColor: tag.color || '#D4AF37' }
                                            ]}
                                        >
                                            <Text style={styles.tagTextModal}>{tag.name}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        <View style={styles.modalButtonContainer}>
                            <Pressable
                                style={[styles.modalButton, styles.editButton]}
                                onPress={() => {
                                    setShowDetailModal(false); // Cierra primero el modal de detalle
                                    setTimeout(() => openEditModal(), 100); // Abre el modal de edición con un pequeño retraso
                                }}
                            >
                                <Icon name="pencil" size={18} color="#000" />
                                <Text style={styles.modalButtonText}>Editar</Text>
                            </Pressable>

                            <Pressable
                                style={[styles.modalButton, styles.deleteButton]}
                                onPress={() => setShowDeleteModal(true)}
                            >
                                <Icon name="trash-can" size={18} color="#000" />
                                <Text style={styles.modalButtonText}>Eliminar</Text>
                            </Pressable>
                        </View>

                        <Pressable
                            style={styles.closeButton}
                            onPress={() => setShowDetailModal(false)}
                        >
                            <Text style={styles.closeButtonText}>Cerrar</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            <Modal
                animationType="fade"
                transparent={true}
                visible={showDeleteModal}
                onRequestClose={() => setShowDeleteModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Confirmar eliminación</Text>
                        <Text style={styles.modalText}>¿Estás seguro que deseas eliminar este movimiento?</Text>

                        <View style={styles.modalButtonContainer}>
                            <Pressable
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setShowDeleteModal(false)}
                            >
                                <Text style={styles.modalButtonText}>Cancelar</Text>
                            </Pressable>

                            <Pressable
                                style={[styles.modalButton, styles.confirmButton]}
                                onPress={handleDelete}
                            >
                                <Text style={styles.modalButtonText}>Eliminar</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal
                visible={showEditModal}
                animationType="slide" // Prueba con "fade" o "none"
                transparent={true}
                onRequestClose={() => setShowEditModal(false)}
                hardwareAccelerated={true} // Solo Android
                statusBarTranslucent={true}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                    keyboardVerticalOffset={Platform.select({ ios: 60, android: 20 })}
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                        <ScrollView
                            contentContainerStyle={styles.scrollContainer}
                            keyboardShouldPersistTaps="handled"
                        >
                            <View style={styles.modalOverlay}>
                                <View style={[styles.formContainer, { width: '90%' }]}>
                                    <Text style={styles.modalTitle}>Editar Movimiento</Text>

                                    <View style={styles.typeSelector}>
                                        <TouchableOpacity
                                            style={[styles.typeButton, editData.type === 'INCOME' && styles.typeButtonActive]}
                                            onPress={() => setEditData({ ...editData, type: 'INCOME' as FinanceEntryType })}
                                        >
                                            <Icon
                                                name="arrow-down"
                                                size={20}
                                                color={editData.type === 'INCOME' ? '#000' : '#4CAF50'}
                                                style={styles.typeIcon}
                                            />
                                            <Text style={[styles.typeButtonText, editData.type === 'INCOME' && styles.typeButtonTextActive]}>
                                                Ingreso
                                            </Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[styles.typeButton, editData.type === 'EXPENSE' && styles.typeButtonActive]}
                                            onPress={() => setEditData({ ...editData, type: 'EXPENSE' as FinanceEntryType })}
                                        >
                                            <Icon
                                                name="arrow-up"
                                                size={20}
                                                color={editData.type === 'EXPENSE' ? '#000' : '#F44336'}
                                                style={styles.typeIcon}
                                            />
                                            <Text style={[styles.typeButtonText, editData.type === 'EXPENSE' && styles.typeButtonTextActive]}>
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
                                            value={editData.title}
                                            onChangeText={(title) => setEditData({ ...editData, title })}
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
                                                setEditData({ ...editData, amount });
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
                                            onPress={() => setShowCategoryPicker(true)}
                                        >
                                            <Text style={styles.dropdownText}>
                                                {editData.categoryId ?
                                                    categories.find(c => c.id === editData.categoryId)?.name :
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
                                                            {defaultCategories.filter(cat => cat.type === editData.type).map(category => (
                                                                <TouchableOpacity
                                                                    key={category.id}
                                                                    style={styles.pickerItem}
                                                                    onPress={() => {
                                                                        setEditData({ ...editData, categoryId: category.id });
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
                                                            {userCategories.filter(cat => cat.type === editData.type).map(category => (
                                                                <TouchableOpacity
                                                                    key={category.id}
                                                                    style={styles.pickerItem}
                                                                    onPress={() => {
                                                                        setEditData({ ...editData, categoryId: category.id });
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
                                                        <Text style={[styles.pickerItemText, { color: '#D4AF37' }]}>Crear nueva categoría</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity
                                                        style={styles.pickerItem}
                                                        onPress={() => {
                                                            setEditData({ ...editData, categoryId: undefined });
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
                                                        style={[styles.colorPreview, { backgroundColor: newCategoryColor }]}
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
                                                const tag = allTags.find(t => t.id === tagId);
                                                return tag ? (
                                                    <View key={tagId} style={[styles.selectedTag, { backgroundColor: tag.color }]}>
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
                                                        <Text style={[styles.pickerItemText, { color: '#D4AF37' }]}>Crear nueva etiqueta</Text>
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
                                                        style={[styles.colorPreview, { backgroundColor: newTagColor }]}
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
                                            style={[styles.input, { height: Platform.OS === 'web' ? 100 : 50 }]}
                                            placeholder="Descripción (opcional)"
                                            placeholderTextColor="#AAAAAA"
                                            value={editData.description}
                                            onChangeText={(description) => setEditData({ ...editData, description })}
                                            multiline
                                            returnKeyType="done"
                                            onFocus={() => {
                                                if (descriptionInputRef.current) {
                                                    handleFocus(descriptionInputRef as React.RefObject<View>);
                                                }
                                            }}
                                        />
                                    </View>

                                    <View style={styles.modalButtonContainer}>
                                        <Pressable
                                            style={[styles.modalButton, styles.cancelButton]}
                                            onPress={() => setShowEditModal(false)}
                                        >
                                            <Text style={styles.modalButtonText}>Cancelar</Text>
                                        </Pressable>

                                        <Pressable
                                            style={[styles.modalButton, styles.confirmButton]}
                                            onPress={handleEdit}
                                            disabled={editLoading}
                                        >
                                            {editLoading ? (
                                                <ActivityIndicator color="#000" />
                                            ) : (
                                                <Text style={styles.modalButtonText}>Guardar</Text>
                                            )}
                                        </Pressable>
                                    </View>
                                </View>
                            </View>
                        </ScrollView>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
};

export default FinanceList;
