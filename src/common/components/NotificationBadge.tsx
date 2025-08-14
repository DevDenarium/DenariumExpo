import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NotificationsService } from '../../services/notifications.service';
import { useFocusEffect } from '@react-navigation/native';

interface NotificationBadgeProps {
  size?: number;
  backgroundColor?: string;
  textColor?: string;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  size = 18,
  backgroundColor = '#D4AF37',
  textColor = '#1c1c1c',
  position = 'top-right',
}) => {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const response = await NotificationsService.getUnreadCount();
      setUnreadCount(response.unreadCount);
    } catch (error) {
      console.error('Error fetching unread count:', error);
      setUnreadCount(0);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchUnreadCount();
      
      // Actualizar cada 30 segundos cuando la pantalla está enfocada
      const interval = setInterval(fetchUnreadCount, 30000);
      
      return () => clearInterval(interval);
    }, [])
  );

  if (unreadCount === 0) {
    return null;
  }

  const getPositionStyle = () => {
    const baseStyle = {
      position: 'absolute' as const,
      zIndex: 10,
    };

    switch (position) {
      case 'top-left':
        return { ...baseStyle, top: -size/4, left: -size/4 };
      case 'bottom-right':
        return { ...baseStyle, bottom: -size/4, right: -size/4 };
      case 'bottom-left':
        return { ...baseStyle, bottom: -size/4, left: -size/4 };
      default: // top-right
        return { ...baseStyle, top: -size/4, right: -size/4 };
    }
  };

  return (
    <View
      style={[
        styles.badge,
        getPositionStyle(),
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
        },
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          {
            color: textColor,
            fontSize: size * 0.6,
          },
        ]}
        numberOfLines={1}
      >
        {unreadCount > 99 ? '99+' : unreadCount.toString()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 18,
    paddingHorizontal: 2,
  },
  badgeText: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default NotificationBadge;
