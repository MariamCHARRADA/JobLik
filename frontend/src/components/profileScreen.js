import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import colors from "../../utils/colors"; // Import your colors
import Icon from "react-native-vector-icons/FontAwesome"; // Import icons
import ServiceProviderReservationsScreen from "./ServiceProviderReservationsScreen";
import ClientReservationsScreen from "./ClientReservationsScreen";
const logo = require("../../assets/jobLogo.png");

export default function ProfileScreen() {
  const [userData, setUserData] = useState(null);
  const navigation = useNavigation();

  const fetchUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem("userData");
      const UserData1 = JSON.parse(userData);
      setUserData(UserData1);
    } catch (e) {
      console.log("error fetching user data", e);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear;
      navigation.navigate("Login"); // Navigate to the login screen
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const navigateToReservations = useCallback((user) => {
    if (user.role === "client") {
      navigation.navigate("ClientReservations", { userId: user });
    } else if (user.role === "serviceProvider") {
      navigation.navigate("ServiceProviderReservations", { userId: user });
    }
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [])
  );

  return (
    <View style={styles.container}>
      {/* Header with logo and screen title */}
      <View style={styles.header}>
        <Image source={logo} style={styles.logoImage} resizeMode="contain" />
        <Text style={styles.headerText}>
          Hi {userData?.firstName} !
        </Text>
      </View>
      <View style={styles.scrollContainer}>

      {/* Navigation Cards */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("ProfData", { userId: userData })}
      >
        <Icon
          name="user"
          size={20}
          color={colors.PRIMARY}
          style={styles.icon}
        />
        <Text style={styles.cardText}>Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          if (userData) {
            navigateToReservations(userData);
          } else {
            console.warn("User data not yet loaded.");
          }
        }}
      >
        <Icon
          name="calendar"
          size={20}
          color={colors.PRIMARY}
          style={styles.icon}
        />
        <Text style={styles.cardText}>Reservations</Text>
      </TouchableOpacity>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Icon
          name="sign-out"
          size={20}
          color={colors.WHITE}
          style={styles.icon}
        />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.LIGHT_GRAY, // Consistent background color
  },
  scrollContainer: {
    alignItems: "center",
    paddingBottom: 80,
    paddingHorizontal: 25,
    marginTop: 50,
  },
  header: {
    backgroundColor: colors.PRIMARY,
    width: "110%",
    alignItems: "center",
    alignSelf: "center",
    paddingTop: 50,
    paddingBottom: 30,
    alignItems: "center",
    borderBottomEndRadius: 200, // Kept the rounded bottom
    borderBottomStartRadius: 200, // Kept the rounded bottom
    marginBottom: 20,
  },
  logoImage: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.WHITE,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    width: "90%",
    backgroundColor: colors.WHITE,
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.DARKER,
    marginLeft: 15,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.PRIMARY,
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginTop: 30,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  logoutText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.WHITE,
    marginLeft: 15,
  },
  icon: {
    marginRight: 10,
  },
});
