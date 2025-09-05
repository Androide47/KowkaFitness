import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Exercise, Workout, WorkoutExercise } from '@/types';
import { api } from '@/utils/api';

interface CompletedExercise {
  workoutId: string;
  exerciseId: string;
  completedAt: string;
}

interface CompletedWorkout {
  id: string;
  completedAt: string;
}

interface WorkoutState {
  exercises: Exercise[];
  workouts: Workout[];
  activeWorkout: Workout | null;
  activeExerciseIndex: number;
  isWorkoutActive: boolean;
  completedExercises: CompletedExercise[];
  completedWorkouts: CompletedWorkout[];
  
  // Exercise library actions
  getExercises: () => Exercise[];
  getExerciseById: (id: string) => Exercise | undefined;
  addExercise: (exercise: Exercise) => void;
  updateExercise: (id: string, data: Partial<Exercise>) => void;
  
  // Workout actions
  getWorkouts: () => Workout[];
  getWorkoutById: (id: string) => Workout | undefined;
  addWorkout: (workout: Workout) => void;
  updateWorkout: (id: string, data: Partial<Workout>) => void;
  deleteWorkout: (id: string) => void;
  hydrateFromApi: () => Promise<void>;
  
  // Active workout session actions
  startWorkout: (workoutId: string) => void;
  endWorkout: () => void;
  nextExercise: () => void;
  previousExercise: () => void;
  getCurrentExercise: () => WorkoutExercise | null;
  updateExerciseNotes: (exerciseId: string, notes: string) => void;
  
  // Completion tracking
  markExerciseCompleted: (workoutId: string, exerciseId: string) => void;
  isExerciseCompleted: (workoutId: string, exerciseId: string) => boolean;
  markWorkoutCompleted: (workoutId: string) => void;
  isWorkoutCompleted: (workoutId: string) => boolean;
  getCompletedWorkouts: () => CompletedWorkout[];
  getWorkoutCompletionCount: () => number;
  getRecentCompletedWorkouts: (limit?: number) => Workout[];
}

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      exercises: [],
      workouts: [],
      activeWorkout: null,
      activeExerciseIndex: 0,
      isWorkoutActive: false,
      completedExercises: [],
      completedWorkouts: [],
      
      // Exercise library actions
      getExercises: () => get().exercises,
      
      getExerciseById: (id) => {
        return get().exercises.find(exercise => exercise.id === id);
      },
      
      addExercise: (exercise) => {
        set(state => ({
          exercises: [...state.exercises, exercise]
        }));
      },
      
      updateExercise: (id, data) => {
        set(state => ({
          exercises: state.exercises.map(exercise => 
            exercise.id === id ? { ...exercise, ...data } : exercise
          )
        }));
      },
      
      // Workout actions
      getWorkouts: () => get().workouts,

      // Hydration from backend
      hydrateFromApi: async () => {
        try {
          const workouts = await api.get('/workouts');
          set({ workouts });
        } catch (e) {
          console.warn('Failed to hydrate workouts', e);
        }
      },
      
      getWorkoutById: (id) => {
        return get().workouts.find(workout => workout.id === id);
      },
      
      addWorkout: (workout) => {
        set(state => ({
          workouts: [...state.workouts, workout]
        }));
      },
      
      updateWorkout: (id, data) => {
        set(state => ({
          workouts: state.workouts.map(workout => 
            workout.id === id ? { ...workout, ...data } : workout
          )
        }));
      },
      
      deleteWorkout: (id) => {
        set(state => ({
          workouts: state.workouts.filter(workout => workout.id !== id)
        }));
      },
      
      // Active workout session actions
      startWorkout: (workoutId) => {
        const workout = get().getWorkoutById(workoutId);
        if (workout) {
          set({
            activeWorkout: workout,
            activeExerciseIndex: 0,
            isWorkoutActive: true
          });
        }
      },
      
      endWorkout: () => {
        set({
          activeWorkout: null,
          activeExerciseIndex: 0,
          isWorkoutActive: false
        });
      },
      
      nextExercise: () => {
        const { activeWorkout, activeExerciseIndex } = get();
        if (activeWorkout && activeExerciseIndex < activeWorkout.exercises.length - 1) {
          set({ activeExerciseIndex: activeExerciseIndex + 1 });
        }
      },
      
      previousExercise: () => {
        const { activeExerciseIndex } = get();
        if (activeExerciseIndex > 0) {
          set({ activeExerciseIndex: activeExerciseIndex - 1 });
        }
      },
      
      getCurrentExercise: () => {
        const { activeWorkout, activeExerciseIndex } = get();
        if (activeWorkout && activeWorkout.exercises.length > 0) {
          return activeWorkout.exercises[activeExerciseIndex];
        }
        return null;
      },
      
      updateExerciseNotes: (exerciseId, notes) => {
        const { activeWorkout } = get();
        if (activeWorkout) {
          const updatedExercises = activeWorkout.exercises.map(ex => 
            ex.exerciseId === exerciseId ? { ...ex, notes } : ex
          );
          
          set({
            activeWorkout: {
              ...activeWorkout,
              exercises: updatedExercises
            }
          });
        }
      },
      
      // Completion tracking
      markExerciseCompleted: (workoutId, exerciseId) => {
        const now = new Date().toISOString();
        
        set(state => {
          // Check if already completed
          const isAlreadyCompleted = state.completedExercises.some(
            ex => ex.workoutId === workoutId && ex.exerciseId === exerciseId
          );
          
          if (isAlreadyCompleted) {
            return state;
          }
          
          return {
            completedExercises: [
              ...state.completedExercises,
              { workoutId, exerciseId, completedAt: now }
            ]
          };
        });
      },
      
      isExerciseCompleted: (workoutId, exerciseId) => {
        return get().completedExercises.some(
          ex => ex.workoutId === workoutId && ex.exerciseId === exerciseId
        );
      },
      
      markWorkoutCompleted: (workoutId) => {
        const now = new Date().toISOString();
        
        set(state => {
          // Check if already completed
          const isAlreadyCompleted = state.completedWorkouts.some(
            w => w.id === workoutId
          );
          
          if (isAlreadyCompleted) {
            return state;
          }
          
          return {
            completedWorkouts: [
              ...state.completedWorkouts,
              { id: workoutId, completedAt: now }
            ]
          };
        });
      },
      
      isWorkoutCompleted: (workoutId) => {
        return get().completedWorkouts.some(w => w.id === workoutId);
      },
      
      getCompletedWorkouts: () => {
        return get().completedWorkouts;
      },
      
      getWorkoutCompletionCount: () => {
        return get().completedWorkouts.length;
      },
      
      getRecentCompletedWorkouts: (limit = 5) => {
        const { completedWorkouts, workouts } = get();
        
        // Sort by completion date (newest first)
        const sortedCompletions = [...completedWorkouts].sort(
          (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
        );
        
        // Get the most recent completions up to the limit
        const recentCompletions = sortedCompletions.slice(0, limit);
        
        // Map to actual workout objects
        return recentCompletions
          .map(completion => workouts.find(w => w.id === completion.id))
          .filter(Boolean) as Workout[];
      },
    }),
    {
      name: 'workout-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);