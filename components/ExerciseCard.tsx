import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Play, Clock, Info, Edit, CheckCircle } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { Exercise, WorkoutExercise } from '@/types';
import { useWorkoutStore } from '@/store/workout-store';

interface ExerciseCardProps {
  exercise: Exercise;
  workoutExercise?: WorkoutExercise;
  onPress?: () => void;
  onPlayVideo?: () => void;
  onAddNote?: () => void;
  showControls?: boolean;
  isCompleted?: boolean;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  workoutExercise,
  onPress,
  onPlayVideo,
  onAddNote,
  showControls = true,
  isCompleted = false,
}) => {
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <TouchableOpacity 
      style={[styles.container, isCompleted && styles.completedContainer]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: exercise.imageUrl || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' }}
          style={styles.image}
          contentFit="cover"
        />
        {exercise.videoUrl && showControls && (
          <TouchableOpacity 
            style={styles.playButton}
            onPress={onPlayVideo}
          >
            <Play size={24} color={colors.text} />
          </TouchableOpacity>
        )}
        
        {isCompleted && (
          <View style={styles.completedBadge}>
            <CheckCircle size={20} color={colors.text} />
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>{exercise.name}</Text>
        <Text style={styles.category}>{exercise.category}</Text>
        
        {workoutExercise && (
          <View style={styles.detailsContainer}>
            {workoutExercise.sets && workoutExercise.reps && (
              <View style={styles.detail}>
                <Text style={styles.detailText}>
                  {workoutExercise.sets} sets × {workoutExercise.reps} reps
                </Text>
              </View>
            )}
            
            {workoutExercise.duration && (
              <View style={styles.detail}>
                <Clock size={16} color={colors.textSecondary} />
                <Text style={styles.detailText}>
                  {formatDuration(workoutExercise.duration)}
                </Text>
              </View>
            )}
            
            {workoutExercise.weight && (
              <View style={styles.detail}>
                <Text style={styles.detailText}>
                  {workoutExercise.weight} kg
                </Text>
              </View>
            )}
          </View>
        )}
        
        {workoutExercise?.notes && (
          <View style={styles.notesContainer}>
            <Text style={styles.notesLabel}>Notes:</Text>
            <Text style={styles.notes}>{workoutExercise.notes}</Text>
          </View>
        )}
      </View>
      
      {showControls && (
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => onPress?.()}
          >
            <Info size={20} color={colors.primary} />
          </TouchableOpacity>
          
          {onAddNote && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={onAddNote}
            >
              <Edit size={20} color={colors.primary} />
            </TouchableOpacity>
          )}
          
          {exercise.videoUrl && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={onPlayVideo}
            >
              <Play size={20} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
    flexDirection: 'row',
    ...theme.shadows.small,
  },
  completedContainer: {
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  imageContainer: {
    width: 100,
    height: 100,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  playButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  detailsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: 8,
  },
  detail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.backgroundLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  detailText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  notesContainer: {
    marginTop: 4,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  notes: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  actions: {
    padding: theme.spacing.sm,
    justifyContent: 'space-around',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
});