import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Modal, Dimensions } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';


const { width, height } = Dimensions.get('window');

interface ConfettiOverlayProps {
  trigger: number; // Use a counter to trigger confetti
}

export function ConfettiOverlay({ trigger }: ConfettiOverlayProps) {
  const confettiRef = useRef<any>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (trigger > 0) {
      setIsActive(true);

      // Start after modal mount
       requestAnimationFrame(() => {
        confettiRef.current?.start();
      });

      // Hide confetti after animation completes
      setTimeout(() => {
        setIsActive(false);
      }, 3000);
    }
  }, [trigger]);

  if (!isActive) return null;

  return (
    <View style={[styles.container, { opacity: isActive ? 1 : 0 }]} pointerEvents="none">
      <ConfettiCannon
        ref={confettiRef}
        count={100}
        origin={{ x: 0, y: 0.5 }}
        explosionSpeed={350}
        fallSpeed={2000}
        fadeOut={true}
        autoStart={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
});