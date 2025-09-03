import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LogOut, Settings, Calendar, BarChart, Camera, FileText } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { globalStyles } from '@/constants/theme';
import { useAuthStore } from '@/store/auth-store';
import { useProgressStore } from '@/store/progress-store';
import { Avatar } from '@/components/Avatar';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { ClientCard } from '@/components/ClientCard';
import { StreakCounter } from '@/components/StreakCounter';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isTrainer, clients, logout } = useAuthStore();
  const { getLatestMeasurements } = useProgressStore();
  
  if (!user) return null;
  
  const renderClientProfile = () => {
    const clientUser = user as any;
    const latestMeasurements = getLatestMeasurements(user.id);
    
    return (
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <Avatar source={user.avatar} name={user.name} size={80} />
          
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user.name}</Text>
            <Text style={styles.profileEmail}>{user.email}</Text>
            <View style={styles.streakContainer}>
              <Text style={styles.streakLabel}>Current Streak:</Text>
              <StreakCounter count={clientUser?.streakCount || 0} size="small" />
            </View>
          </View>
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/calendar')}
          >
            <View style={[styles.actionIcon, { backgroundColor: colors.primary }]}>
              <Calendar size={24} color={colors.text} />
            </View>
            <Text style={styles.actionText}>Calendar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/progress')}
          >
            <View style={[styles.actionIcon, { backgroundColor: colors.secondary }]}>
              <BarChart size={24} color={colors.text} />
            </View>
            <Text style={styles.actionText}>Progress</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/progress/photo')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#4CAF50' }]}>
              <Camera size={24} color={colors.text} />
            </View>
            <Text style={styles.actionText}>Photos</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/progress/measurement')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#FF9800' }]}>
              <FileText size={24} color={colors.text} />
            </View>
            <Text style={styles.actionText}>Measurements</Text>
          </TouchableOpacity>
        </View>
        
        {latestMeasurements && (
          <Card style={styles.measurementsCard}>
            <Text style={styles.cardTitle}>Latest Measurements</Text>
            <View style={styles.measurementsGrid}>
              {latestMeasurements.weight && (
                <View style={styles.measurementItem}>
                  <Text style={styles.measurementLabel}>Weight</Text>
                  <Text style={styles.measurementValue}>{latestMeasurements.weight} kg</Text>
                </View>
              )}
              
              {latestMeasurements.bodyFat && (
                <View style={styles.measurementItem}>
                  <Text style={styles.measurementLabel}>Body Fat</Text>
                  <Text style={styles.measurementValue}>{latestMeasurements.bodyFat}%</Text>
                </View>
              )}
              
              {latestMeasurements.chest && (
                <View style={styles.measurementItem}>
                  <Text style={styles.measurementLabel}>Chest</Text>
                  <Text style={styles.measurementValue}>{latestMeasurements.chest} cm</Text>
                </View>
              )}
              
              {latestMeasurements.waist && (
                <View style={styles.measurementItem}>
                  <Text style={styles.measurementLabel}>Waist</Text>
                  <Text style={styles.measurementValue}>{latestMeasurements.waist} cm</Text>
                </View>
              )}
              
              {latestMeasurements.hips && (
                <View style={styles.measurementItem}>
                  <Text style={styles.measurementLabel}>Hips</Text>
                  <Text style={styles.measurementValue}>{latestMeasurements.hips} cm</Text>
                </View>
              )}
              
              {latestMeasurements.arms && (
                <View style={styles.measurementItem}>
                  <Text style={styles.measurementLabel}>Arms</Text>
                  <Text style={styles.measurementValue}>{latestMeasurements.arms} cm</Text>
                </View>
              )}
              
              {latestMeasurements.thighs && (
                <View style={styles.measurementItem}>
                  <Text style={styles.measurementLabel}>Thighs</Text>
                  <Text style={styles.measurementValue}>{latestMeasurements.thighs} cm</Text>
                </View>
              )}
            </View>
          </Card>
        )}
        
        <Card style={styles.goalsCard}>
          <Text style={styles.cardTitle}>My Goals</Text>
          {clientUser?.goals && clientUser.goals.length > 0 ? (
            <View style={styles.goalsList}>
              {clientUser.goals.map((goal: string, index: number) => (
                <View key={index} style={styles.goalItem}>
                  <View style={styles.goalBullet} />
                  <Text style={styles.goalText}>{goal}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>No goals set yet</Text>
          )}
        </Card>
        
        <View style={styles.settingsButtons}>
          <Button
            title="Settings"
            onPress={() => router.push('/settings')}
            variant="outline"
            icon={<Settings size={20} color={colors.primary} />}
            style={styles.settingsButton}
          />
          
          <Button
            title="Log Out"
            onPress={logout}
            variant="outline"
            icon={<LogOut size={20} color={colors.error} />}
            style={[styles.settingsButton, styles.logoutButton]}
            textStyle={{ color: colors.error }}
          />
        </View>
      </ScrollView>
    );
  };
  
  const renderTrainerProfile = () => {
    return (
      <View style={styles.container}>
        <View style={styles.trainerHeader}>
          <View style={styles.trainerInfo}>
            <Text style={styles.trainerTitle}>My Clients</Text>
            <Text style={styles.trainerSubtitle}>{clients.length} active clients</Text>
          </View>
          
          <View style={styles.trainerActions}>
            <TouchableOpacity 
              style={styles.trainerAction}
              onPress={() => router.push('/settings')}
            >
              <Settings size={24} color={colors.text} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.trainerAction}
              onPress={logout}
            >
              <LogOut size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
        
        <FlatList
          data={clients}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ClientCard
              client={item}
              onPress={() => router.push(`/clients/${item.id}`)}
              onMessagePress={() => router.push(`/messages/${item.id}`)}
              onSchedulePress={() => router.push(`/calendar/client/${item.id}`)}
              onProgressPress={() => router.push(`/progress/client/${item.id}`)}
            />
          )}
          contentContainerStyle={styles.clientsList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No clients found</Text>
            </View>
          }
        />
      </View>
    );
  };
  
  return (
    <SafeAreaView style={globalStyles.container}>
      {isTrainer ? renderTrainerProfile() : renderClientProfile()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.md,
  },
  scrollView: {
    flex: 1,
    padding: theme.spacing.md,
  },
  profileHeader: {
    flexDirection: 'row',
    marginBottom: theme.spacing.lg,
  },
  profileInfo: {
    marginLeft: theme.spacing.md,
    flex: 1,
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginRight: theme.spacing.sm,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  actionButton: {
    alignItems: 'center',
    width: '22%',
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  actionText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: theme.spacing.md,
  },
  measurementsCard: {
    marginBottom: theme.spacing.md,
  },
  measurementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  measurementItem: {
    width: '45%',
  },
  measurementLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  measurementValue: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  goalsCard: {
    marginBottom: theme.spacing.lg,
  },
  goalsList: {
    gap: theme.spacing.sm,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginRight: theme.spacing.sm,
  },
  goalText: {
    fontSize: 16,
    color: colors.text,
  },
  settingsButtons: {
    marginBottom: theme.spacing.xl,
  },
  settingsButton: {
    marginBottom: theme.spacing.md,
  },
  logoutButton: {
    borderColor: colors.error,
  },
  trainerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  trainerInfo: {
    flex: 1,
  },
  trainerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  trainerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  trainerActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  trainerAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clientsList: {
    paddingBottom: theme.spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});