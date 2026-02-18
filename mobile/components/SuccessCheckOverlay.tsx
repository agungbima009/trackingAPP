import React, { useEffect } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

interface Props {
  visible: boolean;
  onFinish: () => void;
}

const CHECK_LENGTH = 80;
const { height } = Dimensions.get('window');

// Create animated components outside component
const AnimatedPath = Animated.createAnimatedComponent(Path);

export default function SuccessCheckOverlay({
  visible,
  onFinish,
}: Props) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const progress = useSharedValue(0);
  const translateY = useSharedValue(height);
  const checkScale = useSharedValue(0);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Background fade in
      opacity.value = withTiming(1, { duration: 300 });
      
      // Move from bottom to center with smooth easing
      translateY.value = withSpring(0, {
        damping: 15,
        stiffness: 100,
      });
      
      // Scale up the container
      scale.value = withSequence(
        withSpring(1.2, { damping: 8 }),
        withSpring(1, { damping: 10 })
      );
      
      // Glow effect
      glowOpacity.value = withSequence(
        withDelay(200, withTiming(0.8, { duration: 300 })),
        withTiming(0, { duration: 500 })
      );
      
      // Check icon scale with bounce
      checkScale.value = withDelay(
        300,
        withSpring(1, { damping: 6, stiffness: 100 })
      );
      
      // Draw checkmark
      progress.value = withDelay(
        400,
        withTiming(1, { 
          duration: 700,
          easing: Easing.out(Easing.cubic),
        })
      );

      const timeout = setTimeout(() => {
        // Exit animation
        scale.value = withSpring(0.8, { damping: 10 });
        opacity.value = withTiming(0, { duration: 400 }, (finished) => {
          if (finished) {
            runOnJS(onFinish)();
          }
        });
      }, 2000);

      return () => clearTimeout(timeout);
    } else {
      scale.value = 0;
      opacity.value = 0;
      progress.value = 0;
      translateY.value = height;
      checkScale.value = 0;
      glowOpacity.value = 0;
    }
  }, [visible, onFinish]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const circleStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const checkIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  // Use useAnimatedProps for SVG props
  const checkProps = useAnimatedProps(() => ({
    strokeDashoffset: CHECK_LENGTH * (1 - progress.value),
  }));

  return (
    <Animated.View style={[styles.overlay, containerStyle]} pointerEvents="none">
      <Animated.View style={[styles.box, circleStyle]}>
        {/* Glow Effect */}
        <Animated.View style={[styles.glow, glowStyle]} />
        
        <Animated.View style={checkIconStyle}>
          <Svg width={140} height={140}>
            {/* Background Circle */}
            <Circle
              cx="70"
              cy="70"
              r="65"
              fill="#10B981"
              opacity="0.1"
            />
            
            {/* Main Circle */}
            <Circle
              cx="70"
              cy="70"
              r="60"
              stroke="#10B981"
              strokeWidth="8"
              fill="#FFFFFF"
            />

            {/* Checkmark */}
            <AnimatedPath
              d="M40 72 L60 92 L100 48"
              stroke="#10B981"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={CHECK_LENGTH}
              animatedProps={checkProps}
            />
          </Svg>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  box: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#10B981',
    opacity: 0.3,
  },
});