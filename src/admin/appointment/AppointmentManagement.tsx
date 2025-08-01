import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    TextInput,
    ActivityIndicator,
    Alert,
    ScrollView,
    Platform,
} from 'react-native';
import { styles } from './AppointmentManagement.styles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { format, isBefore, isSameDay, isSameMonth, isSameYear, parseISO, isAfter } from 'date-fns';
import { es } from 'date-fns/locale';
import {appointmentService} from "../../services/appointment.service";
import { useAuth } from '../../modules/auth/AuthContext';
import { Appointment, AppointmentStatus } from '../../modules/navegation/Navegation.types';
import {AppointmentManagementProps} from "./AppointmentManagement.types";
import { CustomCalendar } from '../../common';

type FilterType = 'day' | 'month' | 'none';
type StatusFilter = 'all' | 'upcoming' | 'pending' | 'past' | 'cancelled';

const AppointmentManagement: React.FC<AppointmentManagementProps> = ({ navigation }) => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
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
    const [showMobileDatePicker, setShowMobileDatePicker] = useState(false);
    const [showRescheduleDatePicker, setShowRescheduleDatePicker] = useState(false);
    const [timeSlots, setTimeSlots] = useState<Date[]>([]);
    const [showTimeSlots, setShowTimeSlots] = useState(false);
    const [selectedTime, setSelectedTime] = useState<Date | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        fetchAppointments();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [appointments, filterType, filterDate, statusFilter]);

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

        switch (statusFilter) {
            case 'upcoming':
                result = result.filter(appointment => {
                    const apptDate = new Date(appointment.confirmedDate || appointment.requestedDate);
                    return (
                        appointment.status === 'CONFIRMED' &&
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

    const generateTimeSlots = (date: Date) => {
        const slots: Date[] = [];
        const startHour = 9;
        const endHour = 21;

        for (let hour = startHour; hour < endHour; hour++) {
            const slot = new Date(date);
            slot.setHours(hour, 0, 0, 0);
            slots.push(slot);
        }

        setTimeSlots(slots);
        setShowTimeSlots(true);
    };

    const handleConfirmAppointment = async () => {
        if (!selectedAppointment) return;

        try {
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
        if (!selectedAppointment || !selectedDate) {
            Alert.alert('Error', 'Selecciona fecha y hora');
            return;
        }

        try {
            await appointmentService.proposeReschedule(
                selectedAppointment.id,
                selectedDate.toISOString()
            );

            Alert.alert('Éxito', 'Propuesta de reagendamiento enviada al cliente');
            setShowModal(false); 
            resetForm();
            fetchAppointments();
        } catch (error) {
            console.error('Error rescheduling:', error);
            Alert.alert('Error', 'No se pudo enviar la propuesta de reagendamiento');
        }
    };

    const handleCancelAppointment = async () => {
        if (!selectedAppointment) return;

        Alert.alert(
            'Confirmar cancelación',
            '¿Estás seguro de cancelar esta cita?',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Sí, cancelar',
                    onPress: async () => {
                        try {
                            await appointmentService.cancelAppointment(selectedAppointment.id); 

                            setShowModal(false);
                            fetchAppointments();

                            if (selectedAppointment.status === 'CONFIRMED') {
                                const clientName = selectedAppointment.user?.firstName || 'Cliente';
                                const clientLastName = selectedAppointment.user?.lastName || '';
                                const clientEmail = selectedAppointment.user?.email || 'Email no disponible';
                                const clientPhone = selectedAppointment.user?.phone || null;
                                const fullName = `${clientName} ${clientLastName}`.trim();
                                
                                let contactInfo = `Cliente: ${fullName}\nEmail: ${clientEmail}`;
                                if (clientPhone) {
                                    contactInfo += `\nTeléfono: ${clientPhone}`;
                                }
                                
                                setTimeout(() => {
                                    Alert.alert(
                                        'Recordatorio de Reembolso',
                                        `La cita ha sido cancelada exitosamente.\n\nACCIÓN REQUERIDA:\nDebes contactar al cliente para procesar el reembolso completo (sin multa):\n\n${contactInfo}\n\nMotivo: Cancelación realizada por administración`,
                                        [
                                            { text: 'Entendido', style: 'default' }
                                        ]
                                    );
                                }, 500);
                            } else {
                                Alert.alert('Éxito', 'Cita cancelada correctamente');
                            }
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
        setShowRescheduleDatePicker(false);
        setTimeSlots([]);
        setShowTimeSlots(false);
        setSelectedTime(null);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return format(date, "dd/MM/yyyy hh:mm a", { locale: es });
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
                        <Text style={{ fontWeight: 'bold' }}>Fecha solicitada:</Text> {formatDate(item.requestedDate)}
                    </Text>
                    <Text style={styles.cardDate}>
                        <Text style={{ fontWeight: 'bold' }}>Modalidad:</Text> {item.isVirtual ? 'Virtual' : 'Presencial'}
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
                            <Text style={{ fontWeight: 'bold' }}>Fecha sugerida:</Text> {formatDate(item.suggestedDate)}
                        </Text>
                    )}
                    {item.confirmedDate && (
                        <Text style={styles.cardDate}>
                            <Text style={{ fontWeight: 'bold' }}>Fecha confirmada:</Text> {formatDate(item.confirmedDate)}
                        </Text>
                    )}
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
                                        const appointmentDate = new Date(item.requestedDate);
                                        setSelectedDate(appointmentDate);
                                        setSelectedTime(appointmentDate);
                                        setActionType('reschedule');
                                        generateTimeSlots(appointmentDate);
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

    const AdminMobileRescheduleDatePicker = () => {
        return (
            <>
                <View style={styles.datePickerContainer}>
                    <TouchableOpacity
                        style={[styles.modalInput, {marginBottom: 10}]}
                        onPress={() => setShowRescheduleDatePicker(true)}
                    >
                        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                            <Text style={{color: '#FFFFFF'}}>
                                {selectedDate ? format(selectedDate, "dd/MM/yyyy", { locale: es }) : 'Seleccionar fecha'}
                            </Text>
                            <Icon name="calendar-edit" size={20} color="#D4AF37" />
                        </View>
                    </TouchableOpacity>
                </View>

                <CustomCalendar
                    visible={showRescheduleDatePicker}
                    onClose={() => setShowRescheduleDatePicker(false)}
                    onDateSelect={(date) => {
                        setSelectedDate(date);
                        setSelectedTime(null);
                        generateTimeSlots(date);
                        setShowRescheduleDatePicker(false);
                    }}
                    selectedDate={selectedDate}
                    title="Seleccionar Nueva Fecha"
                    minDate={new Date()}
                />
            </>
        );
    };

    const renderTimeSlots = () => {
        if (!showTimeSlots || !selectedDate) return null;

        return (
            <View style={{marginBottom: 10}}>
                <Text style={{color: '#FFFFFF', marginBottom: 10}}>
                    Horarios disponibles para {format(selectedDate, "dd/MM/yyyy", { locale: es })}:
                </Text>
                <View style={styles.timeSlotsContainer}>
                    {timeSlots.map((time, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.timeSlot,
                                selectedTime && selectedTime.getTime() === time.getTime() ? styles.selectedTimeSlot : {}
                            ]}
                            onPress={() => {
                                setSelectedTime(time);
                                // Combinar fecha seleccionada con hora seleccionada
                                const newDateTime = new Date(selectedDate);
                                newDateTime.setHours(time.getHours(), time.getMinutes(), 0, 0);
                                setSelectedDate(newDateTime);
                            }}
                        >
                            <Text style={styles.timeSlotText}>
                                {format(time, 'hh:mm a', { locale: es })}
                            </Text>
                        </TouchableOpacity>
                    ))}
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
                            setShowMobileDatePicker(false);
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
                            setShowMobileDatePicker(false);
                        }}
                    >
                        <Text style={styles.filterButtonText}>Mes</Text>
                    </TouchableOpacity>

                    {filterType !== 'none' && filterDate && !showMobileDatePicker && (
                        <TouchableOpacity
                            style={styles.dateDisplayButton}
                            onPress={() => {
                                if (filterType === 'month') {
                                    setShowMonthPicker(true);
                                } else if (Platform.OS === 'web') {
                                    setShowCalendar(!showCalendar);
                                } else {
                                    setShowMobileDatePicker(true);
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

                <CustomCalendar
                    visible={showMobileDatePicker}
                    onClose={() => setShowMobileDatePicker(false)}
                    onDateSelect={handleFilterDateChange}
                    selectedDate={filterDate}
                    title="Seleccionar Fecha para Filtrar"
                />

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
                        style={[styles.statusFilterButton, statusFilter === 'past' && styles.activeStatusFilter]}
                        onPress={() => setStatusFilter('past')}
                    >
                        <Text style={styles.statusFilterButtonText}>Pasadas</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.statusFilterButton, statusFilter === 'cancelled' && styles.activeStatusFilter]}
                        onPress={() => setStatusFilter('cancelled')}
                    >
                        <Text style={styles.statusFilterButtonText}>Canceladas</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>

            <ScrollView 
                style={styles.scrollContainer}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={true}
            >
                {filteredAppointments.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Icon name="calendar-remove" size={60} color="#AAAAAA" />
                        <Text style={styles.emptyText}>
                            {statusFilter === 'all' && 'No hay citas con los filtros actuales'}
                            {statusFilter === 'upcoming' && 'No hay citas próximas'}
                            {statusFilter === 'pending' && 'No hay citas pendientes'}
                            {statusFilter === 'past' && 'No hay citas pasadas'}
                            {statusFilter === 'cancelled' && 'No hay citas canceladas'}
                        </Text>
                    </View>
                ) : (
                    <>
                        {filteredAppointments.map((item) => (
                            <View key={item.id}>
                                {renderAppointmentCard({ item })}
                            </View>
                        ))}
                    </>
                )}
            </ScrollView>

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
                                <Text style={{color: '#FFFFFF', textAlign: 'center', marginBottom: 10}}>
                                    Fecha actual de la cita:
                                </Text>
                                
                                <AdminMobileRescheduleDatePicker />

                                <Text style={{color: '#AAAAAA', textAlign: 'center', marginBottom: 15, fontSize: 12}}>
                                    Toca la fecha para cambiarla o selecciona una nueva hora:
                                </Text>

                                {renderTimeSlots()}

                                {selectedDate && selectedTime && (
                                    <Text style={{color: '#D4AF37', textAlign: 'center', marginTop: 10, marginBottom: 5}}>
                                        Nueva fecha y hora: {format(selectedDate, "dd/MM/yyyy", { locale: es })} a las {format(selectedTime, "hh:mm a", { locale: es })}
                                    </Text>
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
                                    setShowModal(false);
                                    setSelectedAppointment(null);
                                    setActionType('confirm');
                                    setSelectedDate(new Date());
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
                                    {actionType === 'confirm' ? 'Confirmar Cita' :
                                        actionType === 'reschedule' ? 'Solicitar Reagendamiento' :
                                            'Cancelar Cita'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default AppointmentManagement;
