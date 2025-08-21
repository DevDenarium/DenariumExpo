import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
  Modal,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { scheduleManagementStyles as styles } from './ScheduleManagement.styles';
import ScheduleBlockModal from './ScheduleBlockModal';
import { scheduleService } from '../../services/schedule.service';
import {
  ScheduleBlock,
  ScheduleBlockType,
  BLOCK_TYPE_LABELS,
  DAY_LABELS,
} from '../../types/schedule.types';

interface ScheduleManagementProps {
  navigation: any;
}

const ScheduleManagement: React.FC<ScheduleManagementProps> = ({ navigation }) => {
  const [scheduleBlocks, setScheduleBlocks] = useState<ScheduleBlock[]>([]);
  const [filteredBlocks, setFilteredBlocks] = useState<ScheduleBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<ScheduleBlockType | 'ALL'>('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editingBlock, setEditingBlock] = useState<ScheduleBlock | null>(null);

  const loadScheduleBlocks = async () => {
    try {
      const blocks = await scheduleService.getScheduleBlocks();
      setScheduleBlocks(blocks);
      applyFilter(blocks, activeFilter);
    } catch (error) {
      console.error('Error loading schedule blocks:', error);
      Alert.alert('Error', 'No se pudieron cargar los bloqueos de horario');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFilter = (blocks: ScheduleBlock[], filter: ScheduleBlockType | 'ALL') => {
    if (filter === 'ALL') {
      setFilteredBlocks(blocks);
    } else {
      setFilteredBlocks(blocks.filter(block => block.type === filter));
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadScheduleBlocks();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadScheduleBlocks();
  };

  const handleFilterPress = (filter: ScheduleBlockType | 'ALL') => {
    setActiveFilter(filter);
    applyFilter(scheduleBlocks, filter);
  };

  const handleDeleteBlock = async (blockId: string) => {
    Alert.alert(
      'Confirmar Eliminación',
      '¿Estás seguro de que quieres eliminar este bloqueo de horario?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await scheduleService.deleteScheduleBlock(blockId);
              await loadScheduleBlocks();
              Alert.alert('Éxito', 'Bloqueo eliminado correctamente');
            } catch (error) {
              console.error('Error deleting schedule block:', error);
              Alert.alert('Error', 'No se pudo eliminar el bloqueo');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    // Crear fecha en zona horaria local para evitar problemas de timezone
    const [year, month, day] = dateString.split('T')[0].split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (time: string) => {
    const [hour, minute] = time.split(':').map(Number);
    const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;
  };

  const renderScheduleBlock = ({ item }: { item: ScheduleBlock }) => {

    const renderContent = () => {
      switch (item.type) {
        case ScheduleBlockType.SPECIFIC_TIME:
          return (
            <>
              <Text style={styles.blockDate}>
                {item.date ? formatDate(item.date) : 'Fecha no especificada'}
              </Text>
              {item.startTime && item.endTime && (
                <Text style={styles.blockTime}>
                  {formatTime(item.startTime)} - {formatTime(item.endTime)}
                </Text>
              )}
            </>
          );

        case ScheduleBlockType.FULL_DAY:
          return (
            <Text style={styles.blockDate}>
              {item.date ? formatDate(item.date) : 'Fecha no especificada'}
            </Text>
          );

        case ScheduleBlockType.RECURRING:
          return (
            <>
              {item.startDate && item.endDate && (
                <Text style={styles.dateRange}>
                  {formatDate(item.startDate)} - {formatDate(item.endDate)}
                </Text>
              )}
              {item.startTime && item.endTime && (
                <Text style={styles.blockTime}>
                  {formatTime(item.startTime)} - {formatTime(item.endTime)}
                </Text>
              )}
              {item.daysOfWeek && item.daysOfWeek.length > 0 && (
                <View style={styles.blockDays}>
                  {item.daysOfWeek.map((day) => (
                    <View key={day} style={styles.dayChip}>
                      <Text style={styles.dayChipText}>
                        {DAY_LABELS[day].substring(0, 3)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </>
          );

        default:
          return null;
      }
    };

    return (
      <View style={styles.blockCard}>
        <View style={styles.blockHeader}>
          <Text style={styles.blockTypeLabel}>
            {BLOCK_TYPE_LABELS[item.type]}
          </Text>
          <View style={styles.blockActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => {
                setEditingBlock(item);
                setShowModal(true);
              }}
            >
              <Icon name="pencil" size={18} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDeleteBlock(item.id)}
            >
              <Icon name="delete" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.blockContent}>
          {renderContent()}
          {item.reason && (
            <Text style={styles.blockReason}>
              Razón: {item.reason}
            </Text>
          )}
        </View>
      </View>
    );
  };

  const filterButtons = [
    { key: 'ALL', label: 'Todos' },
    { key: ScheduleBlockType.SPECIFIC_TIME, label: 'Específicos' },
    { key: ScheduleBlockType.FULL_DAY, label: 'Día Completo' },
    { key: ScheduleBlockType.RECURRING, label: 'Recurrentes' },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D4AF37" />
        <Text style={styles.emptyText}>Cargando bloqueos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Administrar Horarios</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            setEditingBlock(null);
            setShowModal(true);
          }}
        >
          <Icon name="plus" size={20} color="#1c1c1c" />
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          {filterButtons.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterButton,
                activeFilter === filter.key && styles.filterButtonActive,
              ]}
              onPress={() => handleFilterPress(filter.key as ScheduleBlockType | 'ALL')}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  activeFilter === filter.key && styles.filterButtonTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.listContainer}>
        {filteredBlocks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="calendar-remove" size={80} color="#666" />
            <Text style={styles.emptyText}>
              {activeFilter === 'ALL'
                ? 'No hay bloqueos configurados'
                : `No hay bloqueos de tipo "${filterButtons.find(f => f.key === activeFilter)?.label}"`}
            </Text>
            <Text style={styles.emptySubtext}>
              {activeFilter === 'ALL'
                ? 'Los bloqueos de horario que agregues aparecerán aquí'
                : 'Prueba cambiando el filtro o agregando nuevos bloqueos'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredBlocks}
            renderItem={renderScheduleBlock}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={['#D4AF37']}
                tintColor="#D4AF37"
              />
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <ScheduleBlockModal
          visible={showModal}
          onClose={() => setShowModal(false)}
          editingBlock={editingBlock}
          onSuccess={() => {
            setShowModal(false);
            loadScheduleBlocks();
          }}
        />
      </Modal>
    </View>
  );
};

export default ScheduleManagement;
