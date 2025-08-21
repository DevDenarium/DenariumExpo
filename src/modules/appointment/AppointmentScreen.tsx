import React, {useState, useEffect} from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    Modal,
    TextInput,
    ActivityIndicator,
    Alert,
    ScrollView,
    ViewStyle,
    Platform,
    Keyboard,
    TouchableWithoutFeedback,
    KeyboardAvoidingView
} from 'react-native';
import {styles} from './AppointmentScreen.styles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {appointmentService} from '../../services/appointment.service';
import {format, isBefore, isAfter} from 'date-fns';
import {es} from 'date-fns/locale';
import {Appointment, AppointmentScreenProps, AppointmentStatus} from '../../modules/navegation/Navegation.types';
import {SubscriptionPlan} from "../subscriptions/SubscriptionsScreen.types";
import {PaymentsStackParamList, RootStackParamList} from '../navegation/Navegation.types';
import {StackNavigationProp} from '@react-navigation/stack';
import {useAuth} from '../auth/AuthContext';
import {useNavigation} from "@react-navigation/native";
import { CustomCalendar } from '../../common';

type PaymentsNavigationProp = StackNavigationProp<RootStackParamList, 'PaymentsScreen'>;

type DateTimePickerProps = {
    value: Date;
    mode: 'date' | 'time' | 'datetime';
    display: 'default' | 'spinner' | 'compact' | 'inline';
    onChange: (event: any, date?: Date) => void;
    locale?: string;
    textColor?: string;
    themeVariant?: 'light' | 'dark';
    minimumDate?: Date;
    minimumTime?: Date;
    maximumDate?: Date;
};

type ReactDatePickerProps = {
    onChange: (date: Date) => void,
    showTimeSelect?: boolean,
    timeFormat?: string,
    timeIntervals?: number,
    dateFormat?: string,
    className?: string,
    customInput?: React.ReactElement,
    locale?: string,
    minDate?: Date,
    selectsStart?: boolean,
    selectsEnd?: boolean,
    startDate?: Date,
    endDate?: Date,
    filterTime?: (time: Date) => boolean,
    inline?: boolean,
    selected?: Date | null
};

let DateTimePicker: React.ComponentType<DateTimePickerProps> | null = null;
let ReactDatePicker: React.ComponentType<ReactDatePickerProps> | null = null;

