const axios = require('axios');
const fs = require('fs');
const path = require('path');

const WAQI_API_KEY = '92e34881f8b126f6533a33af5d332eab2d2eac6c';

// Function to get all stations in India
async function getIndiaStations() {
  try {
    console.log('Fetching India station list...');
    const response = await axios.get(`https://api.waqi.info/map/bounds/?latlng=6,68,37,97&token=${WAQI_API_KEY}`);
    
    if (response.data && response.data.data) {
      const stations = response.data.data.filter(station => 
        station.station && station.station.name && 
        station.aqi && station.aqi !== '-'
      );
      
      console.log(`Found ${stations.length} stations in India`);
      return stations;
    }
    return [];
  } catch (error) {
    console.error('Error fetching station list:', error.message);
    return [];
  }
}

// Function to get detailed AQI data for a station
async function getStationAQI(station) {
  try {
    const response = await axios.get(`https://api.waqi.info/feed/@${station.uid}/?token=${WAQI_API_KEY}`);
    
    if (response.data && response.data.data) {
      const data = response.data.data;
      return {
        name: data.city?.name || station.station?.name || 'Unknown',
        lat: data.city?.geo?.[0] || station.lat,
        lon: data.city?.geo?.[1] || station.lon,
        aqi: data.aqi,
        intensity: Math.min(data.aqi / 500, 1.0),
        timestamp: data.time?.iso || new Date().toISOString(),
        pollutants: {
          pm25: data.iaqi?.pm25?.v,
          pm10: data.iaqi?.pm10?.v,
          o3: data.iaqi?.o3?.v,
          no2: data.iaqi?.no2?.v,
          so2: data.iaqi?.so2?.v,
          co: data.iaqi?.co?.v
        }
      };
    }
    return null;
  } catch (error) {
    console.error(`Error fetching AQI for ${station.station?.name}:`, error.message);
    return null;
  }
}

// Main function to fetch all India AQI data
async function fetchIndiaAQI() {
  try {
    console.log('Starting scheduled India AQI data fetch...');
    console.log('Timestamp:', new Date().toISOString());
    
    // Get all stations in India
    const stations = await getIndiaStations();
    
    if (stations.length === 0) {
      console.log('No stations found. Using major Indian cities...');
      // Use major Indian cities as fallback
      const majorCities = [
        { name: 'Delhi', lat: 28.6139, lon: 77.2090 },
        { name: 'Mumbai', lat: 19.0760, lon: 72.8777 },
        { name: 'Bangalore', lat: 12.9716, lon: 77.5946 },
        { name: 'Chennai', lat: 13.0827, lon: 80.2707 },
        { name: 'Kolkata', lat: 22.5726, lon: 88.3639 },
        { name: 'Hyderabad', lat: 17.3850, lon: 78.4867 },
        { name: 'Pune', lat: 18.5204, lon: 73.8567 },
        { name: 'Ahmedabad', lat: 23.0225, lon: 72.5714 },
        { name: 'Jaipur', lat: 26.9124, lon: 75.7873 },
        { name: 'Surat', lat: 21.1702, lon: 72.8311 },
        { name: 'Lucknow', lat: 26.8467, lon: 80.9462 },
        { name: 'Kanpur', lat: 26.4499, lon: 80.3319 },
        { name: 'Nagpur', lat: 21.1458, lon: 79.0882 },
        { name: 'Indore', lat: 22.7196, lon: 75.8577 },
        { name: 'Thane', lat: 19.2183, lon: 72.9781 },
        { name: 'Bhopal', lat: 23.2599, lon: 77.4126 },
        { name: 'Visakhapatnam', lat: 17.6868, lon: 83.2185 },
        { name: 'Patna', lat: 25.5941, lon: 85.1376 },
        { name: 'Vadodara', lat: 22.3072, lon: 73.1812 },
        { name: 'Ghaziabad', lat: 28.6692, lon: 77.4538 }
      ];
      
      const results = [];
      for (const city of majorCities) {
        try {
          const response = await axios.get(`https://api.waqi.info/feed/geo:${city.lat};${city.lon}/?token=${WAQI_API_KEY}`);
          if (response.data && response.data.data && response.data.data.aqi) {
            const data = response.data.data;
            results.push({
              name: city.name,
              lat: city.lat,
              lon: city.lon,
              aqi: data.aqi,
              intensity: Math.min(data.aqi / 500, 1.0),
              timestamp: data.time?.iso || new Date().toISOString(),
              pollutants: {
                pm25: data.iaqi?.pm25?.v,
                pm10: data.iaqi?.pm10?.v,
                o3: data.iaqi?.o3?.v,
                no2: data.iaqi?.no2?.v,
                so2: data.iaqi?.so2?.v,
                co: data.iaqi?.co?.v
              }
            });
          }
          // Wait between requests to avoid rate limits
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`Error fetching data for ${city.name}:`, error.message);
        }
      }
      
      // Save results
      fs.writeFileSync('assets/india_waqi_data.json', JSON.stringify(results, null, 2));
      console.log(`✅ Saved ${results.length} cities to assets/india_waqi_data.json`);
      return;
    }
    
    // Process stations
    console.log(`Processing ${stations.length} stations...`);
    const results = [];
    
    for (let i = 0; i < stations.length; i++) {
      const station = stations[i];
      console.log(`Processing ${i + 1}/${stations.length}: ${station.station?.name}`);
      
      const aqiData = await getStationAQI(station);
      if (aqiData) {
        results.push(aqiData);
      }
      
      // Wait between requests to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Save results
    fs.writeFileSync('assets/india_waqi_data.json', JSON.stringify(results, null, 2));
    console.log(`✅ Successfully saved ${results.length} stations to assets/india_waqi_data.json`);
    
    // Also create a heatmap version
    const heatmapData = results.map(city => [city.lat, city.lon, city.intensity]);
    fs.writeFileSync('assets/india_waqi_heatmap.json', JSON.stringify(heatmapData, null, 2));
    console.log(`✅ Heatmap data saved to assets/india_waqi_heatmap.json`);
    
    // Create a backup with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    fs.writeFileSync(`assets/backup/india_waqi_data_${timestamp}.json`, JSON.stringify(results, null, 2));
    console.log(`✅ Backup saved to assets/backup/india_waqi_data_${timestamp}.json`);
    
  } catch (error) {
    console.error('Error in fetchIndiaAQI:', error.message);
  }
}

// Run the script
fetchIndiaAQI(); 