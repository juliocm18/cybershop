import {StyleSheet} from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 35,
    padding: 20,
    paddingBottom: 40,
    backgroundColor: "#fff",
  },
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
    marginBottom: 15,
    borderRadius: 5,
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
  logoPreview: {width: 50, height: 50},
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#fb8436",
  },
});

export default {
  styles,
};
