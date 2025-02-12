import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { BaseUrl } from "../../config/config";
import { useNavigation } from "@react-navigation/native";
import colors from "../../utils/colors";
import Icon from "react-native-vector-icons/FontAwesome";
import { Ionicons } from "@expo/vector-icons";


const logo = require("../../assets/jobLogo.png");

export default function ProfileDetails({ route }) {
  const { userId } = route.params;
  const navigation = useNavigation();

  const [email, setEmail] = useState(userId?.email || "");
  const [firstName, setFirstName] = useState(userId?.firstName || "");
  const [lastName, setLastName] = useState(userId?.lastName || "");
  const [phone, setPhone] = useState(userId?.phone || "");
  const [address, setAddress] = useState(userId?.address || "");
  const [loading, setLoading] = useState(false); // Set to false initially

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${BaseUrl}/api/userList/${userId?._id}`);
        const userData = response.data;
        console.log(userId);
        setFirstName(userData.firstName || "");
        setLastName(userData.lastName || "");
        setPhone(userData.phone || "");
        setAddress(userData.address || "");
        setEmail(userData.email || "");
      } catch (error) {
      } finally {
        setLoading(false); // Ensure loading is set to false
      }
    };

    fetchUserData();
  }, [userId]);

  const updateProfile = async () => {
    const updateData = {
      email,
      firstName,
      lastName,
      phone,
      address,
    };

    setLoading(true); // Start loading

    try {
      const token = await AsyncStorage.getItem("Token"); // Get the token
      if (!token) {
        throw new Error("User not authenticated.");
      }

      const response = await axios.put(
        `${BaseUrl}/api/users/updateUser/${userId?._id}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${JSON.parse(token)}`, // Include the token
          },
        }
      );

      await AsyncStorage.setItem("userData", JSON.stringify(response.data));
      Alert.alert("Success", "Profile updated successfully!");
      navigation.goBack(); // Navigate back only on success
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert(
        "Update Failed",
        error.response?.data?.message || "Failed to update profile."
      );
    } finally {
      setLoading(false); // End loading
    }
  };

  return (

    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons
                  name="arrow-back"
                  size={24}
                  color={colors.WHITE}
                  style={{ left: -155, position: "absolute", top: 10 }}
                />
              </TouchableOpacity>
        <Image source={logo} style={styles.logoImage} />
        <Text style={styles.headerText}>My Profile</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.inputContainer}>
          <Icon name="user" size={20} color={colors.PRIMARY} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="First Name"
            value={firstName}
            onChangeText={setFirstName}
            placeholderTextColor="#aaa"
          />
        </View>
        <View style={styles.inputContainer}>
          <Icon name="user" size={20} color={colors.PRIMARY} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Last Name"
            value={lastName}
            onChangeText={setLastName}
            placeholderTextColor="#aaa"
          />
        </View>
        <View style={styles.inputContainer}>
          <Icon name="phone" size={20} color={colors.PRIMARY} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            value={phone}
            onChangeText={setPhone}
            placeholderTextColor="#aaa"
          />
        </View>
        <View style={styles.inputContainer}>
          <Icon name="envelope" size={20} color={colors.PRIMARY} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            placeholderTextColor="#aaa"
          />
        </View>
        <View style={styles.inputContainer}>
          <Icon name="map-marker" size={20} color={colors.PRIMARY} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Address"
            value={address}
            onChangeText={setAddress}
            placeholderTextColor="#aaa"
          />
        </View>
        <TouchableOpacity style={styles.updateButton} onPress={updateProfile} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color={colors.WHITE} />
          ) : (
            <Text style={styles.updateButtonText}>Update Profile</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.LIGHT_GRAY,
  },
  header: {
    backgroundColor: colors.PRIMARY,
    paddingTop: 40,
    paddingBottom: 40,
    alignItems: "center",
    borderBottomLeftRadius: 200,
    borderBottomRightRadius: 200,
    width: "110%",
    alignSelf: "center",
    marginBottom: 30,
  },
  logoImage: {
    width: 110,
    height: 110,
    marginBottom: 10,
    borderRadius: 40,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.WHITE,
  },
  content: {
    paddingHorizontal: 25,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.WHITE,
    borderRadius: 20,
    paddingHorizontal: 20,
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: colors.BLACK,
    paddingLeft: 10,
  },
  inputIcon: {
    marginRight: 10,
    color: colors.PRIMARY,
  },
  updateButton: {
    backgroundColor: colors.PRIMARY,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    marginTop: 30,
  },
  updateButtonText: {
    color: colors.WHITE,
    fontSize: 18,
    fontWeight: "bold",
  },
});