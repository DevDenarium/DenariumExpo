import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Modal,
    Pressable,
    TextInput,
    Alert,
    Platform,
    StyleSheet
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { styles } from './FinanceList.styles';
import { FinanceService } from '../../services/Finance.service';
import {FinanceEntry, SortOption, FilterOption, MonthYear, FinanceEntryType, FinanceCategory} from './FinanceScreen.types';
import { registerLocale, setDefaultLocale } from "react-datepicker";
import { es } from 'date-fns/locale';

interface FinanceListProps {
    refreshTrigger: boolean;
    currency: string;
    sortBy: SortOption;
    filterBy: FilterOption;
    onRefresh: () => void;
    selectedMonthYear?: MonthYear;
    categories: FinanceCategory[];
    userId: string;
}

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

registerLocale('es', es);
setDefaultLocale('es');

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

const FinanceList: React.FC<FinanceListProps> = ({
                                                     refreshTrigger,
                                                     currency,
                                                     sortBy,
                                                     filterBy,
                                                     onRefresh,
                                                     selectedMonthYear,
                                                     categories,
                                                     userId
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
    const [allTags, setAllTags] = useState<{id: string, color: string, name: string}[]>([]);
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);
    const [showTagPicker, setShowTagPicker] = useState(false);

    useEffect(() => {
        const loadEntriesAndTags = async () => {
            try {
                console.log('Cargando entradas y etiquetas...');
                const [entriesData, tagsData] = await Promise.all([
                    FinanceService.getAllEntries(userId),
                    FinanceService.getTags()
                ]);

                console.log('Datos de entradas recibidos:', entriesData);
                console.log('Datos de etiquetas recibidos:', tagsData);

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

        switch(filter) {
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

        switch(sort) {
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
        console.log('Entrada seleccionada:', entry);
        const fullEntry = {
            ...entry,
            category: entry.categoryId ? categories.find(c => c.id === entry.categoryId) : undefined,
            tags: entry.tags || []
        };
        console.log('Entrada completa preparada:', fullEntry);
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
        setShowEditModal(true);
    };

    const formatAmount = (amount: number): string => {
        return new Intl.NumberFormat('de-DE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
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
        <View style={{ flex: 1 }}>
            <FlatList
                data={entries}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No hay movimientos registrados</Text>
                    </View>
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
                                onPress={openEditModal}
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
                animationType="fade"
                transparent={true}
                visible={showEditModal}
                onRequestClose={() => setShowEditModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContainer, { width: '90%' }]}>
                        <Text style={styles.modalTitle}>Editar Movimiento</Text>

                        <View style={styles.typeSelector}>
                            <TouchableOpacity
                                style={[styles.typeButton, editData.type === 'INCOME' && styles.typeButtonActive]}
                                onPress={() => setEditData({ ...editData, type: 'INCOME' as FinanceEntryType })}
                            >
                                <Text style={[styles.typeButtonText, editData.type === 'INCOME' && styles.typeButtonTextActive]}>
                                    Ingreso
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.typeButton, editData.type === 'EXPENSE' && styles.typeButtonActive]}
                                onPress={() => setEditData({ ...editData, type: 'EXPENSE' as FinanceEntryType })}
                            >
                                <Text style={[styles.typeButtonText, editData.type === 'EXPENSE' && styles.typeButtonTextActive]}>
                                    Gasto
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            style={styles.input}
                            placeholder="Título"
                            value={editData.title}
                            onChangeText={(title) => setEditData({ ...editData, title })}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Monto"
                            keyboardType="numeric"
                            value={editData.amount ? formatAmount(editData.amount) : ''}
                            onChangeText={(text) => {
                                const cleanValue = text.replace(/[^0-9.]/g, '');
                                const amount = parseFloat(cleanValue) || 0;
                                setEditData({ ...editData, amount });
                            }}
                        />

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

                        {showCategoryPicker && (
                            <View style={styles.pickerContainer}>
                                {categories.map(category => (
                                    <TouchableOpacity
                                        key={category.id}
                                        style={styles.pickerItem}
                                        onPress={() => {
                                            setEditData({ ...editData, categoryId: category.id });
                                            setShowCategoryPicker(false);
                                        }}
                                    >
                                        <View style={[
                                            styles.categoryIcon,
                                            { backgroundColor: category.color || '#333333' }
                                        ]}>
                                            <Icon name={category.icon || 'tag'} size={14} color="#FFFFFF" />
                                        </View>
                                        <Text style={styles.pickerItemText}>{category.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Etiquetas</Text>
                            <View style={styles.tagsInputContainer}>
                                {selectedTags.map(tagId => {
                                    const tag = allTags.find(t => t.id === tagId);
                                    return tag ? (
                                        <View key={tagId} style={[
                                            styles.selectedTag,
                                            { backgroundColor: tag.color || '#D4AF37' }
                                        ]}>
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

                        {showTagPicker && (
                            <View style={styles.pickerContainer}>
                                {allTags.map(tag => (
                                    <TouchableOpacity
                                        key={tag.id}
                                        style={styles.pickerItem}
                                        onPress={() => {
                                            if (!selectedTags.includes(tag.id)) {
                                                setSelectedTags([...selectedTags, tag.id]);
                                            }
                                            setShowTagPicker(false);
                                        }}
                                    >
                                        <View style={[styles.tagColor, { backgroundColor: tag.color || '#D4AF37' }]} />
                                        <Text style={styles.pickerItemText}>{tag.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                        {Platform.OS === 'web' ? <WebDatePicker /> : <MobileDatePicker />}

                        <TextInput
                            style={styles.input}
                            placeholder="Descripción (opcional)"
                            value={editData.description}
                            onChangeText={(description) => setEditData({ ...editData, description })}
                            multiline
                        />

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
                                    <View style={styles.loadingContainer}>
                                        <ActivityIndicator color="#000" />
                                    </View>
                                ) : (
                                    <Text style={styles.modalButtonText}>Guardar</Text>
                                )}
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default FinanceList;
