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

const ClientReservationsScreen = ({ route }) => {
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

      const endpoint = `${BaseUrl}/api/reservations/client`;

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

  const cancelReservation = async (reservationId) => {
    try {
      const token = await getToken();
      await axios.delete(`${BaseUrl}/api/reservations/${reservationId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchReservations();
      Alert.alert("Success", "Reservation canceled!");
    } catch (error) {
      console.error("Error canceling reservation:", error);
      Alert.alert("Error", "Failed to cancel reservation.");
    }
  };

  const renderReservationItem = ({ item }) => (
    console.log("itemm", item),
    (
      <View style={styles.card}>
        {/* Service Provider Photo */}
        <Image
          source={
            item.ServiceProvider?.Photo
              ? { uri: `${BaseUrl}/` + item.ServiceProvider.Photo }
              : logoAvatar
          }
          style={styles.providerPhoto}
        />
        <Text style={styles.providerName}>
          {item.ServiceProvider?.firstName} {item.ServiceProvider?.lastName}
        </Text>

        <Text style={styles.serviceName}>
          📋 {item.ServiceProposal?.service?.Name}
        </Text>
        <Text style={styles.price}>💵 {item.ServiceProposal?.price} TND</Text>
        <Text style={styles.serviceName}>📧 {item.ServiceProvider?.email}</Text>

        <Text style={styles.dateTime}>
          {moment(item.Date).format("YYYY-MM-DD")} - {item.Time}
        </Text>

        {userId.role === "client" && item.Status === "pending" && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => cancelReservation(item._id)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    )
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
      <Text style={styles.title}>My Reservations</Text>
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
    padding: 25,
    width: "90%",
    marginBottom: 15,
    elevation: 2,
    width: "95%",
    alignSelf: "center",
  },
  providerName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  serviceName: {
    fontSize: 16,
    color: colors.DARK,
    marginTop: 3,
    fontWeight: "bold",
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 5,
    color: colors.GREEN,
  },
  dateTime: {
    fontSize: 14,
    color: "#555",
    marginTop: 8,
  },
  providerPhoto: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    right: 30,
    top: 20,
    alignSelf: "flex-end",
  },
  cancelButton: {
    backgroundColor: "rgb(177, 6, 6)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 25,
    marginRight: 15,
    alignSelf: "flex-end",
  },
  cancelButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 14,
    padding: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ClientReservationsScreen;
