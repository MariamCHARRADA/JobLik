import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { BaseUrl } from "../../config/config";
import moment from "moment";
import AsyncStorage from "@react-native-async-storage/async-storage";
import colors from "../../utils/colors";
import { Ionicons } from "@expo/vector-icons";

const logoAvatar = require("../../assets/avatar.png");

const ServiceProviderReservationsScreen = ({ route }) => {
  const { userId } = route.params;
  const [pendingReservations, setPendingReservations] = useState([]);
  const [confirmedReservations, setConfirmedReservations] = useState([]);
  const [rejectedReservations, setRejectedReservations] = useState([]);
  const [status, setStatus] = useState("pending");
  const [reservations, setReservations] = useState([]);
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  const getToken = async () => {
    try {
      const token = await AsyncStorage.getItem("Token");
      return token ? JSON.parse(token) : null;
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  };

  const fetchReservations = async () => {
    try {
      setLoading(true); // Start loading
      const token = await getToken();

      if (!token) {
        console.warn("No token found. User may not be logged in.");
        navigation.navigate("LoginForm");
        return;
      }

      const endpoint = `${BaseUrl}/api/reservations/serviceProvider`;

      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const reservations = response.data;
      setReservations(reservations);
      const pending = reservations.filter(
        (reservation) => reservation.Status === "pending"
      );
      const confirmed = reservations.filter(
        (reservation) => reservation.Status === "confirmed"
      );
      const rejected = reservations.filter(
        (reservation) => reservation.Status === "rejected"
      );

      setPendingReservations(pending);
      setConfirmedReservations(confirmed);
      setRejectedReservations(rejected);
    } catch (error) {
      console.error("Error fetching reservations:", error);
      Alert.alert("Error", "Failed to fetch reservations.");
      if (error.response && error.response.status === 401) {
        console.log("Unauthorized access. Redirect to login.");
        navigation.navigate("LoginForm");
      }
    } finally {
      setLoading(false); // End loading
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [status]);

  const confirmReservation = async (reservationId, selectedDate, selectedTime) => {
    Alert.alert(
      "Confirm Reservation",
      "Are you sure you want to confirm this reservation?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              const token = await getToken();
  
              // First, check if the reservation can be confirmed
              const canConfirmResponse = await axios.get(
                `${BaseUrl}/api/reservations/${reservationId}/can-confirm`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
  
              if (!canConfirmResponse.data.canConfirm) {
                Alert.alert("Error", canConfirmResponse.data.message);
                return;
              }
  
              // Proceed to confirm the reservation if it's allowed
              await axios.put(
                `${BaseUrl}/api/reservations/${reservationId}/status`,
                { status: "confirmed" },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
  
              fetchReservations(); // Refresh reservations
              Alert.alert("Success", "Reservation confirmed!");
            } catch (error) {
              if (error.response && error.response.data && error.response.data.message) {
                  Alert.alert("Sorry", error.response.data.message); // Display backend error message
              } else {
                  Alert.alert("Error", "Failed to confirm reservation.");
              }
            }
          },
        },
      ]
    );
  };
  
  
  const rejectReservation = async (reservationId) => {
    Alert.alert(
      "Reject Reservation",
      "Are you sure you want to reject this reservation?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Reject",
          onPress: async () => {
            try {
              const token = await getToken();
              await axios.put(
                `${BaseUrl}/api/reservations/${reservationId}/status`,
                { status: "rejected" },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
              fetchReservations();
              Alert.alert("Success", "Reservation rejected!");
            } catch (error) {
              console.error("Error rejecting reservation:", error);
              Alert.alert("Error", "Failed to reject reservation.");
            }
          },
        },
      ]
    );
  };

  const renderReservationItem = ({ item }) => (
    <View style={styles.card}>
      {/* Client Photo */}
      <Image
        source={item.Client?.Photo ? { uri: `${BaseUrl}/` + item.Client.Photo } : logoAvatar}
        style={styles.clientPhoto}
      />

      <Text style={styles.serviceTitle}>
        {item.ServiceProposal?.title}({item.ServiceProposal?.price} TND)
      </Text>

      <Text style={styles.serviceName}>
        📋 {item.ServiceProposal?.service?.Name}
      </Text>
      <Text style={styles.clientName}>
        {item.Client?.firstName} {item.Client?.lastName}
      </Text>
      <Text style={styles.dateTime}>
        {moment(item.Date).format("YYYY-MM-DD")} - {item.Time}
      </Text>
      {item.Client?.address && (
        <Text style={styles.addressInfo}>
          📍 {item.Client?.address}, {item.Client?.city?.Name}
        </Text>
      )}
      <Text style={styles.contactInfo}>📞 {item.Client?.phone}</Text>


      {userId.role === "serviceProvider" && item.Status === "pending" && (
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.textButton}
          onPress={() => confirmReservation(item._id)}
        >
          <Ionicons name="checkmark" size={20} color={colors.DARKER} />
          <Text style={[styles.textButtonText, { color: colors.PRIMARY }]}>
            Confirm
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.textButton}
          onPress={() => rejectReservation(item._id)}
        >
          <Ionicons name="close" size={19} color={colors.DARK} />
          <Text style={[styles.textButtonText, { color: colors.PRIMARY }]}>
            Reject
          </Text>
        </TouchableOpacity>
      </View>
    )}
  </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Ionicons
          name="arrow-back"
          size={24}
          color={colors.DARKER}
          style={{ margin: 25 }}
        />
      </TouchableOpacity>
      <Text style={styles.title}>Incoming Requests</Text>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            status === "pending" && styles.activeTabButton,
          ]}
          onPress={() => setStatus("pending")}
        >
          <Text
            style={[
              styles.tabText,
              status === "pending" && styles.activeTabText,
            ]}
          >
            Pending
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            status === "confirmed" && styles.activeTabButton,
          ]}
          onPress={() => setStatus("confirmed")}
        >
          <Text
            style={[
              styles.tabText,
              status === "confirmed" && styles.activeTabText,
            ]}
          >
            Confirmed
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            status === "rejected" && styles.activeTabButton,
          ]}
          onPress={() => setStatus("rejected")}
        >
          <Text
            style={[
              styles.tabText,
              status === "rejected" && styles.activeTabText,
            ]}
          >
            Rejected
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.PRIMARY} />
        </View>
      ) : (
        <>
          {status === "pending" && (
            <FlatList
              data={pendingReservations}
              keyExtractor={(item) => item._id}
              renderItem={renderReservationItem}
              contentContainerStyle={styles.listContainer}
            />
          )}
          {status === "confirmed" && (
            <FlatList
              data={confirmedReservations}
              keyExtractor={(item) => item._id}
              renderItem={renderReservationItem}
              contentContainerStyle={styles.listContainer}
            />
          )}
          {status === "rejected" && (
            <FlatList
              data={rejectedReservations}
              keyExtractor={(item) => item._id}
              renderItem={renderReservationItem}
              contentContainerStyle={styles.listContainer}
            />
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 10,
    marginTop: -55,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    marginBottom: 20,
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTabButton: {
    borderBottomColor: colors.PRIMARY,
  },
  tabText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#666",
  },
  activeTabText: {
    color: colors.PRIMARY,
  },
  listContainer: {
    paddingHorizontal: 10,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    paddingHorizontal: 25,
    marginBottom: 15,
    elevation: 2,
    width: "95%",
    alignSelf: "center",
  },
  clientName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 7,
  },
  serviceTitle: {
    fontSize: 18,
    color: colors.DARKER,
    marginTop: 3,
    fontWeight: "bold",
  },
  serviceName: {
    fontSize: 16,
    color: "#777",
    marginTop: 3,
  },
  contactInfo: {
    fontSize: 14,
    color: "#777",
    marginTop: 2,
  },
  addressInfo: {
    fontSize: 14,
    color: "#555",
    marginTop: 2,
    fontStyle: "italic",
  },
  dateTime: {
    fontSize: 14,
    color: "#555",
    marginTop: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 12,
    width: "30%",
    alignSelf: "left",
    alignItems: "flex-start",
    justifyContent: "center",
    marginLeft: 40
  },
  textButton: {
    flexDirection: "row",
    marginHorizontal: 18,
  },
  textButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  clientPhoto: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 100,
    right: 30,
    top: 55,
    alignSelf: "flex-end",
  },
});
export default ServiceProviderReservationsScreen;
