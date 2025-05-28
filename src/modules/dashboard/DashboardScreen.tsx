import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { styles } from './DashboardScreen.styles';
import type { DashboardScreenProps, FinancialData, Transaction } from './DashboardScreen.types';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';

const DashboardScreen: React.FC<DashboardScreenProps> = ({ route, navigation }) => {
    const { user } = route.params;
    const [financialData, setFinancialData] = useState<FinancialData | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                if (!token) return;

                const config = {
                    headers: { Authorization: `Bearer ${token}` }
                };

                const profileResponse = await axios.get('http://localhost:300/auth/me', config);
                const updatedUser = profileResponse.data;

                if (updatedUser.picture) {
                    setProfileImage(updatedUser.picture);
                } else if (user.picture) {
                    setProfileImage(user.picture);
                }

                const [financeRes, transactionsRes] = await Promise.all([
                    axios.get('http://localhost:3000/dashboard', config),
                    axios.get('http://localhost:3000/transactions', config)
                ]);

                setFinancialData(financeRes.data.data);
                setTransactions(transactionsRes.data.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const handleLogout = async () => {
        await AsyncStorage.removeItem('token');
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: 'Login' }],
            })
        );
    };

    const handleImageError = () => {
        setImageError(true);
        setProfileImage(null);
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#D4AF37" />
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            <ScrollView style={styles.container}>
                <View style={styles.profileSection}>
                    {profileImage && !imageError ? (
                        <Image
                            source={{ uri: profileImage }}
                            style={styles.profileImage}
                            onError={handleImageError}
                            onLoad={() => setImageError(false)}
                        />
                    ) : (
                        <View style={styles.profileImagePlaceholder}>
                            <Icon name="account-circle" size={60} color="#D4AF37" />
                        </View>
                    )}
                    <View style={styles.userInfo}>
                        <Text style={styles.welcomeText}>
                            Bienvenido, {user.firstName || 'Usuario'}
                        </Text>
                        <Text style={styles.emailText}>{user.email}</Text>
                        {imageError && (
                            <Text style={styles.imageErrorText}>
                                No se pudo cargar la imagen de perfil
                            </Text>
                        )}
                    </View>
                </View>

                {financialData && (
                    <View style={styles.financeSection}>
                        <Text style={styles.sectionTitle}>Resumen Financiero</Text>
                        <View style={styles.financeCard}>
                            <View style={styles.financeRow}>
                                <Text style={styles.financeLabel}>Balance Total:</Text>
                                <Text style={styles.financeValue}>
                                    ${financialData.balance.toFixed(2)}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const additionalStyles = StyleSheet.create({
    profileImagePlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 15,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#2a2a2a',
    },
    userInfo: {
        flex: 1,
    },
    imageErrorText: {
        color: '#FF5555',
        fontSize: 12,
        marginTop: 5,
    },
});

export default DashboardScreen;
