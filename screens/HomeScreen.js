import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Path, Svg, Text as SvgText } from 'react-native-svg';
import { useThemeColor } from '../hooks/useThemeColor';
import { fetchPollution, fetchWeather } from '../utils/api';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useCityContext } from '../context/CityContext';
import AQIInfoCard from '../components/AQIInfoCard';

const AQI_COLORS = [
  '#00E838', // Good
  '#FFFF24', // Moderate
  '#FF7200', // Unhealthy for Sensitive Groups
  '#FF0000', // Unhealthy
  '#9D3D8C', // Very Unhealthy
  '#8D0021', // Hazardous
];

function getAqiCategory(aqi) {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}

function getAqiColor(aqi) {
  if (aqi <= 50) return AQI_COLORS[0];
  if (aqi <= 100) return AQI_COLORS[1];
  if (aqi <= 150) return AQI_COLORS[2];
  if (aqi <= 200) return AQI_COLORS[3];
  if (aqi <= 300) return AQI_COLORS[4];
  return AQI_COLORS[5];
}

const MOCK_FORECAST = [
  { hour: '4 AM', aqi: 40 },
  { hour: '8 AM', aqi: 55 },
  { hour: '12 PM', aqi: 70 },
  { hour: '4 PM', aqi: 90 },
  { hour: '8 PM', aqi: 110 },
];

// Load WAQI AQI data from JSON file
const waqiData = require('../assets/india_waqi_data.json');

// Convert WAQI data to the format expected by AQIInfoCard
const MAJOR_CITIES_AQI = waqiData
  .filter(city => city.aqi && city.aqi > 0)
  .slice(0, 8) // Show top 8 cities
  .map(city => {
    const category = getAqiCategory(city.aqi);
    const color = getAqiColor(city.aqi);
    let description = '';
    
    if (city.aqi <= 50) description = 'Air quality is satisfactory.';
    else if (city.aqi <= 100) description = 'Air quality is acceptable.';
    else if (city.aqi <= 150) description = 'Sensitive groups should limit outdoor activity.';
    else if (city.aqi <= 200) description = 'Everyone should limit outdoor activity.';
    else if (city.aqi <= 300) description = 'Avoid outdoor activity.';
    else description = 'Stay indoors. Avoid all outdoor activity.';
    
    return {
      city: city.name,
      aqi: city.aqi,
      category: category,
      color: color,
      description: description
    };
  });

