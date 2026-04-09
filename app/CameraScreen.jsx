import { View, Button, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function CameraScreen({ navigation }) {
  const handleScan = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (permission.status !== 'granted') {
      Alert.alert('Camera permission required', 'Please allow camera access to scan invoices.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync();
    if (!result.canceled) {
      navigation.navigate('Results', {
        data: { vendor: 'Test Co', total: '$100', date: '2026-04-09' },
      });
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Take Photo" onPress={handleScan} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
