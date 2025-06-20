import {Link, useRouter} from "expo-router";
import React, {useEffect, useState} from "react";
import {View, Text, StyleSheet, TouchableOpacity, Alert} from "react-native";
import {FontAwesome} from "@expo/vector-icons";
import {useAuth} from "./context/AuthContext";
import RoleFunctions from "./role/functions";
import {Role} from "./role/model";

const Home: React.FC = () => {
  const router = useRouter();
  const {session, signOut} = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    const data = await RoleFunctions.getByUser(session?.user?.id || "");
    if (data) setRoles(data);
  };
  
  const handleLogout = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/locationhome');
            } catch (error) {
              console.error('Error al cerrar sesión:', error);
              Alert.alert('Error', 'No se pudo cerrar sesión. Por favor, intenta de nuevo.');
            }
          }
        }
      ]
    );
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Panel de Control</Text>
      <View style={styles.buttonContainer}>
        {roles.some(
          (role) => role.name === "CEO" || role.name === "Superadministrador"
        ) && (
          <Link
            href="./dashboard/"
            style={[styles.button, {backgroundColor: "#2196F3"}]}
          >
            <View style={styles.iconLabelContainer}>
              <FontAwesome
                style={styles.icon}
                name="dashboard"
                size={30}
                color="white"
              />
              <Text style={styles.label}>Indicadores de Gestión</Text>
            </View>
          </Link>
        )}

        {roles.some(
          (role) =>
            role.name === "CEO" ||
            role.name === "Superadministrador" ||
            role.name === "Administrador" ||
            role.name === "Operador"
        ) && (
          <>
            <Link
              href="./category/"
              style={[styles.button, {backgroundColor: "#4CAF50"}]}
            >
              <View style={styles.iconLabelContainer}>
                <FontAwesome
                  style={styles.icon}
                  name="edit"
                  size={24}
                  color="white"
                />
                <Text style={styles.label}>Administración de Categorías</Text>
              </View>
            </Link>

            <Link
              href="./company/gestion-socios"
              style={[styles.button, {backgroundColor: "#FF9800"}]}
            >
              <View style={styles.iconLabelContainer}>
                <FontAwesome
                  style={styles.icon}
                  name="building-o"
                  size={30}
                  color="white"
                />
                <Text style={styles.label}>Administración de S.E</Text>
              </View>
            </Link>

            <Link
              href="./link/"
              style={[styles.button, {backgroundColor: "#4CAF"}]}
            >
              <View style={styles.iconLabelContainer}>
                <FontAwesome
                  style={styles.icon}
                  name="link"
                  size={30}
                  color="white"
                />
                <Text style={styles.label}>Administración de Contactos</Text>
              </View>
            </Link>
          </>
        )}

        {roles.some(
          (role) =>
            role.name === "CEO" ||
            role.name === "Superadministrador" ||
            role.name === "Administrador"
        ) && (
          <>
            <Link
              href="./company/gestion-territorios"
              style={[styles.button, {backgroundColor: "#9f2cea"}]}
            >
              <View style={styles.iconLabelContainer}>
                <FontAwesome
                  style={styles.icon}
                  name="globe"
                  size={30}
                  color="white"
                />
                <Text style={styles.label}>
                  Asignación de Territorios a S.E
                </Text>
              </View>
            </Link>
            <Link
              href="./user/"
              style={[styles.button, {backgroundColor: "purple"}]}
            >
              <View style={styles.iconLabelContainer}>
                <FontAwesome
                  style={styles.icon}
                  name="users"
                  size={30}
                  color="white"
                />
                <Text style={styles.label}>Administración de Usuarios</Text>
              </View>
            </Link>
            
            <Link
              href="./reported-messages"
              style={[styles.button, {backgroundColor: "#E91E63"}]}
            >
              <View style={styles.iconLabelContainer}>
                <FontAwesome
                  style={styles.icon}
                  name="flag"
                  size={30}
                  color="white"
                />
                <Text style={styles.label}>Mensajes Reportados</Text>
              </View>
            </Link>
          </>
        )}
      </View>
      <View style={styles.bottomButtonsContainer}>
        <TouchableOpacity
          style={styles.bottonButton}
          onPress={() => router.push("../locationhome")}
        >
          <Text style={styles.buttonText}>Ir a la Tienda</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.bottonButton, styles.logoutButton]}
          onPress={handleLogout}
        >
          <FontAwesome name="sign-out" size={18} color="white" style={styles.logoutIcon} />
          <Text style={styles.buttonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f4f4",
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333",
    padding: 10,
    borderRadius: 5,
    zIndex: 1,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    marginLeft: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    width: "100%",
    gap: 20,
    marginTop: 15,
  },
  button: {
    width: 150,
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  iconLabelContainer: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    width: "100%",
  },
  label: {
    marginTop: 10,
    color: "white",
    fontSize: 16,
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: "bold",
  },
  icon: {
    marginTop: 10,
    fontSize: 40,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  bottomButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginTop: 20,
    gap: 15,
  },
  bottonButton: {
    backgroundColor: "#333",
    padding: 10,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 130,
  },
  logoutButton: {
    backgroundColor: "#d32f2f",
  },
  logoutIcon: {
    marginRight: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    color: "#fb8436",
  },
});

export default Home;
