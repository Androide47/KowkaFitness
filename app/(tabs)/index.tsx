import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Calendar, Dumbbell, MessageCircle, Camera, BarChart, User, Megaphone, Award, CheckCircle, Info } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { globalStyles } from '@/constants/theme';
import { useAuthStore } from '@/store/auth-store';
import { useWorkoutStore } from '@/store/workout-store';
import { useCalendarStore } from '@/store/calendar-store';
import { useStreakStore } from '@/store/streak-store';
import { useLanguageStore } from '@/store/language-store';
import { Card } from '@/components/Card';
import { WorkoutCard } from '@/components/WorkoutCard';
import { AppointmentCard } from '@/components/AppointmentCard';
import { StreakCounter } from '@/components/StreakCounter';
import { formatDate } from '@/utils/date-utils';

export default function HomeScreen() {
  const router = useRouter();
  const { user, isTrainer, clients } = useAuthStore();
  const { getWorkouts, getWorkoutCompletionCount, getRecentCompletedWorkouts } = useWorkoutStore();
  const { getUserAppointments } = useCalendarStore();
  const { checkIn, hasCheckedInToday } = useStreakStore();
  const { t } = useLanguageStore();
  
  const [showWelcome, setShowWelcome] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  
  const workouts = getWorkouts().slice(0, 2);
  const appointments = user ? getUserAppointments(user.id).slice(0, 2) : [];
  const completedWorkoutsCount = getWorkoutCompletionCount();
  const recentCompletedWorkouts = getRecentCompletedWorkouts(3);
  
  useEffect(() => {
    // Auto check-in when opening the app
    if (user && !isTrainer && !hasCheckedInToday(user.id)) {
      checkIn(user.id);
    }
    
    // Show welcome message for new users
    if (user && user.isNew) {
      setShowWelcome(true);
      
      // Animate welcome card
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
      
      // Hide welcome message after 5 seconds
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }).start(() => {
          setShowWelcome(false);
        });
      }, 5000);
    }
  }, [user, isTrainer]);
  
  const renderWelcomeCard = () => (
    <Animated.View style={[styles.welcomeCard, { opacity: fadeAnim }]}>
      <View style={styles.welcomeContent}>
        <Text style={styles.welcomeTitle}>{t('home.welcomeTitle')}</Text>
        <Text style={styles.welcomeText}>{t('home.welcomeMessage')}</Text>
        
        <View style={styles.welcomeTips}>
          <View style={styles.welcomeTip}>
            <CheckCircle size={20} color={colors.success} style={styles.welcomeTipIcon} />
            <Text style={styles.welcomeTipText}>{t('home.welcomeTip1')}</Text>
          </View>
          
          <View style={styles.welcomeTip}>
            <CheckCircle size={20} color={colors.success} style={styles.welcomeTipIcon} />
            <Text style={styles.welcomeTipText}>{t('home.welcomeTip2')}</Text>
          </View>
          
          <View style={styles.welcomeTip}>
            <CheckCircle size={20} color={colors.success} style={styles.welcomeTipIcon} />
            <Text style={styles.welcomeTipText}>{t('home.welcomeTip3')}</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.welcomeButton}
          onPress={() => {
            setShowWelcome(false);
            router.push('/workouts');
          }}
        >
          <Text style={styles.welcomeButtonText}>{t('home.getStarted')}</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
  
  const renderClientDashboard = () => {
    const clientUser = user as any;
    
    return (
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{t('home.hello')}, {user?.name?.split(' ')[0]}</Text>
            <Text style={styles.date}>{formatDate(new Date().toISOString())}</Text>
          </View>
          <StreakCounter count={clientUser?.streakCount || 0} />
        </View>
        
        <Card style={styles.streakCard}>
          <Text style={styles.streakTitle}>
            {clientUser?.streakCount ? `${clientUser.streakCount} ${t('home.streakCount')}` : t('home.startStreak')}
          </Text>
          <Text style={styles.streakDescription}>
            {clientUser?.streakCount 
              ? t('home.streakMessage')
              : t('home.streakStart')}
          </Text>
        </Card>
        
        {completedWorkoutsCount > 0 && (
          <Card style={styles.achievementCard}>
            <View style={styles.achievementHeader}>
              <Award size={24} color={colors.primary} />
              <Text style={styles.achievementTitle}>{t('home.achievements')}</Text>
            </View>
            
            <View style={styles.achievementContent}>
              <View style={styles.achievementItem}>
                <Text style={styles.achievementValue}>{completedWorkoutsCount}</Text>
                <Text style={styles.achievementLabel}>{t('home.workoutsCompleted')}</Text>
              </View>
              
              <View style={styles.achievementItem}>
                <Text style={styles.achievementValue}>{clientUser?.streakCount || 0}</Text>
                <Text style={styles.achievementLabel}>{t('home.currentStreak')}</Text>
              </View>
            </View>
          </Card>
        )}
        
        <Text style={styles.sectionTitle}>{t('home.quickActions')}</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => router.push('/workouts')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: colors.primary }]}>
              <Dumbbell size={24} color={colors.text} />
            </View>
            <Text style={styles.quickActionText}>{t('nav.workouts')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => router.push('/progress')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: colors.secondary }]}>
              <BarChart size={24} color={colors.text} />
            </View>
            <Text style={styles.quickActionText}>{t('nav.progress')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => router.push('/messages')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#4CAF50' }]}>
              <MessageCircle size={24} color={colors.text} />
            </View>
            <Text style={styles.quickActionText}>{t('nav.messages')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => router.push('/progress/photo')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#FF9800' }]}>
              <Camera size={24} color={colors.text} />
            </View>
            <Text style={styles.quickActionText}>{t('progress.addPhoto')}</Text>
          </TouchableOpacity>
        </View>
        
        {recentCompletedWorkouts.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>{t('home.recentCompletions')}</Text>
            {recentCompletedWorkouts.map(workout => (
              <WorkoutCard
                key={workout.id}
                workout={workout}
                onPress={() => router.push(`/workouts/${workout.id}`)}
                isCompleted={true}
              />
            ))}
          </>
        )}
        
        <Text style={styles.sectionTitle}>{t('home.upcomingWorkouts')}</Text>
        {workouts.length > 0 ? (
          workouts.map(workout => (
            <WorkoutCard
              key={workout.id}
              workout={workout}
              onPress={() => router.push(`/workouts/${workout.id}`)}
            />
          ))
        ) : (
          <Card>
            <Text style={styles.emptyText}>{t('home.noWorkouts')}</Text>
          </Card>
        )}
        
        <Text style={styles.sectionTitle}>{t('home.upcomingAppointments')}</Text>
        {appointments.length > 0 ? (
          appointments.map(appointment => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onPress={() => router.push(`/calendar/${appointment.id}`)}
            />
          ))
        ) : (
          <Card>
            <Text style={styles.emptyText}>{t('home.noAppointments')}</Text>
          </Card>
        )}
        
        {user?.isNew && (
          <Card style={styles.tipsCard}>
            <View style={styles.tipsHeader}>
              <Info size={24} color={colors.primary} />
              <Text style={styles.tipsTitle}>{t('home.tipsTitle')}</Text>
            </View>
            
            <View style={styles.tipsList}>
              <View style={styles.tipItem}>
                <View style={styles.tipBullet} />
                <Text style={styles.tipText}>{t('home.tip1')}</Text>
              </View>
              
              <View style={styles.tipItem}>
                <View style={styles.tipBullet} />
                <Text style={styles.tipText}>{t('home.tip2')}</Text>
              </View>
              
              <View style={styles.tipItem}>
                <View style={styles.tipBullet} />
                <Text style={styles.tipText}>{t('home.tip3')}</Text>
              </View>
            </View>
          </Card>
        )}
      </ScrollView>
    );
  };
  
  const renderTrainerDashboard = () => {
    return (
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{t('home.hello')}, {user?.name?.split(' ')[0]}</Text>
            <Text style={styles.date}>{formatDate(new Date().toISOString())}</Text>
          </View>
        </View>
        
        <Card style={styles.statsCard}>
          <Text style={styles.statsTitle}>{t('home.dashboard')}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{clients.length}</Text>
              <Text style={styles.statLabel}>{t('nav.clients')}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{appointments.length}</Text>
              <Text style={styles.statLabel}>{t('calendar.appointment')}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{workouts.length}</Text>
              <Text style={styles.statLabel}>{t('nav.workouts')}</Text>
            </View>
          </View>
        </Card>
        
        <Text style={styles.sectionTitle}>{t('home.quickActions')}</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => router.push('/profile')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: colors.primary }]}>
              <User size={24} color={colors.text} />
            </View>
            <Text style={styles.quickActionText}>{t('nav.clients')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => router.push('/calendar')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: colors.secondary }]}>
              <Calendar size={24} color={colors.text} />
            </View>
            <Text style={styles.quickActionText}>{t('nav.calendar')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => router.push('/messages')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#4CAF50' }]}>
              <MessageCircle size={24} color={colors.text} />
            </View>
            <Text style={styles.quickActionText}>{t('nav.messages')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => router.push('/broadcast')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#FF9800' }]}>
              <Megaphone size={24} color={colors.text} />
            </View>
            <Text style={styles.quickActionText}>Broadcast</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.sectionTitle}>{t('home.upcomingAppointments')}</Text>
        {appointments.length > 0 ? (
          appointments.map(appointment => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              showClientName
              onPress={() => router.push(`/calendar/${appointment.id}`)}
            />
          ))
        ) : (
          <Card>
            <Text style={styles.emptyText}>{t('home.noAppointments')}</Text>
          </Card>
        )}
      </ScrollView>
    );
  };
  
  if (!user) {
    return (
      <SafeAreaView style={globalStyles.container}>
        <View style={globalStyles.center}>
          <Text style={theme.typography.h2}>Please log in</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={globalStyles.container}>
      {isTrainer ? renderTrainerDashboard() : renderClientDashboard()}
      {showWelcome && renderWelcomeCard()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    padding: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  date: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  streakCard: {
    backgroundColor: colors.backgroundLight,
    marginBottom: theme.spacing.lg,
  },
  streakTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: theme.spacing.sm,
  },
  streakDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  achievementCard: {
    marginBottom: theme.spacing.lg,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  achievementTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginLeft: theme.spacing.sm,
  },
  achievementContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  achievementItem: {
    alignItems: 'center',
  },
  achievementValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
  },
  achievementLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statsCard: {
    backgroundColor: colors.backgroundLight,
    marginBottom: theme.spacing.lg,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: theme.spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: theme.spacing.md,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  quickAction: {
    alignItems: 'center',
    width: '22%',
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  quickActionText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  welcomeCard: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.medium,
    zIndex: 1000,
  },
  welcomeContent: {
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
    lineHeight: 22,
  },
  welcomeTips: {
    alignSelf: 'stretch',
    marginBottom: theme.spacing.lg,
  },
  welcomeTip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  welcomeTipIcon: {
    marginRight: theme.spacing.sm,
  },
  welcomeTipText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  welcomeButton: {
    backgroundColor: colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
  },
  welcomeButtonText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 16,
  },
  tipsCard: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginLeft: theme.spacing.sm,
  },
  tipsList: {
    gap: theme.spacing.sm,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: 6,
    marginRight: theme.spacing.sm,
  },
  tipText: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
});