import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProgressEntry, Measurements } from '@/types';
import { api } from '@/utils/api';
import { useAuthStore } from './auth-store';

interface ProgressState {
  entries: ProgressEntry[];
  
  // Progress entry actions
  getEntries: (clientId: string) => ProgressEntry[];
  getEntriesByType: (clientId: string, type: 'photo' | 'measurement' | 'note') => ProgressEntry[];
  addEntry: (entry: Omit<ProgressEntry, 'id'>) => void;
  updateEntry: (id: string, data: Partial<ProgressEntry>) => void;
  deleteEntry: (id: string) => void;
  
  // Measurement specific actions
  addMeasurement: (clientId: string, measurements: Measurements) => void;
  getLatestMeasurements: (clientId: string) => Measurements | undefined;
  
  // Photo specific actions
  addPhotos: (clientId: string, photoUrls: string[]) => void;
  getAllPhotos: (clientId: string) => string[];
  
  // Note specific actions
  addNote: (clientId: string, note: string) => void;
  getAllNotes: (clientId: string) => string[];
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      entries: [],
      hydrateFromApi: async (clientId: string) => {
        try {
          const data = await api.get(`/progress/${clientId}`);
          set({ entries: data });
        } catch (e) {
          console.warn('Failed to hydrate progress', e);
        }
      },
      
      // Progress entry actions
      getEntries: (clientId) => {
        return get().entries
          .filter(entry => entry.clientId === clientId)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      },
      
      getEntriesByType: (clientId, type) => {
        return get().getEntries(clientId).filter(entry => entry.type === type);
      },
      
      addEntry: (entry) => {
        const newEntry: ProgressEntry = {
          id: `prog-${Date.now()}`,
          ...entry,
        };
        
        set(state => ({
          entries: [...state.entries, newEntry]
        }));
      },
      
      updateEntry: (id, data) => {
        set(state => ({
          entries: state.entries.map(entry => 
            entry.id === id ? { ...entry, ...data } : entry
          )
        }));
      },
      
      deleteEntry: (id) => {
        set(state => ({
          entries: state.entries.filter(entry => entry.id !== id)
        }));
      },
      
      // Measurement specific actions
      addMeasurement: (clientId, measurements) => {
        const newEntry: ProgressEntry = {
          id: `prog-${Date.now()}`,
          clientId,
          date: new Date().toISOString(),
          type: 'measurement',
          measurements,
        };
        
        set(state => ({
          entries: [...state.entries, newEntry]
        }));
      },
      
      getLatestMeasurements: (clientId) => {
        const measurementEntries = get().getEntriesByType(clientId, 'measurement');
        if (measurementEntries.length > 0) {
          return measurementEntries[0].measurements;
        }
        return undefined;
      },
      
      // Photo specific actions
      addPhotos: (clientId, photoUrls) => {
        const newEntry: ProgressEntry = {
          id: `prog-${Date.now()}`,
          clientId,
          date: new Date().toISOString(),
          type: 'photo',
          photos: photoUrls,
        };
        
        set(state => ({
          entries: [...state.entries, newEntry]
        }));
      },
      
      getAllPhotos: (clientId) => {
        const photoEntries = get().getEntriesByType(clientId, 'photo');
        return photoEntries.flatMap(entry => entry.photos || []);
      },
      
      // Note specific actions
      addNote: (clientId, note) => {
        const newEntry: ProgressEntry = {
          id: `prog-${Date.now()}`,
          clientId,
          date: new Date().toISOString(),
          type: 'note',
          notes: note,
        };
        
        set(state => ({
          entries: [...state.entries, newEntry]
        }));
      },
      
      getAllNotes: (clientId) => {
        const noteEntries = get().getEntriesByType(clientId, 'note');
        return noteEntries.map(entry => entry.notes || '').filter(Boolean);
      },
    }),
    {
      name: 'progress-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);