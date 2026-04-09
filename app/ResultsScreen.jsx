import { ScrollView, StyleSheet } from 'react-native';
import InvoiceField from '../components/InvoiceField';

export default function ResultsScreen({ route }) {
  const { data } = route.params;

  return (
    <ScrollView style={styles.container}>
      <InvoiceField label="Vendor" value={data.vendor} />
      <InvoiceField label="Total" value={data.total} />
      <InvoiceField label="Date" value={data.date} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
});
