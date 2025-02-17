import React, { useState, useEffect, useCallback } from "react";
import {
  Alert,
  TouchableOpacity,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback
} from "react-native";
import axios from "axios";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { BaseUrl } from "../../config/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import colors from "../../utils/colors";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const { width } = Dimensions.get("window");

const logo = require("../../assets/jobLogo.png");

export default function LoginForm() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useFocusEffect(
    useCallback(() => {
      setEmail("");
      setPassword("");
    }, [])
  );

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${BaseUrl}/api/users/login`, {
        email: email,
        password: password,
      });

      if (response.data) {
        const { accessToken, user } = response.data;
        await AsyncStorage.setItem("userData", JSON.stringify(user));
        await AsyncStorage.setItem("Token", JSON.stringify(accessToken));
        navigation.navigate("Acceuil");
      } else {
        console.log("Login failed: ", response.data.message);
      }
    } catch (error) {
      console.log("Error occurred while logging in: ", error.message);
      Alert.alert("Login Failed", "Invalid email or password.");
    }
  };

  return (
    <KeyboardAwareScrollView
  contentContainerStyle={{ flexGrow: 1 }}
  keyboardShouldPersistTaps="handled"
>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAwareScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Image source={logo} style={styles.image} resizeMode="contain" />
            <Text style={styles.title}>Welcome to JobLik!</Text>
          </View>

          <SafeAreaView style={styles.container}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                autoCorrect={false}
                autoCapitalize="none"
                placeholder="Enter your email"
                placeholderTextColor="#999"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                autoCorrect={false}
                autoCapitalize="none"
                placeholder="Enter your password"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.buttonView}>
              <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>LOGIN</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't Have an Account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                <Text style={styles.signup}> Sign Up</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </KeyboardAwareScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: width * 0.1,
    marginTop: 40,
  },
  header: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: colors.PRIMARY,
    width: "110%",
    height: 250,
    borderBottomEndRadius: 200,
    borderBottomStartRadius: 200,
    paddingTop: 40,
  },
  title: {
    fontSize: 33,
    width: "50%",
    fontWeight: "bold",
    color: colors.WHITE,
    textAlign: "center",
    marginTop: 5,
  },
  image: {
    height: width * 0.25,
    width: width * 0.25,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    marginLeft: 15,
    marginBottom: 5,
  },
  input: {
    backgroundColor: colors.WHITE,
    height: 50,
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.LIGHT_GREEN,
  },
  buttonView: {
    width: "100%",
    marginTop: 10,
  },
  button: {
    backgroundColor: colors.PRIMARY,
    height: 50,
    borderRadius: 25,
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  buttonText: {
    color: colors.WHITE,
    fontSize: 16,
    fontWeight: "bold",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  footerText: {
    color: "#666",
    fontSize: 14,
  },
  signup: {
    color: colors.PRIMARY,
    fontSize: 14,
    fontWeight: "bold",
  },
});
