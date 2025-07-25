import {StyleSheet} from "react-native";

export const styles = StyleSheet.create({
  container: {padding: 20},
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  cell: {flex: 1},

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
    width: "90%",
  },
  label: {fontSize: 16, marginBottom: 5, color: "#898989"},
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    color: '#333',
    fontSize: 16,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  socialModaltitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  editButton: {
    backgroundColor: "#ff9f61",
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 10,
    borderRadius: 5,
    height: 40,
    justifyContent: "center",
  },
  editButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  LinkButton: {
    backgroundColor: "#0087ff",
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 10,
    borderRadius: 5,
    height: 40,
  },
  deleteButton: {
    backgroundColor: "#e74c3c",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    height: 40,
    justifyContent: "center",
  },

  modalButtonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  imagePicker: {
    backgroundColor: "#0087ff",
    padding: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  imagePickerText: {color: "#fff"},
  logoPreview: {width: 100, height: 100, marginBottom: 15},
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
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

  sexual_preference: {
    padding: 12,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  passwordInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: "#333",
  },
  eyeButton: {
    padding: 10,
  },
  eyeText: {
    fontSize: 18,
  },
  title: {
    fontSize: 20,
    marginBottom: 5,
    color: "#fb8436",
    textAlign: "center",
    fontWeight: "bold",
    padding: 10,
  },
  
});

export default styles;
