import {StyleSheet} from "react-native";
export const globalStyles = StyleSheet.create({
  pageTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#fb8436",
  },
  globalButton: {
    backgroundColor: "#ff9f61",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 20,
  },
  globalButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  globalButtonIcon: {
    position: "absolute",
    right: 10,
    top: 10,
  },
  container: {
    flex: 1,
    backgroundColor: "#ea822c",
    paddingTop: 50,
  },
  whiteContainer: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 35,
    paddingHorizontal: 20,
  },
  logoContainer: {
    width: 80, // Ancho fijo para mantener consistencia
    //height: 130, // Altura total del contenedor
    alignItems: "center",
    justifyContent: "flex-start", // Alinea el contenido en la parte superior
    marginBottom: 15, // Aumentamos el espacio entre filas
  },
  logoWrapper: {
    marginTop: 20,
    width: 60,
    height: 60,
    //backgroundColor: "#fff",
    ///borderRadius: 25,
    marginBottom: 5, // Separación uniforme con el texto
  },
  logo: {
    width: "100%",
    height: "100%",
    borderRadius: 15,
  },
  logoLabel: {
    fontSize: 11,
    textAlign: "center",
    width: "100%",
    minHeight: 32, // Espacio para exactamente 2 líneas
    lineHeight: 14, // Ajuste para mejorar la legibilidad
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#faf7f7",
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchBar: {
    flex: 1,
    height: 50,
    color: "#000",
    fontSize: 16,
  },

  categoryButton: {
    marginLeft: 10,
    padding: 10,
    backgroundColor: "#ff5a5f",
    borderRadius: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: "#ff5a5f",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  checkboxContainer: {
    marginVertical: 10, // Espacio vertical entre checkboxes
    paddingVertical: 5, // Más espacio para mejorar la interacción
  },
  checkboxText: {
    fontSize: 16,
    textDecorationLine: "none",
    color: "#333",
    fontWeight: "bold",
  },
  checkboxIcon: {
    borderRadius: 5, // Bordes más suaves
  },
  floatingWhatsAppButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#25D366",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 5,
  },
  socialModaltitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  socialModallinksContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
  },
  socialModallinkButton: {
    flexBasis: "48%", // Dos columnas
    padding: 10,
    marginVertical: 5,
    backgroundColor: "#eee",
    borderRadius: 5,
    alignItems: "center",
  },
  socialModallinkText: {
    fontSize: 16,
  },
  socialModalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },

  item: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
  },
  item_text: {
    fontSize: 40,
    color: "#FFFFFF",
  },
  scene: {flex: 1, justifyContent: "center", alignItems: "center", padding: 20},
  text: {fontSize: 18, fontWeight: "bold"},
  tabBar: {backgroundColor: "#ea822c"},
  indicator: {backgroundColor: "#fff"},
  tab: {maxWidth: 160}, // Asegura que cada tab tenga un ancho adecuado para scroll
  errorContainer: {
    padding: 10,
    backgroundColor: "#ffebee",
    marginVertical: 10,
    borderRadius: 5,
  },
  errorText: {
    color: "#d32f2f",
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 15,
    borderRadius: 5,
    backgroundColor: 'white',
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 10,
  },
  modalCancelButton: {
    backgroundColor: "#898989",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
    width: "45%",
  },
  modalUpdateButton: {
    backgroundColor: "#ff9f61",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
    width: "45%",
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  label: {fontSize: 16, marginBottom: 5, color: "#898989"},
});
