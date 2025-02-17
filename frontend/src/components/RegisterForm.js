import React, { useEffect, useState } from "react";
import {
  Image,
  Button,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Modal,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { BaseUrl } from "../../config/config";
import { Picker } from "@react-native-picker/picker";
import colors from "../../utils/colors";

import * as ImagePicker from "expo-image-picker";
const logo = require("../../assets/jobLogo.png");

export default function RegisterForm() {
  const navigation = useNavigation();
  const [modalVisible1, setModalVisible1] = useState(false);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("client");
  const [address, setAddress] = useState("");
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [image, setImage] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        alert("Permission to access media library is required!");
      }
    })();
  }, []);

  const pickImage = async (source) => {
    let result;
    if (source === "camera") {
      result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        aspect: [1, 1],
        quality: 1,
      });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        aspect: [1, 1],
        quality: 1,
      });
    }

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleRegister = async () => {
    try {
      setModalVisible1(true);

      const formData = new FormData();
      formData.append(
        "data",
        JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          role,
          city: selectedCity,
          phone,
          address
        })
      );

      if (image) {
        let localUri = image;
        let filename = localUri.split("/").pop(); // Get the file name
        let match = /\.(\w+)$/.exec(filename);
        let type = match ? `image/${match[1]}` : "image";

        formData.append("image", {
          uri: localUri,
          name: filename,
          type,
        });
      }
      const response = await axios.post(
        `${BaseUrl}/api/users/register`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data) {
        setModalVisible1(false);
        navigation.navigate("Login");
      } else {
        setModalVisible1(false);
      }
    } catch (error) {
      setModalVisible1(false);
      console.log("Error occurred while registering: ", error);
    }
  };

  const getCities = async () => {
    try {
      const response = await axios.get(`${BaseUrl}/api/cities/getCities`);

      setCities(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getCities();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={logo} style={styles.logoImage} resizeMode="cover" />
        <Text style={styles.headerText}>Register</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Role Selection */}
        <View style={styles.roleSelectionContainer}>
          <View style={styles.roleButtons}>
            <TouchableOpacity
              style={[
                styles.roleButton,
                role === "client" ? styles.selectedRole : null,
              ]}
              onPress={() => setRole("client")}
            >
              <Text
                style={
                  role === "client" ? styles.activeRoleText : styles.roleText
                }
              >
                Client
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.roleButton,
                role === "serviceProvider" ? styles.selectedRole : null,
              ]}
              onPress={() => setRole("serviceProvider")}
            >
              <Text
                style={
                  role === "serviceProvider"
                    ? styles.activeRoleText
                    : styles.roleText
                }
              >
                Service Provider
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Form Inputs */}
        <View style={styles.inputContainer}>
          <View style={styles.nameContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="First Name"
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>

            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Last Name"
                value={lastName}
                onChangeText={setLastName}
              />
            </View>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            keyboardType="email-address"
            onChangeText={setEmail}
            autoCorrect={false}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Phone"
            value={phone}
            onChangeText={setPhone}
            autoCorrect={false}
            maxLength={8}
            keyboardType="numeric"
            autoCapitalize="none"
          />

          {/* City Picker */}
          <View style={styles.pickerContainer}>
            <Picker
              style={styles.picker}
              selectedValue={selectedCity}
              onValueChange={(itemValue) => setSelectedCity(itemValue)}
            >
              <Picker.Item label="City" value="" />
              {cities.map((city) => (
                <Picker.Item
                  label={city.Name}
                  value={city._id}
                  key={city._id}
                />
              ))}
            </Picker>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Address"
            value={address}
            onChangeText={setAddress}
            autoCorrect={false}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            autoCorrect={false}
            autoCapitalize="none"
          />
        </View>
        {/* Image Picker */}
        <View style={styles.imagePickerContainer}>
          <TouchableOpacity
            style={styles.imagePickerButton}
            onPress={() => pickImage("camera")}
          >
            <Text style={styles.imagePickerText}>Open Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.imagePickerButton}
            onPress={() => pickImage("Library")}
          >
            <Text style={styles.imagePickerText}>Select Image</Text>
          </TouchableOpacity>
        </View>
        {image && (
          <Image
            source={{ uri: image }}
            style={styles.selectedImage}
            resizeMode="cover"
          />
        )}

        {/* Register Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>REGISTER</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already Have an Account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.loginText}>Log In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible1}
        onRequestClose={() => setModalVisible1(!modalVisible1)}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalText}>
            Registration in progress. Please wait...
          </Text>
          <ActivityIndicator size="large" color={colors.PRIMARY} />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.WHITE,
  },
  scrollContainer: {
    alignItems: "center",
    paddingBottom: 100,
    paddingHorizontal: 25,
  },
  header: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: colors.PRIMARY,
    width: "110%",
    height: 200,
    borderBottomEndRadius: 200,
    borderBottomStartRadius: 200,
  },

  logoImage: {
    width: 90,
    height: 90,
    marginTop: 50,
  },
  headerText: {
    fontSize: 29,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: colors.WHITE,
  },
  nameContainer: {
    flexDirection: "row", // Makes inputs adjacent
    justifyContent: "space-between", // Distributes space
    width: "100%",
    gap: 8,
  },
  inputWrapper: {
    flex: 1,
  },
  imagePickerContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    gap: 20,
    marginBottom: 20,
  },
  imagePickerButton: {
    backgroundColor: colors.PRIMARY,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 10,
  },
  imagePickerText: {
    color: "white",
    fontSize: 16,
  },
  selectedImage: {
    width: 200,
    height: 200,
    marginBottom: 30,
    borderRadius: 100,
  },
  inputContainer: {
    width: "90%",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 20,
    marginBottom: 15,
    paddingHorizontal: 17,
    fontSize: 15,
    borderColor: colors.LIGHT_GREEN,
    borderWidth: 1,
    height: "42",
  },
  pickerContainer: {
    alignContent: "center",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20, // Rounded corners
    overflow: "hidden", // Ensures the children (Picker) follow the border radius
    borderWidth: 1, // Visible border
    borderColor: colors.LIGHT_GREEN,
    backgroundColor: colors.LIGHTER_GRAY, // Background color
    marginBottom: 15,
    height: 42,
  },
  picker: {
    width: "100%",
    color: "rgba(122, 114, 114, 0.68)",
    backgroundColor: "transparent", // Ensure background matches container
  },
  roleSelectionContainer: {
    marginBottom: 20,
  },
  roleButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    width: "90%",
    gap: 20,
  },
  roleButton: {
    flex: 1,
    backgroundColor: colors.LIGHT_GRAY,
    borderRadius: 100,
    paddingVertical: 13,
    alignItems: "center",
    borderColor: colors.LIGHT_GRAY,
    borderWidth: 1,
  },
  selectedRole: {
    backgroundColor: colors.PRIMARY,
  },
  roleText: {
    color: "#333",
  },
  activeRoleText: {
    color: "#fff",
  },
  buttonContainer: {
    marginBottom: 20,
    width: "90%",
  },
  button: {
    backgroundColor: colors.PRIMARY,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  footerText: {
    fontSize: 16,
  },
  loginText: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.PRIMARY,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    height: "110%",
  },
  modalText: {
    fontSize: 18,
    color: "white",
    marginBottom: 20,
  },
});
