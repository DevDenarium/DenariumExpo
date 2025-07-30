import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    Platform,
} from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { styles } from './CustomCalendar.styles';

LocaleConfig.locales['es'] = {
    monthNames: [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ],
    monthNamesShort: [
        'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
        'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ],
    dayNames: [
        'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
    ],
    dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
    today: 'Hoy'
};
LocaleConfig.defaultLocale = 'es';

export interface CustomCalendarProps {
    visible: boolean;
    onClose: () => void;
    onDateSelect: (date: Date) => void;
    selectedDate?: Date | null;
    title?: string;
    minDate?: Date;
    maxDate?: Date;
    initialDate?: Date;
}

const CustomCalendar: React.FC<CustomCalendarProps> = ({
    visible,
    onClose,
    onDateSelect,
    selectedDate,
    title = "Seleccionar Fecha",
    minDate,
    maxDate,
    initialDate
}) => {
    const [calendarMonth, setCalendarMonth] = useState<number>(
        (initialDate || selectedDate || new Date()).getMonth()
    );
    const [calendarYear, setCalendarYear] = useState<number>(
        (initialDate || selectedDate || new Date()).getFullYear()
    );

    const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    useEffect(() => {
        if (visible && (initialDate || selectedDate)) {
            const dateToUse = initialDate || selectedDate || new Date();
            setCalendarMonth(dateToUse.getMonth());
            setCalendarYear(dateToUse.getFullYear());
        }
    }, [visible, initialDate, selectedDate]);

    const changeMonth = (increment: number) => {
        let newMonth = calendarMonth + increment;
        let newYear = calendarYear;
        
        if (newMonth > 11) {
            newMonth = 0;
            newYear = calendarYear + 1;
            setCalendarYear(newYear);
        } else if (newMonth < 0) {
            newMonth = 11;
            newYear = calendarYear - 1;
            setCalendarYear(newYear);
        }
        
        setCalendarMonth(newMonth);
    };

    const changeYear = (increment: number) => {
        const newYear = calendarYear + increment;
        const currentYear = new Date().getFullYear();
        const minYear = minDate?.getFullYear() || (currentYear - 5);
        const maxYear = maxDate?.getFullYear() || (currentYear + 5);
        
        if (newYear >= minYear && newYear <= maxYear) {
            setCalendarYear(newYear);
        }
    };

    const handleDayPress = (day: any) => {
        const selectedDate = new Date(day.year, day.month - 1, day.day);
        
        if (minDate && selectedDate < minDate) return;
        if (maxDate && selectedDate > maxDate) return;
        
        onDateSelect(selectedDate);
        onClose();
    };

    const getMarkedDates = () => {
        const marked: any = {};
        
        if (selectedDate) {
            const dateString = format(selectedDate, 'yyyy-MM-dd');
            marked[dateString] = {
                selected: true,
                selectedColor: '#D4AF37'
            };
        }
        
        return marked;
    };

    const getMinDateString = () => {
        return minDate ? format(minDate, 'yyyy-MM-dd') : undefined;
    };

    const getMaxDateString = () => {
        return maxDate ? format(maxDate, 'yyyy-MM-dd') : undefined;
    };

    if (!visible) return null;

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <TouchableOpacity 
                style={styles.overlay}
                activeOpacity={1}
                onPress={onClose}
            >
                <View style={styles.container}>
                    <Text style={styles.title}>
                        {title}
                    </Text>

                    <View style={styles.controlsContainer}>
                        {/* Control de Mes */}
                        <View style={styles.monthControl}>
                            <Text style={styles.controlLabel}>MES</Text>
                            <View style={styles.controlRow}>
                                <TouchableOpacity 
                                    onPress={() => changeMonth(-1)}
                                    style={styles.arrowButton}
                                >
                                    <Text style={styles.arrowText}>‹</Text>
                                </TouchableOpacity>
                                <Text style={styles.monthText}>
                                    {monthNames[calendarMonth]}
                                </Text>
                                <TouchableOpacity 
                                    onPress={() => changeMonth(1)}
                                    style={styles.arrowButton}
                                >
                                    <Text style={styles.arrowText}>›</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Control de Año */}
                        <View style={styles.yearControl}>
                            <Text style={styles.controlLabel}>AÑO</Text>
                            <View style={styles.controlRow}>
                                <TouchableOpacity 
                                    onPress={() => changeYear(-1)}
                                    style={styles.arrowButton}
                                >
                                    <Text style={styles.arrowText}>‹</Text>
                                </TouchableOpacity>
                                <Text style={styles.yearText}>
                                    {calendarYear}
                                </Text>
                                <TouchableOpacity 
                                    onPress={() => changeYear(1)}
                                    style={styles.arrowButton}
                                >
                                    <Text style={styles.arrowText}>›</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                    
                    {/* Calendario */}
                    <View style={styles.calendarContainer}>
                        <Calendar
                            current={`${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-01`}
                            onDayPress={handleDayPress}
                            markedDates={getMarkedDates()}
                            minDate={getMinDateString()}
                            maxDate={getMaxDateString()}
                            theme={{
                                backgroundColor: '#2c2c2c',
                                calendarBackground: '#2c2c2c',
                                textSectionTitleColor: '#ffffff',
                                selectedDayBackgroundColor: '#D4AF37',
                                selectedDayTextColor: '#000000',
                                todayTextColor: '#D4AF37',
                                dayTextColor: '#ffffff',
                                textDisabledColor: '#666666',
                                dotColor: '#D4AF37',
                                selectedDotColor: '#000000',
                                arrowColor: 'transparent',
                                disabledArrowColor: 'transparent',
                                monthTextColor: 'transparent',
                                indicatorColor: '#D4AF37',
                                textDayFontFamily: 'System',
                                textMonthFontFamily: 'System',
                                textDayHeaderFontFamily: 'System',
                                textDayFontWeight: '300',
                                textMonthFontWeight: 'bold',
                                textDayHeaderFontWeight: '300',
                                textDayFontSize: 16,
                                textMonthFontSize: 16,
                                textDayHeaderFontSize: 13
                            }}
                            firstDay={1}
                            enableSwipeMonths={false}
                            hideArrows={true}
                            disableMonthChange={true}
                        />
                    </View>
                    
                    <TouchableOpacity 
                        style={styles.cancelButton}
                        onPress={onClose}
                    >
                        <Text style={styles.cancelButtonText}>Cancelar</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    );
};

export default CustomCalendar;