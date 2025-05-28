import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { styles } from './FinanceScreen.styles';
import { FinanceService } from './finance.service';
import { FinanceEntry, SortOption, FilterOption } from './FinanceScreen.types';

interface FinanceListProps {
    refreshTrigger: boolean;
    currency: 'CRC' | 'USD';
    sortBy: SortOption;
    filterBy: FilterOption;
    exchangeRate: number;
}

const FinanceList: React.FC<FinanceListProps> = ({
                                                     refreshTrigger,
                                                     currency,
                                                     sortBy,
                                                     filterBy,
                                                     exchangeRate
                                                 }) => {
    const [entries, setEntries] = useState<FinanceEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadEntries = async () => {
            try {
                let data = await FinanceService.getAllEntries();

                data = filterEntries(data, filterBy);

                data = sortEntries(data, sortBy);

                setEntries(data);
            } catch (error) {
                console.error('Error loading entries:', error);
            } finally {
                setLoading(false);
            }
        };

        loadEntries();
    }, [refreshTrigger, sortBy, filterBy]);

    const filterEntries = (entries: FinanceEntry[], filter: FilterOption): FinanceEntry[] => {
        const now = new Date();
        const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1));
        const threeMonthsAgo = new Date(now.setMonth(now.getMonth() - 3));

        switch(filter) {
            case 'income':
                return entries.filter(e => e.type === 'income');
            case 'expense':
                return entries.filter(e => e.type === 'expense');
            case 'lastMonth':
                return entries.filter(e => new Date(e.date) >= oneMonthAgo);
            case 'last3Months':
                return entries.filter(e => new Date(e.date) >= threeMonthsAgo);
            default:
                return entries;
        }
    };

    const sortEntries = (entries: FinanceEntry[], sort: SortOption): FinanceEntry[] => {
        const sorted = [...entries];

        switch(sort) {
            case 'recent':
                return sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            case 'oldest':
                return sorted.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            case 'highest':
                return sorted.sort((a, b) => b.amount - a.amount);
            case 'lowest':
                return sorted.sort((a, b) => a.amount - b.amount);
            case 'type':
                return sorted.sort((a, b) => a.type.localeCompare(b.type));
            default:
                return sorted;
        }
    };

    const formatAmount = (amount: number): string => {
        const convertedAmount = currency === 'CRC' ? amount * exchangeRate : amount;
        const symbol = currency === 'CRC' ? '₡' : '$';
        return `${symbol}${convertedAmount.toFixed(2)}`;
    };

    const renderItem = ({ item }: { item: FinanceEntry }) => (
        <View style={styles.entryItem}>
            <View style={styles.entryIcon}>
                <Icon
                    name={item.type === 'income' ? 'arrow-down' : 'arrow-up'}
                    size={20}
                    color={item.type === 'income' ? '#4CAF50' : '#F44336'}
                />
            </View>
            <View style={styles.entryInfo}>
                <Text style={styles.entryTitle}>{item.title}</Text>
                <Text style={styles.entryDate}>{new Date(item.date).toLocaleDateString()}</Text>
                {item.description && (
                    <Text style={styles.entryDescription}>{item.description}</Text>
                )}
            </View>
            <Text style={[
                styles.entryAmount,
                item.type === 'income' ? styles.incomeAmount : styles.expenseAmount
            ]}>
                {formatAmount(item.amount)}
            </Text>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#D4AF37" />
            </View>
        );
    }

    return (
        <FlatList
            data={entries}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No hay movimientos registrados</Text>
                </View>
            }
        />
    );
};

export default FinanceList;
