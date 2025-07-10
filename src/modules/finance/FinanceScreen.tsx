import React, { useEffect, useState } from 'react';
import { View, RefreshControl, Text, TouchableOpacity, Modal } from 'react-native';
import { styles } from './FinanceScreen.styles';
import FinanceEntryForm from './FinanceEntryForm';
import FinanceList from './FinanceList';
import { FinanceService } from '../../services/Finance.service';
import { BalanceSummary, Currency, FinanceSettings, SortOption, FilterOption, CURRENCIES, MonthYear, FinanceEntryType, FinanceCategory, FinanceTag } from './FinanceScreen.types';
import ConfigModal from './ConfigModal';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../auth/AuthContext';

const DEFAULT_SETTINGS: FinanceSettings = {
    currency: CURRENCIES.find(c => c.code === 'CRC') || CURRENCIES[0],
    sortBy: 'recent',
    filterBy: 'all'
};

const FinanceScreen: React.FC = () => {
    const { user } = useAuth();
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
    const [categories, setCategories] = useState<FinanceCategory[]>([]);
    const [tags, setTags] = useState<FinanceTag[]>([]);
    const [showEntryForm, setShowEntryForm] = useState(false);

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const savedSettings = await AsyncStorage.getItem('financeSettings');
                if (savedSettings) {
                    const parsedSettings = JSON.parse(savedSettings);
                    const currency = CURRENCIES.find(c => c.code === parsedSettings.currency.code) || DEFAULT_SETTINGS.currency;
                    setSettings({
                        ...parsedSettings,
                        currency,
                        filterBy: parsedSettings.filterBy || DEFAULT_SETTINGS.filterBy
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

    useEffect(() => {
        if (user?.id) {
            loadBalance();
            loadCategoriesAndTags();
        }
    }, [user, refreshTrigger]);

    const getActiveFiltersCount = () => {
        let count = 0;
        if (settings.filterBy !== 'all') count++;
        if (settings.filterBy === 'specificMonth') count++;
        if (settings.sortBy !== 'recent') count++;
        return count;
    };

    const activeFiltersCount = getActiveFiltersCount();

    const loadCategoriesAndTags = async () => {
        try {
            const [cats, tgs] = await Promise.all([
                FinanceService.getCategories(),
                FinanceService.getTags()
            ]);
            setCategories(cats || []);
            setTags(tgs || []);
        } catch (error) {
            console.error('Error loading categories/tags:', error);
        }
    };

    const loadBalance = async () => {
        try {
            const data = await FinanceService.calculateBalance();
            setBalance(data);
        } catch (error) {
            console.error('Error loading balance:', error);
            setBalance({ balance: 0, incomes: 0, expenses: 0 });
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await Promise.all([loadBalance(), loadCategoriesAndTags()]);
            setRefreshTrigger(prev => !prev);
        } catch (error) {
            console.error('Error during refresh:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const handleEntryAdded = async () => {
        try {
            await loadBalance();
            await loadCategoriesAndTags();
            setRefreshTrigger(prev => !prev);
            setShowEntryForm(false);
        } catch (error) {
            console.error('Error updating balance:', error);
        }
    };

    const formatAmount = (amount: number): string => {
        const formattedAmount = amount.toLocaleString('de-DE', {
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
        <View style={{ flex: 1, backgroundColor: '#1c1c1c' }}>
            <TouchableOpacity
                style={styles.configButton}
                onPress={() => setShowConfig(true)}
            >
                <Icon name="cog" size={24} color="#D4AF37" />
                {activeFiltersCount > 0 && (
                    <View style={styles.filterBadge}>
                        <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
                    </View>
                )}
            </TouchableOpacity>

            <FinanceList
                refreshTrigger={refreshTrigger}
                currency={settings.currency.symbol}
                sortBy={settings.sortBy}
                filterBy={settings.filterBy}
                onRefresh={onRefresh}
                selectedMonthYear={selectedMonthYear}
                categories={categories}
                setCategories={setCategories}
                userId={user?.id || ''}
                refreshing={refreshing}
                onRefreshTrigger={onRefresh}
                headerComponent={
                    <View style={styles.headerContainer}>
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

                        <TouchableOpacity
                            style={styles.addEntryButton}
                            onPress={() => setShowEntryForm(true)}
                        >
                            <Icon
                                name="plus-circle"
                                size={24}
                                color="#D4AF37"
                                style={styles.addEntryButtonIcon}
                            />
                            <Text style={styles.addEntryButtonText}>Ingresar movimiento</Text>
                        </TouchableOpacity>
                    </View>
                }
            />

            <Modal
                animationType="slide"
                transparent={true}
                visible={showEntryForm}
                onRequestClose={() => setShowEntryForm(false)}
            >
                <View style={styles.fullScreenModalOverlay}>
                    <View style={styles.fullScreenModalContainer}>
                        <View style={styles.editModalHeader}>
                            <Text style={styles.editModalTitle}>Nuevo Movimiento</Text>
                            <TouchableOpacity
                                onPress={() => setShowEntryForm(false)}
                                style={styles.editModalCloseButton}
                            >
                                <Icon name="close" size={24} color="#D4AF37" />
                            </TouchableOpacity>
                        </View>

                        <FinanceEntryForm
                            onEntryAdded={handleEntryAdded}
                            categories={categories}
                            setCategories={setCategories}
                            tags={tags}
                            setTags={setTags}
                            onCancel={() => setShowEntryForm(false)}
                            hideHeader={true}
                            customStyles={true}
                        />
                    </View>
                </View>
            </Modal>

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
