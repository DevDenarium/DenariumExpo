import React, { useState, useEffect } from 'react';
import { View, ScrollView, RefreshControl, Text, TouchableOpacity } from 'react-native';
import { styles } from './FinanceScreen.styles';
import FinanceEntryForm from './FinanceEntryForm';
import FinanceList from './FinanceList';
import { FinanceService } from '../../services/Finance.service';
import {
    BalanceSummary,
    Currency,
    FinanceSettings,
    SortOption,
    FilterOption,
    CURRENCIES,
    MonthYear
} from './FinanceScreen.types';
import ConfigModal from './ConfigModal';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEFAULT_SETTINGS: FinanceSettings = {
    currency: CURRENCIES.find(c => c.code === 'CRC') || CURRENCIES[0],
    sortBy: 'recent',
    filterBy: 'all'
};

const FinanceScreen: React.FC = () => {
    const [balance, setBalance] = useState<BalanceSummary>({
        balance: 0,
        incomes: 0,
        expenses: 0
    });
    const [refreshing, setRefreshing] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(false);
    const [settings, setSettings] = useState<FinanceSettings>(DEFAULT_SETTINGS);
    const [showConfig, setShowConfig] = useState(false);
    const [selectedMonthYear, setSelectedMonthYear] = useState<MonthYear>({
        month: new Date().getMonth(),
        year: new Date().getFullYear()
    });

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const savedSettings = await AsyncStorage.getItem('financeSettings');
                if (savedSettings) {
                    const parsedSettings = JSON.parse(savedSettings);
                    const currency = CURRENCIES.find(c => c.code === parsedSettings.currency) || DEFAULT_SETTINGS.currency;
                    setSettings({
                        currency,
                        sortBy: parsedSettings.sortBy || DEFAULT_SETTINGS.sortBy,
                        filterBy: 'all' // <--- Fuerza que siempre empiece en 'all'
                    });
                }
            } catch (error) {
                console.error('Error loading settings:', error);
            }
        };
        loadSettings();
    }, []);

    useEffect(() => {
        const saveSettings = async () => {
            try {
                await AsyncStorage.setItem('financeSettings', JSON.stringify(settings));
            } catch (error) {
                console.error('Error saving settings:', error);
            }
        };

        saveSettings();
    }, [settings]);

    const loadBalance = async () => {
        try {
            const data = await FinanceService.calculateBalance();
            setBalance(data);
        } catch (error) {
            console.error('Error loading balance:', error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadBalance();
        setRefreshTrigger(prev => !prev);
        setRefreshing(false);
    };

    useEffect(() => {
        loadBalance();
    }, []);

    const formatAmount = (amount: number): string => {
        // Usamos 'en-US' para ambos casos para asegurar comas como separadores de miles
        const formattedAmount = amount.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        return `${settings.currency.symbol}${formattedAmount}`;
    };

    const getMonthName = (month: number) => {
        const months = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        return months[month];
    };

    return (
        <View style={{ flex: 1 }}>
            <TouchableOpacity
                style={styles.configButton}
                onPress={() => setShowConfig(true)}
            >
                <Icon name="cog" size={24} color="#D4AF37" />
            </TouchableOpacity>

            <ScrollView
                style={styles.container}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#D4AF37"
                    />
                }
            >
                <View style={styles.balanceContainer}>
                    <Text style={styles.balanceTitle}>Balance Actual ({settings.currency.code})</Text>
                    {settings.filterBy === 'specificMonth' && (
                        <Text style={{ color: '#D4AF37', fontSize: 14, marginBottom: 5 }}>
                            {getMonthName(selectedMonthYear.month)} {selectedMonthYear.year}
                        </Text>
                    )}
                    <Text style={[
                        styles.balanceAmount,
                        balance.balance >= 0 ? styles.balancePositive : styles.balanceNegative
                    ]}>
                        {formatAmount(balance.balance)}
                    </Text>
                    <View style={styles.balanceDetails}>
                        <Text style={styles.balanceDetail}>
                            Ingresos: {formatAmount(balance.incomes)}
                        </Text>
                        <Text style={styles.balanceDetail}>
                            Gastos: {formatAmount(balance.expenses)}
                        </Text>
                    </View>
                </View>

                <FinanceEntryForm onEntryAdded={onRefresh} />

                <FinanceList
                    refreshTrigger={refreshTrigger}
                    currency={settings.currency.symbol}
                    sortBy={settings.sortBy}
                    filterBy={settings.filterBy}
                    onRefresh={onRefresh}
                    selectedMonthYear={selectedMonthYear}
                />
            </ScrollView>

            <ConfigModal
                visible={showConfig}
                onClose={() => setShowConfig(false)}
                settings={settings}
                onSettingsChange={setSettings}
                selectedMonthYear={selectedMonthYear}
                onMonthYearChange={setSelectedMonthYear}
            />
        </View>
    );
};

export default FinanceScreen;
