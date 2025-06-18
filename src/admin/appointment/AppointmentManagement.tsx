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
    Platform,
} from 'react-native';
import { styles } from './AppointmentManagement.styles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Appointment, AppointmentManagementProps, AppointmentStatus} from './AppointmentManagement.types';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format, isBefore, isSameDay, isSameMonth, isSameYear, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { registerLocale, setDefaultLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

registerLocale('es', es);
setDefaultLocale('es');

// Definición de tipos para los pickers
type DateTimePickerProps = {
    value: Date;
    mode: 'date' | 'time' | 'datetime';
    display: 'default' | 'spinner' | 'compact' | 'inline';
    onChange: (event: any, date?: Date) => void;
    minimumDate?: Date;
};

type ReactDatePickerProps = {
    selected?: Date | null;
    onChange: (date: Date) => void;
    showTimeSelect?: boolean;
    timeFormat?: string;
    timeIntervals?: number;
    dateFormat?: string;
    locale?: string;
    minDate?: Date;
    inline?: boolean;
    customInput?: React.ReactElement;
};

let DateTimePicker: React.ComponentType<DateTimePickerProps> | null = null;
let ReactDatePicker: React.ComponentType<ReactDatePickerProps> | undefined;

if (Platform.OS === 'web') {
    try {
        const rdp = require('react-datepicker');
        ReactDatePicker = rdp.default;
    } catch (error) {
        console.error('Error al cargar react-datepicker:', error);
    }
} else {
    try {
        const dtp = require('@react-native-community/datetimepicker');
        DateTimePicker = dtp.default;
    } catch (error) {
        console.error('Error al cargar DateTimePicker:', error);
    }
}

const API_BASE_URL = 'http://localhost:3000';

type FilterType = 'day' | 'month' | 'none';
type StatusFilter = 'upcoming' | 'pending' | 'cancelled' | 'all';

