import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { IconSymbol } from './ui/icon-symbol';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BUTTON_WIDTH = SCREEN_WIDTH - 80;
const SWIPE_THRESHOLD = BUTTON_WIDTH - 100;

interface SwipeableButtonProps {
  onSwipeComplete: () => void;
  disabled?: boolean;
}

export function SwipeableButton({ onSwipeComplete, disabled = false }: SwipeableButtonProps) {
  const [swiped, setSwiped] = useState(false);
  const translateX = useRef(new Animated.Value(0)).current;
  const backgroundOpacity = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled && !swiped,
      onMoveShouldSetPanResponder: () => !disabled && !swiped,
      onPanResponderMove: (_, gesture) => {
        if (gesture.dx > 0 && gesture.dx <= SWIPE_THRESHOLD) {
          translateX.setValue(gesture.dx);
          backgroundOpacity.setValue(gesture.dx / SWIPE_THRESHOLD);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx >= SWIPE_THRESHOLD) {
          // Swipe completed
          setSwiped(true);
          Animated.parallel([
            Animated.spring(translateX, {
              toValue: SWIPE_THRESHOLD,
              useNativeDriver: true,
            }),
            Animated.timing(backgroundOpacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start(() => {
            setTimeout(() => {
              onSwipeComplete();
            }, 300);
          });
        } else {
          // Swipe not completed, return to start
          Animated.parallel([
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
              damping: 15,
            }),
            Animated.timing(backgroundOpacity, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      <View style={styles.trackContainer}>
        {/* Background that fills on swipe */}
        <Animated.View
          style={[
            styles.backgroundFill,
            {
              opacity: backgroundOpacity,
              transform: [
                {
                  scaleX: backgroundOpacity.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1],
                  }),
                },
              ],
            },
          ]}
        />

        {/* Text instruction */}
        <View style={styles.textContainer}>
          <IconSymbol name="arrow.right" size={20} color="#9CA3AF" />
          <Text style={styles.instructionText}>
            {swiped ? 'Starting...' : 'Swipe to Start Tracking'}
          </Text>
          <IconSymbol name="arrow.right" size={20} color="#9CA3AF" />
        </View>

        {/* Sliding button */}
        <Animated.View
          style={[
            styles.sliderButton,
            {
              transform: [{ translateX }],
            },
          ]}
          {...panResponder.panHandlers}
        >
          <View style={styles.sliderButtonInner}>
            <IconSymbol name="arrow.right" size={28} color="#FFFFFF" />
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  trackContainer: {
    height: 70,
    backgroundColor: '#1F2937',
    borderRadius: 40,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  backgroundFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '100%',
    backgroundColor: '#10B981',
    transformOrigin: 'left',
  },
  textContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 80,
  },
  instructionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
    textAlign: 'center',
  },
  sliderButton: {
    position: 'absolute',
    left: 5,
    top: 5,
    width: 60,
    height: 60,
  },
  sliderButtonInner: {
    width: '100%',
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
