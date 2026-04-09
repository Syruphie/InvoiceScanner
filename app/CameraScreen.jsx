import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { buildMockInvoiceData } from '../services/mockInvoice';

export default function CameraScreen({ navigation }) {
  const handleScan = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (permission.status !== 'granted') {
      Alert.alert('Camera permission required', 'Please allow camera access to scan invoices.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled) {
      const imageUri = result.assets?.[0]?.uri;
      const fileName = imageUri ? imageUri.split('/').pop() : 'camera_scan.jpg';

      navigation.navigate('Results', {
        data: buildMockInvoiceData('camera'),
        meta: { imageUri, fileName, source: 'camera' },
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.viewfinder}>
        <View style={styles.frame}>
          <View style={[styles.corner, styles.tl]} />
          <View style={[styles.corner, styles.tr]} />
          <View style={[styles.corner, styles.bl]} />
          <View style={[styles.corner, styles.br]} />
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.hint}>Align invoice within frame</Text>
        <View style={styles.tip}>
          <Text style={styles.tipText}>
            Make sure the invoice is flat, well-lit, and all four corners are visible for best
            results.
          </Text>
        </View>

        <TouchableOpacity style={styles.shutter} onPress={handleScan}>
          <View style={styles.shutterInner} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  viewfinder: {
    flex: 0.72,
    minHeight: 320,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  frame: { width: 280, height: 180, position: 'relative' },
  corner: { position: 'absolute', width: 18, height: 18, borderColor: '#378ADD', borderStyle: 'solid' },
  tl: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 4 },
  tr: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 4 },
  bl: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 4 },
  br: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 4 },
  body: {
    flex: 0.28,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    justifyContent: 'flex-end',
  },
  hint: { color: '#5A7EA5', fontSize: 12, marginBottom: 10, textAlign: 'center' },
  tip: { backgroundColor: '#E6F1FB', borderRadius: 10, padding: 12 },
  tipText: { color: '#0C447C', fontSize: 12, lineHeight: 18 },
  shutter: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#185FA5',
    borderWidth: 3,
    borderColor: '#85B7EB',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 24,
  },
  shutterInner: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#378ADD' },
});