const AppointmentManagement: React.FC<AppointmentManagementProps> = ({ navigation }) => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [actionType, setActionType] = useState<'confirm' | 'reschedule' | 'cancel'>('confirm');
    const [filterType, setFilterType] = useState<FilterType>('none');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [filterDate, setFilterDate] = useState<Date | null>(null);
    const [showMonthPicker, setShowMonthPicker] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [showCalendar, setShowCalendar] = useState(false); // Nuevo estado para controlar la visibilidad del calendario

    useEffect(() => {
        fetchAppointments();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [appointments, filterType, filterDate, statusFilter]);

    const WebDatePicker = ({ value, onChange, mode = 'date' }: { value: Date, onChange: (date: Date) => void, mode?: 'date' | 'datetime' }) => {
        if (!ReactDatePicker) {
            return (
                <TextInput
                    style={[styles.modalInput, { marginBottom: 15 }]}
                    value={value ? format(value, "dd/MM/yyyy", { locale: es }) : 'Seleccionar fecha'}
                    placeholder="Seleccionar fecha"
                    editable={false}
                />
            );
        }

        const DatePickerComponent = ReactDatePicker;

        return (
            <View style={{ marginBottom: 15 }}>
                <TouchableOpacity
                    style={styles.dateDisplayButton}
                    onPress={() => setShowCalendar(!showCalendar)}
                >
                    <Text style={styles.dateDisplayText}>
                        {value ? format(value, mode === 'datetime' ? "dd/MM/yyyy HH:mm" : "dd/MM/yyyy", { locale: es }) : 'Seleccionar fecha'}
                    </Text>
                    <Icon name="calendar" size={20} color="#D4AF37" />
                </TouchableOpacity>
                {showCalendar && (
                    <DatePickerComponent
                        selected={value}
                        onChange={(date: Date) => {
                            onChange(date);
                            setShowCalendar(false);
                        }}
                        showTimeSelect={mode === 'datetime'}
                        timeFormat="HH:mm"
                        timeIntervals={15}
                        dateFormat={mode === 'datetime' ? "dd/MM/yyyy HH:mm" : "dd/MM/yyyy"}
                        locale="es"
                        minDate={new Date()}
                        inline
                    />
                )}
            </View>
        );
    };

    const MobileDatePicker = ({ value, onChange, mode = 'date' }: { value: Date, onChange: (date: Date) => void, mode?: 'date' | 'datetime' }) => {
        return (
            <View style={styles.datePickerContainer}>
                <TouchableOpacity
                    style={styles.modalInput}
                    onPress={() => setShowDatePicker(true)}
                >
                    <Text style={{ color: '#FFFFFF' }}>
                        {value ? format(value, mode === 'datetime' ? "dd/MM/yyyy HH:mm" : "dd/MM/yyyy", { locale: es }) : 'Seleccionar fecha'}
                    </Text>
                </TouchableOpacity>

                {showDatePicker && DateTimePicker && (
                    <DateTimePicker
                        value={value}
                        mode={mode}
                        display="default"
                        onChange={(event, date) => {
                            setShowDatePicker(false);
                            if (date) {
                                onChange(date);
                            }
                        }}
                        minimumDate={new Date()}
                    />
                )}
            </View>
        );
    };

    const handleMonthSelect = (month: number) => {
        setSelectedMonth(month);
        const newDate = new Date(selectedYear, month, 1);
        setFilterDate(newDate);
        setShowMonthPicker(false);
    };

    const handleYearChange = (increment: number) => {
        const newYear = selectedYear + increment;
        setSelectedYear(newYear);
        const newDate = new Date(newYear, selectedMonth, 1);
        setFilterDate(newDate);
    };

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

    const applyFilters = () => {
        let result = [...appointments];

        // Apply date filter
        if (filterType !== 'none' && filterDate) {
            if (filterType === 'day') {
                result = result.filter(appointment =>
                    isSameDay(parseISO(appointment.requestedDate), filterDate)
                );
            } else if (filterType === 'month') {
                result = result.filter(appointment =>
                    isSameMonth(parseISO(appointment.requestedDate), filterDate) &&
                    isSameYear(parseISO(appointment.requestedDate), filterDate)
                );
            }
        }

        // Apply status filter
        switch (statusFilter) {
            case 'upcoming':
                result = result.filter(appointment =>
                    appointment.status === 'CONFIRMED' ||
                    appointment.status === 'RESCHEDULED'
                ).sort((a, b) =>
                    new Date(a.confirmedDate || a.requestedDate).getTime() -
                    new Date(b.confirmedDate || b.requestedDate).getTime()
                );
                break;
            case 'pending':
                result = result.filter(appointment =>
                    appointment.status === 'PENDING'
                ).sort((a, b) =>
                    new Date(a.requestedDate).getTime() -
                    new Date(b.requestedDate).getTime()
                );
                break;
            case 'cancelled':
                result = result.filter(appointment =>
                    appointment.status === 'CANCELLED' ||
                    appointment.status === 'REJECTED'
                ).sort((a, b) =>
                    new Date(b.requestedDate).getTime() -
                    new Date(a.requestedDate).getTime()
                );
                break;
            case 'all':
            default:
                // No additional filtering needed
                break;
        }

        setFilteredAppointments(result);
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

    const formatMonth = (date: Date) => {
        return format(date, "MMMM yyyy", { locale: es });
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

    const handleDateChange = (date: Date) => {
        setSelectedDate(date);
    };

    const handleFilterDateChange = (date: Date) => {
        setFilterDate(date);
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
                <Text style={styles.title}>Citas Agendadas</Text>
            </View>

            {/* Filtros */}
            <View style={styles.filterContainer}>
                <View style={styles.dateFilterContainer}>
                    <TouchableOpacity
                        style={[styles.filterButton, filterType === 'day' && styles.activeFilter]}
                        onPress={() => {
                            setFilterType(filterType === 'day' ? 'none' : 'day');
                            if (filterType !== 'day') {
                                setFilterDate(new Date());
                            } else {
                                setFilterDate(null);
                            }
                            setShowCalendar(false);
                        }}
                    >
                        <Text style={styles.filterButtonText}>Día</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.filterButton, filterType === 'month' && styles.activeFilter]}
                        onPress={() => {
                            setFilterType(filterType === 'month' ? 'none' : 'month');
                            if (filterType !== 'month') {
                                setFilterDate(new Date());
                                setSelectedMonth(new Date().getMonth());
                                setSelectedYear(new Date().getFullYear());
                            } else {
                                setFilterDate(null);
                            }
                            setShowCalendar(false);
                        }}
                    >
                        <Text style={styles.filterButtonText}>Mes</Text>
                    </TouchableOpacity>

                    {filterType !== 'none' && filterDate && (
                        <TouchableOpacity
                            style={styles.dateDisplayButton}
                            onPress={() => {
                                if (filterType === 'month') {
                                    setShowMonthPicker(true);
                                } else {
                                    setShowCalendar(!showCalendar);
                                }
                            }}
                        >
                            <Text style={styles.dateDisplayText}>
                                {filterType === 'day'
                                    ? format(filterDate, "dd/MM/yyyy", { locale: es })
                                    : format(filterDate, "MMMM yyyy", { locale: es })}
                            </Text>
                            <Icon name="calendar" size={20} color="#D4AF37" />
                        </TouchableOpacity>
                    )}
                </View>

                {filterType === 'day' && showCalendar && Platform.OS === 'web' && ReactDatePicker && (
                    <View style={styles.webDatePickerContainer}>
                        <ReactDatePicker
                            selected={filterDate}
                            onChange={(date: Date) => {
                                handleFilterDateChange(date);
                                setShowCalendar(false);
                            }}
                            showTimeSelect={false}
                            dateFormat="dd/MM/yyyy"
                            locale="es"
                            minDate={new Date()}
                            inline
                        />
                    </View>
                )}

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.statusFilterContainer}
                    contentContainerStyle={styles.statusFilterContent}
                >
                    <TouchableOpacity
                        style={[styles.statusFilterButton, statusFilter === 'all' && styles.activeStatusFilter]}
                        onPress={() => setStatusFilter('all')}
                    >
                        <Text style={styles.statusFilterButtonText}>Todas</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.statusFilterButton, statusFilter === 'upcoming' && styles.activeStatusFilter]}
                        onPress={() => setStatusFilter('upcoming')}
                    >
                        <Text style={styles.statusFilterButtonText}>Próximas</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.statusFilterButton, statusFilter === 'pending' && styles.activeStatusFilter]}
                        onPress={() => setStatusFilter('pending')}
                    >
                        <Text style={styles.statusFilterButtonText}>Pendientes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.statusFilterButton, statusFilter === 'cancelled' && styles.activeStatusFilter]}
                        onPress={() => setStatusFilter('cancelled')}
                    >
                        <Text style={styles.statusFilterButtonText}>Canceladas</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>

            {filteredAppointments.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Icon name="calendar-remove" size={60} color="#AAAAAA" />
                    <Text style={styles.emptyText}>No hay citas con los filtros actuales</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredAppointments}
                    renderItem={renderAppointmentCard}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContainer}
                />
            )}

            {/* Modal para seleccionar mes */}
            <Modal
                visible={showMonthPicker}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowMonthPicker(false)}
            >
                <View style={styles.monthPickerOverlay}>
                    <View style={styles.monthPickerContainer}>
                        <View style={styles.monthPickerHeader}>
                            <TouchableOpacity onPress={() => handleYearChange(-1)}>
                                <Icon name="chevron-left" size={24} color="#D4AF37" />
                            </TouchableOpacity>
                            <Text style={styles.monthPickerYearText}>{selectedYear}</Text>
                            <TouchableOpacity onPress={() => handleYearChange(1)}>
                                <Icon name="chevron-right" size={24} color="#D4AF37" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.monthPickerGrid}>
                            {Array.from({ length: 12 }).map((_, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.monthPickerButton,
                                        selectedMonth === index && styles.monthPickerButtonSelected
                                    ]}
                                    onPress={() => handleMonthSelect(index)}
                                >
                                    <Text style={[
                                        styles.monthPickerButtonText,
                                        selectedMonth === index && styles.monthPickerButtonTextSelected
                                    ]}>
                                        {format(new Date(selectedYear, index, 1), 'MMM', { locale: es })}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <TouchableOpacity
                            style={styles.monthPickerCloseButton}
                            onPress={() => setShowMonthPicker(false)}
                        >
                            <Text style={styles.monthPickerCloseButtonText}>Cerrar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Modal para acciones de cita */}
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
                                {Platform.OS === 'web' ? (
                                    <WebDatePicker
                                        value={selectedDate}
                                        onChange={handleDateChange}
                                        mode={actionType === 'reschedule' ? 'datetime' : 'date'}
                                    />
                                ) : (
                                    <MobileDatePicker
                                        value={selectedDate}
                                        onChange={handleDateChange}
                                        mode={actionType === 'reschedule' ? 'datetime' : 'date'}
                                    />
                                )}
                            </View>
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

            {Platform.OS === 'web' && (
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
                            position: relative !important;
                            top: auto !important;
                            left: auto !important;
                            z-index: 10000 !important;
                            margin-top: 10px;
                        }
                        .react-datepicker-popper {
                            z-index: 10000 !important;
                            position: relative !important;
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
                        .react-datepicker-time__header {
                            color: white;
                        }
                        .react-datepicker__time-container {
                            background-color: #2a2a2a;
                            border-left: 1px solid #444;
                        }
                        .react-datepicker__time-list-item {
                            color: white;
                        }
                        .react-datepicker__time-list-item:hover {
                            background-color: #444;
                        }
                        .react-datepicker__time-list-item--selected {
                            background-color: #D4AF37;
                            color: black;
                        }
                        .react-datepicker__month-container {
                            float: none;
                        }
                        .react-datepicker__time-container {
                            float: none;
                            width: 100%;
                        }
                        .react-datepicker__time-box {
                            width: 100%;
                        }
                    `}
                </style>
            )}
        </View>
    );
};

export default AppointmentManagement;
