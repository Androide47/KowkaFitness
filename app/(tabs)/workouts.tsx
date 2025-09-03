import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search, Filter, Plus } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { globalStyles } from '@/constants/theme';
import { useWorkoutStore } from '@/store/workout-store';
import { useAuthStore } from '@/store/auth-store';
import { WorkoutCard } from '@/components/WorkoutCard';
import { Input } from '@/components/Input';

export default function WorkoutsScreen() {
  const router = useRouter();
  const { getWorkouts } = useWorkoutStore();
  const { isTrainer } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null);
  
  const workouts = getWorkouts();
  
  const filteredWorkouts = workouts.filter(workout => {
    const matchesSearch = workout.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         workout.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDifficulty = difficultyFilter ? workout.difficulty === difficultyFilter : true;
    
    return matchesSearch && matchesDifficulty;
  });
  
  const renderDifficultyFilter = () => (
    <View style={styles.filterContainer}>
      <Text style={styles.filterTitle}>Difficulty</Text>
      <View style={styles.filterOptions}>
        <TouchableOpacity
          style={[
            styles.filterOption,
            difficultyFilter === 'beginner' && styles.filterOptionActive
          ]}
          onPress={() => setDifficultyFilter(difficultyFilter === 'beginner' ? null : 'beginner')}
        >
          <Text style={[
            styles.filterOptionText,
            difficultyFilter === 'beginner' && styles.filterOptionTextActive
          ]}>Beginner</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterOption,
            difficultyFilter === 'intermediate' && styles.filterOptionActive
          ]}
          onPress={() => setDifficultyFilter(difficultyFilter === 'intermediate' ? null : 'intermediate')}
        >
          <Text style={[
            styles.filterOptionText,
            difficultyFilter === 'intermediate' && styles.filterOptionTextActive
          ]}>Intermediate</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterOption,
            difficultyFilter === 'advanced' && styles.filterOptionActive
          ]}
          onPress={() => setDifficultyFilter(difficultyFilter === 'advanced' ? null : 'advanced')}
        >
          <Text style={[
            styles.filterOptionText,
            difficultyFilter === 'advanced' && styles.filterOptionTextActive
          ]}>Advanced</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  
  return (
    <SafeAreaView style={globalStyles.container}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Input
            placeholder="Search workouts..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            leftIcon={<Search size={20} color={colors.textSecondary} />}
            rightIcon={
              <TouchableOpacity onPress={() => setFilterVisible(!filterVisible)}>
                <Filter size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            }
            containerStyle={styles.searchContainer}
          />
          
          {isTrainer && (
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => router.push('/workouts/create')}
            >
              <Plus size={24} color={colors.text} />
            </TouchableOpacity>
          )}
        </View>
        
        {filterVisible && renderDifficultyFilter()}
        
        <FlatList
          data={filteredWorkouts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <WorkoutCard
              workout={item}
              onPress={() => router.push(`/workouts/${item.id}`)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No workouts found</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  searchContainer: {
    flex: 1,
    marginBottom: 0,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: theme.spacing.md,
  },
  filterContainer: {
    backgroundColor: colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: theme.spacing.sm,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  filterOption: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterOptionText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  filterOptionTextActive: {
    color: colors.text,
  },
  listContent: {
    paddingBottom: theme.spacing.md,
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
});