import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appointment, BlockedTime } from '@/types';
import { mockAppointments } from '@/mocks/appointments';
import { useAuthStore } from './auth-store';

interface CalendarState {
  appointments: Appointment[];
  blockedTimes: BlockedTime[];
  
  // Appointment actions
  getAppointments: () => Appointment[];
  getUserAppointments: (userId: string) => Appointment[];
  getAppointmentsByDate: (date: string) => Appointment[];
  addAppointment: (appointment: Omit<Appointment, 'id'>) => void;
  updateAppointment: (id: string, data: Partial<Appointment>) => void;
  cancelAppointment: (id: string) => void;
  deleteAppointment: (id: string) => void;
  
  // Availability
  getBlockedTimes: () => BlockedTime[];
  getBlockedTimesByDate: (date: string) => BlockedTime[];
  blockTime: (blockedTime: Omit<BlockedTime, 'id'>) => void;
  unblockTime: (id: string) => void;
  isDayFullyBlocked: (date: string) => boolean;
  blockFullDay: (date: string, reason?: string) => void;
  unblockFullDay: (date: string) => void;
  
  checkAvailability: (startTime: string, endTime: string) => boolean;
  getAvailableSlots: (date: string, durationMinutes: number) => { start: string, end: string }[];
}

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set, get) => ({
      appointments: mockAppointments,
      blockedTimes: [],
      
      // Appointment actions
      getAppointments: () => get().appointments,
      
      getUserAppointments: (userId) => {
        return get().appointments.filter(
          appointment => 
            appointment.clientId === userId || 
            appointment.trainerId === userId
        ).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
      },
      
      getAppointmentsByDate: (date) => {
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);
        
        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);
        
        return get().appointments.filter(appointment => {
          const appointmentDate = new Date(appointment.startTime);
          return appointmentDate >= targetDate && appointmentDate < nextDay;
        });
      },
      
      addAppointment: (appointment) => {
        const user = useAuthStore.getState().user;
        if (!user) return;
        
        const newAppointment: Appointment = {
          id: `apt-${Date.now()}`,
          ...appointment,
        };
        
        set(state => ({
          appointments: [...state.appointments, newAppointment]
        }));
      },
      
      updateAppointment: (id, data) => {
        set(state => ({
          appointments: state.appointments.map(appointment => 
            appointment.id === id ? { ...appointment, ...data } : appointment
          )
        }));
      },
      
      cancelAppointment: (id) => {
        set(state => ({
          appointments: state.appointments.map(appointment => 
            appointment.id === id ? { ...appointment, status: 'cancelled' } : appointment
          )
        }));
      },
      
      deleteAppointment: (id) => {
        set(state => ({
          appointments: state.appointments.filter(appointment => appointment.id !== id)
        }));
      },
      
      // Availability
      getBlockedTimes: () => get().blockedTimes,
      
      getBlockedTimesByDate: (date) => {
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);
        
        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);
        
        return get().blockedTimes.filter(blockedTime => {
          const startDate = new Date(blockedTime.startTime);
          return startDate >= targetDate && startDate < nextDay;
        });
      },
      
      blockTime: (blockedTime) => {
        const user = useAuthStore.getState().user;
        if (!user || user.role !== 'trainer') return;
        
        const newBlockedTime: BlockedTime = {
          id: `block-${Date.now()}`,
          ...blockedTime,
          trainerId: user.id,
        };
        
        set(state => ({
          blockedTimes: [...state.blockedTimes, newBlockedTime]
        }));
      },
      
      unblockTime: (id) => {
        set(state => ({
          blockedTimes: state.blockedTimes.filter(blockedTime => blockedTime.id !== id)
        }));
      },
      
      isDayFullyBlocked: (date) => {
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);
        
        const blockedTimes = get().getBlockedTimesByDate(date);
        
        return blockedTimes.some(blockedTime => 
          blockedTime.isFullDay && 
          new Date(blockedTime.startTime).getDate() === targetDate.getDate()
        );
      },
      
      blockFullDay: (date, reason) => {
        const user = useAuthStore.getState().user;
        if (!user || user.role !== 'trainer') return;
        
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(targetDate);
        endDate.setDate(endDate.getDate() + 1);
        
        const newBlockedTime: BlockedTime = {
          id: `block-day-${Date.now()}`,
          trainerId: user.id,
          startTime: targetDate.toISOString(),
          endTime: endDate.toISOString(),
          isFullDay: true,
          reason: reason || 'Not available',
        };
        
        set(state => ({
          blockedTimes: [...state.blockedTimes, newBlockedTime]
        }));
      },
      
      unblockFullDay: (date) => {
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);
        
        set(state => ({
          blockedTimes: state.blockedTimes.filter(blockedTime => {
            if (!blockedTime.isFullDay) return true;
            
            const blockDate = new Date(blockedTime.startTime);
            blockDate.setHours(0, 0, 0, 0);
            
            return blockDate.getTime() !== targetDate.getTime();
          })
        }));
      },
      
      // Availability
      checkAvailability: (startTime, endTime) => {
        const start = new Date(startTime).getTime();
        const end = new Date(endTime).getTime();
        
        // Check if there are any overlapping appointments
        const overlappingAppointments = get().appointments.some(appointment => {
          if (appointment.status === 'cancelled') return false;
          
          const appointmentStart = new Date(appointment.startTime).getTime();
          const appointmentEnd = new Date(appointment.endTime).getTime();
          
          return (
            (start >= appointmentStart && start < appointmentEnd) ||
            (end > appointmentStart && end <= appointmentEnd) ||
            (start <= appointmentStart && end >= appointmentEnd)
          );
        });
        
        // Check if there are any overlapping blocked times
        const overlappingBlockedTimes = get().blockedTimes.some(blockedTime => {
          const blockStart = new Date(blockedTime.startTime).getTime();
          const blockEnd = new Date(blockedTime.endTime).getTime();
          
          return (
            (start >= blockStart && start < blockEnd) ||
            (end > blockStart && end <= blockEnd) ||
            (start <= blockStart && end >= blockEnd)
          );
        });
        
        return !overlappingAppointments && !overlappingBlockedTimes;
      },
      
      getAvailableSlots: (date, durationMinutes) => {
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);
        
        // If the day is fully blocked, return no slots
        if (get().isDayFullyBlocked(date)) {
          return [];
        }
        
        const workingHourStart = 9; // 9 AM
        const workingHourEnd = 17; // 5 PM
        
        const slots = [];
        const durationMs = durationMinutes * 60 * 1000;
        
        // Generate slots every 30 minutes
        for (let hour = workingHourStart; hour < workingHourEnd; hour++) {
          for (let minute = 0; minute < 60; minute += 30) {
            const slotStart = new Date(targetDate);
            slotStart.setHours(hour, minute, 0, 0);
            
            const slotEnd = new Date(slotStart.getTime() + durationMs);
            
            if (slotEnd.getHours() < workingHourEnd || 
                (slotEnd.getHours() === workingHourEnd && slotEnd.getMinutes() === 0)) {
              
              if (get().checkAvailability(slotStart.toISOString(), slotEnd.toISOString())) {
                slots.push({
                  start: slotStart.toISOString(),
                  end: slotEnd.toISOString(),
                });
              }
            }
          }
        }
        
        return slots;
      },
    }),
    {
      name: 'calendar-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);