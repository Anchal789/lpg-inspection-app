import React, { useEffect, useRef } from 'react';
import { View, Image, Animated, StyleSheet, Dimensions } from 'react-native';
import LoaderSpinner from '../../assets/logo.png';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const LoadingIndicator = (): JSX.Element => {
  const spinValue1 = useRef(new Animated.Value(0)).current;
  const spinValue2 = useRef(new Animated.Value(0)).current;
  const spinValue3 = useRef(new Animated.Value(0)).current;
  const spinValue4 = useRef(new Animated.Value(0)).current;
  const logoSpinValue = useRef(new Animated.Value(0)).current; // Add logo spin

  useEffect(() => {
    const createSpinAnimation = (animatedValue: Animated.Value, duration: number) => {
      return Animated.loop(
        Animated.timing(animatedValue, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        })
      );
    };

    // Start all animations with different durations
    createSpinAnimation(spinValue1, 4000).start();
    createSpinAnimation(spinValue2, 2000).start();
    createSpinAnimation(spinValue3, 1000).start();
    createSpinAnimation(spinValue4, 500).start();
    createSpinAnimation(logoSpinValue, 1500).start(); // Logo spins every 1.5 seconds
  }, [spinValue1, spinValue2, spinValue3, spinValue4, logoSpinValue]);

  const createSpinInterpolation = (animatedValue: Animated.Value) => {
    return animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });
  };

  const spin1 = createSpinInterpolation(spinValue1);
  const spin2 = createSpinInterpolation(spinValue2);
  const spin3 = createSpinInterpolation(spinValue3);
  const spin4 = createSpinInterpolation(spinValue4);
  const logoSpin = createSpinInterpolation(logoSpinValue);

  return (
    <View style={styles.loaderContainer}>
      <View style={styles.loaderContainerSpinner}>
        <Animated.View
          style={[
            styles.loader,
            styles.loader1,
            { transform: [{ rotate: spin1 }] }
          ]}
        />
        <Animated.View
          style={[
            styles.loader,
            styles.loader2,
            { transform: [{ rotate: spin2 }] }
          ]}
        />
        <Animated.View
          style={[
            styles.loader,
            styles.loader3,
            { transform: [{ rotate: spin3 }] }
          ]}
        />
        <Animated.View
          style={[
            styles.loader,
            styles.loader4,
            { transform: [{ rotate: spin4 }] }
          ]}
        />
        <Animated.View style={[styles.loaderImage, { transform: [{ rotate: logoSpin }] }]}>
          <Image source={LoaderSpinner} style={styles.image} resizeMode="contain" />
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    height: screenHeight,
    width: screenWidth,
    zIndex: 999999,
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Semi-transparent background
  },
  loaderContainerSpinner: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    width: 150,
    height: 150,
  },
  loader: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 999, // Large number for perfect circle
    borderTopColor: '#1d8cbe',
  },
  loader1: {
    width: 140,
    height: 140,
  },
  loader2: {
    width: 120,
    height: 120,
  },
  loader3: {
    width: 100,
    height: 100,
  },
  loader4: {
    width: 80,
    height: 80,
  },
  loaderImage: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default LoadingIndicator;