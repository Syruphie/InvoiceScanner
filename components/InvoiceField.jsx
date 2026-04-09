import { View, Text, StyleSheet } from 'react-native';

export default function InvoiceField({ label, value, isTotal }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, isTotal && styles.totalValue]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
  },
  label: { fontSize: 13, color: '#888' },
  value: { fontSize: 14, fontWeight: '500', color: '#111' },
  totalValue: { fontSize: 16, color: '#185FA5' },
});
