import { ThemeContext, ThemeType } from '@/theme/ThemeContext';
import React, { useContext, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useThemeColor } from '../../hooks/useThemeColor';

export default function SettingsTab() {
  const [smartNotifications, setSmartNotifications] = useState(true);
  const [morningReport, setMorningReport] = useState(true);
  const [eveningReport, setEveningReport] = useState(false);
  const [themeModalVisible, setThemeModalVisible] = useState(false);
  const { theme, setTheme } = useContext(ThemeContext);

  const themeLabel = theme === 'auto' ? 'Auto' : theme.charAt(0).toUpperCase() + theme.slice(1);
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const sectionColor = '#B0B8C1';
  const arrowColor = '#3D7CFF';

  return (
    <ScrollView style={[styles.root, { backgroundColor }]} contentContainerStyle={styles.container}>
      <Text style={[styles.header, { color: textColor }]}>Settings</Text>

      <Text style={[styles.section, { color: sectionColor }]}>PREFERENCES</Text>
      <TouchableOpacity style={styles.item}>
        <View>
          <Text style={[styles.title, { color: textColor }]}>Recommendations</Text>
          <Text style={[styles.subtitle, { color: textColor }]}>Choose the one that matters most</Text>
        </View>
        <Text style={[styles.arrow, { color: arrowColor }]}>{'>'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.item}>
        <Text style={[styles.title, { color: textColor }]}>Units</Text>
        <Text style={[styles.arrow, { color: arrowColor }]}>{'>'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.item}>
        <Text style={[styles.title, { color: textColor }]}>Sensitivity</Text>
        <Text style={[styles.arrow, { color: arrowColor }]}>{'>'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.item} onPress={() => setThemeModalVisible(true)}>
        <View>
          <Text style={[styles.title, { color: textColor }]}>Theme</Text>
          <Text style={[styles.subtitle, { color: textColor }]}>{themeLabel}</Text>
        </View>
        <Text style={[styles.arrow, { color: arrowColor }]}>{'>'}</Text>
      </TouchableOpacity>

      <Text style={[styles.section, { color: sectionColor }]}>NOTIFICATIONS</Text>
      <TouchableOpacity style={styles.item}>
        <View>
          <Text style={[styles.title, { color: textColor }]}>Favorite City</Text>
          <Text style={[styles.subtitle, { color: textColor }]}>New Delhi</Text>
        </View>
        <Text style={[styles.arrow, { color: arrowColor }]}>{'>'}</Text>
      </TouchableOpacity>
      <View style={styles.item}>
        <View>
          <Text style={[styles.title, { color: textColor }]}>Smart notifications</Text>
          <Text style={[styles.subtitle, { color: textColor }]}>Tips and alerts when it matters</Text>
        </View>
        <Switch
          value={smartNotifications}
          onValueChange={setSmartNotifications}
          trackColor={{ false: '#444', true: '#3D7CFF' }}
          thumbColor={smartNotifications ? '#3D7CFF' : '#ccc'}
        />
      </View>
      <View style={styles.item}>
        <View>
          <Text style={[styles.title, { color: textColor }]}>Morning report</Text>
          <Text style={[styles.subtitle, { color: textColor }]}>The day's forecast received at 7AM</Text>
        </View>
        <Switch
          value={morningReport}
          onValueChange={setMorningReport}
          trackColor={{ false: '#444', true: '#3D7CFF' }}
          thumbColor={morningReport ? '#3D7CFF' : '#ccc'}
        />
      </View>
      <View style={styles.item}>
        <View>
          <Text style={[styles.title, { color: textColor }]}>Evening report</Text>
          <Text style={[styles.subtitle, { color: textColor }]}>Tomorrow's forecast received at 7PM</Text>
        </View>
        <Switch
          value={eveningReport}
          onValueChange={setEveningReport}
          trackColor={{ false: '#444', true: '#3D7CFF' }}
          thumbColor={eveningReport ? '#3D7CFF' : '#ccc'}
        />
      </View>

      {/* Theme selection modal */}
      <Modal
        visible={themeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setThemeModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setThemeModalVisible(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Theme</Text>
            {['auto', 'light', 'dark'].map((option) => (
              <Pressable
                key={option}
                style={styles.modalOption}
                onPress={() => {
                  setTheme(option as ThemeType);
                  setThemeModalVisible(false);
                }}
              >
                <Text style={[styles.modalOptionText, theme === option && styles.modalOptionSelected]}>
                  {option === 'auto' ? 'Auto (System)' : option.charAt(0).toUpperCase() + option.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0A1833',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  section: {
    color: '#B0B8C1',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 18,
    marginBottom: 8,
    letterSpacing: 1.2,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#172A4A',
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  subtitle: {
    color: '#B0B8C1',
    fontSize: 13,
    marginTop: 2,
  },
  arrow: {
    color: '#3D7CFF',
    fontSize: 22,
    marginLeft: 10,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#172A4A',
    borderRadius: 16,
    padding: 24,
    width: 280,
    alignItems: 'center',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 18,
  },
  modalOption: {
    paddingVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  modalOptionText: {
    color: '#B0B8C1',
    fontSize: 16,
  },
  modalOptionSelected: {
    color: '#3D7CFF',
    fontWeight: 'bold',
  },
}); 