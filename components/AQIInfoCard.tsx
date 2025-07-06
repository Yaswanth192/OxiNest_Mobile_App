import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useThemeColor } from '../hooks/useThemeColor';

interface AQIData {
  city: string;
  aqi: number;
  category: string;
  color: string;
  description: string;
}

interface AQIInfoCardProps {
  data: AQIData;
  onPress?: () => void;
}

export default function AQIInfoCard({ data, onPress }: AQIInfoCardProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  const getAQILevel = (aqi: number) => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  };

  const getHealthAdvice = (aqi: number) => {
    if (aqi <= 50) return 'Air quality is satisfactory.';
    if (aqi <= 100) return 'Air quality is acceptable.';
    if (aqi <= 150) return 'Sensitive groups should limit outdoor activity.';
    if (aqi <= 200) return 'Everyone should limit outdoor activity.';
    if (aqi <= 300) return 'Avoid outdoor activity.';
    return 'Stay indoors. Avoid all outdoor activity.';
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <Text style={[styles.cityName, { color: textColor }]}>{data.city}</Text>
        <View style={[styles.aqiBadge, { backgroundColor: data.color }]}>
          <Text style={styles.aqiValue}>{data.aqi}</Text>
        </View>
      </View>
      
      <View style={styles.content}>
        <Text style={[styles.category, { color: data.color }]}>
          {getAQILevel(data.aqi)}
        </Text>
        <Text style={[styles.description, { color: textColor }]}>
          {getHealthAdvice(data.aqi)}
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.timestamp, { color: textColor }]}>
          Last updated: {new Date().toLocaleTimeString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cityName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  aqiBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 50,
    alignItems: 'center',
  },
  aqiValue: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    marginBottom: 12,
  },
  category: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 8,
  },
  timestamp: {
    fontSize: 12,
    opacity: 0.7,
  },
}); 