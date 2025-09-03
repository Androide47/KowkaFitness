import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated, Easing } from 'react-native';

const { width, height } = Dimensions.get('window');

// Generate random confetti pieces
const generateConfetti = (count: number) => {
  const confetti = [];
  const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722'];
  
  for (let i = 0; i < count; i++) {
    confetti.push({
      id: i,
      x: Math.random() * width,
      y: -20 - Math.random() * 100,
      size: 5 + Math.random() * 15,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: new Animated.Value(0),
      translateY: new Animated.Value(-20 - Math.random() * 100),
      translateX: new Animated.Value(Math.random() * width),
    });
  }
  
  return confetti;
};

interface ConfettiProps {
  count?: number;
  duration?: number;
}

const Confetti: React.FC<ConfettiProps> = ({ count = 100, duration = 5000 }) => {
  const confetti = useRef(generateConfetti(count)).current;
  
  useEffect(() => {
    // Animate each confetti piece
    confetti.forEach((piece) => {
      // Rotation animation
      Animated.loop(
        Animated.timing(piece.rotation, {
          toValue: 1,
          duration: 3000 + Math.random() * 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
      
      // Falling animation
      Animated.timing(piece.translateY, {
        toValue: height + 100,
        duration: duration + Math.random() * 2000,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start();
      
      // Swaying animation
      Animated.sequence([
        Animated.timing(piece.translateX, {
          toValue: piece.translateX._value - 50 + Math.random() * 100,
          duration: 1000 + Math.random() * 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(piece.translateX, {
          toValue: piece.translateX._value + 50 - Math.random() * 100,
          duration: 1000 + Math.random() * 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(piece.translateX, {
          toValue: piece.translateX._value - 50 + Math.random() * 100,
          duration: 1000 + Math.random() * 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, []);
  
  return (
    <View style={styles.container} pointerEvents="none">
      {confetti.map((piece) => {
        const rotateZ = piece.rotation.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg'],
        });
        
        return (
          <Animated.View
            key={piece.id}
            style={[
              styles.confetti,
              {
                width: piece.size,
                height: piece.size,
                backgroundColor: piece.color,
                transform: [
                  { translateX: piece.translateX },
                  { translateY: piece.translateY },
                  { rotateZ },
                ],
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
  },
  confetti: {
    position: 'absolute',
    borderRadius: 2,
  },
});

export default Confetti;