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
import { styles } from './AppointmentScreen.styles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AppointmentScreenProps } from './AppointmentScreen.types';
import { appointmentService } from '../../services/appointment.service';
import { format, isBefore } from 'date-fns';
import { es } from 'date-fns/locale';
import { Appointment, AppointmentStatus } from '../../modules/navegation/Navegation.types';
import { registerLocale, setDefaultLocale } from "react-datepicker";
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
    minimumDate?: Date;  // Añadimos esta propiedad
    minimumTime?: Date;  // Opcional: para compatibilidad futura
    maximumDate?: Date;
};

type ReactDatePickerProps = {
    selected: Date;
    onChange: (date: Date) => void;
    showTimeSelect?: boolean;
    timeFormat?: string;
    timeIntervals?: number;
    dateFormat?: string;
    className?: string;
    customInput?: React.ReactElement;
    locale?: string;
    minDate?: Date;
    selectsStart?: boolean;
    selectsEnd?: boolean;
    startDate?: Date;
    endDate?: Date;
    filterTime?: (time: Date) => boolean;
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

const AppointmentScreen: React.FC<AppointmentScreenProps> = ({ navigation }) => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showMobileDatePicker, setShowMobileDatePicker] = useState(false); // Cambiado el nombre aquí
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        duration: '60',
    });
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [actionType, setActionType] = useState<'create' | 'cancel'>('create');
    const [availabilitySlots, setAvailabilitySlots] = useState<TimeSlot[]>([]);
    const [showAvailability, setShowAvailability] = useState(false);

    useEffect(() => {
        fetchAppointments();
    }, []);

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

    const fetchAvailability = async (date: Date) => {
        try {
            const response = await appointmentService.getAvailability(date);
            setAvailabilitySlots(response.data);
        } catch (error: any) {
            console.error('Error fetching availability:', error);
            Alert.alert('Error', error.message || 'No se pudieron cargar los horarios disponibles');
        }
    };

    const handleCreateAppointment = async () => {
        try {
            if (!formData.title || !selectedDate) {
                Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
                return;
            }

            const duration = parseInt(formData.duration) || 60;

            if (duration < 15) {
                Alert.alert('Error', 'La duración mínima es de 15 minutos');
                return;
            }

            if (isBefore(selectedDate, new Date())) {
                Alert.alert('Error', 'No se pueden agendar citas en el pasado');
                return;
            }

            await appointmentService.createAppointment({
                title: formData.title,
                description: formData.description,
                requestedDate: selectedDate.toISOString(),
                duration,
            });

            Alert.alert('Éxito', 'Cita creada correctamente');
            setShowModal(false);
            fetchAppointments();
            resetForm();
        } catch (error: any) {
            console.error('Error creating appointment:', error);
            Alert.alert('Error', error.message || 'No se pudo crear la cita');
        }
    };

    const handleCancelAppointment = async () => {
        if (!selectedAppointment) return;

        try {
            await appointmentService.cancelAppointment(selectedAppointment.id);
            Alert.alert('Éxito', 'Cita cancelada correctamente');
            setShowModal(false);
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
        setSelectedDate(new Date());
        setSelectedAppointment(null);
        setActionType('create');
        setShowAvailability(false);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return format(date, "dd/MM/yyyy HH:mm", { locale: es });
    };

    const formatDisplayDate = (date: Date) => {
        return format(date, "dd/MM/yyyy HH:mm", { locale: es });
    };

    const handleDateChange = (date: Date) => {
        setSelectedDate(date);
        if (actionType === 'create') {
            fetchAvailability(date);
        }
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
            case 'PENDING': return 'PENDIENTE';
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
                    style={[styles.modalInput, { marginBottom: 15 }]}
                    value={formatDisplayDate(selectedDate)}
                    placeholder="Seleccionar fecha y hora"
                    editable={false}
                />
            );
        }

        return (
            <View style={{ marginBottom: 15 }}>
                <ReactDatePicker
                    selected={selectedDate}
                    onChange={handleDateChange}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    dateFormat="dd/MM/yyyy HH:mm"
                    locale="es"
                    minDate={new Date()}
                    customInput={
                        <TextInput
                            style={styles.modalInput}
                            value={formatDisplayDate(selectedDate)}
                            placeholder="Seleccionar fecha y hora"
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
                    onPress={() => setShowMobileDatePicker(true)} // Usamos el nuevo nombre aquí
                >
                    <Text style={{ color: '#FFFFFF' }}>
                        {formatDisplayDate(selectedDate)}
                    </Text>
                </TouchableOpacity>

                {showMobileDatePicker && DateTimePicker && ( // Y aquí
                    <DateTimePicker
                        value={selectedDate}
                        mode="datetime"
                        display="default"
                        onChange={(event, date) => {
                            setShowMobileDatePicker(false); // Y aquí
                            if (date) {
                                setSelectedDate(date);
                                if (actionType === 'create') {
                                    fetchAvailability(date);
                                }
                            }
                        }}
                        minimumDate={new Date()}
                    />
                )}
            </View>
        );
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
                    {item.admin && (
                        <Text style={styles.cardDate}>
                            <Text style={{ fontWeight: 'bold' }}>Asesor:</Text> {item.admin.firstName} {item.admin.lastName} ({item.admin.email})
                        </Text>
                    )}
                    <Text style={styles.cardDate}>
                        <Text style={{ fontWeight: 'bold' }}>Duración:</Text> {item.duration} minutos
                    </Text>
                </View>
                <View style={styles.cardFooter}>
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
                <Text style={styles.title}>Mis Citas</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => {
                        setActionType('create');
                        setSelectedDate(new Date());
                        fetchAvailability(new Date());
                        setShowModal(true);
                    }}
                >
                    <Icon name="plus" size={24} color="#000000" />
                </TouchableOpacity>
            </View>

            {appointments.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Icon name="calendar-remove" size={60} color="#AAAAAA" />
                    <Text style={styles.emptyText}>No tienes citas agendadas</Text>
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
                            {actionType === 'create' ? 'Nueva Cita' : 'Cancelar Cita'}
                        </Text>

                        {actionType !== 'cancel' && (
                            <>
                                <TextInput
                                    style={styles.modalInput}
                                    placeholder="Título*"
                                    placeholderTextColor="#AAAAAA"
                                    value={formData.title}
                                    onChangeText={(text) => setFormData({ ...formData, title: text })}
                                />
                                <TextInput
                                    style={[styles.modalInput, { minHeight: 80 }]}
                                    placeholder="Descripción (opcional)"
                                    placeholderTextColor="#AAAAAA"
                                    value={formData.description}
                                    onChangeText={(text) => setFormData({ ...formData, description: text })}
                                    multiline
                                />

                                {Platform.OS === 'web' ? <WebDatePicker /> : <MobileDatePicker />}

                                <TextInput
                                    style={styles.durationInput}
                                    placeholder="Duración en minutos (mínimo 15)*"
                                    placeholderTextColor="#AAAAAA"
                                    keyboardType="numeric"
                                    value={formData.duration}
                                    onChangeText={(text) => setFormData({ ...formData, duration: text })}
                                />

                                <TouchableOpacity
                                    style={[styles.modalButton, { marginBottom: 15 }]}
                                    onPress={() => setShowAvailability(!showAvailability)}
                                >
                                    <Text style={styles.modalButtonText}>
                                        {showAvailability ? 'Ocultar disponibilidad' : 'Ver horarios disponibles'}
                                    </Text>
                                </TouchableOpacity>

                                {showAvailability && (
                                    <View style={{ marginBottom: 15 }}>
                                        <Text style={{ color: '#FFFFFF', marginBottom: 5 }}>
                                            Horarios disponibles para {format(selectedDate, "dd/MM/yyyy", { locale: es })}:
                                        </Text>
                                        {availabilitySlots.length > 0 ? (
                                            availabilitySlots.map((slot, index) => (
                                                <View key={index} style={{
                                                    backgroundColor: '#333333',
                                                    padding: 10,
                                                    borderRadius: 5,
                                                    marginBottom: 5
                                                }}>
                                                    <Text style={{ color: '#FFFFFF' }}>
                                                        {format(slot.start, "HH:mm")} - {format(slot.end, "HH:mm")}
                                                    </Text>
                                                </View>
                                            ))
                                        ) : (
                                            <Text style={{ color: '#AAAAAA' }}>
                                                No hay horarios disponibles para esta fecha
                                            </Text>
                                        )}
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
                                    setShowModal(false);
                                    resetForm();
                                }}
                            >
                                <Text style={styles.modalButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.confirmButton]}
                                onPress={() => {
                                    if (actionType === 'create') {
                                        handleCreateAppointment();
                                    } else {
                                        handleCancelAppointment();
                                    }
                                }}
                            >
                                <Text style={styles.modalButtonText}>
                                    {actionType === 'create' ? 'Crear' : 'Cancelar Cita'}
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
                            position: absolute;
                            top: 100% !important;
                            left: 0 !important;
                            z-index: 10000 !important;
                        }
                        .react-datepicker-popper {
                            z-index: 10000 !important;
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
                    `}
                </style>
            )}
        </View>
    );
};

export default AppointmentScreen;
