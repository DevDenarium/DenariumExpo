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
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format, isBefore, isSameDay, isSameMonth, isSameYear, parseISO, isAfter } from 'date-fns';
import { es } from 'date-fns/locale';
import { registerLocale, setDefaultLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {appointmentService} from "../../services/appointment.service";
import { useAuth } from '../../modules/auth/AuthContext';
import { Appointment, AppointmentStatus } from '../../modules/navegation/Navegation.types';
import {AppointmentManagementProps} from "./AppointmentManagement.types";

registerLocale('es', es);
setDefaultLocale('es');

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

type FilterType = 'day' | 'month' | 'none';
type StatusFilter = 'upcoming' | 'pending' | 'cancelled' | 'all' | 'past';

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
    const [showCalendar, setShowCalendar] = useState(false);
    const [showTimeSlots, setShowTimeSlots] = useState(false);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const { user } = useAuth();

    const generateTimeSlots = () => {
        const slots = [];
        for (let hour = 9; hour <= 21; hour++) {
            const time = `${hour.toString().padStart(2, '0')}:00`;
            slots.push(time);
        }
        return slots;
    };

    const timeSlots = generateTimeSlots();

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
                            if (actionType === 'reschedule') {
                                setShowTimeSlots(true);
                            }
                        }}
                        showTimeSelect={false}
                        timeFormat="HH:mm"
                        timeIntervals={15}
                        dateFormat="dd/MM/yyyy"
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
                                if (actionType === 'reschedule') {
                                    setShowTimeSlots(true);
                                }
                            }
                        }}
                        minimumDate={new Date()}
                    />
                )}
            </View>
        );
    };

    const handleTimeSelect = (time: string) => {
        setSelectedTime(time);
        const [hours, minutes] = time.split(':').map(Number);
        const newDate = new Date(selectedDate);
        newDate.setHours(hours, minutes, 0, 0);
        setSelectedDate(newDate);
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
            let appointmentsData: Appointment[] = [];

            if (user?.role === 'ADMIN') {
                const response = await appointmentService.getAdminAppointments();
                appointmentsData = Array.isArray(response?.data) ? response.data : [];
            } else {
                const userResponse = await appointmentService.getUserAppointments();
                appointmentsData = Array.isArray(userResponse?.data) ? userResponse.data : [];
            }

            // Ordenar solo si hay datos
            if (appointmentsData.length > 0) {
                appointmentsData = appointmentsData.sort((a, b) =>
                    new Date(b.requestedDate).getTime() - new Date(a.requestedDate).getTime()
                );
            }

            setAppointments(appointmentsData);
        } catch (error) {
            console.error('Error fetching appointments:', error);
            Alert.alert('Error', 'No se pudieron cargar las citas');
            setAppointments([]);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let result = [...appointments];
        const now = new Date();
        // Filtro por fecha (día o mes)
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

        // Filtro por estado
        switch (statusFilter) {
            case 'upcoming':
                result = result.filter(appointment => {
                    const apptDate = new Date(appointment.confirmedDate || appointment.requestedDate);
                    return (
                        (appointment.status === 'CONFIRMED' || appointment.status === 'RESCHEDULED') &&
                        isAfter(apptDate, now)
                    );
                }).sort((a, b) => {
                    const dateA = new Date(a.confirmedDate || a.requestedDate);
                    const dateB = new Date(b.confirmedDate || b.requestedDate);
                    return dateA.getTime() - dateB.getTime();
                });
                break;

            case 'pending':
                result = result.filter(appointment =>
                    ['PENDING_ADMIN_REVIEW', 'RESCHEDULED'].includes(appointment.status)
                ).sort((a, b) =>
                    new Date(a.requestedDate).getTime() - new Date(b.requestedDate).getTime()
                );
                break;

            case 'cancelled':
                result = result.filter(appointment =>
                    ['CANCELLED', 'REJECTED'].includes(appointment.status)
                ).sort((a, b) =>
                    new Date(b.requestedDate).getTime() - new Date(a.requestedDate).getTime()
                );
                break;

            case 'past':
                result = result.filter(appointment => {
                    const apptDate = new Date(appointment.confirmedDate || appointment.requestedDate);
                    return (
                        ['CONFIRMED', 'COMPLETED'].includes(appointment.status) &&
                        isBefore(apptDate, now)
                    );
                }).sort((a, b) =>
                    new Date(b.confirmedDate || b.requestedDate).getTime() -
                    new Date(a.confirmedDate || a.requestedDate).getTime()
                );
                break;

            case 'all':
            default:
                break;
        }

        setFilteredAppointments(result);
    };

    const handleProposeReschedule = async (appointmentId: string, newDate: string) => {
        try {
            await appointmentService.proposeReschedule(appointmentId, newDate);
            fetchAppointments();
            Alert.alert('Éxito', 'Se ha enviado la propuesta de reagendamiento');
        } catch (error) {
            Alert.alert('Error', 'No se pudo reagendar la cita');
        }
    };

    const handleConfirmAppointment = async () => {
        if (!selectedAppointment) return;

        try {
            // Usar la fecha solicitada original de la cita
            const confirmedDate = new Date(selectedAppointment.requestedDate);

            const response = await appointmentService.confirmAppointment(
                selectedAppointment.id,
                confirmedDate.toISOString()
            );

            setAppointments(prev => prev.map(appt =>
                appt.id === selectedAppointment.id ? response.data : appt
            ));

            Alert.alert('Éxito', 'Cita confirmada correctamente');
            setShowModal(false);
            await fetchAppointments();
        } catch (error) {
            console.error('Error confirming appointment:', error);
            Alert.alert('Error', 'No se pudo confirmar la cita');
        }
    };

    const handleRescheduleAppointment = async () => {
        if (!selectedAppointment || !selectedTime) {
            Alert.alert('Error', 'Selecciona fecha y hora');
            return;
        }

        try {
            const [hours, minutes] = selectedTime.split(':').map(Number);
            const suggestedDate = new Date(selectedDate);
            suggestedDate.setHours(hours, minutes, 0, 0);

            await appointmentService.proposeReschedule(
                selectedAppointment.id,
                suggestedDate.toISOString()
            );

            Alert.alert('Éxito', 'Propuesta de reagendamiento enviada');
            setShowModal(false);
            fetchAppointments();
        } catch (error) {
            console.error('Error rescheduling:', error);
            Alert.alert('Error', 'No se pudo reagendar la cita');
        }
    };

    const handleCancelAppointment = async () => {
        if (!selectedAppointment) return;

        Alert.alert(
            'Confirmar cancelación',
            '¿Estás seguro de cancelar esta cita? El cliente recibirá un reintegro con una multa del 10%.',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Sí, cancelar',
                    onPress: async () => {
                        try {
                            await appointmentService.cancelAppointment(selectedAppointment.id);

                            if (selectedAppointment.status === 'CONFIRMED') {
                                await appointmentService.processRefund(selectedAppointment.id);
                            }

                            Alert.alert('Éxito', 'Cita cancelada y reintegro procesado');
                            setShowModal(false);
                            fetchAppointments();
                        } catch (error) {
                            console.error('Error canceling:', error);
                            Alert.alert('Error', 'No se pudo cancelar la cita');
                        }
                    }
                }
            ]
        );
    };

    const resetForm = () => {
        setSelectedDate(new Date());
        setSelectedAppointment(null);
        setActionType('confirm');
        setShowTimeSlots(false);
        setSelectedTime(null);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return format(date, "dd/MM/yyyy HH:mm", { locale: es });
    };

    const formatDateOnly = (dateString: string) => {
        const date = new Date(dateString);
        return format(date, "dd/MM/yyyy", { locale: es });
    };

    const formatTime12Hour = (dateString: string) => {
        const date = new Date(dateString);
        return format(date, "h:mm a", { locale: es });
    };

    const formatMonth = (date: Date) => {
        return format(date, "MMMM yyyy", { locale: es });
    };

    const getStatusStyle = (status: AppointmentStatus): [{ backgroundColor: string }, { color: string }] => {
        switch (status) {
            case 'PENDING_ADMIN_REVIEW':
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
            case 'PENDING_PAYMENT': return 'PENDIENTE DE PAGO';
            case 'PENDING_ADMIN_REVIEW': return 'PENDIENTE DE REVISIÓN';
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
        const isPastAppointment = isBefore(new Date(item.confirmedDate || item.requestedDate), new Date());

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
                    {item.user && (
                        <>
                            <Text style={styles.cardDate}>
                                <Text style={{fontWeight: 'bold'}}>Cliente:</Text> {item.user.firstName} {item.user.lastName}
                            </Text>
                            <Text style={styles.cardDate}>
                                <Text style={{fontWeight: 'bold'}}>Email:</Text> {item.user.email}
                            </Text>
                            <Text style={styles.cardDate}>
                                <Text style={{fontWeight: 'bold'}}>Teléfono:</Text> {item.user.phone || 'No disponible'}
                            </Text>
                        </>
                    )}
                    <Text style={styles.cardDate}>
                        <Text style={{ fontWeight: 'bold' }}>Fecha solicitada:</Text> {format(parseISO(item.requestedDate), 'dd/MM/yyyy', { locale: es })}
                    </Text>
                    <Text style={styles.cardDate}>
                        <Text style={{ fontWeight: 'bold' }}>Hora solicitada:</Text> {formatTime12Hour(item.requestedDate)}
                    </Text>
                    <Text style={styles.cardDate}>
                        <Text style={{ fontWeight: 'bold' }}>Duración:</Text> {item.duration} minutos
                    </Text>
                    {item.description && (
                        <Text style={styles.cardDate}>
                            <Text style={{fontWeight: 'bold'}}>Descripción:</Text> {item.description}
                        </Text>
                    )}
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
                    <Text style={styles.cardDate}>
                        <Text style={{ fontWeight: 'bold' }}>Duración:</Text> {item.duration} minutos
                    </Text>
                </View>

                {!isPastAppointment && item.status !== 'CANCELLED' && item.status !== 'REJECTED' && (
                    <View style={styles.cardFooter}>
                        {item.status === 'PENDING_ADMIN_REVIEW' && (
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
                        {(item.status === 'PENDING_ADMIN_REVIEW' || item.status === 'CONFIRMED' || item.status === 'RESCHEDULED') && (
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
                )}
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
                    <TouchableOpacity
                        style={[styles.statusFilterButton, statusFilter === 'past' && styles.activeStatusFilter]}
                        onPress={() => setStatusFilter('past')}
                    >
                        <Text style={styles.statusFilterButtonText}>Pasadas</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>

            {filteredAppointments.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Icon name="calendar-remove" size={60} color="#AAAAAA" />
                    <Text style={styles.emptyText}>
                        {statusFilter === 'upcoming' && 'No hay citas próximas'}
                        {statusFilter === 'pending' && 'No hay citas pendientes'}
                        {statusFilter === 'cancelled' && 'No hay citas canceladas'}
                        {statusFilter === 'past' && 'No hay citas pasadas'}
                        {statusFilter === 'all' && 'No hay citas con los filtros actuales'}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filteredAppointments}
                    renderItem={renderAppointmentCard}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContainer}
                />
            )}

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
                    <View style={[
                        styles.modalContainer,
                        actionType === 'confirm' && {
                            width: '85%',
                            maxHeight: 'auto',
                            minHeight: 'auto',
                            paddingVertical: 20,
                            paddingHorizontal: 20
                        }
                    ]}>
                        <Text style={styles.modalTitle}>
                            {actionType === 'confirm' ? 'Confirmar Cita' :
                                actionType === 'reschedule' ? 'Reagendar Cita' : 'Cancelar Cita'}
                        </Text>

                        {actionType === 'confirm' && selectedAppointment && (
                            <View style={{marginVertical: 15, paddingHorizontal: 10}}>
                                <Text style={{color: '#FFFFFF', textAlign: 'center', fontSize: 16, marginBottom: 15}}>
                                    ¿Estás seguro que deseas confirmar la cita?
                                </Text>
                                
                                <View style={{marginBottom: 10}}>
                                    <Text style={{color: '#FFFFFF', fontSize: 14}}>
                                        <Text style={{fontWeight: 'bold'}}>Cliente:</Text> {selectedAppointment.user?.firstName} {selectedAppointment.user?.lastName}
                                    </Text>
                                </View>
                                
                                <View style={{marginBottom: 10}}>
                                    <Text style={{color: '#FFFFFF', fontSize: 14}}>
                                        <Text style={{fontWeight: 'bold'}}>Email:</Text> {selectedAppointment.user?.email}
                                    </Text>
                                </View>
                                
                                <View style={{marginBottom: 10}}>
                                    <Text style={{color: '#FFFFFF', fontSize: 14}}>
                                        <Text style={{fontWeight: 'bold'}}>Teléfono:</Text> {selectedAppointment.user?.phone || 'No disponible'}
                                    </Text>
                                </View>
                                
                                <View style={{marginBottom: 10}}>
                                    <Text style={{color: '#FFFFFF', fontSize: 14}}>
                                        <Text style={{fontWeight: 'bold'}}>Tema:</Text> {selectedAppointment.title}
                                    </Text>
                                </View>
                                
                                <View style={{marginBottom: 10}}>
                                    <Text style={{color: '#FFFFFF', fontSize: 14}}>
                                        <Text style={{fontWeight: 'bold'}}>Fecha:</Text> {formatDateOnly(selectedAppointment.requestedDate)}
                                    </Text>
                                </View>
                                
                                <View style={{marginBottom: 10}}>
                                    <Text style={{color: '#FFFFFF', fontSize: 14}}>
                                        <Text style={{fontWeight: 'bold'}}>Hora:</Text> {formatTime12Hour(selectedAppointment.requestedDate)}
                                    </Text>
                                </View>
                                
                                <View style={{marginBottom: 10}}>
                                    <Text style={{color: '#FFFFFF', fontSize: 14}}>
                                        <Text style={{fontWeight: 'bold'}}>Duración:</Text> {selectedAppointment.duration} minutos
                                    </Text>
                                </View>
                            </View>
                        )}

                        {actionType === 'reschedule' && (
                            <>
                                <Text style={styles.modalSubtitle}>
                                    {showTimeSlots
                                        ? 'Selecciona un horario'
                                        : 'Selecciona una fecha'}
                                </Text>

                                {!showTimeSlots && (
                                    <View style={styles.datePickerContainer}>
                                        {Platform.OS === 'web' ? (
                                            <WebDatePicker
                                                value={selectedDate}
                                                onChange={handleDateChange}
                                                mode="datetime"
                                            />
                                        ) : (
                                            <MobileDatePicker
                                                value={selectedDate}
                                                onChange={handleDateChange}
                                                mode="datetime"
                                            />
                                        )}
                                    </View>
                                )}

                                {showTimeSlots && (
                                    <View style={styles.timeSlotsContainer}>
                                        {timeSlots.map((time, index) => (
                                            <TouchableOpacity
                                                key={index}
                                                style={[
                                                    styles.timeSlot,
                                                    selectedTime === time && styles.selectedTimeSlot
                                                ]}
                                                onPress={() => handleTimeSelect(time)}
                                            >
                                                <Text style={styles.timeSlotText}>{time}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </>
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
                                    if (actionType === 'reschedule' && showTimeSlots) {
                                        setShowTimeSlots(false);
                                    } else {
                                        setShowModal(false);
                                        resetForm();
                                    }
                                }}
                            >
                                <Text style={styles.modalButtonText}>
                                    {actionType === 'reschedule' && showTimeSlots ? 'Atrás' : 'Cancelar'}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.confirmButton]}
                                onPress={() => {
                                    if (actionType === 'confirm') {
                                        handleConfirmAppointment();
                                    } else if (actionType === 'reschedule') {
                                        if (showTimeSlots) {
                                            handleRescheduleAppointment();
                                        } else {
                                            setShowTimeSlots(true);
                                        }
                                    } else {
                                        handleCancelAppointment();
                                    }
                                }}
                            >
                                <Text style={styles.modalButtonText}>
                                    {actionType === 'confirm' ? 'Confirmar Cita' :
                                        actionType === 'reschedule' ?
                                            (showTimeSlots ? 'Reagendar' : 'Siguiente') :
                                            'Cancelar Cita'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
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
