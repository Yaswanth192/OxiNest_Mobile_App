import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function CameraTab() {
  return (
    <View style={styles.root}>
      <Text style={styles.text}>Camera feature is temporarily unavailable.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0A1833',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 16,
  },
});
