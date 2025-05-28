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
    Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { styles } from './FinanceScreen.styles';
import { FinanceService } from './finance.service';
import { FinanceEntry, SortOption, FilterOption } from './FinanceScreen.types';

interface FinanceListProps {
    refreshTrigger: boolean;
    currency: string;
    sortBy: SortOption;
    filterBy: FilterOption;
    onRefresh: () => void;
}

const FinanceList: React.FC<FinanceListProps> = ({
                                                     refreshTrigger,
                                                     currency,
                                                     sortBy,
                                                     filterBy,
                                                     onRefresh
                                                 }) => {
    const [entries, setEntries] = useState<FinanceEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEntry, setSelectedEntry] = useState<FinanceEntry | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editData, setEditData] = useState<Partial<FinanceEntry>>({});
    const [editLoading, setEditLoading] = useState(false);

    useEffect(() => {
        const loadEntries = async () => {
            try {
                let data = await FinanceService.getAllEntries();

                data = filterEntries(data, filterBy);
                data = sortEntries(data, sortBy);

                setEntries(data);
            } catch (error) {
                console.error('Error loading entries:', error);
            } finally {
                setLoading(false);
            }
        };

        loadEntries();
    }, [refreshTrigger, sortBy, filterBy]);

    const filterEntries = (entries: FinanceEntry[], filter: FilterOption): FinanceEntry[] => {
        const now = new Date();
        const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1));
        const threeMonthsAgo = new Date(now.setMonth(now.getMonth() - 3));

        switch(filter) {
            case 'income':
                return entries.filter(e => e.type === 'income');
            case 'expense':
                return entries.filter(e => e.type === 'expense');
            case 'lastMonth':
                return entries.filter(e => new Date(e.date) >= oneMonthAgo);
            case 'last3Months':
                return entries.filter(e => new Date(e.date) >= threeMonthsAgo);
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


    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const handleEntryPress = (entry: FinanceEntry) => {
        setSelectedEntry(entry);
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
                date: editData.date ? new Date(editData.date).toISOString() : new Date().toISOString()
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

    const openEditModal = () => {
        if (!selectedEntry) return;
        setEditData({
            title: selectedEntry.title,
            description: selectedEntry.description,
            amount: selectedEntry.amount,
            type: selectedEntry.type,
            date: selectedEntry.date
        });
        setShowEditModal(true);
    };

    const renderItem = ({ item }: { item: FinanceEntry }) => (
        <TouchableOpacity
            style={styles.entryItem}
            onPress={() => handleEntryPress(item)}
        >
            <View style={styles.entryIcon}>
                <Icon
                    name={item.type === 'income' ? 'arrow-down' : 'arrow-up'}
                    size={20}
                    color={item.type === 'income' ? '#4CAF50' : '#F44336'}
                />
            </View>
            <View style={styles.entryInfo}>
                <Text style={styles.entryTitle}>{item.title}</Text>
                <Text style={styles.entryDate}>{formatDate(item.date)}</Text>
                {item.description && (
                    <Text style={styles.entryDescription}>{item.description}</Text>
                )}
            </View>
            <Text style={[
                styles.entryAmount,
                item.type === 'income' ? styles.incomeAmount : styles.expenseAmount
            ]}>
                {currency}{item.amount}
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
        <>
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
                            <Text style={styles.detailLabel}>Tipo:</Text>
                            <Text style={[
                                styles.detailValue,
                                selectedEntry?.type === 'income' ? styles.incomeAmount : styles.expenseAmount
                            ]}>
                                {selectedEntry?.type === 'income' ? 'Ingreso' : 'Gasto'}
                            </Text>
                        </View>

                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Monto:</Text>
                            <Text style={[
                                styles.detailValue,
                                selectedEntry?.type === 'income' ? styles.incomeAmount : styles.expenseAmount
                            ]}>
                                {selectedEntry && `${currency}${selectedEntry.amount}`}
                            </Text>
                        </View>

                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Fecha:</Text>
                            <Text style={styles.detailValue}>
                                {selectedEntry && formatDate(selectedEntry.date)}
                            </Text>
                        </View>

                        {selectedEntry?.description && (
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Descripción:</Text>
                                <Text style={styles.detailValue}>
                                    {selectedEntry.description}
                                </Text>
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

            {/* Modal de Confirmación de Eliminación */}
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

            {/* Modal de Edición */}
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
                                style={[styles.typeButton, editData.type === 'income' && styles.typeButtonActive]}
                                onPress={() => setEditData({ ...editData, type: 'income' })}
                            >
                                <Text style={[styles.typeButtonText, editData.type === 'income' && styles.typeButtonTextActive]}>
                                    Ingreso
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.typeButton, editData.type === 'expense' && styles.typeButtonActive]}
                                onPress={() => setEditData({ ...editData, type: 'expense' })}
                            >
                                <Text style={[styles.typeButtonText, editData.type === 'expense' && styles.typeButtonTextActive]}>
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
                            value={editData.amount?.toString()}
                            onChangeText={(text) => {
                                const amount = parseFloat(text) || 0;
                                setEditData({ ...editData, amount });
                            }}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Fecha (YYYY-MM-DD)"
                            value={editData.date}
                            onChangeText={(date) => setEditData({ ...editData, date })}
                        />

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
                                    <ActivityIndicator color="#000" />
                                ) : (
                                    <Text style={styles.modalButtonText}>Guardar</Text>
                                )}
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
};

export default FinanceList;
