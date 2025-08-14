import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { styles } from './NotificationsScreen.styles';
import { NotificationsService } from '../../services/notifications.service';
import { Notification, NotificationType } from '../../services/notifications.types';
import { useFocusEffect } from '@react-navigation/native';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { getProfile } from '../../services/auth.service';
import { UserRole } from '../auth/user.types';

interface NotificationsScreenProps {
  navigation: any;
}

const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ navigation }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  const fetchUserProfile = useCallback(async () => {
    try {
      const profile = await getProfile();
      setUserRole(profile.role);
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  }, []);

  const fetchNotifications = useCallback(async (pageNum = 1, refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
        setError(null);
      } else if (pageNum === 1) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      const response = await NotificationsService.getUserNotifications(pageNum, 20);
      
      if (pageNum === 1 || refresh) {
        setNotifications(response.notifications);
      } else {
        setNotifications(prev => [...prev, ...response.notifications]);
      }

      setHasMore(pageNum < response.totalPages);
      setPage(pageNum);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar las notificaciones');
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, []);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await NotificationsService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
      Alert.alert('Error', 'No se pudo marcar la notificación como leída');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await NotificationsService.markAllAsRead();
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, isRead: true }))
      );
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      Alert.alert('Error', 'No se pudieron marcar todas las notificaciones como leídas');
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    Alert.alert(
      'Eliminar notificación',
      '¿Estás seguro de que quieres eliminar esta notificación?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await NotificationsService.deleteNotification(notificationId);
              setNotifications(prev =>
                prev.filter(notification => notification.id !== notificationId)
              );
            } catch (err) {
              console.error('Error deleting notification:', err);
              Alert.alert('Error', 'No se pudo eliminar la notificación');
            }
          },
        },
      ]
    );
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchNotifications(page + 1);
    }
  };

  const formatNotificationTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return formatDistanceToNow(date, { addSuffix: true, locale: es });
    } else {
      return format(date, 'dd/MM/yyyy HH:mm', { locale: es });
    }
  };

  const navigateToRelatedScreen = (notification: Notification) => {
    // Marcar como leída al hacer tap
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }

    // Navegar según el tipo de notificación y el rol del usuario
    switch (notification.type) {
      case NotificationType.APPOINTMENT_REQUEST:
      case NotificationType.APPOINTMENT_REQUEST_ACCEPTED:
      case NotificationType.APPOINTMENT_RESCHEDULED_BY_USER:
      case NotificationType.APPOINTMENT_RESCHEDULED_BY_ADMIN:
      case NotificationType.APPOINTMENT_RESCHEDULE_ACCEPTED:
      case NotificationType.APPOINTMENT_RESCHEDULE_COUNTER_PROPOSAL:
      case NotificationType.APPOINTMENT_RESCHEDULE_COUNTER_CONFIRMED:
      case NotificationType.APPOINTMENT_RESCHEDULE_COUNTER_REJECTED:
      case NotificationType.APPOINTMENT_RESCHEDULE_REJECTED:
      case NotificationType.APPOINTMENT_CANCELLED:
      case NotificationType.APPOINTMENT_CANCELLED_BY_ADMIN:
      case NotificationType.APPOINTMENT_PENDING_REVIEW:
      case NotificationType.PENDING_APPOINTMENTS_REMINDER:
        // Para administradores y asesores, redirigir a la gestión de citas
        if (userRole === UserRole.ADMIN || userRole === UserRole.ADVISOR) {
          navigation.navigate('AppointmentManagement');
        } else {
          // Para usuarios regulares, redirigir a sus citas
          navigation.navigate('Appointments');
        }
        break;
      case NotificationType.PROFILE_INCOMPLETE:
        navigation.navigate('Profile');
        break;
      default:
        break;
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserProfile();
      fetchNotifications(1, true);
    }, [fetchUserProfile, fetchNotifications])
  );

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.notificationItem, !item.isRead && styles.unreadNotification]}
      onPress={() => navigateToRelatedScreen(item)}
      activeOpacity={0.7}
    >
      <View 
        style={[
          styles.iconContainer,
          { backgroundColor: NotificationsService.getNotificationColor(item.type) + '20' }
        ]}
      >
        <Icon
          name={NotificationsService.getNotificationIcon(item.type)}
          size={20}
          color={NotificationsService.getNotificationColor(item.type)}
        />
        {!item.isRead && <View style={styles.unreadIndicator} />}
      </View>

      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={styles.notificationTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.notificationTime}>
            {formatNotificationTime(item.createdAt)}
          </Text>
        </View>

        <Text style={styles.notificationMessage} numberOfLines={2}>
          {item.message}
        </Text>

        <View style={styles.actionsContainer}>
          {!item.isRead && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={(e) => {
                e.stopPropagation();
                handleMarkAsRead(item.id);
              }}
            >
              <Icon name="check" size={16} color="#4CAF50" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={(e) => {
              e.stopPropagation();
              handleDeleteNotification(item.id);
            }}
          >
            <Icon name="delete" size={16} color="#F44336" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Notificaciones</Text>
      {notifications.some(n => !n.isRead) && (
        <TouchableOpacity style={styles.markAllButton} onPress={handleMarkAllAsRead}>
          <Icon name="check-all" size={16} color="#D4AF37" />
          <Text style={styles.markAllText}>Marcar todas</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderFooter = () => {
    if (loadingMore) {
      return (
        <View style={styles.loadMoreContainer}>
          <ActivityIndicator size="small" color="#D4AF37" />
        </View>
      );
    }

    if (hasMore && notifications.length > 0) {
      return (
        <View style={styles.loadMoreContainer}>
          <TouchableOpacity style={styles.loadMoreButton} onPress={handleLoadMore}>
            <Text style={styles.loadMoreText}>Cargar más</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="bell-outline" size={80} color="#555" style={styles.emptyIcon} />
      <Text style={styles.emptyTitle}>No tienes notificaciones</Text>
      <Text style={styles.emptyText}>
        Cuando recibas notificaciones sobre tus citas y actividades, aparecerán aquí.
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D4AF37" />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchNotifications(1, true)}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchNotifications(1, true)}
            colors={['#D4AF37']}
            tintColor="#D4AF37"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default NotificationsScreen;
