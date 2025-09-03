import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from './auth-store';

interface StreakState {
  // Map of userId to their check-in dates
  checkIns: Record<string, string[]>;
  
  // Streak actions
  checkIn: (userId: string) => void;
  getStreak: (userId: string) => number;
  getLastCheckIn: (userId: string) => string | null;
  resetStreak: (userId: string) => void;
  
  // Utility
  hasCheckedInToday: (userId: string) => boolean;
}

export const useStreakStore = create<StreakState>()(
  persist(
    (set, get) => ({
      checkIns: {},
      
      checkIn: (userId) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString();
        
        // Get user's check-ins or initialize empty array
        const userCheckIns = get().checkIns[userId] || [];
        
        // Check if already checked in today
        if (get().hasCheckedInToday(userId)) {
          return;
        }
        
        // Add today's check-in
        const updatedCheckIns = [...userCheckIns, todayStr];
        
        // Update the store
        set(state => ({
          checkIns: {
            ...state.checkIns,
            [userId]: updatedCheckIns,
          }
        }));
        
        // Update streak count in auth store if it's a client
        const { user, updateUser, updateClient, clients } = useAuthStore.getState();
        const streak = get().getStreak(userId);
        
        if (user && user.id === userId && user.role === 'client') {
          updateUser({ 
            ...user, 
            lastCheckIn: new Date().toISOString(),
            streakCount: streak,
          });
        } else if (clients.length > 0) {
          const client = clients.find(c => c.id === userId);
          if (client) {
            updateClient(userId, { 
              streakCount: streak,
              lastCheckIn: new Date().toISOString(),
            });
          }
        }
      },
      
      getStreak: (userId) => {
        const userCheckIns = get().checkIns[userId] || [];
        if (userCheckIns.length === 0) return 0;
        
        // Sort check-ins by date
        const sortedCheckIns = [...userCheckIns].sort((a, b) => 
          new Date(a).getTime() - new Date(b).getTime()
        );
        
        let streak = 1;
        let currentDate = new Date(sortedCheckIns[sortedCheckIns.length - 1]);
        
        // Go backwards through the sorted check-ins
        for (let i = sortedCheckIns.length - 2; i >= 0; i--) {
          const checkInDate = new Date(sortedCheckIns[i]);
          
          // Calculate the difference in days
          const prevDate = new Date(currentDate);
          prevDate.setDate(prevDate.getDate() - 1);
          prevDate.setHours(0, 0, 0, 0);
          
          if (checkInDate.getTime() === prevDate.getTime()) {
            streak++;
            currentDate = checkInDate;
          } else {
            break;
          }
        }
        
        return streak;
      },
      
      getLastCheckIn: (userId) => {
        const userCheckIns = get().checkIns[userId] || [];
        if (userCheckIns.length === 0) return null;
        
        // Sort check-ins by date (newest first)
        const sortedCheckIns = [...userCheckIns].sort((a, b) => 
          new Date(b).getTime() - new Date(a).getTime()
        );
        
        return sortedCheckIns[0];
      },
      
      resetStreak: (userId) => {
        set(state => ({
          checkIns: {
            ...state.checkIns,
            [userId]: [],
          }
        }));
        
        // Update streak count in auth store if it's a client
        const { user, updateUser, updateClient, clients } = useAuthStore.getState();
        
        if (user && user.id === userId && user.role === 'client') {
          updateUser({ 
            ...user, 
            streakCount: 0,
          });
        } else if (clients.length > 0) {
          const client = clients.find(c => c.id === userId);
          if (client) {
            updateClient(userId, { streakCount: 0 });
          }
        }
      },
      
      hasCheckedInToday: (userId) => {
        const userCheckIns = get().checkIns[userId] || [];
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString();
        
        return userCheckIns.some(checkIn => {
          const checkInDate = new Date(checkIn);
          checkInDate.setHours(0, 0, 0, 0);
          return checkInDate.toISOString() === todayStr;
        });
      },
    }),
    {
      name: 'streak-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);