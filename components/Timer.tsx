import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { Play, Pause, RotateCcw } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';

interface TimerProps {
  initialSeconds?: number;
  onComplete?: () => void;
  autoStart?: boolean;
  countDown?: boolean;
}

export const Timer: React.FC<TimerProps> = ({
  initialSeconds = 60,
  onComplete,
  autoStart = false,
  countDown = true,
}) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(autoStart);
  const [isCompleted, setIsCompleted] = useState(false);
  
  const progressAnimation = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && !isCompleted) {
      interval = setInterval(() => {
        setSeconds(prevSeconds => {
          const newSeconds = countDown ? prevSeconds - 1 : prevSeconds + 1;
          
          if (countDown && newSeconds <= 0) {
            clearInterval(interval!);
            setIsActive(false);
            setIsCompleted(true);
            onComplete?.();
            return 0;
          }
          
          return newSeconds;
        });
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isCompleted, countDown, onComplete]);
  
  useEffect(() => {
    if (countDown) {
      Animated.timing(progressAnimation, {
        toValue: isActive ? 1 : 0,
        duration: isActive ? seconds * 1000 : 300,
        useNativeDriver: false,
        easing: Easing.linear,
      }).start();
    }
  }, [isActive, seconds, countDown, progressAnimation]);
  
  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const toggleTimer = () => {
    if (isCompleted) {
      resetTimer();
    } else {
      setIsActive(!isActive);
    }
  };
  
  const resetTimer = () => {
    setIsActive(false);
    setIsCompleted(false);
    setSeconds(initialSeconds);
    progressAnimation.setValue(0);
  };
  
  const progressInterpolation = progressAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });
  
  return (
    <View style={styles.container}>
      <View style={styles.timerContainer}>
        {countDown && (
          <View style={styles.progressContainer}>
            <Animated.View 
              style={[
                styles.progressBar, 
                { width: progressInterpolation }
              ]} 
            />
          </View>
        )}
        
        <Text style={styles.timerText}>{formatTime(seconds)}</Text>
        
        <View style={styles.controls}>
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={toggleTimer}
          >
            {isActive ? (
              <Pause size={24} color={colors.text} />
            ) : (
              <Play size={24} color={colors.text} />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={resetTimer}
          >
            <RotateCcw size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.md,
  },
  timerContainer: {
    backgroundColor: colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    ...theme.shadows.small,
  },
  progressContainer: {
    width: '100%',
    height: 4,
    backgroundColor: colors.backgroundLight,
    borderRadius: 2,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  timerText: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.text,
    marginBottom: theme.spacing.md,
  },
  controls: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});