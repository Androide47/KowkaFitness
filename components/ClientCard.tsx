import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MessageCircle, Calendar, BarChart } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { Client } from '@/types';
import { Avatar } from './Avatar';

interface ClientCardProps {
  client: Client;
  onPress: () => void;
  onMessagePress: () => void;
  onSchedulePress: () => void;
  onProgressPress: () => void;
}

export const ClientCard: React.FC<ClientCardProps> = ({
  client,
  onPress,
  onMessagePress,
  onSchedulePress,
  onProgressPress,
}) => {
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <Avatar source={client.avatar} name={client.name} size={50} />
        
        <View style={styles.info}>
          <Text style={styles.name}>{client.name}</Text>
          <View style={styles.streakContainer}>
            <Text style={styles.streakLabel}>Streak:</Text>
            <Text style={styles.streakCount}>{client.streakCount} days</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={onMessagePress}
        >
          <MessageCircle size={20} color={colors.primary} />
          <Text style={styles.actionText}>Message</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={onSchedulePress}
        >
          <Calendar size={20} color={colors.primary} />
          <Text style={styles.actionText}>Schedule</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={onProgressPress}
        >
          <BarChart size={20} color={colors.primary} />
          <Text style={styles.actionText}>Progress</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.small,
  },
  header: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  info: {
    marginLeft: theme.spacing.md,
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginRight: 4,
  },
  streakCount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: theme.spacing.md,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 12,
    color: colors.primary,
    marginTop: 4,
  },
});