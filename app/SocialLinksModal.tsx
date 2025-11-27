import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import RNModal from "react-native-modal";
import { CompanyLink } from "./company/company.interface";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

interface SocialLinksModalProps {
  visible: boolean;
  companyLinks: any;
  company: any;
  handleLinkPress: (link: string, onClose: () => void) => void;
  onClose: () => void;
}

const SocialLinksModal: React.FC<SocialLinksModalProps> = ({
  visible,
  companyLinks,
  company,
  handleLinkPress,
  onClose,
}) => {
  const renderIcon = (key: string) => {
    return <Image source={{ uri: key }} style={styles.icon} resizeMode="cover" />;
  };
  return (
    <RNModal isVisible={visible} onBackdropPress={onClose}>
      <View style={styles.modalContent}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.titleContainer}
          onPress={() => {
            onClose();
            router.push(`/company/company-profile?id=${company?.id}`);
          }}
        >
          <Text style={styles.title}>{company?.name || ""}</Text>
          <Ionicons name="open-outline" size={20} color="#fc5f37ff" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
        <View style={styles.linksContainer}>
          {companyLinks.map((companyLink: CompanyLink) => (
            <TouchableOpacity
              key={companyLink.id}
              style={styles.linkButton}
              onPress={() => handleLinkPress(companyLink.url || "", onClose)}
            >
              {renderIcon(companyLink.link?.icon || "")}
              <Text style={styles.linkText}>{companyLink.link?.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </RNModal>
  );
};

export default SocialLinksModal;

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1,
    padding: 5,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  linksContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
  },
  linkButton: {
    width: "30%", // 4 columnas
    padding: 10,
    marginVertical: 5,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    alignItems: "center",
  },
  icon: {
    width: 50,
    height: 50,
    borderRadius: 25, // Hace los iconos redondos
    marginBottom: 5,
  },
  linkText: {
    fontSize: 12,
    textAlign: "center",
  },
});
