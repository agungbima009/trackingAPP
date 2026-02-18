import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
  interpolate,
  runOnJS,
  ReduceMotion,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';

interface SwipeableButtonProps {
  onSwipeComplete: () => void;
  disabled?: boolean;
}

export function SwipeableButton({
  onSwipeComplete,
  disabled = false,
}: SwipeableButtonProps) {
  const SLIDER_SIZE = 54;
  const MARGIN = 4;

  const translateX = useSharedValue(0);
  const trackWidth = useSharedValue(0);
  const completed = useSharedValue(false);

  // ✅ FIX: gunakan derived value
  const maxTranslate = useDerivedValue(() => {
    return trackWidth.value - SLIDER_SIZE - MARGIN * 2;
  });

  const gesture = Gesture.Pan()
    .enabled(!disabled)
    .onUpdate((event) => {
      if (completed.value) return;

      const newX = Math.max(
        0,
        Math.min(event.translationX, maxTranslate.value)
      );

      translateX.value = newX;
    })
    .onEnd(() => {
      if (completed.value) return;

      const threshold = maxTranslate.value * 0.85;

      if (translateX.value >= threshold) {
        translateX.value = withSpring(maxTranslate.value, {
          reduceMotion: ReduceMotion.Never,
        });

        completed.value = true;
        runOnJS(onSwipeComplete)();
      } else {
        translateX.value = withSpring(0, {
          reduceMotion: ReduceMotion.Never,
        });
      }
    });

  const sliderStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const fillStyle = useAnimatedStyle(() => {
    const progress =
      maxTranslate.value > 0
        ? translateX.value / maxTranslate.value
        : 0;

    return {
      opacity: progress,
      transform: [{ scaleX: progress }],
    };
  });

  const textStyle = useAnimatedStyle(() => {
    const progress =
      maxTranslate.value > 0
        ? translateX.value / maxTranslate.value
        : 0;

    return {
      opacity: interpolate(progress, [0, 1], [1, 0]),
    };
  });

  return (
    <View
      style={styles.container}
      onLayout={(e) => {
        trackWidth.value =
          e.nativeEvent.layout.width;
      }}
    >
      <Animated.View style={[styles.fill, fillStyle]} />

      <Animated.View style={[styles.textContainer, textStyle]}>
        <Text style={styles.text}>
          SWIPE TO START TRACKING
        </Text>
      </Animated.View>

      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.slider, sliderStyle]}>
          <Text style={styles.arrow}>➜</Text>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 62,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e5ea',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '100%',
    backgroundColor: '#000000',
    transformOrigin: 'left',
  },
  textContainer: {
    position: 'absolute',
    width: '100%',
    alignItems: 'center',
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    color: '#86868b',
    letterSpacing: 0.5,
  },
  slider: {
    position: 'absolute',
    left: 4,
    top: 4,
    width: 54,
    height: 54,
    borderRadius: 8,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
});
