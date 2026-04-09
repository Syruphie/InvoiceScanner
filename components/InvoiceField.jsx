import { View, Text, StyleSheet } from 'react-native';

export default function InvoiceField({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { marginBottom: 16 },
  label: { fontWeight: 'bold', fontSize: 14, color: '#555' },
  value: { fontSize: 16, marginTop: 4 },
});
