import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Company, CompanyLink } from "./company.interface";
import { getCompanyById } from "./functions";
import { fetchCompanyLinks } from "./functions";
import BackButton from "../components/BackButton";

const CompanyProfile = () => {
  const { id } = useLocalSearchParams();
  const [company, setCompany] = useState<Company | null>(null);
  const [companyLinks, setCompanyLinks] = useState<CompanyLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCompanyData();
  }, [id]);

  const loadCompanyData = async () => {
    try {
      setLoading(true);
      if (id) {
        const companyData = await getCompanyById(Number(id));
        setCompany(companyData);

        const links = await fetchCompanyLinks(Number(id));
        setCompanyLinks(links || []);
      }
    } catch (error) {
      console.error("Error loading company data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkPress = async (url: string) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error("Error opening link:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fc5f37ff" />
      </View>
    );
  }

  if (!company) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Empresa no encontrada</Text>
        <BackButton route="/home/home" style={{ marginTop: 20 }} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton route="/home/home" style={styles.backButton} />
      </View>

      {/* Cover Image / Banner */}
      <View style={styles.coverContainer}>
        <View style={styles.coverPlaceholder}>
          <Ionicons name="business" size={60} color="#ccc" />
        </View>
      </View>

      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image source={{ uri: company.logo }} style={styles.logo} />
      </View>

      {/* Company Name */}
      <View style={styles.nameContainer}>
        <Text style={styles.companyName}>{company.name}</Text>
        {company.is_global && (
          <View style={styles.globalBadge}>
            <Ionicons name="globe" size={16} color="#fff" />
            <Text style={styles.globalText}>Global</Text>
          </View>
        )}
      </View>

      {/* Information Section */}
      {company.information && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle" size={24} color="#fc5f37ff" />
            <Text style={styles.sectionTitle}>Información</Text>
          </View>
          <Text style={styles.sectionContent}>{company.information}</Text>
        </View>
      )}

      {/* Address Section */}
      {company.address && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location" size={24} color="#fc5f37ff" />
            <Text style={styles.sectionTitle}>Dirección</Text>
          </View>
          <Text style={styles.sectionContent}>{company.address}</Text>
        </View>
      )}

      {/* Links Section */}
      {companyLinks.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="link" size={24} color="#fc5f37ff" />
            <Text style={styles.sectionTitle}>Enlaces</Text>
          </View>
          <View style={styles.linksContainer}>
            {companyLinks.map((companyLink: CompanyLink) => (
              <TouchableOpacity
                key={companyLink.id}
                style={styles.linkButton}
                onPress={() => handleLinkPress(companyLink.url || "")}
              >
                <Image
                  source={{ uri: companyLink.link?.icon }}
                  style={styles.linkIcon}
                  resizeMode="cover"
                />
                <Text style={styles.linkText}>{companyLink.link?.name}</Text>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Categories */}
      {company.categories && company.categories.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="pricetags" size={24} color="#fc5f37ff" />
            <Text style={styles.sectionTitle}>Categorías</Text>
          </View>
          <View style={styles.categoriesContainer}>
            {company.categories.map((category, index) => (
              <View key={index} style={styles.categoryTag}>
                <Text style={styles.categoryText}>{category}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  errorText: {
    fontSize: 16,
    color: "#666",
  },
  header: {
    position: "absolute",
    top: 40,
    left: 10,
    zIndex: 10,
  },
  backButton: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
  },
  coverContainer: {
    height: 200,
    backgroundColor: "#e0e0e0",
  },
  coverPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fc5f37ff",
  },
  logoContainer: {
    alignItems: "center",
    marginTop: -50,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#fff",
    backgroundColor: "#fff",
  },
  nameContainer: {
    alignItems: "center",
    marginTop: 15,
    paddingHorizontal: 20,
  },
  companyName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  globalBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fc5f37ff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginTop: 8,
  },
  globalText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 5,
  },
  section: {
    backgroundColor: "#fff",
    marginTop: 15,
    padding: 20,
    borderRadius: 10,
    marginHorizontal: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 10,
  },
  sectionContent: {
    fontSize: 15,
    color: "#666",
    lineHeight: 22,
  },
  linksContainer: {
    marginTop: 5,
  },
  linkButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  linkIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  linkText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 5,
  },
  categoryTag: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 13,
    color: "#666",
  },
});

export default CompanyProfile;
