import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { BaseUrl } from "../../config/config";
import colors from "../../utils/colors";
import Icon from 'react-native-vector-icons/FontAwesome'; // Make sure FontAwesome is imported

const AddServiceProposalScreen = () => {
  const navigation = useNavigation();

  // Form state
  const [title, setTitle] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [Token, setToken] = useState();

  // Dropdown data
  const [services, setServices] = useState([]);
  // Provider is fetched from user data (stored locally)
  const [provider, setProvider] = useState("");

  // Modal state for loading
  const [modalVisible, setModalVisible] = useState(false);

  // Get user data and available services on mount
  useEffect(() => {
    const getUserData = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem("userData");
        const Token = await AsyncStorage.getItem("Token");
        if (storedUserData) {
          const parsedUserData = JSON.parse(storedUserData);
          // Adjust the field name as stored in your user data
          setToken(JSON.parse(Token));

          setProvider(parsedUserData._id);
        }
      } catch (error) {
        console.error("Error fetching user data", error);
      }
    };

    const getServices = async () => {
      try {
        const response = await axios.get(`${BaseUrl}/api/services/getServices`);
        setServices(response.data);
      } catch (error) {
        console.error("Error fetching services", error);
      }
    };

    getUserData();
    getServices();
  }, []);

  const handleAddProposal = async () => {
    try {
      setModalVisible(true);

      const payload = {
        title,
        serviceId,
        provider, // taken from user data
        price: Number(price), // ensure numeric
        description,
      };
      console.log(Token);
      const response = await axios.post(
        `${BaseUrl}/api/proposal/createProposal`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${Token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setTitle("");
      setDescription("");
      setPrice("");
      setServiceId("");
      if (response.data) {
        setModalVisible(false);
        navigation.goBack(); // or navigate to another screen
      } else {
        setModalVisible(false);
      }
    } catch (error) {
      console.error("Error adding service proposal", error);
      setModalVisible(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with logo and screen title */}
      <View style={styles.header}>
        <Image
          source={require("../../assets/jobLogo.png")}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <Text style={styles.headerText}>Add Proposal</Text>
      </View>
  
      {/* Scrollable content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title Input */}
        <View style={styles.inputContainer}>
          <Icon name="tag" size={20} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Title"
            value={title}
            onChangeText={setTitle}
            placeholderTextColor="#aaa"
          />
        </View>
  
        {/* Service Picker */}
        <View style={styles.inputContainer}>
          <Icon name="list" size={20} style={styles.inputIcon} />
          <View style={styles.pickerContainer}>
            <Picker
              style={styles.picker}
              selectedValue={serviceId}
              onValueChange={(itemValue) => setServiceId(itemValue)}
            >
              <Picker.Item label="Select a service" value="" />
              {services.map((service) => (
                <Picker.Item key={service._id} label={service.Name} value={service._id} />
              ))}
            </Picker>
          </View>
        </View>
  
        {/* Price Input */}
        <View style={styles.inputContainer}>
          <Icon name="money" size={20} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Price"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            placeholderTextColor="#aaa"
          />
        </View>
  
        {/* Description Input */}
        <View style={styles.inputContainer}>
          <Icon name="file-text-o" size={20} style={[styles.descriptionInputIcon, { marginTop: 12 }]} />
          <TextInput
            style={[styles.input, styles.descriptionInput]}
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
            multiline
            placeholderTextColor="#aaa"
          />
        </View>
  
        {/* Submit Button */}
        <TouchableOpacity style={styles.button} onPress={handleAddProposal}>
          <Text style={styles.buttonText}>Submit Proposal</Text>
        </TouchableOpacity>
      </ScrollView>
  
      {/* Modal for loading indicator */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(!modalVisible)}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalText}>Submitting Proposal...</Text>
          <ActivityIndicator size="large" color={colors.PRIMARY} />
        </View>
      </Modal>
    </View>
  );
  
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.LIGHT_GRAY, // Changed background color
  },
  scrollContainer: {
    alignItems: "center",
    paddingBottom: 80,
    paddingHorizontal: 25,
    marginTop: 10
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
  inputContainer: {
    width: "100%",
    marginBottom: 20, // Increased spacing
    flexDirection: 'row',
    backgroundColor: colors.WHITE,
    borderRadius: 15,
    paddingHorizontal: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    flex: 1,
    height: 47,
    fontSize: 16,
    color: colors.BLACK,
    paddingLeft: 10,
  },
  descriptionInput: {
    flex: 1,
    height: 120, // Increased for description
    textAlignVertical: "top",
  },
  pickerContainer: {
    flex: 1,
    borderRadius: 25,
    borderWidth: 0,
    overflow: "hidden",
    backgroundColor: 'transparent',
  },
  picker: {
    color: "#aaa",
  },
  button: {
    backgroundColor: colors.PRIMARY,
    height: 50,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    width: '100%',
    alignSelf: 'center',
    marginVertical: 30
  },
  buttonText: {
    color: colors.WHITE,
    fontSize: 18,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalText: {
    fontSize: 18,
    color: "white",
    marginBottom: 20,
  },
  inputIcon: {
    marginRight: 5,
    marginLeft: 5,
    color: colors.DARK,
    alignSelf: "center",
  },
  descriptionInputIcon: {
    marginRight: 10,
    marginLeft: 5,
    color: colors.DARK,
    alignSelf: 'flex-start', // Align the icon to the top
    paddingTop: 1
  },
});

export default AddServiceProposalScreen;