if (Platform.OS === 'web') {
    try {
        ReactDatePicker = require('react-datepicker').default;
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

interface TimeSlot {
    start: Date;
    end: Date;
}

type FilterType = 'all' | 'upcoming' | 'pending' | 'past' | 'cancelled';

const AppointmentScreen: React.FC<AppointmentScreenProps> = ({navigation}) => {
    const {user} = useAuth();
    const paymentsNavigation = useNavigation<PaymentsNavigationProp>();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<Date | null>(null);
    const [showMobileDatePicker, setShowMobileDatePicker] = useState(false);
    const [showRescheduleDatePicker, setShowRescheduleDatePicker] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        duration: '60',
        isVirtual: false
    });
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [actionType, setActionType] = useState<'create' | 'edit' | 'cancel' | 'reschedule'>('create');
    const [availabilitySlots, setAvailabilitySlots] = useState<Array<{ time: string; available: boolean; reason?: string }>>([]);
    const [showTimeSlots, setShowTimeSlots] = useState(false);
    const [timeSlots, setTimeSlots] = useState<Date[]>([]);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [showFinalCancelConfirmation, setShowFinalCancelConfirmation] = useState(false);
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');

    useEffect(() => {
        fetchAppointments();
    }, []);

    useEffect(() => {
        filterAppointments();
    }, [appointments, activeFilter]);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            let appointmentsData: Appointment[] = [];

            const userResponse = await appointmentService.getUserAppointments();
            appointmentsData = [...userResponse.data];

            if (user?.role === 'ADMIN') {
                const pendingResponse = await appointmentService.getPendingAppointments();
                const confirmedResponse = await appointmentService.getUserAppointments();

                const allAppointments = [...pendingResponse.data, ...confirmedResponse.data];
                const pendingIds = new Set(appointmentsData.map(a => a.id));

                const uniquePending = allAppointments.filter(a => !pendingIds.has(a.id));
                appointmentsData = [...appointmentsData, ...uniquePending];
            }

            appointmentsData = appointmentsData.map(appt => ({
                ...appt,
                status: appt.status || 'PENDING_ADMIN_REVIEW'
            })).sort((a, b) =>
                new Date(a.requestedDate).getTime() - new Date(b.requestedDate).getTime()
            );

            setAppointments(appointmentsData);
        } catch (error) {
            console.error('Error fetching appointments:', error);
            Alert.alert('Error', 'No se pudieron cargar las citas');
        } finally {
            setLoading(false);
        }
    };

    const filterAppointments = () => {
        const now = new Date();
        let filtered = [...appointments];

        switch (activeFilter) {
            case 'all':
                break;
            case 'upcoming':
                filtered = filtered.filter(appt => {
                    const apptDate = new Date(appt.confirmedDate || appt.requestedDate);
                    return (
                        appt.status === 'CONFIRMED' &&
                        isAfter(apptDate, now)
                    );
                });
                break;
            case 'pending':
                if (user?.role === 'ADMIN') {
                    filtered = filtered.filter(appt =>
                        ['PENDING_ADMIN_REVIEW', 'RESCHEDULED'].includes(appt.status)
                    );
                } else {
                    filtered = filtered.filter(appt =>
                        ['PENDING_ADMIN_REVIEW', 'RESCHEDULED', 'PENDING_PAYMENT'].includes(appt.status)
                    );
                }
                break;
            case 'past':
                filtered = filtered.filter(appt => {
                    const apptDate = new Date(appt.confirmedDate || appt.requestedDate);
                    return (
                        ['CONFIRMED', 'COMPLETED'].includes(appt.status) &&
                        isBefore(apptDate, now)
                    );
                });
                break;
            case 'cancelled':
                filtered = filtered.filter(appt =>
                    ['CANCELLED', 'REJECTED'].includes(appt.status)
                );
                break;
            default:
                break;
        }

        filtered.sort((a, b) => {
            const dateA = new Date(a.confirmedDate || a.requestedDate);
            const dateB = new Date(b.confirmedDate || b.requestedDate);
            return dateA.getTime() - dateB.getTime();
        });

        setFilteredAppointments(filtered);
    };

    const fetchAvailability = async (date: Date) => {
        try {
            const response = await appointmentService.getAvailability(date);
            setAvailabilitySlots(response.data);
            generateTimeSlots(date);
        } catch (error: any) {
            console.error('Error fetching availability:', error);
            Alert.alert('Error', error.message || 'No se pudieron cargar los horarios disponibles');
        }
    };

    const generateTimeSlots = (date: Date) => {
        const slots: Date[] = [];
        const startHour = 8;
        const endHour = 21;

        // Generar slots cada 30 minutos desde 8:00 AM hasta 9:00 PM
        for (let hour = startHour; hour < endHour; hour++) {
            // Slot en la hora exacta (ej: 8:00, 9:00)
            const hourSlot = new Date(date);
            hourSlot.setHours(hour, 0, 0, 0);
            slots.push(hourSlot);

            // Slot a los 30 minutos (ej: 8:30, 9:30)
            const halfHourSlot = new Date(date);
            halfHourSlot.setHours(hour, 30, 0, 0);
            slots.push(halfHourSlot);
        }

        setTimeSlots(slots);
        setShowTimeSlots(true);
    };

    const handleAcceptReschedule = async (appointment: Appointment) => {
        try {
            await appointmentService.acceptReschedule(appointment.id);
            Alert.alert('Éxito', 'Has aceptado la nueva fecha para tu cita');
            fetchAppointments();
        } catch (error: any) {
            console.error('Error accepting reschedule:', error);
            Alert.alert('Error', error.message || 'No se pudo aceptar el reagendamiento');
        }
    };

    const handleRejectReschedule = async (appointment: Appointment) => {
        Alert.alert(
            'Rechazar Reagendamiento',
            '¿Confirmas que quieres rechazar esta propuesta y cancelar la cita? Recuerda que puedes proponer una nueva fecha.',
            [
                {
                    text: 'Rechazar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await appointmentService.rejectReschedule(appointment.id);
                            Alert.alert('Contacto para Rembolso', 'Contacte a Denarium Capital para el rembolso total de la cita por reagendamiento por parte de Denarium');
                            fetchAppointments();
                        } catch (error: any) {
                            console.error('Error rejecting reschedule:', error);
                            Alert.alert('Error', error.message || 'No se pudo rechazar el reagendamiento');
                        }
                    }
                },
                {
                    text: 'Proponer Nueva Fecha',
                    onPress: () => {
                        openRescheduleModal(appointment);
                    }
                },
                {
                    text: 'Cancelar',
                    style: 'cancel'
                }
            ]
        );
    };

    const openRescheduleModal = (appointment: Appointment) => {
        setSelectedAppointment(appointment);
        setActionType('reschedule');
        
        // Usar la fecha confirmada de la cita como fecha inicial
        const appointmentDate = new Date(appointment.confirmedDate || appointment.requestedDate);
        
        setSelectedDate(appointmentDate);
        setSelectedTime(null);
        
        // Generar horarios disponibles automáticamente para la fecha de la cita
        fetchAvailability(appointmentDate);
        
        setShowRescheduleModal(true);
    };

    const handleCreateAppointment = async () => {
        try {
            if (!selectedDate || !selectedTime) {
                Alert.alert('Completa fecha y hora');
                return;
            }

            const fullDate = new Date(selectedDate);
            fullDate.setHours(selectedTime.getHours());
            fullDate.setMinutes(selectedTime.getMinutes());
            fullDate.setSeconds(0);
            fullDate.setMilliseconds(0);

            const duration = parseInt(formData.duration) || 60;

            const appointmentData = {
                title: formData.title,
                description: formData.description,
                isVirtual: formData.isVirtual,
                duration,
                requestedDate: fullDate.toISOString(),
            };

            if (actionType === 'edit' && selectedAppointment) {
                const currentStatus = selectedAppointment.status;
                if (currentStatus === 'PENDING_ADMIN_REVIEW' || currentStatus === 'RESCHEDULED') {
                    try {
                        await appointmentService.updatePendingAppointment(selectedAppointment.id, appointmentData);
                        Alert.alert('Éxito', 'Cita actualizada correctamente');
                        setShowModal(false);
                        fetchAppointments();
                        resetForm();
                        return;
                    } catch (error: any) {
                        console.error('Error updating pending appointment:', error);
                        Alert.alert('Error', error.message || 'No se pudo actualizar la cita');
                        return;
                    }
                } else {
                    Alert.alert('Error', 'Solo puedes editar citas que estén pendientes de revisión');
                    return;
                }
            }

            const price = formData.isVirtual ? 10 : 25;

            const advisoryPlan: SubscriptionPlan = {
                id: `advisory_${Date.now()}`,
                name: `Asesoría ${formData.isVirtual ? 'Virtual' : 'Presencial'}`,
                price,
                period: 'una vez',
                features: [
                    `1 sesión de asesoría ${formData.isVirtual ? 'virtual' : 'presencial'}`,
                    `Duración: ${duration} minutos`
                ],
                type: 'ADVISORY_SINGLE',
                icon: 'account-cash',
            };

            setShowModal(false);

            navigation.navigate('PaymentsScreen', {
                plan: advisoryPlan,
                metadata: { appointmentData: JSON.stringify(appointmentData) },
                onSuccess: async () => {
                    await fetchAppointments();
                },
            });
        } catch (err) {
            console.error('Error creando cita:', err);
            Alert.alert('Error', 'No se pudo crear la cita');
        }
    };

    const handleCancelAppointment = async () => {
        if (!selectedAppointment) return;

        try {
            await appointmentService.cancelAppointment(selectedAppointment.id);
            Alert.alert('Éxito', 'Cita cancelada correctamente');
            setShowModal(false);
            setShowDeleteConfirmation(false);
            setShowFinalCancelConfirmation(false);
            fetchAppointments();
            resetForm();
        } catch (error: any) {
            console.error('Error canceling appointment:', error);
            Alert.alert('Error', error.message || 'No se pudo cancelar la cita');
        }
    };

    const handleClientReschedule = async () => {
        if (!selectedAppointment || !selectedDate || !selectedTime) {
            Alert.alert('Error', 'Selecciona fecha y hora');
            return;
        }

        try {
            // Combinar fecha y hora seleccionadas
            const combinedDateTime = new Date(selectedDate);
            combinedDateTime.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);

            await appointmentService.proposeReschedule(
                selectedAppointment.id,
                combinedDateTime.toISOString()
            );

            Alert.alert('Éxito', 'Solicitud de reagendamiento enviada. El administrador revisará tu propuesta.');
            setShowRescheduleModal(false);
            resetForm();
            fetchAppointments();
        } catch (error: any) {
            console.error('Error rescheduling:', error);
            Alert.alert('Error', 'No se pudo enviar la solicitud de reagendamiento');
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            duration: '60',
            isVirtual: false
        });
        setSelectedDate(null);
        setSelectedTime(null);
        setSelectedAppointment(null);
        setActionType('create');
        setShowTimeSlots(false);
        setShowDeleteConfirmation(false);
        setShowFinalCancelConfirmation(false);
        setShowRescheduleModal(false);
        setShowMobileDatePicker(false);
        setShowRescheduleDatePicker(false);
        setTimeSlots([]);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return format(date, "dd/MM/yyyy hh:mm a", {locale: es});
    };

    const formatDisplayDate = (date: Date) => {
        return format(date, "dd/MM/yyyy", {locale: es});
    };

    const formatTime = (date: Date) => {
        return format(date, "hh:mm a", {locale: es});
    };

    const handleDateChange = (date: Date) => {
        setSelectedDate(date);
        setSelectedTime(null);
        fetchAvailability(date);
    };

    const handleTimeSelect = (time: Date) => {
        setSelectedTime(time);
    };

    const getStatusStyle = (status: AppointmentStatus): [ViewStyle, ViewStyle] => {
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

    const WebDatePicker = () => {
        if (!ReactDatePicker) {
            return (
                <TextInput
                    style={[styles.modalInput, {marginBottom: 15}]}
                    value={selectedDate ? formatDisplayDate(selectedDate) : 'Seleccionar fecha'}
                    placeholder="Seleccionar fecha"
                    editable={false}
                />
            );
        }

        return (
            <View style={{marginBottom: 15}}>
                <ReactDatePicker
                    selected={selectedDate}
                    onChange={handleDateChange}
                    showTimeSelect={false}
                    dateFormat="dd/MM/yyyy"
                    locale="es"
                    minDate={new Date()}
                    inline
                    customInput={
                        <TextInput
                            style={styles.modalInput}
                            value={selectedDate ? formatDisplayDate(selectedDate) : 'Seleccionar fecha'}
                            placeholder="Seleccionar fecha"
                        />
                    }
                />
            </View>
        );
    };

    const MobileDatePicker = () => {
        return (
            <>
                <View style={styles.datePickerContainer}>
                    <TouchableOpacity
                        style={styles.datePickerButton}
                        onPress={() => setShowMobileDatePicker(true)}
                    >
                        <Text style={[styles.datePickerText, selectedDate && {color: '#FFFFFF'}]}>
                            {selectedDate ? formatDisplayDate(selectedDate) : 'Seleccionar fecha'}
                        </Text>
                        <Icon name="calendar" size={20} color="#D4AF37" />
                    </TouchableOpacity>
                </View>

                <CustomCalendar
                    visible={showMobileDatePicker}
                    onClose={() => setShowMobileDatePicker(false)}
                    onDateSelect={(date) => {
                        setSelectedDate(date);
                        setSelectedTime(null);
                        fetchAvailability(date);
                        setShowMobileDatePicker(false);
                    }}
                    selectedDate={selectedDate}
                    title="Seleccionar Fecha para Cita"
                    minDate={new Date()}
                />
            </>
        );
    };

    const MobileRescheduleDatePicker = () => {
        return (
            <>
                <View style={styles.datePickerContainer}>
                    <TouchableOpacity
                        style={styles.datePickerButton}
                        onPress={() => setShowRescheduleDatePicker(true)}
                    >
                        <Text style={[styles.datePickerText, selectedDate && {color: '#FFFFFF'}]}>
                            {selectedDate ? format(selectedDate, "dd/MM/yyyy", { locale: es }) : 'Seleccionar fecha'}
                        </Text>
                        <Icon name="calendar-edit" size={20} color="#D4AF37" />
                    </TouchableOpacity>
                </View>

                <CustomCalendar
                    visible={showRescheduleDatePicker}
                    onClose={() => setShowRescheduleDatePicker(false)}
                    onDateSelect={(date) => {
                        setSelectedDate(date);
                        setSelectedTime(null);
                        fetchAvailability(date);
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
            <View style={{marginBottom: 15}}>
                <Text style={{color: '#FFFFFF', marginBottom: 10}}>
                    Horarios disponibles para {formatDisplayDate(selectedDate)}:
                </Text>
                <View style={styles.timeSlotsContainer}>
                    {timeSlots.map((time, index) => {
                        // Formato 12 horas am/pm igual que ScheduleBlockModal
                        const h = time.getHours();
                        const m = time.getMinutes();
                        let hour12 = h % 12 === 0 ? 12 : h % 12;
                        const ampm = h < 12 || h === 24 ? 'am' : 'pm';
                        const timeLabel = `${hour12}:${m.toString().padStart(2, '0')} ${ampm}`;
                        const timeString = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                        const availabilityInfo = availabilitySlots.find(slot => slot.time === timeString);
                        const isAvailable = availabilityInfo?.available === true;
                        const isSelected = selectedTime && selectedTime.getTime() === time.getTime();
                        const isOccupied = !isAvailable;
                        return (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.timeSlot,
                                    isSelected && styles.selectedTimeSlot,
                                    isOccupied && !isSelected && styles.disabledTimeSlot,
                                ]}
                                onPress={() => {
                                    if (isAvailable) {
                                        handleTimeSelect(time);
                                    } else {
                                        Alert.alert('Horario no disponible', availabilityInfo?.reason || 'Este horario ya está ocupado');
                                    }
                                }}
                                disabled={isOccupied && !isSelected}
                            >
                                <Text style={[
                                    styles.timeSlotText,
                                    isSelected && styles.selectedTimeSlotText,
                                    isOccupied && !isSelected && styles.disabledTimeSlotText,
                                ]}>
                                    {timeLabel}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        );
    };

    const handleEditAppointment = (appointment: Appointment) => {
        setSelectedAppointment(appointment);
        setActionType('edit');

        const appointmentDate = new Date(appointment.requestedDate);
        setSelectedDate(appointmentDate);
        setSelectedTime(appointmentDate);

        setFormData({
            title: appointment.title,
            description: appointment.description || '',
            duration: appointment.duration.toString(),
            isVirtual: appointment.isVirtual
        });

        fetchAvailability(appointmentDate);
        setShowModal(true);
    };

    const renderAppointmentCard = ({item}: { item: Appointment }) => {
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
                    {item.description && (
                        <Text style={styles.cardDescription}>{item.description}</Text>
                    )}
                    <Text style={styles.cardDate}>
                        <Text style={{fontWeight: 'bold'}}>Fecha solicitada:</Text> {formatDate(item.requestedDate)}
                    </Text>
                    <Text style={styles.cardDate}>
                        <Text style={{fontWeight: 'bold'}}>Modalidad:</Text> {item.isVirtual ? 'Virtual' : 'Presencial'}
                    </Text>
                    {item.status === 'RESCHEDULED' && item.suggestedDate && (
                        <Text style={styles.cardDate}>
                            <Text style={{fontWeight: 'bold'}}>Fecha sugerida:</Text> {formatDate(item.suggestedDate)}
                        </Text>
                    )}
                    {item.status !== 'RESCHEDULED' && item.suggestedDate && (
                        <Text style={styles.cardDate}>
                            <Text style={{fontWeight: 'bold'}}>Fecha sugerida:</Text> {formatDate(item.suggestedDate)}
                        </Text>
                    )}
                    {item.confirmedDate && (
                        <Text style={styles.cardDate}>
                            <Text style={{fontWeight: 'bold'}}>Fecha confirmada:</Text> {formatDate(item.confirmedDate)}
                        </Text>
                    )}
                    {item.admin && (
                        <Text style={styles.cardDate}>
                            <Text style={{fontWeight: 'bold'}}>Asesor:</Text> {item.admin.firstName} {item.admin.lastName} ({item.admin.email})
                        </Text>
                    )}
                    <Text style={styles.cardDate}>
                        <Text style={{fontWeight: 'bold'}}>Duración:</Text> {item.duration} minutos
                    </Text>
                </View>

                {!isPastAppointment && (
                    <View style={styles.cardFooter}>
                        {item.status === 'RESCHEDULED' && (
                            <>
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.acceptButton]}
                                    onPress={() => handleAcceptReschedule(item)}
                                >
                                    <Icon name="check" size={20} color="#FFFFFF"/>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.rejectButton]}
                                    onPress={() => handleRejectReschedule(item)}
                                >
                                    <Icon name="close" size={20} color="#FFFFFF"/>
                                </TouchableOpacity>
                            </>
                        )}

                        {item.status === 'PENDING_ADMIN_REVIEW' && (
                            <>
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.editButton]}
                                    onPress={() => handleEditAppointment(item)}
                                >
                                    <Icon name="pencil" size={20} color="#FFFFFF"/>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.deleteButton]}
                                    onPress={() => {
                                        setSelectedAppointment(item);
                                        setShowFinalCancelConfirmation(true);
                                    }}
                                >
                                    <Icon name="trash-can-outline" size={20} color="#FFFFFF"/>
                                </TouchableOpacity>
                            </>
                        )}

                        {item.status === 'CONFIRMED' && (
                            <>
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.rescheduleButton]}
                                    onPress={() => {
                                        openRescheduleModal(item);
                                    }}
                                >
                                    <Icon name="calendar-edit" size={20} color="#FFFFFF"/>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.deleteButton]}
                                    onPress={() => {
                                        setSelectedAppointment(item);
                                        setShowDeleteConfirmation(true);
                                    }}
                                >
                                    <Icon name="trash-can-outline" size={20} color="#FFFFFF"/>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                )}
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#D4AF37"/>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Mis Citas</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => {
                        setActionType('create');
                        setSelectedDate(null);
                        setSelectedTime(null);
                        setShowTimeSlots(false);
                        setShowModal(true);
                    }}
                >
                    <Icon name="plus" size={24} color="#000000"/>
                </TouchableOpacity>
            </View>

            <View style={styles.filterContainer}>
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterScrollView}
                >
                    <TouchableOpacity
                        style={[
                            styles.filterButton,
                            activeFilter === 'all' ? styles.activeFilterButton : {}
                        ]}
                        onPress={() => setActiveFilter('all')}
                    >
                        <Text style={styles.filterButtonText}>Todas</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.filterButton,
                            activeFilter === 'upcoming' ? styles.activeFilterButton : {}
                        ]}
                        onPress={() => setActiveFilter('upcoming')}
                    >
                        <Text style={styles.filterButtonText}>Próximas</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.filterButton,
                            activeFilter === 'pending' ? styles.activeFilterButton : {}
                        ]}
                        onPress={() => setActiveFilter('pending')}
                    >
                        <Text style={styles.filterButtonText}>Pendientes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.filterButton,
                            activeFilter === 'past' ? styles.activeFilterButton : {}
                        ]}
                        onPress={() => setActiveFilter('past')}
                    >
                        <Text style={styles.filterButtonText}>Pasadas</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.filterButton,
                            activeFilter === 'cancelled' ? styles.activeFilterButton : {}
                        ]}
                        onPress={() => setActiveFilter('cancelled')}
                    >
                        <Text style={styles.filterButtonText}>Canceladas</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>

            {filteredAppointments.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Icon name="calendar-remove" size={60} color="#AAAAAA"/>
                    <Text style={styles.emptyText}>
                        {activeFilter === 'all' && 'No tienes citas registradas'}
                        {activeFilter === 'upcoming' && 'No tienes citas próximas'}
                        {activeFilter === 'pending' && 'No tienes citas pendientes'}
                        {activeFilter === 'past' && 'No tienes citas pasadas'}
                        {activeFilter === 'cancelled' && 'No tienes citas canceladas'}
                    </Text>
                </View>
            ) : (
                <ScrollView 
                    style={styles.scrollContainer}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <FlatList
                        data={filteredAppointments}
                        renderItem={renderAppointmentCard}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.listContainer}
                        scrollEnabled={false}
                    />
                </ScrollView>
            )}

            <Modal
                visible={showModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => {
                    setShowModal(false);
                    resetForm();
                }}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback onPress={() => {}}>
                            <KeyboardAvoidingView
                                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                                style={styles.modalContainer}
                                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
                            >
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>
                                        {actionType === 'create' ? 'Nueva Cita' : 'Editar Cita'}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => {
                                            setShowModal(false);
                                            resetForm();
                                        }}
                                        style={styles.closeButton}
                                    >
                                        <Icon name="close" size={24} color="#D4AF37" />
                                    </TouchableOpacity>
                                </View>
                                
                                <ScrollView 
                                    style={styles.scrollContainer}
                                    contentContainerStyle={styles.scrollContent}
                                    keyboardShouldPersistTaps="handled"
                                >

                        <TextInput
                            style={styles.modalInput}
                            placeholder="Título*"
                            placeholderTextColor="#AAAAAA"
                            value={formData.title}
                            onChangeText={(text) => setFormData({...formData, title: text})}
                            returnKeyType="next"
                            blurOnSubmit={false}
                        />
                        <TextInput
                            style={[styles.modalInput, {minHeight: 80}]}
                            placeholder="Descripción (opcional)"
                            placeholderTextColor="#AAAAAA"
                            value={formData.description}
                            onChangeText={(text) => setFormData({...formData, description: text})}
                            multiline
                            returnKeyType="done"
                            blurOnSubmit={true}
                        />

                        <View style={styles.typeSelectorContainer}>
                            <Text style={styles.typeLabel}>Tipo de asesoría:</Text>
                            {actionType === 'edit' && (
                                <Text style={{color: '#D4AF37', fontSize: 10, marginBottom: 5, textAlign: 'center'}}>
                                    Para cambiar la modalidad, contacta con Denarium Capital
                                </Text>
                            )}
                            <View style={styles.typeButtonsContainer}>
                                <TouchableOpacity
                                    style={[
                                        styles.typeButton,
                                        formData.isVirtual && styles.typeButtonSelected,
                                        actionType === 'edit' && styles.disabledButton
                                    ]}
                                    onPress={() => {
                                        if (actionType !== 'edit') {
                                            setFormData({...formData, isVirtual: true});
                                        }
                                    }}
                                    disabled={actionType === 'edit'}
                                >
                                    <Text style={[
                                        styles.typeButtonText,
                                        actionType === 'edit' && {color: '#888888'}
                                    ]}>Virtual ($10)</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.typeButton,
                                        !formData.isVirtual && styles.typeButtonSelected,
                                        actionType === 'edit' && styles.disabledButton
                                    ]}
                                    onPress={() => {
                                        if (actionType !== 'edit') {
                                            setFormData({...formData, isVirtual: false});
                                        }
                                    }}
                                    disabled={actionType === 'edit'}
                                >
                                    <Text style={[
                                        styles.typeButtonText,
                                        actionType === 'edit' && {color: '#888888'}
                                    ]}>Presencial ($25)</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {Platform.OS === 'web' ? <WebDatePicker/> : <MobileDatePicker/>}

                        {renderTimeSlots()}

                        <TextInput
                            style={styles.durationInput}
                            placeholder="Duración en minutos (mínimo 15)*"
                            placeholderTextColor="#AAAAAA"
                            keyboardType="numeric"
                            value={formData.duration}
                            onChangeText={(text) => setFormData({...formData, duration: text})}
                            returnKeyType="done"
                            blurOnSubmit={true}
                        />

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
                                style={[styles.modalButton, styles.confirmButton, !selectedTime ? styles.disabledButton : {}]}
                                onPress={handleCreateAppointment}
                                disabled={!selectedTime}
                            >
                                <Text style={[styles.modalButtonText, {color: '#000000'}]}>
                                    {actionType === 'create' ? 'Crear Cita' : 'Actualizar Cita'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        </ScrollView>
                            </KeyboardAvoidingView>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            <Modal
                visible={showDeleteConfirmation}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowDeleteConfirmation(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Cancelar Cita</Text>
                        <Text style={{color: '#FFFFFF', textAlign: 'center', marginBottom: 20}}>
                            ¿Estás seguro que deseas cancelar esta cita? Recuerda que puedes reagendar.
                        </Text>
                        <View style={styles.modalButtonContainer}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setShowDeleteConfirmation(false)}
                            >
                                <Text style={styles.modalButtonText}>No</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.confirmButton]}
                                onPress={() => {
                                    setShowDeleteConfirmation(false);
                                    setShowFinalCancelConfirmation(true);
                                }}
                            >
                                <Text style={styles.modalButtonText}>Cancelar Cita</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal
                visible={showFinalCancelConfirmation}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowFinalCancelConfirmation(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Confirmar Cancelación</Text>
                        <Text style={{color: '#FFFFFF', textAlign: 'center', marginBottom: 20}}>
                            Si cancelas la cita debes comunicarte con Denarium Capital para el reintegro del dinero, se cobrará un 10% del costo de la cita por cancelación.
                        </Text>
                        <View style={styles.modalButtonContainer}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setShowFinalCancelConfirmation(false)}
                            >
                                <Text style={styles.modalButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.confirmButton]}
                                onPress={handleCancelAppointment}
                            >
                                <Text style={styles.modalButtonText}>Confirmar Cancelación</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal
                visible={showRescheduleModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowRescheduleModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Reagendar Cita</Text>
                        <Text style={{color: '#FFFFFF', textAlign: 'center', marginBottom: 10}}>
                            Fecha actual de tu cita:
                        </Text>
                        
                        {/* Usar el mismo patrón que crear cita pero para reagendar */}
                        <MobileRescheduleDatePicker />

                        <Text style={{color: '#AAAAAA', textAlign: 'center', marginBottom: 20, fontSize: 12}}>
                            Toca la fecha para cambiarla o selecciona una nueva hora:
                        </Text>

                        {/* Siempre mostrar los time slots si hay fecha seleccionada */}
                        {renderTimeSlots()}

                        {selectedDate && selectedTime && (
                            <Text style={{color: '#D4AF37', textAlign: 'center', marginTop: 15, marginBottom: 15}}>
                                Nueva fecha y hora: {format(selectedDate, "dd/MM/yyyy", { locale: es })} a las {format(selectedTime, "hh:mm a", { locale: es })}
                            </Text>
                        )}

                        <View style={styles.modalButtonContainer}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => {
                                    setShowRescheduleModal(false);
                                    resetForm();
                                }}
                            >
                                <Text style={styles.modalButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.modalButton, 
                                    styles.confirmButton,
                                    (!selectedDate || !selectedTime) && styles.disabledButton
                                ]}
                                onPress={handleClientReschedule}
                                disabled={!selectedDate || !selectedTime}
                            >
                                <Text style={styles.modalButtonText}>Solicitar Reagendamiento</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

        </View>
    );
};

export default AppointmentScreen;
