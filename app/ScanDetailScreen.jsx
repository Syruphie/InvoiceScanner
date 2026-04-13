import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useState } from "react";
import { Stack } from "expo-router";
import InvoiceField from "../components/InvoiceField";
import { API_URL } from "../services/api";

export default function ScanDetailScreen({ route, navigation }) {
  const { invoice } = route.params;
  const [imageLoading, setImageLoading] = useState(true);

  const fields = [
    { label: "Vendor", value: invoice.vendor },
    { label: "Invoice no.", value: invoice.invoice_no },
    { label: "Date", value: invoice.date },
    { label: "Due date", value: invoice.due_date },
    { label: "Subtotal", value: invoice.subtotal },
    { label: "Tax (GST)", value: invoice.tax },
  ];

  const scannedAt = invoice.scanned_at
    ? new Date(invoice.scanned_at).toLocaleString()
    : null;

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ headerBackVisible: false, title: "Scan Detail" }} />

      {invoice.blob_url ? (
        <View style={styles.imageWrapper}>
          {imageLoading && (
            <ActivityIndicator style={styles.imageSpinner} size="large" color="#185FA5" />
          )}
          <Image
            source={{ uri: `${API_URL}/invoices/${invoice.id}/image` }}
            style={styles.image}
            resizeMode="contain"
            onLoadEnd={() => setImageLoading(false)}
          />
        </View>
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imagePlaceholderText}>📄 No image available</Text>
        </View>
      )}

      <View style={styles.metaRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{invoice.confidence}% accuracy</Text>
        </View>
        {scannedAt && <Text style={styles.scannedAt}>Scanned {scannedAt}</Text>}
      </View>

      <View style={styles.fieldGroup}>
        {fields.map((f) => (
          <InvoiceField key={f.label} label={f.label} value={f.value} />
        ))}
        <InvoiceField label="Total" value={invoice.total} isTotal />
      </View>

      <TouchableOpacity style={styles.homeBtn} onPress={() => navigation.popToTop()}>
        <Text style={styles.homeBtnText}>Return to Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  imageWrapper: {
    width: "100%",
    height: 260,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
    marginBottom: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  imageSpinner: {
    position: "absolute",
  },
  image: {
    width: "100%",
    height: 260,
    borderRadius: 10,
  },
  imagePlaceholder: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  imagePlaceholderText: { color: "#888", fontSize: 14 },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  badge: {
    backgroundColor: "#EAF3DE",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: { fontSize: 10, color: "#3B6D11" },
  scannedAt: { fontSize: 11, color: "#888" },
  fieldGroup: {
    borderWidth: 0.5,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 4,
  },
  homeBtn: {
    backgroundColor: "#185FA5",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 32,
  },
  homeBtnText: { color: "#fff", fontSize: 15, fontWeight: "600" },
});
