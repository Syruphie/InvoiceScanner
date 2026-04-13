import { ScrollView, StyleSheet, Text, View } from "react-native";
import InvoiceField from "../components/InvoiceField";

export default function ResultsScreen({ route }) {
  const { data } = route.params;
  const meta = route.params?.meta ?? {};
  const fileName = meta.fileName || "invoice_scan.jpg";
  const scannedWhen =
    meta.source === "gallery" ? "Uploaded from gallery" : "Scanned just now";

  const fields = [
    { label: "Vendor", value: data.vendor },
    { label: "Invoice no.", value: data.invoiceNo },
    { label: "Date", value: data.date },
    { label: "Due date", value: data.dueDate },
    { label: "Subtotal", value: data.subtotal },
    { label: "Tax (GST)", value: data.tax },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.previewCard}>
        <View style={styles.thumb}>
          <Text style={styles.thumbIcon}>📄</Text>
        </View>
        <View>
          <Text style={styles.fileName}>{fileName}</Text>
          <Text style={styles.fileMeta}>{scannedWhen}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{data.confidence}% accuracy</Text>
          </View>
        </View>
      </View>

      <View style={styles.fieldGroup}>
        {fields.map((f) => (
          <InvoiceField key={f.label} label={f.label} value={f.value} />
        ))}
        <InvoiceField label="Total" value={data.total} isTotal />
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  previewCard: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  thumb: {
    width: 40,
    height: 48,
    backgroundColor: "#B5D4F4",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  thumbIcon: { fontSize: 20 },
  fileName: { fontSize: 13, fontWeight: "500", color: "#111" },
  fileMeta: { fontSize: 11, color: "#888", marginTop: 2 },
  badge: {
    backgroundColor: "#EAF3DE",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  badgeText: { fontSize: 10, color: "#3B6D11" },
  fieldGroup: {
    borderWidth: 0.5,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 4,
  },
  helperText: {
    color: "#6a6a6a",
    fontSize: 12,
    marginTop: 14,
    marginBottom: 32,
  },
});
