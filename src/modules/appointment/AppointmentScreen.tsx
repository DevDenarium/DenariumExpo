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
    Platform
} from 'react-native';
import {styles} from './AppointmentScreen.styles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {appointmentService} from '../../services/appointment.service';
import {format, isBefore, isAfter} from 'date-fns';
import {es} from 'date-fns/locale';
import {Appointment, AppointmentScreenProps, AppointmentStatus} from '../../modules/navegation/Navegation.types';
import {SubscriptionPlan} from "../subscriptions/SubscriptionsScreen.types";
import {registerLocale, setDefaultLocale} from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {PaymentsStackParamList, RootStackParamList} from '../navegation/Navegation.types';
import {StackNavigationProp} from '@react-navigation/stack';
import {useAuth} from '../auth/AuthContext';
import {useNavigation} from "@react-navigation/native";
import { CustomCalendar } from '../../common';

type PaymentsNavigationProp = StackNavigationProp<RootStackParamList, 'PaymentsScreen'>;
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
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        duration: '60',
        isVirtual: false
    });
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [actionType, setActionType] = useState<'create' | 'edit' | 'cancel' | 'reschedule'>('create');
    const [availabilitySlots, setAvailabilitySlots] = useState<TimeSlot[]>([]);
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
            '¿Deseas rechazar esta propuesta y solicitar una nueva fecha?',
            [
                {
                    text: 'Solo Rechazar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await appointmentService.rejectReschedule(appointment.id);
                            Alert.alert('Éxito', 'Has rechazado la propuesta de reagendamiento');
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
                        setSelectedAppointment(appointment);
                        setActionType('reschedule');
                        setShowRescheduleModal(true);
                    }
                },
                {
                    text: 'Cancelar',
                    style: 'cancel'
                }
            ]
        );
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
        if (!selectedAppointment || !selectedDate) {
            Alert.alert('Error', 'Selecciona fecha y hora');
            return;
        }

        try {
            await appointmentService.proposeReschedule(
                selectedAppointment.id,
                selectedDate.toISOString()
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
                        style={styles.modalInput}
                        onPress={() => setShowMobileDatePicker(true)}
                    >
                        <Text style={{color: '#FFFFFF'}}>
                            {selectedDate ? formatDisplayDate(selectedDate) : 'Seleccionar fecha'}
                        </Text>
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

    const renderTimeSlots = () => {
        if (!showTimeSlots || !selectedDate) return null;

        return (
            <View style={{marginBottom: 15}}>
                <Text style={{color: '#FFFFFF', marginBottom: 10}}>
                    Horarios disponibles para {formatDisplayDate(selectedDate)}:
                </Text>
                <View style={styles.timeSlotsContainer}>
                    {timeSlots.map((time, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.timeSlot,
                                selectedTime && selectedTime.getTime() === time.getTime() ? styles.selectedTimeSlot : {}
                            ]}
                            onPress={() => handleTimeSelect(time)}
                        >
                            <Text style={styles.timeSlotText}>
                                {formatTime(time)}
                            </Text>
                        </TouchableOpacity>
                    ))}
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
                                        setSelectedAppointment(item);
                                        setActionType('reschedule');
                                        setShowRescheduleModal(true);
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
                animationType="fade"
                onRequestClose={() => {
                    setShowModal(false);
                    resetForm();
                }}
            >
                <View style={styles.modalOverlay}>
                    <ScrollView style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>
                            {actionType === 'create' ? 'Nueva Cita' : 'Editar Cita'}
                        </Text>

                        <TextInput
                            style={styles.modalInput}
                            placeholder="Título*"
                            placeholderTextColor="#AAAAAA"
                            value={formData.title}
                            onChangeText={(text) => setFormData({...formData, title: text})}
                        />
                        <TextInput
                            style={[styles.modalInput, {minHeight: 80}]}
                            placeholder="Descripción (opcional)"
                            placeholderTextColor="#AAAAAA"
                            value={formData.description}
                            onChangeText={(text) => setFormData({...formData, description: text})}
                            multiline
                        />

                        <View style={styles.typeSelectorContainer}>
                            <Text style={styles.typeLabel}>Tipo de asesoría:</Text>
                            <View style={styles.typeButtonsContainer}>
                                <TouchableOpacity
                                    style={[
                                        styles.typeButton,
                                        formData.isVirtual && styles.typeButtonSelected
                                    ]}
                                    onPress={() => setFormData({...formData, isVirtual: true})}
                                >
                                    <Text style={styles.typeButtonText}>Virtual ($10)</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.typeButton,
                                        !formData.isVirtual && styles.typeButtonSelected
                                    ]}
                                    onPress={() => setFormData({...formData, isVirtual: false})}
                                >
                                    <Text style={styles.typeButtonText}>Presencial ($25)</Text>
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
                                <Text style={styles.modalButtonText}>
                                    {actionType === 'create' ? 'Crear Cita' : 'Actualizar Cita'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
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
                        <Text style={{color: '#FFFFFF', textAlign: 'center', marginBottom: 20}}>
                            Selecciona la nueva fecha y hora para tu cita:
                        </Text>
                        
                        {Platform.OS === 'web' ? (
                            ReactDatePicker ? (
                                <ReactDatePicker
                                    selected={selectedDate}
                                    onChange={(date: Date) => setSelectedDate(date)}
                                    showTimeSelect={true}
                                    timeFormat="HH:mm"
                                    timeIntervals={15}
                                    dateFormat="dd/MM/yyyy HH:mm"
                                    locale="es"
                                    minDate={new Date()}
                                    inline
                                />
                            ) : (
                                <TextInput
                                    style={[styles.modalInput, {marginBottom: 15}]}
                                    value={selectedDate ? format(selectedDate, "dd/MM/yyyy hh:mm a", { locale: es }) : 'Seleccionar fecha'}
                                    placeholder="Seleccionar fecha"
                                    editable={false}
                                />
                            )
                        ) : (
                            <View>
                                <TouchableOpacity
                                    style={styles.modalInput}
                                    onPress={() => setShowMobileDatePicker(true)}
                                >
                                    <Text style={{color: '#FFFFFF'}}>
                                        {selectedDate ? format(selectedDate, "dd/MM/yyyy hh:mm a", { locale: es }) : 'Seleccionar fecha y hora'}
                                    </Text>
                                </TouchableOpacity>
                                
                                {showMobileDatePicker && DateTimePicker && (
                                    <DateTimePicker
                                        value={selectedDate || new Date()}
                                        mode="datetime"
                                        display="default"
                                        onChange={(event: any, date?: Date) => {
                                            setShowMobileDatePicker(false);
                                            if (date) {
                                                setSelectedDate(date);
                                            }
                                        }}
                                        minimumDate={new Date()}
                                    />
                                )}
                            </View>
                        )}

                        {selectedDate && (
                            <Text style={{color: '#D4AF37', textAlign: 'center', marginTop: 15, marginBottom: 15}}>
                                Nueva fecha y hora: {format(selectedDate, "dd/MM/yyyy hh:mm a", { locale: es })}
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
                                style={[styles.modalButton, styles.confirmButton]}
                                onPress={handleClientReschedule}
                            >
                                <Text style={styles.modalButtonText}>Solicitar Reagendamiento</Text>
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

export default AppointmentScreen;
