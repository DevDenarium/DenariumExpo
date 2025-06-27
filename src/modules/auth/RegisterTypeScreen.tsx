import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navegation/Navegation.types';

type RegisterTypeScreenProps = {
    navigation: StackNavigationProp<RootStackParamList, 'RegisterType'>;
};

const RegisterTypeScreen = ({ navigation }: RegisterTypeScreenProps) => {
    const [showPersonalInfo, setShowPersonalInfo] = React.useState(false);
    const [showCorporateInfo, setShowCorporateInfo] = React.useState(false);
    const [showEmployeeInfo, setShowEmployeeInfo] = React.useState(false);

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.contentContainer}>
                <View style={styles.headerContainer}>
                    <Text style={styles.title}>Selecciona tu tipo de cuenta</Text>
                    <Text style={styles.subtitle}>
                        Elige el tipo de cuenta que mejor se adapte a tus necesidades
                    </Text>
                </View>

                {/* Personal Account Option */}
                <TouchableOpacity
                    style={styles.optionCard}
                    onPress={() => navigation.navigate('RegisterPersonal')}
                    onLongPress={() => setShowPersonalInfo(!showPersonalInfo)}
                >
                    <View style={styles.optionHeader}>
                        <Icon name="account" size={24} color="#D4AF37" />
                        <Text style={styles.optionTitle}>Cuenta Personal</Text>
                        <TouchableOpacity
                            onPress={() => setShowPersonalInfo(!showPersonalInfo)}
                            style={styles.infoButton}
                        >
                            <Icon
                                name={showPersonalInfo ? 'information-off' : 'information'}
                                size={20}
                                color="#D4AF37"
                            />
                        </TouchableOpacity>
                    </View>

                    {showPersonalInfo && (
                        <Text style={styles.optionDescription}>
                            Ideal para gestionar tus finanzas personales. Registra tus ingresos y gastos,
                            establece metas financieras y accede a contenido educativo sobre finanzas personales.
                        </Text>
                    )}
                </TouchableOpacity>

                {/* Corporate Account Option */}
                <TouchableOpacity
                    style={styles.optionCard}
                    onPress={() => navigation.navigate('RegisterCorporate')}
                    onLongPress={() => setShowCorporateInfo(!showCorporateInfo)}
                >
                    <View style={styles.optionHeader}>
                        <Icon name="office-building" size={24} color="#D4AF37" />
                        <Text style={styles.optionTitle}>Cuenta Corporativa</Text>
                        <TouchableOpacity
                            onPress={() => setShowCorporateInfo(!showCorporateInfo)}
                            style={styles.infoButton}
                        >
                            <Icon
                                name={showCorporateInfo ? 'information-off' : 'information'}
                                size={20}
                                color="#D4AF37"
                            />
                        </TouchableOpacity>
                    </View>

                    {showCorporateInfo && (
                        <Text style={styles.optionDescription}>
                            Para empresas que desean gestionar sus finanzas corporativas y capacitar
                            a sus empleados. Incluye acceso a informes avanzados y la posibilidad de
                            agregar empleados con cuentas vinculadas.
                        </Text>
                    )}
                </TouchableOpacity>

                {/* Corporate Employee Option */}
                <TouchableOpacity
                    style={styles.optionCard}
                    onPress={() => navigation.navigate('RegisterCorporateEmployee')}
                    onLongPress={() => setShowEmployeeInfo(!showEmployeeInfo)}
                >
                    <View style={styles.optionHeader}>
                        <Icon name="account-group" size={24} color="#D4AF37" />
                        <Text style={styles.optionTitle}>Personal Corporativo</Text>
                        <TouchableOpacity
                            onPress={() => setShowEmployeeInfo(!showEmployeeInfo)}
                            style={styles.infoButton}
                        >
                            <Icon
                                name={showEmployeeInfo ? 'information-off' : 'information'}
                                size={20}
                                color="#D4AF37"
                            />
                        </TouchableOpacity>
                    </View>

                    {showEmployeeInfo && (
                        <Text style={styles.optionDescription}>
                            Para empleados de empresas que tienen una cuenta corporativa activa.
                            Acceso gratuito a todos los servicios de la aplicación con tu correo
                            corporativo.
                        </Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => navigation.navigate('Login')}
                    style={styles.loginLinkContainer}
                >
                    <Text style={styles.loginText}>
                        ¿Ya tienes una cuenta? <Text style={styles.loginLink}>Inicia sesión</Text>
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#1c1c1c',
    },
    contentContainer: {
        paddingHorizontal: 30,
        paddingTop: 40,
        paddingBottom: 20,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    title: {
        fontSize: 26,
        fontWeight: '600',
        marginBottom: 10,
        textAlign: 'center',
        color: '#D4AF37',
        fontFamily: 'sans-serif',
        letterSpacing: 0.5,
        textShadowColor: 'rgba(212, 175, 55, 0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    subtitle: {
        fontSize: 16,
        color: '#FFFFFF',
        textAlign: 'center',
        opacity: 0.8,
        paddingHorizontal: 20,
    },
    optionCard: {
        backgroundColor: '#2a2a2a',
        borderRadius: 10,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#333',
    },
    optionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    optionTitle: {
        color: '#D4AF37',
        fontSize: 18,
        fontWeight: '600',
        marginLeft: 10,
        flex: 1,
    },
    optionDescription: {
        color: '#FFFFFF',
        fontSize: 14,
        opacity: 0.8,
        marginTop: 10,
    },
    infoButton: {
        padding: 5,
    },
    loginLinkContainer: {
        marginTop: 10,
    },
    loginText: {
        textAlign: 'center',
        color: '#D4AF37',
        fontSize: 15,
    },
    loginLink: {
        fontWeight: '700',
        textDecorationLine: 'underline',
    },
});

export default RegisterTypeScreen;
