import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useCityContext } from '../../context/CityContext';
import { fetchCitySuggestions } from '../../utils/api';

const FREQUENT_CITIES = [
  'Paris, France',
  'City of Westminster, United Kingdom',
  'New Delhi, India',
  'Beijing, China',
  'Lyon, France',
  'Beijing, China',
  'Ciudad de México, Mexico',
  'Shanghai, China',
  'Warszawa, Poland',
  'New York, United States',
  'Mumbai, India',
];

export default function SearchCityScreen() {
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { addCity } = useCityContext();

  async function handleFetchSuggestions(query: string) {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      // For demo, use California, USA. In a real app, you'd want to search for state/country too.
      const cities = await fetchCitySuggestions('California', 'USA');
      // Filter by query
      setSuggestions(cities.filter((c: string) => c.toLowerCase().includes(query.toLowerCase())));
    } catch (e) {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }

  const filtered = search.length < 2 && suggestions.length === 0
    ? FREQUENT_CITIES
    : suggestions.length > 0
      ? suggestions
      : [];

  return (
    <View style={styles.root}>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          placeholderTextColor="#B0B8C1"
          value={search}
          onChangeText={text => {
            setSearch(text);
            handleFetchSuggestions(text);
          }}
        />
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancel}>CANCEL</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.divider} />
      <Text style={styles.sectionTitle}>{search.length < 2 ? 'FREQUENT SEARCHES' : 'SUGGESTIONS'}</Text>
      {loading && <ActivityIndicator color="#3D7CFF" style={{ marginVertical: 10 }} />}
      <FlatList
        data={filtered}
        keyExtractor={(item, index) => item + index}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.cityItem} onPress={() => { addCity(item); router.back(); }}>
            <Text style={styles.cityText}>{item}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0A1833',
    paddingTop: 40,
    paddingHorizontal: 18,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    height: 38,
    borderBottomWidth: 1.5,
    borderBottomColor: '#3D7CFF',
    color: '#fff',
    fontSize: 16,
    marginRight: 12,
  },
  cancel: {
    color: '#3D7CFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  divider: {
    height: 2,
    backgroundColor: '#3D7CFF',
    marginVertical: 12,
  },
  sectionTitle: {
    color: '#B0B8C1',
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 10,
    letterSpacing: 1.2,
  },
  cityItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A2340',
  },
  cityText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
}); 