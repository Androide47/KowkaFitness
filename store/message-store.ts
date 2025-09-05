import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Message, Attachment } from '@/types';
import { api } from '@/utils/api';
import { useAuthStore } from './auth-store';

interface MessageState {
  messages: Message[];
  
  // Message actions
  getMessages: () => Message[];
  getConversation: (userId: string, otherUserId: string) => Message[];
  sendMessage: (content: string, receiverId: string, attachments?: Attachment[]) => void;
  markAsRead: (messageId: string) => void;
  deleteMessage: (messageId: string) => void;
  
  // Broadcast actions
  sendBroadcast: (content: string, receiverIds: string[], attachments?: Attachment[]) => void;
  
  // Utility
  getUnreadCount: (userId: string) => number;
}

export const useMessageStore = create<MessageState>()(
  persist(
    (set, get) => ({
      messages: [],
      
      // Message actions
      getMessages: () => get().messages,
      hydrateFromApi: async (userId?: string, otherUserId?: string) => {
        try {
          if (userId && otherUserId) {
            const data = await api.get(`/messages/conversation?userId=${encodeURIComponent(userId)}&otherUserId=${encodeURIComponent(otherUserId)}`);
            set({ messages: data });
          } else {
            const data = await api.get('/messages');
            set({ messages: data });
          }
        } catch (e) {
          console.warn('Failed to hydrate messages', e);
        }
      },
      
      getConversation: (userId, otherUserId) => {
        return get().messages.filter(
          message => 
            (message.senderId === userId && message.receiverId === otherUserId) ||
            (message.senderId === otherUserId && message.receiverId === userId)
        ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      },
      
      sendMessage: (content, receiverId, attachments) => {
        const user = useAuthStore.getState().user;
        if (!user) return;
        
        const newMessage: Message = {
          id: `msg-${Date.now()}`,
          senderId: user.id,
          receiverId,
          content,
          timestamp: new Date().toISOString(),
          read: false,
          attachments,
        };
        
        set(state => ({
          messages: [...state.messages, newMessage]
        }));
      },
      
      markAsRead: (messageId) => {
        set(state => ({
          messages: state.messages.map(message => 
            message.id === messageId ? { ...message, read: true } : message
          )
        }));
      },
      
      deleteMessage: (messageId) => {
        set(state => ({
          messages: state.messages.filter(message => message.id !== messageId)
        }));
      },
      
      // Broadcast actions
      sendBroadcast: (content, receiverIds, attachments) => {
        const user = useAuthStore.getState().user;
        if (!user) return;
        
        const newMessages = receiverIds.map(receiverId => ({
          id: `msg-${Date.now()}-${receiverId}`,
          senderId: user.id,
          receiverId,
          content,
          timestamp: new Date().toISOString(),
          read: false,
          attachments,
        }));
        
        set(state => ({
          messages: [...state.messages, ...newMessages]
        }));
      },
      
      // Utility
      getUnreadCount: (userId) => {
        return get().messages.filter(
          message => message.receiverId === userId && !message.read
        ).length;
      },
    }),
    {
      name: 'message-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);