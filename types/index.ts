export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'trainer' | 'client';
  joinedAt: string;
}

export interface Client extends User {
  role: 'client';
  trainerId: string;
  streakCount: number;
  lastCheckIn: string | null;
  measurements?: Measurements;
  goals?: string[];
}

export interface Trainer extends User {
  role: 'trainer';
  clients: string[];
  specialties?: string[];
}

export interface Measurements {
  date: string;
  weight?: number;
  bodyFat?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  arms?: number;
  thighs?: number;
  notes?: string;
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  videoUrl?: string;
  imageUrl?: string;
  category: string;
  equipment?: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface WorkoutExercise {
  exerciseId: string;
  sets?: number;
  reps?: number;
  duration?: number; // in seconds
  weight?: number;
  notes?: string;
  restTime?: number; // in seconds
}

export interface Workout {
  id: string;
  name: string;
  description: string;
  exercises: WorkoutExercise[];
  createdAt: string;
  createdBy: string;
  duration: number; // estimated duration in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  clientId: string;
  trainerId: string;
  workouts: { [day: string]: string[] }; // day -> workout ids
  startDate: string;
  endDate?: string;
  active: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  type: 'image' | 'video' | 'document';
  url: string;
  thumbnailUrl?: string;
  name: string;
  size?: number;
}

export interface ProgressEntry {
  id: string;
  clientId: string;
  date: string;
  type: 'photo' | 'measurement' | 'note';
  photos?: string[];
  measurements?: Measurements;
  notes?: string;
}

export interface Appointment {
  id: string;
  trainerId: string;
  clientId: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  location?: string;
  notes?: string;
}

export interface BlockedTime {
  id: string;
  trainerId: string;
  startTime: string;
  endTime: string;
  isFullDay: boolean;
  reason?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'message' | 'workout' | 'appointment' | 'streak' | 'broadcast';
  data?: any;
}

export interface ClientAnalytics {
  clientId: string;
  workoutsCompleted: number;
  appointmentsAttended: number;
  streakHighest: number;
  progressEntries: number;
  lastActive: string;
  weightChange?: number;
  bodyFatChange?: number;
}