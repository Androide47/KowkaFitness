import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Flame } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';

interface StreakCounterProps {
  count: number;
  size?: 'small' | 'medium' | 'large';
}

export const StreakCounter: React.FC<StreakCounterProps> = ({
  count,
  size = 'medium',
}) => {
  const getSize = () => {
    switch (size) {
      case 'small':
        return {
          container: styles.smallContainer,
          flame: 16,
          text: styles.smallText,
        };
      case 'large':
        return {
          container: styles.largeContainer,
          flame: 28,
          text: styles.largeText,
        };
      default:
        return {
          container: styles.mediumContainer,
          flame: 20,
          text: styles.mediumText,
        };
    }
  };
  
  const sizeStyles = getSize();
  
  return (
    <View style={[styles.container, sizeStyles.container]}>
      <Flame size={sizeStyles.flame} color={colors.secondary} />
      <Text style={[styles.text, sizeStyles.text]}>{count}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    borderRadius: theme.borderRadius.round,
    paddingHorizontal: theme.spacing.md,
  },
  smallContainer: {
    paddingVertical: 4,
    gap: 4,
  },
  mediumContainer: {
    paddingVertical: 6,
    gap: 6,
  },
  largeContainer: {
    paddingVertical: 8,
    gap: 8,
  },
  text: {
    fontWeight: '700',
    color: colors.text,
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 20,
  },
});