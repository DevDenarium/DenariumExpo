import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    Modal,
    TextInput,
    ActivityIndicator,
    Alert,
    StyleSheet,
    ScrollView,
    ViewStyle,
} from 'react-native';
import { styles } from './AppointmentManagement.styles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Appointment, AppointmentManagementProps, AppointmentStatus} from './AppointmentManagement.types';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, isBefore } from 'date-fns';
import { es } from 'date-fns/locale';

const API_BASE_URL = 'http://localhost:3000';

const AppointmentManagement: React.FC<AppointmentManagementProps> = ({ navigation }) => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [actionType, setActionType] = useState<'confirm' | 'reschedule' | 'cancel'>('confirm');

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                navigation.navigate('Login', { message: undefined });
                return;
            }

            const response = await axios.get(`${API_BASE_URL}/appointments`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setAppointments(response.data);
        } catch (error) {
            console.error('Error fetching appointments:', error);
            Alert.alert('Error', 'No se pudieron cargar las citas');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmAppointment = async () => {
        if (!selectedAppointment) return;

        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                navigation.navigate('Login', { message: undefined });
                return;
            }

            await axios.put(
                `${API_BASE_URL}/appointments/${selectedAppointment.id}/confirm`,
                { date: selectedDate.toISOString() },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setShowModal(false);
            fetchAppointments();
            resetForm();
        } catch (error) {
            console.error('Error confirming appointment:', error);
            Alert.alert('Error', 'No se pudo confirmar la cita');
        }
    };

    const handleRescheduleAppointment = async () => {
        if (!selectedAppointment) return;

        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                navigation.navigate('Login', { message: undefined });
                return;
            }

            await axios.put(
                `${API_BASE_URL}/appointments/${selectedAppointment.id}/reschedule`,
                { date: selectedDate.toISOString() },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setShowModal(false);
            fetchAppointments();
            resetForm();
        } catch (error) {
            console.error('Error rescheduling appointment:', error);
            Alert.alert('Error', 'No se pudo reagendar la cita');
        }
    };

    const handleCancelAppointment = async () => {
        if (!selectedAppointment) return;

        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                navigation.navigate('Login', { message: undefined });
                return;
            }

            await axios.put(
                `${API_BASE_URL}/appointments/${selectedAppointment.id}/cancel`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setShowModal(false);
            fetchAppointments();
            resetForm();
        } catch (error) {
            console.error('Error canceling appointment:', error);
            Alert.alert('Error', 'No se pudo cancelar la cita');
        }
    };

    const resetForm = () => {
        setSelectedDate(new Date());
        setSelectedAppointment(null);
        setActionType('confirm');
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return format(date, "dd/MM/yyyy HH:mm", { locale: es });
    };

    const getStatusStyle = (status: AppointmentStatus): [{ backgroundColor: string }, { color: string }] => {
        switch (status) {
            case 'PENDING':
                return [styles.statusPending, styles.statusTextPending];
            case 'CONFIRMED':
                return [styles.statusConfirmed, styles.statusTextConfirmed];
            case 'CANCELLED':
                return [styles.statusCancelled, styles.statusTextCancelled];
            case 'RESCHEDULED':
                return [styles.statusRescheduled, styles.statusTextRescheduled];
            case 'REJECTED':
                return [styles.statusCancelled, styles.statusTextCancelled];
            case 'COMPLETED':
                return [styles.statusConfirmed, styles.statusTextConfirmed];
            default:
                return [styles.statusPending, styles.statusTextPending];
        }
    };

    const getStatusText = (status: AppointmentStatus) => {
        switch (status) {
            case 'PENDING': return 'PENDIENTE';
            case 'CONFIRMED': return 'CONFIRMADA';
            case 'CANCELLED': return 'CANCELADA';
            case 'RESCHEDULED': return 'REAGENDADA';
            case 'REJECTED': return 'RECHAZADA';
            case 'COMPLETED': return 'COMPLETADA';
            default: return status;
        }
    };

    const handleDateChange = (event: any, date?: Date) => {
        setShowDatePicker(false);
        if (date) {
            setSelectedDate(date);
        }
    };

    const renderAppointmentCard = ({ item }: { item: Appointment }) => {
        const [statusContainerStyle, statusTextStyle] = getStatusStyle(item.status);

        return (
            <View style={styles.appointmentCard}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <View style={[styles.cardStatus, statusContainerStyle]}>
                        <Text style={[styles.statusText, statusTextStyle]}>
                            {getStatusText(item.status)}
                        </Text>
                    </View>
                </View>
                <View style={styles.cardBody}>
                    {item.description && (
                        <Text style={styles.cardDescription}>{item.description}</Text>
                    )}
                    <Text style={styles.cardDate}>
                        <Text style={{ fontWeight: 'bold' }}>Solicitada:</Text> {formatDate(item.requestedDate)}
                    </Text>
                    {item.suggestedDate && (
                        <Text style={styles.cardDate}>
                            <Text style={{ fontWeight: 'bold' }}>Sugerida:</Text> {formatDate(item.suggestedDate)}
                        </Text>
                    )}
                    {item.confirmedDate && (
                        <Text style={styles.cardDate}>
                            <Text style={{ fontWeight: 'bold' }}>Confirmada:</Text> {formatDate(item.confirmedDate)}
                        </Text>
                    )}
                    {item.user && (
                        <Text style={styles.cardDate}>
                            <Text style={{ fontWeight: 'bold' }}>Cliente:</Text> {item.user.firstName} {item.user.lastName} ({item.user.email})
                        </Text>
                    )}
                    <Text style={styles.cardDate}>
                        <Text style={{ fontWeight: 'bold' }}>Duración:</Text> {item.duration} minutos
                    </Text>
                </View>
                <View style={styles.cardFooter}>
                    {item.status === 'PENDING' && (
                        <>
                            <TouchableOpacity
                                style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
                                onPress={() => {
                                    setSelectedAppointment(item);
                                    setSelectedDate(new Date(item.requestedDate));
                                    setActionType('confirm');
                                    setShowModal(true);
                                }}
                            >
                                <Icon name="check" size={20} color="#FFFFFF" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionButton, { backgroundColor: '#2196F3' }]}
                                onPress={() => {
                                    setSelectedAppointment(item);
                                    setSelectedDate(new Date(item.requestedDate));
                                    setActionType('reschedule');
                                    setShowModal(true);
                                }}
                            >
                                <Icon name="calendar-clock" size={20} color="#FFFFFF" />
                            </TouchableOpacity>
                        </>
                    )}
                    {(item.status === 'PENDING' || item.status === 'CONFIRMED' || item.status === 'RESCHEDULED') && (
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: '#F44336' }]}
                            onPress={() => {
                                setSelectedAppointment(item);
                                setActionType('cancel');
                                setShowModal(true);
                            }}
                        >
                            <Icon name="close" size={20} color="#FFFFFF" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#D4AF37" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Gestión de Citas</Text>
            </View>

            {appointments.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Icon name="calendar-remove" size={60} color="#AAAAAA" />
                    <Text style={styles.emptyText}>No hay citas pendientes</Text>
                </View>
            ) : (
                <FlatList
                    data={appointments}
                    renderItem={renderAppointmentCard}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContainer}
                />
            )}

            <Modal
                visible={showModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => {
                    setShowModal(false);
                    resetForm();
                }}
            >
                <View style={styles.modalOverlay}>
                    <ScrollView style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>
                            {actionType === 'confirm' ? 'Confirmar Cita' :
                                actionType === 'reschedule' ? 'Reagendar Cita' : 'Cancelar Cita'}
                        </Text>

                        {(actionType === 'confirm' || actionType === 'reschedule') && (
                            <View style={styles.datePickerContainer}>
                                <TouchableOpacity
                                    style={styles.datePickerButton}
                                    onPress={() => setShowDatePicker(true)}
                                >
                                    <Text style={styles.datePickerText}>
                                        {format(selectedDate, "dd/MM/yyyy HH:mm", { locale: es })}
                                    </Text>
                                    <Icon name="calendar" size={20} color="#D4AF37" />
                                </TouchableOpacity>
                            </View>
                        )}

                        {showDatePicker && (
                            <DateTimePicker
                                value={selectedDate}
                                mode="datetime"
                                display="default"
                                minimumDate={new Date()}
                                onChange={handleDateChange}
                            />
                        )}

                        {actionType === 'cancel' && (
                            <Text style={{ color: '#FFFFFF', textAlign: 'center', marginBottom: 20 }}>
                                ¿Estás seguro que deseas cancelar esta cita?
                            </Text>
                        )}

                        <View style={styles.modalButtonContainer}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => {
                                    setShowModal(false);
                                    resetForm();
                                }}
                            >
                                <Text style={styles.modalButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.confirmButton]}
                                onPress={() => {
                                    if (actionType === 'confirm') {
                                        handleConfirmAppointment();
                                    } else if (actionType === 'reschedule') {
                                        handleRescheduleAppointment();
                                    } else {
                                        handleCancelAppointment();
                                    }
                                }}
                            >
                                <Text style={styles.modalButtonText}>
                                    {actionType === 'confirm' ? 'Confirmar' :
                                        actionType === 'reschedule' ? 'Reagendar' : 'Cancelar Cita'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
};

export default AppointmentManagement;
