import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Client, Trainer, User } from '@/types';
import { mockTrainer, mockClients } from '@/mocks/users';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isTrainer: boolean;
  clients: Client[];
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  updateClient: (clientId: string, clientData: Partial<Client>) => void;
  signUp: (userData: Partial<User>, isTrainer: boolean) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isTrainer: false,
      clients: [],
      
      login: async (email: string, password: string) => {
        // In a real app, this would be an API call
        // For demo purposes, we're using mock data
        
        // Simulate trainer login
        if (email.includes('trainer') || email.includes('coach')) {
          set({
            user: mockTrainer,
            isAuthenticated: true,
            isTrainer: true,
            clients: mockClients,
          });
          return true;
        }
        
        // Simulate client login
        const client = mockClients.find(c => c.email === email);
        if (client) {
          set({
            user: client,
            isAuthenticated: true,
            isTrainer: false,
            clients: [],
          });
          return true;
        }
        
        return false;
      },
      
      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          isTrainer: false,
          clients: [],
        });
      },
      
      updateUser: (userData) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } });
        }
      },
      
      updateClient: (clientId, clientData) => {
        const clients = get().clients;
        const updatedClients = clients.map(client => 
          client.id === clientId ? { ...client, ...clientData } : client
        );
        set({ clients: updatedClients });
      },

      signUp: async (userData, isTrainer) => {
        // In a real app, this would be an API call to create a new user
        // For demo purposes, we'll simulate a successful signup
        
        try {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          if (isTrainer) {
            // Create a new trainer
            const newTrainer: Trainer = {
              id: `trainer-${Date.now()}`,
              name: userData.name || 'New Trainer',
              email: userData.email || 'new.trainer@example.com',
              avatar: mockTrainer.avatar, // Use default avatar
              bio: 'New trainer bio',
              specialties: ['General Fitness'],
              experience: '1 year',
              certifications: [],
              availability: mockTrainer.availability,
            };
            
            set({
              user: newTrainer,
              isAuthenticated: true,
              isTrainer: true,
              clients: [],
            });
          } else {
            // Create a new client
            const newClient: Client = {
              id: `client-${Date.now()}`,
              name: userData.name || 'New Client',
              email: userData.email || 'new.client@example.com',
              avatar: mockClients[0].avatar, // Use default avatar
              goals: [],
              height: 0,
              weight: 0,
              fitnessLevel: 'beginner',
              medicalConditions: [],
              joinDate: new Date().toISOString(),
            };
            
            set({
              user: newClient,
              isAuthenticated: true,
              isTrainer: false,
              clients: [],
            });
          }
          
          return true;
        } catch (error) {
          console.error('Signup error:', error);
          return false;
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);