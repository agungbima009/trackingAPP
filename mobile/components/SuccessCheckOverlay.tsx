import React, { useEffect } from 'react';
import { StyleSheet, Dimensions, Text } from 'react-native';
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
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(10);

  useEffect(() => {
    if (visible) {
      // Background fade in - more subtle
      opacity.value = withTiming(1, { duration: 250, easing: Easing.out(Easing.ease) });
      
      // Move from bottom to center with refined easing
      translateY.value = withSpring(0, {
        damping: 18,
        stiffness: 120,
      });
      
      // Scale up the container - more refined
      scale.value = withSequence(
        withSpring(1.1, { damping: 10 }),
        withSpring(1, { damping: 12 })
      );
      
      // Subtle glow effect
      glowOpacity.value = withSequence(
        withDelay(150, withTiming(0.6, { duration: 250 })),
        withTiming(0, { duration: 400 })
      );
      
      // Check icon scale with subtle bounce
      checkScale.value = withDelay(
        250,
        withSpring(1, { damping: 8, stiffness: 120 })
      );
      
      // Draw checkmark smoothly
      progress.value = withDelay(
        350,
        withTiming(1, { 
          duration: 600,
          easing: Easing.out(Easing.cubic),
        })
      );

      // Fade in success text with subtle slide up
      textOpacity.value = withDelay(
        700,
        withTiming(1, { duration: 300 })
      );
      textTranslateY.value = withDelay(
        700,
        withSpring(0, { damping: 12, stiffness: 100 })
      );

      const timeout = setTimeout(() => {
        // Exit animation - more subtle
        scale.value = withSpring(0.9, { damping: 12 });
        textOpacity.value = withTiming(0, { duration: 250 });
        opacity.value = withTiming(0, { duration: 350 }, (finished) => {
          if (finished) {
            runOnJS(onFinish)();
          }
        });
      }, 1800);

      return () => clearTimeout(timeout);
    } else {
      scale.value = 0;
      opacity.value = 0;
      progress.value = 0;
      translateY.value = height;
      checkScale.value = 0;
      glowOpacity.value = 0;
      textOpacity.value = 0;
      textTranslateY.value = 10;
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

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  // Use useAnimatedProps for SVG props
  const checkProps = useAnimatedProps(() => ({
    strokeDashoffset: CHECK_LENGTH * (1 - progress.value),
  }));

  return (
    <Animated.View style={[styles.overlay, containerStyle]} pointerEvents="none">
      <Animated.View style={[styles.box, circleStyle]}>
        {/* Subtle Glow Effect */}
        <Animated.View style={[styles.glow, glowStyle]} />
        
        <Animated.View style={checkIconStyle}>
          <Svg width={120} height={120}>
            {/* Background Circle - Subtle */}
            <Circle
              cx="60"
              cy="60"
              r="55"
              fill="#1d1d1f"
              opacity="0.05"
            />
            
            {/* Main Circle - Minimalist Black */}
            <Circle
              cx="60"
              cy="60"
              r="50"
              stroke="#1d1d1f"
              strokeWidth="4"
              fill="#FFFFFF"
            />

            {/* Refined Checkmark */}
            <AnimatedPath
              d="M35 62 L52 79 L87 42"
              stroke="#1d1d1f"
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={CHECK_LENGTH}
              animatedProps={checkProps}
            />
          </Svg>
        </Animated.View>
        
        {/* Success Text */}
        <Animated.Text style={[styles.successText, textStyle]}>
          Success
        </Animated.Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  box: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  glow: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#1d1d1f',
    opacity: 0.2,
  },
  successText: {
    marginTop: 24,
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});