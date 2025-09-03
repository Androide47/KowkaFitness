import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Clock, Dumbbell, BarChart3, CheckCircle } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { Workout } from '@/types';

interface WorkoutCardProps {
  workout: Workout;
  onPress: () => void;
  isCompleted?: boolean;
}

export const WorkoutCard: React.FC<WorkoutCardProps> = ({
  workout,
  onPress,
  isCompleted = false,
}) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return colors.success;
      case 'intermediate':
        return colors.warning;
      case 'advanced':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };
  
  return (
    <TouchableOpacity 
      style={[styles.container, isCompleted && styles.completedContainer]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{workout.name}</Text>
        {isCompleted ? (
          <View style={styles.completedBadge}>
            <CheckCircle size={16} color={colors.text} />
            <Text style={styles.completedText}>Completed</Text>
          </View>
        ) : (
          <View style={[
            styles.difficultyBadge, 
            { backgroundColor: getDifficultyColor(workout.difficulty) }
          ]}>
            <Text style={styles.difficultyText}>
              {workout.difficulty.charAt(0).toUpperCase() + workout.difficulty.slice(1)}
            </Text>
          </View>
        )}
      </View>
      
      <Text style={styles.description} numberOfLines={2}>
        {workout.description}
      </Text>
      
      <View style={styles.stats}>
        <View style={styles.stat}>
          <Clock size={16} color={colors.textSecondary} />
          <Text style={styles.statText}>{workout.duration} min</Text>
        </View>
        
        <View style={styles.stat}>
          <Dumbbell size={16} color={colors.textSecondary} />
          <Text style={styles.statText}>{workout.exercises.length} exercises</Text>
        </View>
        
        <View style={styles.stat}>
          <BarChart3 size={16} color={colors.textSecondary} />
          <Text style={styles.statText}>
            {workout.exercises.reduce((total, ex) => total + (ex.sets || 0), 0)} sets
          </Text>
        </View>
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
  completedContainer: {
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    gap: 4,
  },
  completedText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});