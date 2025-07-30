import React, { useEffect, useState, useRef } from 'react';
import {
    Alert,
    Keyboard,
    Modal,
    Platform,
    Pressable,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
    RefreshControl,
    FlatList,
    StyleSheet,
    TextInput
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { FinanceService } from '../../services/Finance.service';
import { CreateEntryDto, FinanceCategory, FinanceEntryType, FinanceTag, FinanceEntry, SortOption, FilterOption, MonthYear } from './FinanceScreen.types';
import ColorPicker from 'react-native-wheel-color-picker';
import { styles } from './FinanceList.styles';
import FinanceEntryForm from "./FinanceEntryForm";

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
                                                     setCategories,
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
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [allTags, setAllTags] = useState<FinanceTag[]>([]);
    const [rawAmount, setRawAmount] = useState('');
    const [localCategories, setLocalCategories] = useState<FinanceCategory[]>(categories);
    const [pendingDelete, setPendingDelete] = useState(false);

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

    useEffect(() => {
        if (pendingDelete && !showDetailModal) {
            setShowDeleteModal(true);
            setPendingDelete(false);
        }
    }, [pendingDelete, showDetailModal]);

    useEffect(() => {
        setLocalCategories(categories);
    }, [categories]);

    const formatDate = (date: Date | string): string => {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return dateObj.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const filterEntries = (entries: FinanceEntry[], filter: FilterOption): FinanceEntry[] => {
        const now = new Date();
        const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1));
        const threeMonthsAgo = new Date(now.setMonth(now.getMonth() - 3));

        switch (filter) {
            case 'income': return entries.filter(e => e.type === 'INCOME');
            case 'expense': return entries.filter(e => e.type === 'EXPENSE');
            case 'lastMonth': return entries.filter(e => new Date(e.date) >= oneMonthAgo);
            case 'last3Months': return entries.filter(e => new Date(e.date) >= threeMonthsAgo);
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
            default: return entries;
        }
    };

    const sortEntries = (entries: FinanceEntry[], sort: SortOption): FinanceEntry[] => {
        const sorted = [...entries];
        switch (sort) {
            case 'recent': return sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            case 'oldest': return sorted.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            case 'highest': return sorted.sort((a, b) => b.amount - a.amount);
            case 'lowest': return sorted.sort((a, b) => a.amount - b.amount);
            case 'type': return sorted.sort((a, b) => a.type.localeCompare(b.type));
            default: return sorted;
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

    const handleDeletePress = () => {
        setShowDetailModal(false);
        setPendingDelete(true);
    };

    const handleDelete = async () => {
        if (!selectedEntry) return;

        try {
            setLoading(true);
            await FinanceService.deleteEntry(selectedEntry.id);

            // Optimistic update
            setEntries(prev => prev.filter(e => e.id !== selectedEntry.id));
            setShowDeleteModal(false);

            Alert.alert('Éxito', 'Movimiento eliminado correctamente');
            onRefresh();
        } catch (error) {
            console.error('Error deleting entry:', error);
            Alert.alert('Error', 'No se pudo eliminar el movimiento');
        } finally {
            setLoading(false);
            setSelectedEntry(null);
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
        setSelectedTags(selectedEntry.tags?.map(tag => tag.id) || []);
        setRawAmount(selectedEntry.amount.toString().replace('.', '').replace(',', ''));
        setShowEditModal(true);
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
                                    setShowDetailModal(false);
                                    setTimeout(() => openEditModal(), 100);
                                }}
                            >
                                <Icon name="pencil" size={18} color="#000" />
                                <Text style={styles.modalButtonText}>Editar</Text>
                            </Pressable>

                            <Pressable
                                style={[styles.modalButton, styles.deleteButton]}
                                onPress={handleDeletePress}
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
                statusBarTranslucent={true}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer} onStartShouldSetResponder={() => true}>
                        <Text style={styles.modalTitle}>Confirmar eliminación</Text>
                        <Text style={styles.modalText}>¿Estás seguro que deseas eliminar este movimiento?</Text>

                        <View style={styles.modalButtonContainer}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setShowDeleteModal(false)}
                            >
                                <Text style={styles.modalButtonText}>Cancelar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalButton, styles.confirmButton]}
                                onPress={handleDelete}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#000" />
                                ) : (
                                    <Text style={styles.modalButtonText}>Eliminar</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal
                visible={showEditModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowEditModal(false)}
            >
                <View style={styles.fullScreenModalOverlay}>
                    <View style={styles.fullScreenModalContainer}>
                        <View style={styles.editModalHeader}>
                            <Text style={styles.editModalTitle}>Editar Movimiento</Text>
                            <TouchableOpacity
                                onPress={() => setShowEditModal(false)}
                                style={styles.editModalCloseButton}
                            >
                                <Icon name="close" size={24} color="#D4AF37" />
                            </TouchableOpacity>
                        </View>

                        <FinanceEntryForm
                            onEntryAdded={() => {
                                setShowEditModal(false);
                                onRefresh();
                            }}
                            categories={categories}
                            tags={allTags}
                            setCategories={setCategories}  
                            setTags={setAllTags}
                            initialData={{
                                ...selectedEntry,
                                category: selectedEntry?.category,
                                categoryId: selectedEntry?.categoryId,
                                tags: selectedEntry?.tags || []
                            }}
                            isEditing={true}
                            onCancel={() => setShowEditModal(false)}
                            hideHeader={true}
                            customStyles={true}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default FinanceList;
