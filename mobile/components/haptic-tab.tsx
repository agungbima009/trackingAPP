import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
import { Animated } from 'react-native';
import { useEffect, useRef } from 'react';

export function HapticTab(props: BottomTabBarButtonProps) {
  const isActive = props.accessibilityState?.selected;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(scaleAnim, {
      toValue: isActive ? 1.1 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isActive]);

  const handlePressIn = (ev: any) => {
    Animated.timing(scaleAnim, {
      toValue: 0.95,
      duration: 100,
      useNativeDriver: true,
    }).start();

    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    props.onPressIn?.(ev);
  };

  const handlePressOut = (ev: any) => {
    Animated.timing(scaleAnim, {
      toValue: isActive ? 1.1 : 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
    props.onPressOut?.(ev);
  };

  return (
    <Animated.View
      style={{
        flex: 1,
        transform: [{ scale: scaleAnim }],
      }}
    >
      <PlatformPressable
        {...props}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {props.children}
      </PlatformPressable>
    </Animated.View>
  );
}