function AqiGauge({ aqi, size = 90, strokeWidth = 8 }) {
  // Gauge parameters
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const startAngle = 180;
  const endAngle = 0;
  const angle = (aqi / 500) * 180; // AQI max 500
  const aqiColor = getAqiColor(aqi);

  // Calculate arc path
  const polarToCartesian = (cx, cy, r, angle) => {
    const a = ((angle - 90) * Math.PI) / 180.0;
    return {
      x: cx + r * Math.cos(a),
      y: cy + r * Math.sin(a),
    };
  };
  const describeArc = (x, y, r, startAngle, endAngle) => {
    const start = polarToCartesian(x, y, r, endAngle);
    const end = polarToCartesian(x, y, r, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return [
      'M', start.x, start.y,
      'A', r, r, 0, largeArcFlag, 0, end.x, end.y,
    ].join(' ');
  };
  const arcPath = describeArc(center, center, radius, startAngle, startAngle + angle);

  return (
    <Svg width={size} height={size / 2}>
      {/* Background arc */}
      <Path
        d={describeArc(center, center, radius, startAngle, endAngle)}
        stroke="#E0E0E0"
        strokeWidth={strokeWidth}
        fill="none"
      />
      {/* AQI arc */}
      <Path
        d={arcPath}
        stroke={aqiColor}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
      />
      {/* AQI value */}
      <SvgText
        x={center}
        y={center + 8}
        fontSize="22"
        fontWeight="bold"
        fill={aqiColor}
        textAnchor="middle"
      >
        {aqi}
      </SvgText>
      {/* AQI label */}
      <SvgText
        x={center}
        y={center + 28}
        fontSize="13"
        fill="#888"
        textAnchor="middle"
      >
        AQI
      </SvgText>
    </Svg>
  );
}

export default function HomeScreen() {
  const [location, setLocation] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [aqiData, setAqiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardColor = useThemeColor({}, 'card');

  const router = useRouter();
  const { cities } = useCityContext();

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Permission to access location was denied');
          setLoading(false);
          return;
        }
        let loc = await Location.getCurrentPositionAsync({});
        setLocation(loc.coords);
        const [weather, pollution] = await Promise.all([
          fetchWeather(loc.coords.latitude, loc.coords.longitude),
          fetchPollution(loc.coords.latitude, loc.coords.longitude),
        ]);
        setWeatherData(weather);
        setAqiData(pollution);
      } catch (e) {
        setError(e.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Extract city, AQI, AQI category, temperature
  let city = '';
  let aqi = null;
  let aqiCategory = '';
  let temp = null;
  if (aqiData && aqiData.status === 'success' && aqiData.data) {
    city = aqiData.data.city;
    aqi = aqiData.data.current.pollution.aqius;
    aqiCategory = getAqiCategory(aqi);
  }
  if (weatherData && weatherData.main) {
    temp = Math.round(weatherData.main.temp);
  }

  return (
    <View style={[styles.root, { backgroundColor }]}>
      {/* Header row outside ScrollView for proper alignment */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingHorizontal: 20, marginTop: 50, marginBottom: 10 }}>
        <Text style={[styles.title, { color: '#fff' }]}>Dashboard</Text>
        <TouchableOpacity onPress={() => router.push('/search-city')}>
          <Ionicons name="add-circle-outline" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor }]}>
        {loading ? (
          <ActivityIndicator size="large" color="#00E838" style={{ marginTop: 40 }} />
        ) : error ? (
          <View style={[styles.card, { backgroundColor: cardColor }]}>
            <Text style={styles.label}>Error</Text>
            <Text style={styles.data}>{error}</Text>
          </View>
        ) : (aqi !== null && temp !== null) ? (
          <View style={[styles.cardDark, { backgroundColor: cardColor }]}>
            <Text style={styles.city}>{city}</Text>
            <Text style={styles.category}>{aqiCategory}</Text>
            <Text style={styles.time}>{new Date().toLocaleString([], { hour: '2-digit', minute: '2-digit' })}, local time</Text>
            <View style={styles.row}>
              <View style={styles.aqiRingContainer}>
                <AqiGauge aqi={aqi} />
              </View>
              <View style={styles.tempContainer}>
                <Text style={styles.temp}>{temp}°C</Text>
                <Text style={styles.tempLabel}>{weatherData.weather[0].description}</Text>
              </View>
            </View>
            <View style={styles.forecastContainer}>
              <Text style={styles.forecastLabel}>FORECAST</Text>
              <View style={styles.forecastBar}>
                <Text style={{ color: '#B0B8C1', fontSize: 14 }}>
                  AQI forecast unavailable
                </Text>
              </View>
            </View>
          </View>
        ) : null}
        {/* Major Cities AQI Section */}
        <View style={[styles.cardDark, { marginTop: 20 }]}>
          <Text style={styles.sectionTitle}>Major Cities AQI</Text>
          <Text style={styles.sectionSubtitle}>Real AQI data from IQAir API</Text>
          {MAJOR_CITIES_AQI.slice(0, 4).map((cityData, index) => (
            <AQIInfoCard
              key={cityData.city}
              data={cityData}
              onPress={() => {
                // Navigate to map with city focus
                router.push('/map');
              }}
            />
          ))}
          <TouchableOpacity 
            style={styles.viewAllButton}
            onPress={() => router.push('/map')}
          >
            <Text style={styles.viewAllText}>View All Cities on Map</Text>
            <Ionicons name="arrow-forward" size={16} color="#00E838" />
          </TouchableOpacity>
        </View>

        {/* Render AQI cards for added cities */}
        {cities.map(city => (
          <View key={city} style={[styles.cardDark, { marginTop: 20 }]}> 
            <Text style={styles.city}>{city}</Text>
            {/* You can fetch and display AQI for this city here */}
            <Text style={styles.data}>AQI forecast for {city} will appear here.</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    padding: 20,
    alignItems: 'center',
    minHeight: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  cardDark: {
    backgroundColor: '#172A4A',
    borderRadius: 20,
    padding: 24,
    width: width - 40,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  city: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  category: {
    color: '#00E838',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  time: {
    color: '#B0B8C1',
    fontSize: 13,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  aqiRingContainer: {
    marginRight: 24,
  },
  aqiRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 7,
    borderColor: '#00E838',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#172A4A',
  },
  aqiValue: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  aqiLabel: {
    color: '#B0B8C1',
    fontSize: 13,
    fontWeight: '600',
  },
  tempContainer: {
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  temp: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  tempLabel: {
    color: '#B0B8C1',
    fontSize: 15,
    fontWeight: '500',
    marginTop: 2,
    textTransform: 'capitalize',
  },
  forecastContainer: {
    marginTop: 18,
  },
  forecastLabel: {
    color: '#B0B8C1',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  forecastBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 4,
  },
  forecastItem: {
    alignItems: 'center',
    marginHorizontal: 6,
  },
  forecastDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginBottom: 2,
  },
  forecastAqi: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  forecastHours: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  forecastHour: {
    color: '#B0B8C1',
    fontSize: 12,
    width: 48,
    textAlign: 'center',
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#fff',
  },
  data: {
    fontSize: 16,
    marginBottom: 5,
    color: '#fff',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sectionSubtitle: {
    color: '#B0B8C1',
    fontSize: 14,
    marginBottom: 16,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#2A3F5F',
  },
  viewAllText: {
    color: '#00E838',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
}); 