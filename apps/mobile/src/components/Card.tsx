import { View, StyleSheet, ViewStyle } from 'react-native';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
}

export default function Card({ children, style }: CardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
});
