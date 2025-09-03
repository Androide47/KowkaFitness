import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Calendar, Clock, MapPin, User, FileText } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { globalStyles } from '@/constants/theme';
import { useAuthStore } from '@/store/auth-store';
import { useCalendarStore } from '@/store/calendar-store';
import { useLanguageStore } from '@/store/language-store';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Avatar } from '@/components/Avatar';
import { formatDate } from '@/utils/date-utils';

export default function CreateAppointmentScreen() {
  const router = useRouter();
  const { user, clients } = useAuthStore();
  const { addAppointment, getAvailableSlots } = useCalendarStore();
  const { t } = useLanguageStore();
  
  const [date, setDate] = useState(new Date());
  const [selectedClient, setSelectedClient] = useState(clients[0]?.id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [availableSlots, setAvailableSlots] = useState<{ start: string, end: string }[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<{ start: string, end: string } | null>(null);
  
  useEffect(() => {
    if (date) {
      // Get available slots for 60 minutes appointments
      const slots = getAvailableSlots(date.toISOString(), 60);
      setAvailableSlots(slots);
      setSelectedSlot(null);
    }
  }, [date]);
  
  const handleCreateAppointment = () => {
    if (!user || !selectedClient || !title || !selectedSlot) return;
    
    addAppointment({
      trainerId: user.id,
      clientId: selectedClient,
      title,
      description,
      startTime: selectedSlot.start,
      endTime: selectedSlot.end,
      status: 'scheduled',
      location,
      notes,
    });
    
    router.back();
  };
  
  const formatTimeSlot = (slot: { start: string, end: string }) => {
    const startTime = new Date(slot.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const endTime = new Date(slot.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${startTime} - ${endTime}`;
  };
  
  return (
    <SafeAreaView style={globalStyles.container}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Create Appointment</Text>
        
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Client</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.clientList}>
              {clients.map(client => (
                <TouchableOpacity
                  key={client.id}
                  style={[
                    styles.clientItem,
                    selectedClient === client.id && styles.selectedClientItem
                  ]}
                  onPress={() => setSelectedClient(client.id)}
                >
                  <Avatar source={client.avatar} name={client.name} size={40} />
                  <Text style={[
                    styles.clientName,
                    selectedClient === client.id && styles.selectedClientName
                  ]}>
                    {client.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date</Text>
            <View style={styles.dateContainer}>
              <Text style={styles.dateText}>{formatDate(date.toISOString())}</Text>
              <Calendar size={20} color={colors.primary} />
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Available Time Slots</Text>
            {availableSlots.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.slotList}>
                {availableSlots.map((slot, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.slotItem,
                      selectedSlot && selectedSlot.start === slot.start && styles.selectedSlotItem
                    ]}
                    onPress={() => setSelectedSlot(slot)}
                  >
                    <Clock size={16} color={selectedSlot && selectedSlot.start === slot.start ? colors.text : colors.textSecondary} />
                    <Text style={[
                      styles.slotText,
                      selectedSlot && selectedSlot.start === slot.start && styles.selectedSlotText
                    ]}>
                      {formatTimeSlot(slot)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <Text style={styles.noSlotsText}>No available slots for this day</Text>
            )}
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title</Text>
            <Input
              placeholder="Appointment title"
              value={title}
              onChangeText={setTitle}
              leftIcon={<FileText size={20} color={colors.textSecondary} />}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description (Optional)</Text>
            <Input
              placeholder="Appointment description"
              value={description}
              onChangeText={setDescription}
              multiline
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location (Optional)</Text>
            <Input
              placeholder="Appointment location"
              value={location}
              onChangeText={setLocation}
              leftIcon={<MapPin size={20} color={colors.textSecondary} />}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes (Optional)</Text>
            <Input
              placeholder="Additional notes"
              value={notes}
              onChangeText={setNotes}
              multiline
            />
          </View>
          
          <View style={styles.buttonContainer}>
            <Button
              title={t('common.cancel')}
              onPress={() => router.back()}
              variant="outline"
              style={styles.button}
            />
            
            <Button
              title="Create Appointment"
              onPress={handleCreateAppointment}
              style={styles.button}
              disabled={!selectedClient || !title || !selectedSlot}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: theme.spacing.lg,
  },
  formContainer: {
    gap: theme.spacing.md,
  },
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: theme.spacing.sm,
  },
  clientList: {
    marginBottom: theme.spacing.sm,
  },
  clientItem: {
    alignItems: 'center',
    marginRight: theme.spacing.md,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    width: 80,
  },
  selectedClientItem: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  clientName: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  selectedClientName: {
    color: colors.text,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateText: {
    fontSize: 16,
    color: colors.text,
  },
  slotList: {
    marginBottom: theme.spacing.sm,
  },
  slotItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  selectedSlotItem: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  slotText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  selectedSlotText: {
    color: colors.text,
  },
  noSlotsText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  button: {
    flex: 1,
  },
});