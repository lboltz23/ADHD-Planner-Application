import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';

interface ConfettiOverlayProps {
  trigger: number; // Use a counter to trigger confetti
}

export function ConfettiOverlay({ trigger }: ConfettiOverlayProps) {
  const confettiRef = useRef<any>(null);

  useEffect(() => {
    if (trigger > 0 && confettiRef.current) {
      confettiRef.current.start();
    }
  }, [trigger]);

  return (
    <View style={styles.container} pointerEvents="none">
      <ConfettiCannon
        ref={confettiRef}
        count={50}
        origin={{ x: 0.5, y: 0 }}
        fallDirection="down"
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
