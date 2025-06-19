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
    StyleSheet,
    ScrollView,
    ViewStyle,
    Platform,
} from 'react-native';
import {styles} from './AppointmentScreen.styles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {AppointmentScreenProps} from './AppointmentScreen.types';
import {appointmentService} from '../../services/appointment.service';
import {format, isBefore, parse, setHours, setMinutes, addDays, isAfter} from 'date-fns';
import {es} from 'date-fns/locale';
import {Appointment, AppointmentStatus} from '../../modules/navegation/Navegation.types';
import {registerLocale, setDefaultLocale} from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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

type FilterType = 'upcoming' | 'pending' | 'past' | 'cancelled';

const AppointmentScreen: React.FC<AppointmentScreenProps> = ({navigation}) => {
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
    });
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [actionType, setActionType] = useState<'create' | 'edit' | 'cancel'>('create');
    const [availabilitySlots, setAvailabilitySlots] = useState<TimeSlot[]>([]);
    const [showTimeSlots, setShowTimeSlots] = useState(false);
    const [timeSlots, setTimeSlots] = useState<Date[]>([]);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [activeFilter, setActiveFilter] = useState<FilterType>('upcoming');

    useEffect(() => {
        fetchAppointments();
    }, []);

    useEffect(() => {
        filterAppointments();
    }, [appointments, activeFilter]);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const response = await appointmentService.getUserAppointments();
            setAppointments(response.data);
        } catch (error: any) {
            console.error('Error fetching appointments:', error);
            Alert.alert('Error', error.message || 'No se pudieron cargar las citas');
        } finally {
            setLoading(false);
        }
    };

    const filterAppointments = () => {
        const now = new Date();
        let filtered = [...appointments];

        switch (activeFilter) {
            case 'upcoming':
                filtered = filtered.filter(appt =>
                    appt.status === 'CONFIRMED' &&
                    isAfter(new Date(appt.requestedDate), now)
                );
                break;
            case 'pending':
                filtered = filtered.filter(appt =>
                    (appt.status === 'PENDING' || appt.status === 'RESCHEDULED') &&
                    isAfter(new Date(appt.requestedDate), now)
                );
                break;
            case 'past':
                filtered = filtered.filter(appt =>
                    (appt.status === 'CONFIRMED' || appt.status === 'PENDING' || appt.status === 'RESCHEDULED') &&
                    isBefore(new Date(appt.requestedDate), now)
                );
                break;
            case 'cancelled':
                filtered = filtered.filter(appt =>
                    appt.status === 'CANCELLED' || appt.status === 'REJECTED'
                );
                break;
            default:
                break;
        }

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

    const handleCreateAppointment = async () => {
        try {
            if (!formData.title || !selectedDate || !selectedTime) {
                Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
                return;
            }

            const duration = parseInt(formData.duration) || 60;

            if (duration < 15) {
                Alert.alert('Error', 'La duración mínima es de 15 minutos');
                return;
            }

            const finalDate = new Date(selectedDate);
            finalDate.setHours(selectedTime.getHours());
            finalDate.setMinutes(selectedTime.getMinutes());

            if (isBefore(finalDate, new Date())) {
                Alert.alert('Error', 'No se pueden agendar citas en el pasado');
                return;
            }

            if (actionType === 'create') {
                await appointmentService.createAppointment({
                    title: formData.title,
                    description: formData.description,
                    requestedDate: finalDate.toISOString(),
                    duration,
                });
                Alert.alert('Éxito', 'Cita creada correctamente');
            } else if (actionType === 'edit' && selectedAppointment) {
                await appointmentService.updateAppointment(selectedAppointment.id, {
                    title: formData.title,
                    description: formData.description,
                    requestedDate: finalDate.toISOString(),
                    duration,
                });
                Alert.alert('Éxito', 'Cita actualizada correctamente');
            }

            setShowModal(false);
            fetchAppointments();
            resetForm();
        } catch (error: any) {
            console.error('Error creating/updating appointment:', error);
            Alert.alert('Error', error.message || 'No se pudo procesar la solicitud');
        }
    };

    const handleCancelAppointment = async () => {
        if (!selectedAppointment) return;

        try {
            await appointmentService.cancelAppointment(selectedAppointment.id);
            Alert.alert('Éxito', 'Cita cancelada correctamente');
            setShowModal(false);
            setShowDeleteConfirmation(false);
            fetchAppointments();
            resetForm();
        } catch (error: any) {
            console.error('Error canceling appointment:', error);
            Alert.alert('Error', error.message || 'No se pudo cancelar la cita');
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            duration: '60',
        });
        setSelectedDate(null);
        setSelectedTime(null);
        setSelectedAppointment(null);
        setActionType('create');
        setShowTimeSlots(false);
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
            case 'PENDING':
                return 'PENDIENTE';
            case 'CONFIRMED':
                return 'CONFIRMADA';
            case 'CANCELLED':
                return 'CANCELADA';
            case 'RESCHEDULED':
                return 'REAGENDADA';
            case 'REJECTED':
                return 'RECHAZADA';
            case 'COMPLETED':
                return 'COMPLETADA';
            default:
                return status;
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
            <View style={styles.datePickerContainer}>
                <TouchableOpacity
                    style={styles.modalInput}
                    onPress={() => setShowMobileDatePicker(true)}
                >
                    <Text style={{color: '#FFFFFF'}}>
                        {selectedDate ? formatDisplayDate(selectedDate) : 'Seleccionar fecha'}
                    </Text>
                </TouchableOpacity>

                {showMobileDatePicker && DateTimePicker && (
                    <DateTimePicker
                        value={selectedDate || new Date()}
                        mode="date"
                        display="default"
                        onChange={(event, date) => {
                            setShowMobileDatePicker(false);
                            if (date) {
                                setSelectedDate(date);
                                setSelectedTime(null);
                                fetchAvailability(date);
                            }
                        }}
                        minimumDate={new Date()}
                    />
                )}
            </View>
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

        // Parse the appointment date
        const appointmentDate = new Date(appointment.requestedDate);
        setSelectedDate(appointmentDate);
        setSelectedTime(appointmentDate);

        // Set form data
        setFormData({
            title: appointment.title,
            description: appointment.description || '',
            duration: appointment.duration.toString(),
        });

        // Fetch availability and show modal
        fetchAvailability(appointmentDate);
        setShowModal(true);
    };

    const renderAppointmentCard = ({item}: { item: Appointment }) => {
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
                        <Text style={{fontWeight: 'bold'}}>Solicitada:</Text> {formatDate(item.requestedDate)}
                    </Text>
                    {item.suggestedDate && (
                        <Text style={styles.cardDate}>
                            <Text style={{fontWeight: 'bold'}}>Sugerida:</Text> {formatDate(item.suggestedDate)}
                        </Text>
                    )}
                    {item.confirmedDate && (
                        <Text style={styles.cardDate}>
                            <Text style={{fontWeight: 'bold'}}>Confirmada:</Text> {formatDate(item.confirmedDate)}
                        </Text>
                    )}
                    {item.admin && (
                        <Text style={styles.cardDate}>
                            <Text
                                style={{fontWeight: 'bold'}}>Asesor:</Text> {item.admin.firstName} {item.admin.lastName} ({item.admin.email})
                        </Text>
                    )}
                    <Text style={styles.cardDate}>
                        <Text style={{fontWeight: 'bold'}}>Duración:</Text> {item.duration} minutos
                    </Text>
                </View>
                <View style={styles.cardFooter}>
                    {/* Botón EDITAR - Solo para PENDING o RESCHEDULED */}
                    {(item.status === 'PENDING' || item.status === 'RESCHEDULED') && (
                        <TouchableOpacity
                            style={[styles.actionButton, styles.editButton]}
                            onPress={() => handleEditAppointment(item)}
                        >
                            <Icon name="pencil" size={20} color="#FFFFFF"/>
                        </TouchableOpacity>
                    )}

                    {/* Botón CANCELAR - Para PENDING, RESCHEDULED y CONFIRMED */}
                    {(item.status === 'PENDING' || item.status === 'RESCHEDULED' || item.status === 'CONFIRMED') && (
                        <TouchableOpacity
                            style={[styles.actionButton, styles.deleteButton]}
                            onPress={() => {
                                setSelectedAppointment(item);
                                setShowDeleteConfirmation(true);
                            }}
                        >
                            <Icon name="trash-can-outline" size={20} color="#FFFFFF"/>
                        </TouchableOpacity>
                    )}
                </View>
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

            {/* Filter Buttons */}
            <View style={styles.filterContainer}>
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
            </View>

            {filteredAppointments.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Icon name="calendar-remove" size={60} color="#AAAAAA"/>
                    <Text style={styles.emptyText}>
                        {activeFilter === 'upcoming' && 'No tienes citas próximas'}
                        {activeFilter === 'pending' && 'No tienes citas pendientes'}
                        {activeFilter === 'past' && 'No tienes citas pasadas'}
                        {activeFilter === 'cancelled' && 'No tienes citas canceladas'}
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
                        <Text style={styles.modalTitle}>Confirmar Cancelación</Text>
                        <Text style={{color: '#FFFFFF', textAlign: 'center', marginBottom: 20}}>
                            ¿Estás seguro que deseas cancelar esta cita?
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
                                onPress={handleCancelAppointment}
                            >
                                <Text style={styles.modalButtonText}>Sí, Cancelar</Text>
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
