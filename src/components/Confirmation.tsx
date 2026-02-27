import React from 'react';
import { Alert } from 'react-native';

export const confirm = (message: string) => {
  return new Promise((resolve) => {
    Alert.alert(
      'Confirmation',
      message,
      [
        { text: 'No', onPress: () => resolve(false) },
        { text: 'Yes', onPress: () => resolve(true), isPreferred: true },
      ],
      { cancelable: false }
    );
  });
};

