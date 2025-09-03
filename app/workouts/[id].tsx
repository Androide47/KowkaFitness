import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Play, Clock, Dumbbell, BarChart3, ArrowLeft, ArrowRight, CheckCircle, Award } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { globalStyles } from '@/constants/theme';
import { useWorkoutStore } from '@/store/workout-store';
import { useAuthStore } from '@/store/auth-store';
import { useLanguageStore } from '@/store/language-store';
import { ExerciseCard } from '@/components/ExerciseCard';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Timer } from '@/components/Timer';
import { Video } from 'expo-av';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Confetti from '@/components/Confetti';

const { width } = Dimensions.get('window');

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { 
    getWorkoutById, 
    getExerciseById, 
    startWorkout, 
    activeWorkout, 
    isWorkoutActive, 
    getCurrentExercise, 
    nextExercise, 
    previousExercise, 
    updateExerciseNotes, 
    endWorkout,
    markExerciseCompleted,
    isExerciseCompleted,
    markWorkoutCompleted,
    isWorkoutCompleted
  } = useWorkoutStore();
  const { isTrainer } = useAuthStore();
  const { t } = useLanguageStore();
  
  const [workout, setWorkout] = useState(getWorkoutById(id));
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [currentNote, setCurrentNote] = useState('');
  const [currentExerciseId, setCurrentExerciseId] = useState('');
  const [showVideo, setShowVideo] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [showCompletionMessage, setShowCompletionMessage] = useState(false);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  
  const videoRef = useRef(null);
  const translateX = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (!workout) {
      Alert.alert('Error', 'Workout not found');
      router.back();
    }
  }, [workout]);
  
  useEffect(() => {
    if (isWorkoutActive && activeWorkout?.id === id) {
      const currentEx = getCurrentExercise();
      if (currentEx) {
        const index = workout?.exercises.findIndex(ex => ex.exerciseId === currentEx.exerciseId) || 0;
        setCurrentExerciseIndex(index);
      }
    }
  }, [isWorkoutActive, activeWorkout, getCurrentExercise]);
  
  const handleStartWorkout = () => {
    if (workout) {
      startWorkout(workout.id);
    }
  };
  
  const handleEndWorkout = () => {
    Alert.alert(
      t('workouts.endWorkout'),
      t('workouts.confirmEnd'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: 'End',
          onPress: () => {
            if (workout) {
              // Check if all exercises are completed
              const allCompleted = workout.exercises.every(ex => 
                isExerciseCompleted(workout.id, ex.exerciseId)
              );
              
              if (allCompleted) {
                markWorkoutCompleted(workout.id);
                setShowConfetti(true);
                setShowCompletionMessage(true);
                
                // Hide confetti after 5 seconds
                setTimeout(() => {
                  setShowConfetti(false);
                  setShowCompletionMessage(false);
                  endWorkout();
                  router.back();
                }, 5000);
              } else {
                endWorkout();
                router.back();
              }
            }
          },
        },
      ]
    );
  };
  
  const handleAddNote = (exerciseId: string, currentNoteText: string = '') => {
    setCurrentExerciseId(exerciseId);
    setCurrentNote(currentNoteText);
    setNoteModalVisible(true);
  };
  
  const handleSaveNote = () => {
    if (currentExerciseId) {
      updateExerciseNotes(currentExerciseId, currentNote);
      setNoteModalVisible(false);
      setCurrentNote('');
      setCurrentExerciseId('');
    }
  };
  
  const handlePlayVideo = (videoUrl: string) => {
    if (videoUrl) {
      setCurrentVideoUrl(videoUrl);
      setShowVideo(true);
    }
  };
  
  const handleCloseVideo = () => {
    setShowVideo(false);
    setCurrentVideoUrl('');
  };
  
  const handleCompleteExercise = (exerciseId: string) => {
    if (workout) {
      markExerciseCompleted(workout.id, exerciseId);
      
      // Check if all exercises are completed
      const allCompleted = workout.exercises.every(ex => 
        ex.exerciseId === exerciseId || isExerciseCompleted(workout.id, ex.exerciseId)
      );
      
      if (allCompleted) {
        markWorkoutCompleted(workout.id);
        setShowConfetti(true);
        setShowCompletionMessage(true);
        
        // Hide confetti after 5 seconds
        setTimeout(() => {
          setShowConfetti(false);
          setShowCompletionMessage(false);
        }, 5000);
      } else {
        // Move to next exercise
        handleNextExercise();
      }
    }
  };
  
  const handleNextExercise = () => {
    if (currentExerciseIndex < workout.exercises.length - 1) {
      // Reset animation
      translateX.setValue(0);
      
      // Update exercise index
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setCurrentSetIndex(0);
      nextExercise();
    }
  };
  
  const handlePreviousExercise = () => {
    if (currentExerciseIndex > 0) {
      // Reset animation
      translateX.setValue(0);
      
      // Update exercise index
      setCurrentExerciseIndex(currentExerciseIndex - 1);
      setCurrentSetIndex(0);
      previousExercise();
    }
  };
  
  const handleGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );
  
  const handleGestureEnd = (event) => {
    const { translationX } = event.nativeEvent;
    
    if (translationX > 100) {
      // Swiped right - mark as completed and go to next
      const currentExercise = workout.exercises[currentExerciseIndex];
      handleCompleteExercise(currentExercise.exerciseId);
    } else if (translationX < -100) {
      // Swiped left - go to previous
      handlePreviousExercise();
    }
    
    // Reset animation
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };
  
  const handleNextSet = () => {
    const currentExercise = workout.exercises[currentExerciseIndex];
    if (currentExercise && currentExercise.sets && currentSetIndex < currentExercise.sets - 1) {
      setCurrentSetIndex(currentSetIndex + 1);
    } else {
      // All sets completed, mark exercise as completed
      handleCompleteExercise(currentExercise.exerciseId);
    }
  };
  
  const handlePreviousSet = () => {
    if (currentSetIndex > 0) {
      setCurrentSetIndex(currentSetIndex - 1);
    }
  };
  
  if (!workout) return null;
  
  const renderWorkoutDetails = () => (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>{workout.name}</Text>
        <View style={[
          styles.difficultyBadge, 
          { backgroundColor: getDifficultyColor(workout.difficulty) }
        ]}>
          <Text style={styles.difficultyText}>
            {t(`common.${workout.difficulty}`)}
          </Text>
        </View>
      </View>
      
      <Text style={styles.description}>{workout.description}</Text>
      
      <View style={styles.stats}>
        <View style={styles.stat}>
          <Clock size={20} color={colors.textSecondary} />
          <Text style={styles.statText}>{workout.duration} min</Text>
        </View>
        
        <View style={styles.stat}>
          <Dumbbell size={20} color={colors.textSecondary} />
          <Text style={styles.statText}>{workout.exercises.length} exercises</Text>
        </View>
        
        <View style={styles.stat}>
          <BarChart3 size={20} color={colors.textSecondary} />
          <Text style={styles.statText}>
            {workout.exercises.reduce((total, ex) => total + (ex.sets || 0), 0)} sets
          </Text>
        </View>
      </View>
      
      <Text style={styles.sectionTitle}>{t('workouts.exercises')}</Text>
      
      {workout.exercises.map((workoutExercise, index) => {
        const exercise = getExerciseById(workoutExercise.exerciseId);
        if (!exercise) return null;
        
        const isCompleted = isExerciseCompleted(workout.id, workoutExercise.exerciseId);
        
        return (
          <ExerciseCard
            key={`${exercise.id}-${index}`}
            exercise={exercise}
            workoutExercise={workoutExercise}
            onPress={() => {}}
            onPlayVideo={() => handlePlayVideo(exercise.videoUrl || '')}
            onAddNote={() => handleAddNote(workoutExercise.exerciseId, workoutExercise.notes)}
            isCompleted={isCompleted}
          />
        );
      })}
      
      {!isTrainer && (
        <Button
          title={isWorkoutCompleted(workout.id) ? t('workouts.workoutCompleted') : t('workouts.startWorkout')}
          onPress={handleStartWorkout}
          style={[
            styles.startButton,
            isWorkoutCompleted(workout.id) && styles.completedButton
          ]}
          icon={isWorkoutCompleted(workout.id) ? 
            <CheckCircle size={20} color={colors.text} /> : 
            <Play size={20} color={colors.text} />
          }
          disabled={isWorkoutCompleted(workout.id)}
        />
      )}
    </ScrollView>
  );
  
  const renderActiveWorkout = () => {
    const currentExercise = workout.exercises[currentExerciseIndex];
    const exercise = getExerciseById(currentExercise.exerciseId);
    
    if (!exercise) return null;
    
    const isCompleted = isExerciseCompleted(workout.id, currentExercise.exerciseId);
    const totalSets = currentExercise.sets || 1;
    
    return (
      <View style={styles.activeWorkoutContainer}>
        <View style={styles.progressIndicator}>
          <Text style={styles.progressText}>
            {t('workouts.exerciseProgress', { current: currentExerciseIndex + 1, total: workout.exercises.length })}
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentExerciseIndex + 1) / workout.exercises.length) * 100}%` }
              ]} 
            />
          </View>
        </View>
        
        <PanGestureHandler
          onGestureEvent={handleGestureEvent}
          onEnded={handleGestureEnd}
        >
          <Animated.View
            style={[
              styles.exerciseCardContainer,
              {
                transform: [{ translateX }]
              }
            ]}
          >
            {exercise.videoUrl && (
              <TouchableOpacity 
                style={styles.videoPreview}
                onPress={() => handlePlayVideo(exercise.videoUrl || '')}
              >
                <View style={styles.videoOverlay}>
                  <Play size={40} color={colors.text} />
                </View>
                <Text style={styles.videoText}>{t('workouts.tapToPlayVideo')}</Text>
              </TouchableOpacity>
            )}
            
            <View style={styles.exerciseHeader}>
              <Text style={styles.exerciseName}>{exercise.name}</Text>
              <Text style={styles.exerciseCategory}>{exercise.category}</Text>
            </View>
            
            <View style={styles.setIndicator}>
              <Text style={styles.setIndicatorText}>
                {t('workouts.setProgress', { current: currentSetIndex + 1, total: totalSets })}
              </Text>
              <View style={styles.setProgressBar}>
                <View 
                  style={[
                    styles.setProgressFill, 
                    { width: `${((currentSetIndex + 1) / totalSets) * 100}%` }
                  ]} 
                />
              </View>
            </View>
            
            <View style={styles.exerciseDetails}>
              {currentExercise.sets && currentExercise.reps && (
                <View style={styles.exerciseDetail}>
                  <Text style={styles.exerciseDetailLabel}>{t('workouts.sets')} × {t('workouts.reps')}</Text>
                  <Text style={styles.exerciseDetailValue}>
                    {currentExercise.sets} × {currentExercise.reps}
                  </Text>
                </View>
              )}
              
              {currentExercise.weight && (
                <View style={styles.exerciseDetail}>
                  <Text style={styles.exerciseDetailLabel}>{t('workouts.weight')}</Text>
                  <Text style={styles.exerciseDetailValue}>{currentExercise.weight} kg</Text>
                </View>
              )}
              
              {currentExercise.duration && (
                <View style={styles.exerciseDetail}>
                  <Text style={styles.exerciseDetailLabel}>{t('workouts.duration')}</Text>
                  <Text style={styles.exerciseDetailValue}>{formatDuration(currentExercise.duration)}</Text>
                </View>
              )}
              
              {currentExercise.restTime && (
                <View style={styles.exerciseDetail}>
                  <Text style={styles.exerciseDetailLabel}>{t('workouts.rest')}</Text>
                  <Text style={styles.exerciseDetailValue}>{formatDuration(currentExercise.restTime)}</Text>
                </View>
              )}
            </View>
            
            {currentExercise.notes && (
              <View style={styles.notesContainer}>
                <Text style={styles.notesLabel}>{t('workouts.notes')}:</Text>
                <Text style={styles.notes}>{currentExercise.notes}</Text>
              </View>
            )}
            
            {currentExercise.restTime && (
              <View style={styles.timerContainer}>
                <Text style={styles.timerLabel}>{t('workouts.restTimer')}</Text>
                <Timer 
                  initialSeconds={currentExercise.restTime}
                  countDown={true}
                  autoStart={false}
                />
              </View>
            )}
            
            <View style={styles.swipeInstructions}>
              <Text style={styles.swipeText}>{t('workouts.swipeToComplete')}</Text>
            </View>
          </Animated.View>
        </PanGestureHandler>
        
        <View style={styles.activeWorkoutControls}>
          <Button
            title={t('workouts.addNote')}
            onPress={() => handleAddNote(currentExercise.exerciseId, currentExercise.notes)}
            variant="outline"
            style={styles.noteButton}
          />
          
          <View style={styles.navigationButtons}>
            {totalSets > 1 && (
              <>
                <TouchableOpacity
                  style={[styles.navButton, currentSetIndex === 0 && styles.navButtonDisabled]}
                  onPress={handlePreviousSet}
                  disabled={currentSetIndex === 0}
                >
                  <ArrowLeft size={24} color={currentSetIndex === 0 ? colors.inactive : colors.text} />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.navButton, currentSetIndex === totalSets - 1 && styles.navButtonDisabled]}
                  onPress={handleNextSet}
                  disabled={currentSetIndex === totalSets - 1}
                >
                  <ArrowRight size={24} color={currentSetIndex === totalSets - 1 ? colors.inactive : colors.text} />
                </TouchableOpacity>
              </>
            )}
            
            <TouchableOpacity
              style={[styles.navButton, currentExerciseIndex === 0 && styles.navButtonDisabled]}
              onPress={handlePreviousExercise}
              disabled={currentExerciseIndex === 0}
            >
              <ArrowLeft size={24} color={currentExerciseIndex === 0 ? colors.inactive : colors.text} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.navButton, currentExerciseIndex === workout.exercises.length - 1 && styles.navButtonDisabled]}
              onPress={handleNextExercise}
              disabled={currentExerciseIndex === workout.exercises.length - 1}
            >
              <ArrowRight size={24} color={currentExerciseIndex === workout.exercises.length - 1 ? colors.inactive : colors.text} />
            </TouchableOpacity>
          </View>
        </View>
        
        <Button
          title={t('workouts.completeExercise')}
          onPress={() => handleCompleteExercise(currentExercise.exerciseId)}
          style={styles.completeButton}
          icon={<CheckCircle size={20} color={colors.text} />}
        />
        
        <Button
          title={t('workouts.endWorkout')}
          onPress={handleEndWorkout}
          variant="outline"
          style={styles.endButton}
          textStyle={{ color: colors.error }}
        />
      </View>
    );
  };
  
  const renderNoteModal = () => (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>{t('workouts.addNote')}</Text>
        
        <Input
          placeholder="Enter your notes about this exercise..."
          value={currentNote}
          onChangeText={setCurrentNote}
          multiline
          containerStyle={styles.noteInput}
        />
        
        <View style={styles.modalButtons}>
          <Button
            title={t('common.cancel')}
            onPress={() => setNoteModalVisible(false)}
            variant="outline"
            style={styles.modalButton}
          />
          
          <Button
            title={t('common.save')}
            onPress={handleSaveNote}
            style={styles.modalButton}
          />
        </View>
      </View>
    </View>
  );
  
  const renderVideoModal = () => (
    <View style={styles.videoModalOverlay}>
      <View style={styles.videoModalContent}>
        <TouchableOpacity 
          style={styles.closeVideoButton}
          onPress={handleCloseVideo}
        >
          <Text style={styles.closeVideoText}>×</Text>
        </TouchableOpacity>
        
        <Video
          ref={videoRef}
          source={{ uri: currentVideoUrl }}
          style={styles.video}
          useNativeControls
          resizeMode="contain"
          isLooping
          shouldPlay
        />
      </View>
    </View>
  );
  
  const renderCompletionMessage = () => (
    <View style={styles.completionOverlay}>
      <View style={styles.completionContent}>
        <Award size={60} color={colors.success} style={styles.completionIcon} />
        <Text style={styles.completionTitle}>{t('workouts.congratulations')}</Text>
        <Text style={styles.completionText}>{t('workouts.workoutCompletedMessage')}</Text>
        
        <Button
          title={t('workouts.backToWorkouts')}
          onPress={() => {
            setShowCompletionMessage(false);
            endWorkout();
            router.back();
          }}
          style={styles.completionButton}
        />
      </View>
    </View>
  );
  
  return (
    <SafeAreaView style={globalStyles.container}>
      {isWorkoutActive && activeWorkout?.id === id ? renderActiveWorkout() : renderWorkoutDetails()}
      {noteModalVisible && renderNoteModal()}
      {showVideo && renderVideoModal()}
      {showConfetti && <Confetti />}
      {showCompletionMessage && renderCompletionMessage()}
    </SafeAreaView>
  );
}

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

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

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
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.md,
  },
  difficultyText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: theme.spacing.lg,
    lineHeight: 24,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statText: {
    fontSize: 14,
    color: colors.text,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: theme.spacing.md,
  },
  startButton: {
    marginVertical: theme.spacing.lg,
  },
  completedButton: {
    backgroundColor: colors.success,
  },
  activeWorkoutContainer: {
    flex: 1,
    padding: theme.spacing.md,
  },
  progressIndicator: {
    marginBottom: theme.spacing.md,
  },
  progressText: {
    fontSize: 16,
    color: colors.text,
    marginBottom: theme.spacing.xs,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.backgroundLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  exerciseCardContainer: {
    backgroundColor: colors.card,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
    ...theme.shadows.small,
  },
  videoPreview: {
    height: 200,
    backgroundColor: colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoOverlay: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoText: {
    color: colors.text,
    marginTop: theme.spacing.sm,
    fontSize: 14,
  },
  exerciseHeader: {
    padding: theme.spacing.md,
  },
  exerciseName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  exerciseCategory: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  setIndicator: {
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  setIndicatorText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  setProgressBar: {
    height: 4,
    backgroundColor: colors.backgroundLight,
    borderRadius: 2,
    overflow: 'hidden',
  },
  setProgressFill: {
    height: '100%',
    backgroundColor: colors.secondary,
  },
  exerciseDetails: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  exerciseDetail: {
    marginBottom: theme.spacing.sm,
  },
  exerciseDetailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  exerciseDetailValue: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  notesContainer: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  notes: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  timerContainer: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  timerLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: theme.spacing.sm,
  },
  swipeInstructions: {
    padding: theme.spacing.md,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  swipeText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  activeWorkoutControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  noteButton: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  navigationButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  navButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  completeButton: {
    marginBottom: theme.spacing.md,
    backgroundColor: colors.success,
  },
  endButton: {
    borderColor: colors.error,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.md,
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    width: '100%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: theme.spacing.md,
  },
  noteInput: {
    marginBottom: theme.spacing.md,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.md,
  },
  modalButton: {
    minWidth: 100,
  },
  videoModalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  videoModalContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeVideoButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1001,
  },
  closeVideoText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  video: {
    width: '100%',
    height: 300,
  },
  completionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.md,
    zIndex: 1000,
  },
  completionContent: {
    backgroundColor: colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    width: '90%',
    alignItems: 'center',
  },
  completionIcon: {
    marginBottom: theme.spacing.md,
  },
  completionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  completionText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
    lineHeight: 24,
  },
  completionButton: {
    minWidth: 200,
  },
});