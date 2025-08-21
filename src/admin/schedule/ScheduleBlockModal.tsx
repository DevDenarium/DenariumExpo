import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { scheduleBlockModalStyles as styles } from './ScheduleBlockModal.styles';
import CustomCalendar from '../../common/components/CustomCalendar';
import { scheduleService } from '../../services/schedule.service';
import {
  ScheduleBlock,
  ScheduleBlockType,
  DayOfWeek,
  CreateScheduleBlockDto,
  DAY_LABELS,
  AvailabilityResponse,
} from '../../types/schedule.types';

interface ScheduleBlockModalProps {
  visible: boolean;
  onClose: () => void;
  editingBlock?: ScheduleBlock | null;
  onSuccess: () => void;
}

const ScheduleBlockModal: React.FC<ScheduleBlockModalProps> = ({ 
  visible, 
  onClose, 
  editingBlock, 
  onSuccess 
}) => {
  const isEditing = !!editingBlock;

  const [formData, setFormData] = useState<CreateScheduleBlockDto>({
    type: ScheduleBlockType.SPECIFIC_TIME,
    reason: '',
  });

  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarType, setCalendarType] = useState<'date' | 'startDate' | 'endDate'>('date');
  const [calendarTitle, setCalendarTitle] = useState('');
  
  const [availability, setAvailability] = useState<AvailabilityResponse[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (isEditing && editingBlock) {
      // Convertir fechas ISO a formato YYYY-MM-DD
      const convertDate = (dateString: string | null | undefined) => {
        if (!dateString) return undefined;
        return dateString.includes('T') ? dateString.split('T')[0] : dateString;
      };

      setFormData({
        type: editingBlock.type,
        date: convertDate(editingBlock.date),
        startTime: editingBlock.startTime,
        endTime: editingBlock.endTime,
        startDate: convertDate(editingBlock.startDate),
        endDate: convertDate(editingBlock.endDate),
        daysOfWeek: editingBlock.daysOfWeek,
        reason: editingBlock.reason || '',
      });

      if (editingBlock.type === ScheduleBlockType.SPECIFIC_TIME && editingBlock.startTime && editingBlock.endTime) {
        setSelectedTimeSlots(generateTimeSlotsInRange(editingBlock.startTime, editingBlock.endTime));
      }
    } else {
      // Reset form for new block
      setFormData({
        type: ScheduleBlockType.SPECIFIC_TIME,
        reason: '',
      });
      setSelectedTimeSlots([]);
      setAvailability([]);
    }
  }, [isEditing, editingBlock, visible]);

  useEffect(() => {
    if (formData.type === ScheduleBlockType.SPECIFIC_TIME && formData.date) {
      loadAvailability(formData.date);
    }
  }, [formData.date, formData.type]);

  const generateTimeSlotsInRange = (startTime: string, endTime: string): string[] => {
    const slots: string[] = [];
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    
    let current = new Date(start);
    while (current < end) {
      slots.push(current.toTimeString().substring(0, 5));
      current.setMinutes(current.getMinutes() + 30);
    }
    
    return slots;
  };

  const loadAvailability = async (date: string) => {
    if (!date) return;
    
    setLoadingAvailability(true);
    try {
      const response = await scheduleService.getTimeAvailability(date);
      setAvailability(response);
    } catch (error) {
      console.error('Error loading availability:', error);
      Alert.alert('Error', 'No se pudo cargar la disponibilidad');
    } finally {
      setLoadingAvailability(false);
    }
  };

  const handleTypeChange = (type: ScheduleBlockType) => {
    setFormData(prev => ({
      ...prev,
      type,
      // Reset relevant fields when changing type
      date: type === ScheduleBlockType.SPECIFIC_TIME || type === ScheduleBlockType.FULL_DAY ? prev.date : undefined,
      startTime: type === ScheduleBlockType.SPECIFIC_TIME || type === ScheduleBlockType.RECURRING ? prev.startTime : undefined,
      endTime: type === ScheduleBlockType.SPECIFIC_TIME || type === ScheduleBlockType.RECURRING ? prev.endTime : undefined,
      startDate: type === ScheduleBlockType.RECURRING ? prev.startDate : undefined,
      endDate: type === ScheduleBlockType.RECURRING ? prev.endDate : undefined,
      daysOfWeek: type === ScheduleBlockType.RECURRING ? prev.daysOfWeek : undefined,
    }));
    
    setSelectedTimeSlots([]);
    setErrors({});
  };

  const handleDateSelect = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    if (calendarType === 'date') {
      setFormData(prev => ({ ...prev, date: dateString }));
    } else if (calendarType === 'startDate') {
      setFormData(prev => ({ ...prev, startDate: dateString }));
    } else if (calendarType === 'endDate') {
      setFormData(prev => ({ ...prev, endDate: dateString }));
    }
    setShowCalendar(false);
  };

  const handleTimeSlotPress = (time: string) => {
    if (selectedTimeSlots.includes(time)) {
      setSelectedTimeSlots(prev => prev.filter(t => t !== time));
    } else {
      setSelectedTimeSlots(prev => [...prev, time].sort());
    }
  };

  const handleDayOfWeekToggle = (day: DayOfWeek) => {
    const currentDays = formData.daysOfWeek || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day];
    
    setFormData(prev => ({ ...prev, daysOfWeek: newDays }));
  };

  const validateForm = (data: CreateScheduleBlockDto): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (data.type === ScheduleBlockType.SPECIFIC_TIME) {
      if (!data.date) {
        newErrors.date = 'Selecciona una fecha';
      }
      if (selectedTimeSlots.length === 0) {
        newErrors.timeSlots = 'Selecciona al menos un horario';
      }
    }

    if (data.type === ScheduleBlockType.FULL_DAY) {
      if (!data.date) {
        newErrors.date = 'Selecciona una fecha';
      }
    }

    if (data.type === ScheduleBlockType.RECURRING) {
      if (!data.startDate) {
        newErrors.startDate = 'Selecciona fecha de inicio';
      }
      if (!data.endDate) {
        newErrors.endDate = 'Selecciona fecha de fin';
      }
      if (!data.daysOfWeek || data.daysOfWeek.length === 0) {
        newErrors.daysOfWeek = 'Selecciona al menos un día';
      }
      if (!data.startTime || !data.endTime) {
        newErrors.time = 'Selecciona horario de inicio y fin';
      }
    }

    setErrors(newErrors);
    console.log('validateForm errors', newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    // LOG: inicio de handleSave
    console.log('handleSave called', { type: formData.type, selectedTimeSlots, formData });

    // Calcular startTime y endTime ANTES de validar para recurrente y específico
    let finalFormData = { ...formData };
    if ((formData.type === ScheduleBlockType.SPECIFIC_TIME || formData.type === ScheduleBlockType.RECURRING)) {
      if (selectedTimeSlots.length > 0) {
        const sortedSlots = selectedTimeSlots.sort();
        finalFormData.startTime = sortedSlots[0];
        // Calcular endTime sumando 30 minutos al último slot
        const lastSlot = sortedSlots[sortedSlots.length - 1];
        const [hours, minutes] = lastSlot.split(':').map(Number);
        const endTime = new Date();
        endTime.setHours(hours, minutes + 30, 0, 0);
        finalFormData.endTime = endTime.toTimeString().substring(0, 5);
        // LOG: horarios calculados
        console.log('Calculated startTime/endTime', { startTime: finalFormData.startTime, endTime: finalFormData.endTime });
      }
    }

    // Validar que haya horarios seleccionados en recurrente
    if (formData.type === ScheduleBlockType.RECURRING && selectedTimeSlots.length === 0) {
      console.log('No horarios seleccionados para recurrente');
      setErrors({ timeSlots: 'Selecciona al menos un horario' });
      return;
    }

    // LOG: antes de validar
    console.log('Before validateForm', { finalFormData });
    if (!validateForm(finalFormData)) {
      console.log('Validación fallida', { errors });
      return;
    }

    // LOG: datos finales antes de guardar
    console.log('Saving block', { finalFormData });

    setLoading(true);
    try {
      if (isEditing && editingBlock) {
        await scheduleService.updateScheduleBlock(editingBlock.id, finalFormData);
        Alert.alert('Éxito', 'Bloqueo actualizado correctamente');
      } else {
        await scheduleService.createScheduleBlock(finalFormData);
        Alert.alert('Éxito', 'Bloqueo creado correctamente');
      }
      onSuccess();
    } catch (error: any) {
      console.error('Error saving schedule block:', error);
      let errorMsg = 'No se pudo guardar el bloqueo';
      if (error && error.response && error.response.data && error.response.data.message) {
        errorMsg += `\n${error.response.data.message}`;
      } else if (error && error.message) {
        errorMsg += `\n${error.message}`;
      }
      Alert.alert('Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Seleccionar fecha';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 20; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        // Agregar 8:30 pm (20:30) como último slot
        if (hour === 20 && minute > 30) break;
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }
    // Asegurar que 20:30 (8:30 pm) esté incluido
    if (!slots.includes('20:30')) {
      slots.push('20:30');
    }
    return slots;
  };

  if (!visible) return null;

  return (
    <TouchableWithoutFeedback onPress={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableWithoutFeedback onPress={() => {}}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContainer}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isEditing ? 'Editar Bloqueo' : 'Nuevo Bloqueo'}
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Icon name="close" size={24} color="#D4AF37" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* Tipo de bloqueo */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Tipo de Bloqueo</Text>
                <View style={styles.typeContainer}>
                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      formData.type === ScheduleBlockType.SPECIFIC_TIME && styles.typeButtonActive,
                    ]}
                    onPress={() => handleTypeChange(ScheduleBlockType.SPECIFIC_TIME)}
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        formData.type === ScheduleBlockType.SPECIFIC_TIME && styles.typeButtonTextActive,
                      ]}
                    >
                      Horario Específico
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      formData.type === ScheduleBlockType.FULL_DAY && styles.typeButtonActive,
                    ]}
                    onPress={() => handleTypeChange(ScheduleBlockType.FULL_DAY)}
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        formData.type === ScheduleBlockType.FULL_DAY && styles.typeButtonTextActive,
                      ]}
                    >
                      Día Completo
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      formData.type === ScheduleBlockType.RECURRING && styles.typeButtonActive,
                    ]}
                    onPress={() => handleTypeChange(ScheduleBlockType.RECURRING)}
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        formData.type === ScheduleBlockType.RECURRING && styles.typeButtonTextActive,
                      ]}
                    >
                      Recurrente
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Fecha para horario específico o día completo */}
              {(formData.type === ScheduleBlockType.SPECIFIC_TIME || formData.type === ScheduleBlockType.FULL_DAY) && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Fecha</Text>
                  <TouchableOpacity
                    style={[styles.dateButton, errors.date && styles.inputError]}
                    onPress={() => {
                      setCalendarType('date');
                      setCalendarTitle('Seleccionar Fecha');
                      setShowCalendar(true);
                    }}
                  >
                    <Icon name="calendar" size={20} color="#D4AF37" />
                    <Text style={styles.dateButtonText}>
                      {formatDate(formData.date)}
                    </Text>
                  </TouchableOpacity>
                  {errors.date && <Text style={styles.errorText}>{errors.date}</Text>}
                </View>
              )}

              {/* Seleccionar horarios para horario específico */}
              {formData.type === ScheduleBlockType.SPECIFIC_TIME && formData.date && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Seleccionar Horarios</Text>
                  <Text style={styles.sectionSubtitle}>
                    Toca los horarios que quieres bloquear
                  </Text>
                  
                  {loadingAvailability ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="small" color="#D4AF37" />
                      <Text style={styles.loadingText}>Cargando disponibilidad...</Text>
                    </View>
                  ) : (
                    <View style={styles.timeSlotsContainer}>
                      {generateTimeSlots().map((time) => {
                        const isSelected = selectedTimeSlots.includes(time);
                        const availabilitySlot = availability.find(slot => slot.time === time);
                        const isOccupied = !availabilitySlot?.available || false;
                        // Formato 12 horas am/pm
                        const [h, m] = time.split(':').map(Number);
                        let hour12 = h % 12 === 0 ? 12 : h % 12;
                        const ampm = h < 12 || h === 24 ? 'am' : 'pm';
                        const timeLabel = `${hour12}:${m.toString().padStart(2, '0')} ${ampm}`;
                        return (
                          <TouchableOpacity
                            key={time}
                            style={[
                              styles.timeSlot,
                              isSelected && styles.timeSlotSelected,
                              isOccupied && !isSelected && styles.timeSlotOccupied,
                            ]}
                            onPress={() => handleTimeSlotPress(time)}
                            disabled={isOccupied && !isSelected}
                          >
                            <Text
                              style={[
                                styles.timeSlotText,
                                isSelected && styles.timeSlotTextSelected,
                                isOccupied && !isSelected && styles.timeSlotTextOccupied,
                              ]}
                            >
                              {timeLabel}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                  {errors.timeSlots && <Text style={styles.errorText}>{errors.timeSlots}</Text>}
                </View>
              )}

              {/* Fechas para recurrente */}
              {formData.type === ScheduleBlockType.RECURRING && (
                <>
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Rango de Fechas</Text>
                    
                    <View style={styles.dateRangeContainer}>
                      <View style={styles.dateRangeItem}>
                        <Text style={styles.dateRangeLabel}>Desde</Text>
                        <TouchableOpacity
                          style={[styles.dateButton, errors.startDate && styles.inputError]}
                          onPress={() => {
                            setCalendarType('startDate');
                            setCalendarTitle('Fecha de Inicio');
                            setShowCalendar(true);
                          }}
                        >
                          <Icon name="calendar" size={20} color="#D4AF37" />
                          <Text style={styles.dateButtonText}>
                            {formatDate(formData.startDate)}
                          </Text>
                        </TouchableOpacity>
                      </View>

                      <View style={styles.dateRangeItem}>
                        <Text style={styles.dateRangeLabel}>Hasta</Text>
                        <TouchableOpacity
                          style={[styles.dateButton, errors.endDate && styles.inputError]}
                          onPress={() => {
                            setCalendarType('endDate');
                            setCalendarTitle('Fecha de Fin');
                            setShowCalendar(true);
                          }}
                        >
                          <Icon name="calendar" size={20} color="#D4AF37" />
                          <Text style={styles.dateButtonText}>
                            {formatDate(formData.endDate)}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    
                    {(errors.startDate || errors.endDate) && (
                      <Text style={styles.errorText}>
                        {errors.startDate || errors.endDate}
                      </Text>
                    )}
                  </View>

                  {/* Días de la semana */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Días de la Semana</Text>
                    <View style={styles.daysContainer}>
                      {Object.values(DayOfWeek).map((day) => (
                        <TouchableOpacity
                          key={day}
                          style={[
                            styles.dayButton,
                            formData.daysOfWeek?.includes(day) && styles.dayButtonActive,
                          ]}
                          onPress={() => handleDayOfWeekToggle(day)}
                        >
                          <Text
                            style={[
                              styles.dayButtonText,
                              formData.daysOfWeek?.includes(day) && styles.dayButtonTextActive,
                            ]}
                          >
                            {DAY_LABELS[day].substring(0, 3)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    {errors.daysOfWeek && <Text style={styles.errorText}>{errors.daysOfWeek}</Text>}
                  </View>

                  {/* Seleccionar horarios para recurrente */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Seleccionar Horarios</Text>
                    <Text style={styles.sectionSubtitle}>
                      Toca los horarios que quieres bloquear
                    </Text>
                    <View style={styles.timeSlotsContainer}>
                      {generateTimeSlots().map((time) => {
                        const isSelected = selectedTimeSlots.includes(time);
                        // Formato 12 horas am/pm
                        const [h, m] = time.split(':').map(Number);
                        let hour12 = h % 12 === 0 ? 12 : h % 12;
                        const ampm = h < 12 || h === 24 ? 'am' : 'pm';
                        const timeLabel = `${hour12}:${m.toString().padStart(2, '0')} ${ampm}`;
                        return (
                          <TouchableOpacity
                            key={time}
                            style={[styles.timeSlot, isSelected && styles.timeSlotSelected]}
                            onPress={() => handleTimeSlotPress(time)}
                          >
                            <Text style={[styles.timeSlotText, isSelected && styles.timeSlotTextSelected]}>
                              {timeLabel}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                    {errors.timeSlots && <Text style={styles.errorText}>{errors.timeSlots}</Text>}
                  </View>
                </>
              )}

              {/* Razón */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Razón (Opcional)</Text>
                <TextInput
                  style={styles.reasonInput}
                  value={formData.reason}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, reason: text }))}
                  placeholder="Motivo del bloqueo..."
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#1c1c1c" />
                ) : (
                  <Text style={styles.saveButtonText}>
                    {isEditing ? 'Actualizar' : 'Guardar'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>

        {/* Calendar Modal */}
        {showCalendar && (
          <CustomCalendar
            visible={showCalendar}
            title={calendarTitle}
            onClose={() => setShowCalendar(false)}
            onDateSelect={handleDateSelect}
            selectedDate={
              calendarType === 'date' && formData.date ? new Date(formData.date + 'T00:00:00') :
              calendarType === 'startDate' && formData.startDate ? new Date(formData.startDate + 'T00:00:00') :
              calendarType === 'endDate' && formData.endDate ? new Date(formData.endDate + 'T00:00:00') :
              null
            }
          />
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

export default ScheduleBlockModal;
