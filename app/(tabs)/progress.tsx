import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Camera, FileText, Plus } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { globalStyles } from '@/constants/theme';
import { useProgressStore } from '@/store/progress-store';
import { useAuthStore } from '@/store/auth-store';
import { ProgressCard } from '@/components/ProgressCard';

export default function ProgressScreen() {
  const router = useRouter();
  const { user, isTrainer, clients } = useAuthStore();
  const { getEntries } = useProgressStore();
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'photos' | 'measurements' | 'notes'>('all');
  
  if (!user) return null;
  
  const clientId = isTrainer ? (selectedClient || (clients[0]?.id || '')) : user.id;
  const allEntries = getEntries(clientId);
  
  const filteredEntries = activeTab === 'all' 
    ? allEntries 
    : allEntries.filter(entry => {
        if (activeTab === 'photos') return entry.type === 'photo';
        if (activeTab === 'measurements') return entry.type === 'measurement';
        if (activeTab === 'notes') return entry.type === 'note';
        return true;
      });
  
  const renderClientSelector = () => (
    <View style={styles.clientSelector}>
      <Text style={styles.clientSelectorTitle}>Select Client:</Text>
      <FlatList
        data={clients}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.clientItem,
              selectedClient === item.id && styles.clientItemSelected
            ]}
            onPress={() => setSelectedClient(item.id)}
          >
            <Text style={[
              styles.clientItemText,
              selectedClient === item.id && styles.clientItemTextSelected
            ]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.clientList}
      />
    </View>
  );
  
  return (
    <SafeAreaView style={globalStyles.container}>
      <View style={styles.container}>
        {isTrainer && renderClientSelector()}
        
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'all' && styles.activeTab]}
            onPress={() => setActiveTab('all')}
          >
            <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>All</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'photos' && styles.activeTab]}
            onPress={() => setActiveTab('photos')}
          >
            <Camera size={16} color={activeTab === 'photos' ? colors.text : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'photos' && styles.activeTabText]}>Photos</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'measurements' && styles.activeTab]}
            onPress={() => setActiveTab('measurements')}
          >
            <FileText size={16} color={activeTab === 'measurements' ? colors.text : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'measurements' && styles.activeTabText]}>Measurements</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'notes' && styles.activeTab]}
            onPress={() => setActiveTab('notes')}
          >
            <FileText size={16} color={activeTab === 'notes' ? colors.text : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'notes' && styles.activeTabText]}>Notes</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={filteredEntries}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ProgressCard
              entry={item}
              onPress={() => router.push(`/progress/${item.id}`)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No progress entries found</Text>
            </View>
          }
        />
        
        {!isTrainer && (
          <View style={styles.fabContainer}>
            <TouchableOpacity
              style={[styles.fab, { backgroundColor: colors.secondary }]}
              onPress={() => router.push('/progress/photo')}
            >
              <Camera size={24} color={colors.text} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.fab, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/progress/measurement')}
            >
              <FileText size={24} color={colors.text} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.fab, { backgroundColor: '#4CAF50' }]}
              onPress={() => router.push('/progress/note')}
            >
              <Plus size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.md,
  },
  clientSelector: {
    marginBottom: theme.spacing.md,
  },
  clientSelectorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: theme.spacing.sm,
  },
  clientList: {
    paddingVertical: theme.spacing.sm,
  },
  clientItem: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: colors.card,
    marginRight: theme.spacing.sm,
  },
  clientItemSelected: {
    backgroundColor: colors.primary,
  },
  clientItemText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  clientItemTextSelected: {
    color: colors.text,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
    backgroundColor: colors.backgroundLight,
    borderRadius: theme.borderRadius.md,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    gap: 4,
  },
  activeTab: {
    backgroundColor: colors.card,
  },
  tabText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.text,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: theme.spacing.xl * 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  fabContainer: {
    position: 'absolute',
    bottom: theme.spacing.lg,
    right: theme.spacing.lg,
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.medium,
  },
});