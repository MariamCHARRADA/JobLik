import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image, // Import Image component
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

  const confirmReservation = async (reservationId) => {
    try {
      const token = await getToken();
      await axios.put(
        `${BaseUrl}/api/reservations/${reservationId}/status`,
        { status: "confirmed" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchReservations();
      Alert.alert("Success", "Reservation confirmed!");
    } catch (error) {
      console.error("Error confirming reservation:", error);
      Alert.alert("Error", "Failed to confirm reservation.");
    }
  };

  const rejectReservation = async (reservationId) => {
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
  };

  const renderReservationItem = ({ item }) => (
    <View style={styles.card}>
      {/* Client Photo */}
      <Image
        source={item.Client?.Photo ? { uri: `${BaseUrl}/` + item.Client.Photo } : logoAvatar}
        style={styles.clientPhoto}
      />
      <Text style={styles.clientName}>
        {item.Client?.firstName} {item.Client?.lastName}
      </Text>

      <Text style={styles.serviceName}>
        📋 {item.ServiceProposal?.service?.Name}
      </Text>
      {item.Client?.address && (
        <Text style={styles.addressInfo}>
          📍 {item.Client?.address}, {item.Client?.city?.Name}
        </Text>
      )}
      <Text style={styles.contactInfo}>📞 {item.Client?.phone}</Text>

      <Text style={styles.dateTime}>
        {moment(item.Date).format("YYYY-MM-DD")} - {item.Time}
      </Text>
      {userId.role === "serviceProvider" && item.Status === "pending" && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.confirmButton]}
            onPress={() => confirmReservation(item._id)}
          >
            <Text style={styles.buttonText}>Confirm</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.rejectButton]}
            onPress={() => rejectReservation(item._id)}
          >
            <Text style={styles.buttonText}>Reject</Text>
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
      <Text style={styles.title}>Reservations</Text>
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
    marginTop: -55
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
    marginBottom: 15,
    elevation: 2,
    width: "95%",
    alignSelf: "center"
  },
  clientName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
    padding: 5
  },
  serviceName: {
    fontSize: 16,
    color: colors.DARK,
    marginTop: 3,
    fontWeight: "bold",
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
    justifyContent: "space-around",
    marginTop: 12,
    width: "60%",
    justifyContent: "center",
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    flex: 0.48,
    marginHorizontal: 3,
    elevation: 2,
  },
  confirmButton: {
    backgroundColor: colors.GREEN,
  },
  rejectButton: {
    backgroundColor: "rgb(177, 6, 6)",
    
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 14,
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 5,
    color: colors.GREEN,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  clientPhoto: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    right: 30,
    top: 30,
    alignSelf: "flex-end",
  },
  cancelButton: {
    backgroundColor: colors.RED,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginTop: 10,
    alignSelf: "flex-start", // Aligns button to the start of the card
  },
  cancelButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});
export default ServiceProviderReservationsScreen;
