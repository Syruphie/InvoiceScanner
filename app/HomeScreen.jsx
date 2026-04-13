import * as ImagePicker from "expo-image-picker";
import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { analyzeInvoiceFromImage, mapAzureToInvoiceData, getInvoices } from "../services/api";

export default function HomeScreen({ navigation }) {
  const [isUploading, setIsUploading] = useState(false);
  const [invoices, setInvoices] = useState([]);

  useFocusEffect(
    useCallback(() => {
      getInvoices().then(setInvoices).catch(console.error);
    }, [])
  );

  const handleUploadFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== "granted") {
      Alert.alert(
        "Gallery permission required",
        "Please allow photo access to upload invoices.",
      );
      return;
    }

    try {
      setIsUploading(true);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.8,
      });

      if (result.canceled) return;

      const imageUri = result.assets?.[0]?.uri;
      const fileName = imageUri
        ? imageUri.split("/").pop()
        : "gallery_upload.jpg";

      // 🔥 CALL AZURE HERE
      const analysisResult = await analyzeInvoiceFromImage(imageUri);

      // 🔥 transform Azure → your UI format
      const formattedData = mapAzureToInvoiceData(analysisResult);

      navigation.navigate("Results", {
        data: formattedData,
        meta: { imageUri, fileName, source: "gallery" },
      });
    } catch (err) {
      console.error(err);
      Alert.alert(
        "Upload failed",
        "Something went wrong while processing the image.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Text style={styles.heroIconText}>📄</Text>
        </View>
        <Text style={styles.heroTitle}>Invoice Scanner</Text>
        <Text style={styles.heroSub}>Scan any invoice instantly</Text>
      </View>

      <View style={styles.body}>
        <TouchableOpacity
          style={styles.scanBtn}
          onPress={() => navigation.navigate("Camera")}
        >
          <Text style={styles.scanBtnText}>📷 Scan Invoice</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.uploadBtn}
          onPress={handleUploadFromGallery}
          disabled={isUploading}
        >
          <Text style={styles.uploadBtnText}>
            {isUploading ? "Uploading..." : "⬆ Upload from Gallery"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.recentLabel}>RECENT SCANS</Text>

        {invoices.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.recentCard}
            onPress={() => navigation.navigate("ScanDetail", { invoice: item })}
          >
            <View>
              <Text style={styles.recentName}>{item.vendor}</Text>
              <Text style={styles.recentDate}>{item.date}</Text>
            </View>
            <Text style={styles.recentAmount}>{item.total}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  hero: { backgroundColor: "#0C447C", padding: 32, alignItems: "center" },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: "#378ADD",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  heroIconText: { fontSize: 26 },
  heroTitle: {
    color: "#E6F1FB",
    fontSize: 22,
    fontWeight: "500",
    marginBottom: 4,
  },
  heroSub: { color: "#85B7EB", fontSize: 13 },
  body: { padding: 16 },
  scanBtn: {
    backgroundColor: "#185FA5",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    marginTop: 4,
  },
  scanBtnText: { color: "#E6F1FB", fontSize: 15, fontWeight: "500" },
  uploadBtn: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    marginTop: 10,
    borderWidth: 0.5,
    borderColor: "#ccc",
  },
  uploadBtnText: { color: "#333", fontSize: 15, fontWeight: "500" },
  recentLabel: {
    fontSize: 11,
    color: "#888",
    marginTop: 24,
    marginBottom: 10,
    letterSpacing: 0.8,
  },
  recentCard: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  recentName: { fontSize: 14, fontWeight: "500", color: "#111" },
  recentDate: { fontSize: 12, color: "#888", marginTop: 2 },
  recentAmount: { fontSize: 14, fontWeight: "500", color: "#185FA5" },
});
