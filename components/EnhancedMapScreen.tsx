import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import MapView, { Heatmap, Marker } from 'react-native-maps';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { useThemeColor } from '../hooks/useThemeColor';

// Load WAQI AQI data for India
const waqiData = require('../assets/india_waqi_data.json');

// Convert WAQI data to heatmap format
const aqiData = waqiData
  .filter((city: any) => city.aqi && city.aqi > 0)
  .map((city: any) => [city.lat, city.lon, city.intensity]);

// Convert AQI data to heatmap points format
const heatmapPoints = aqiData.map(([lat, lon, intensity]: [number, number, number]) => ({
  latitude: lat,
  longitude: lon,
  weight: intensity,
}));

// Get all cities data
const allCitiesData = waqiData
  .filter((city: any) => city.aqi && city.aqi > 0)
  .map((city: any) => ({
    name: city.name,
    latitude: city.lat,
    longitude: city.lon,
    aqi: city.aqi,
    pollutants: city.pollutants
  }));

// Filter cities based on showAllCities state
const getFilteredCities = (showAll: boolean) => {
  if (showAll) return allCitiesData;
  
  return allCitiesData.filter((city: any) => {
    // Show major cities (top 20 by population/importance)
    const majorCities = [
      'Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 
      'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat',
      'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane',
      'Bhopal', 'Visakhapatnam', 'Patna', 'Vadodara', 'Ghaziabad'
    ];
    
    // Show if it's a major city OR if AQI is high (unhealthy or worse)
    return majorCities.includes(city.name) || city.aqi > 100;
  });
};

export default function EnhancedMapScreen() {
  const [mapType, setMapType] = useState<'webview' | 'native'>('webview');
  const [currentLocation, setCurrentLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const webviewRef = useRef<WebView>(null);
  const mapRef = useRef<MapView>(null);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  // Get current location
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          setCurrentLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      } catch (error) {
        console.log('Error getting location:', error);
      }
    })();
  }, []);

  // WebView heatmap HTML (same as your existing component)
  const heatmapHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset='utf-8' />
  <title>India City AQI Heatmap</title>
  <meta name='viewport' content='width=device-width, initial-scale=1.0'>
  <link rel='stylesheet' href='https://unpkg.com/leaflet/dist/leaflet.css' />
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; }
  </style>
</head>
<body>
  <div id='map'></div>
  <script src='https://unpkg.com/leaflet/dist/leaflet.js'></script>
  <script src='https://unpkg.com/leaflet.heat/dist/leaflet-heat.js'></script>
  <script>
    var map = L.map('map').setView([22.9734, 78.6569], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    function renderHeatmap(data) {
      if (window.heatLayer) map.removeLayer(window.heatLayer);
      window.heatLayer = L.heatLayer(data, {
        radius: 80,
        blur: 40,
        maxZoom: 10,
        gradient: {
          0.0: 'rgba(0,0,255,1)',     // Blue - Good
          0.2: 'rgba(0,255,255,1)',   // Cyan - Moderate
          0.4: 'rgba(0,255,0,1)',     // Green - Unhealthy for Sensitive
          0.6: 'rgba(255,255,0,1)',   // Yellow - Unhealthy
          0.8: 'rgba(255,128,0,1)',   // Orange - Very Unhealthy
          1.0: 'rgba(255,0,0,1)'      // Red - Hazardous
        }
      }).addTo(map);
    }
    function handleData(event) {
      try {
        var data = JSON.parse(event.data);
        console.log('Received city AQI data:', data.length, 'cities');
        document.body.insertAdjacentHTML('beforeend', '<div style="position:fixed;top:0;left:0;background:#fff;z-index:9999;font-size:12px;padding:5px;">Cities: '+data.length+' | AQI Heatmap</div>');
        renderHeatmap(data);
      } catch (e) { console.log('Error parsing city AQI data', e); }
    }
    if (window.ReactNativeWebView) {
      document.addEventListener('message', handleData);
      window.addEventListener('message', handleData);
      window.ReactNativeWebView.onMessage = handleData;
    } else {
      document.addEventListener('message', handleData);
      window.addEventListener('message', handleData);
    }
  </script>
</body>
</html>`;

  const sendDataToWebView = () => {
    if (webviewRef.current) {
      const dataStr = JSON.stringify(aqiData);
      webviewRef.current.postMessage(dataStr);
      setTimeout(() => {
        if (webviewRef.current) {
          webviewRef.current.postMessage(dataStr);
        }
      }, 500);
    }
  };

  useEffect(() => {
    if (mapType === 'webview') {
      sendDataToWebView();
    }
  }, [mapType]);

  const getAQICategory = (aqi: number) => {
    if (aqi <= 50) return { category: 'Good', color: '#00E400' };
    if (aqi <= 100) return { category: 'Moderate', color: '#FFFF00' };
    if (aqi <= 150) return { category: 'Unhealthy for Sensitive', color: '#FF7E00' };
    if (aqi <= 200) return { category: 'Unhealthy', color: '#FF0000' };
    if (aqi <= 300) return { category: 'Very Unhealthy', color: '#8F3F97' };
    return { category: 'Hazardous', color: '#7E0023' };
  };

  const handleCityPress = (city: any) => {
    setSelectedCity(city.name);
    
    let details = `Air Quality Index: ${city.aqi}\nCategory: ${getAQICategory(city.aqi).category}`;
    
    if (city.pollutants) {
      details += '\n\nPollutants:';
      if (city.pollutants.pm25) details += `\nPM2.5: ${city.pollutants.pm25}`;
      if (city.pollutants.pm10) details += `\nPM10: ${city.pollutants.pm10}`;
      if (city.pollutants.o3) details += `\nO₃: ${city.pollutants.o3}`;
      if (city.pollutants.no2) details += `\nNO₂: ${city.pollutants.no2}`;
      if (city.pollutants.so2) details += `\nSO₂: ${city.pollutants.so2}`;
      if (city.pollutants.co) details += `\nCO: ${city.pollutants.co}`;
    }
    
    Alert.alert(
      `${city.name} AQI`,
      details,
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Map Type Toggle */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            mapType === 'webview' && styles.activeToggle,
            { borderColor: textColor }
          ]}
          onPress={() => setMapType('webview')}
        >
          <Text style={[styles.toggleText, { color: mapType === 'webview' ? backgroundColor : textColor }]}>
            Web Heatmap
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            mapType === 'native' && styles.activeToggle,
            { borderColor: textColor }
          ]}
          onPress={() => setMapType('native')}
        >
          <Text style={[styles.toggleText, { color: mapType === 'native' ? backgroundColor : textColor }]}>
            Native Map
          </Text>
        </TouchableOpacity>
      </View>

      {/* Map Content */}
      {mapType === 'webview' ? (
        <WebView
          ref={webviewRef}
          originWhitelist={['*']}
          source={{ html: heatmapHtml }}
          style={styles.map}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          onLoadEnd={sendDataToWebView}
          onMessage={() => {}}
          allowFileAccess={true}
          allowUniversalAccessFromFileURLs={true}
          mixedContentMode="always"
        />
      ) : (
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={currentLocation ? {
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          } : {
            latitude: 22.9734,
            longitude: 78.6569,
            latitudeDelta: 40,
            longitudeDelta: 40,
          }}
        >
          <Heatmap
            points={heatmapPoints}
            radius={30}
            opacity={0.7}
            gradient={{
              colors: ['blue', 'cyan', 'lime', 'yellow', 'red'],
              startPoints: [0.01, 0.25, 0.5, 0.75, 1],
              colorMapSize: 256,
            }}
          />
          {currentLocation && (
            <Marker
              coordinate={currentLocation}
              pinColor="blue"
              title="Your Location"
              description="Current location"
            />
          )}
        </MapView>
      )}

      {/* Info Panel */}
      <View style={[styles.infoPanel, { backgroundColor }]}>
        <Text style={[styles.infoTitle, { color: textColor }]}>India AQI Monitor</Text>
        <Text style={[styles.infoText, { color: textColor }]}>
          {mapType === 'webview' 
            ? `Web-based heatmap with AQI data`
            : `Native map with your location`
          }
        </Text>
        <Text style={[styles.infoText, { color: textColor }]}>
          {mapType === 'webview' ? 'View air quality heatmap' : 'Blue marker shows your location'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toggleContainer: {
    flexDirection: 'row',
    padding: 10,
    gap: 10,
    zIndex: 1,
  },
  toggleButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  activeToggle: {
    backgroundColor: '#007AFF',
  },
  toggleText: {
    fontWeight: '600',
  },
  map: {
    flex: 1,
  },
  infoPanel: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 2,
  },
}); 