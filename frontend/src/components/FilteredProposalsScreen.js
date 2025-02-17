import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import axios from "axios";
import { BaseUrl } from "../../config/config";
import { useNavigation } from "@react-navigation/native";
import colors from "../../utils/colors";
import Icon from "react-native-vector-icons/FontAwesome";

const FilteredProposalsScreen = ({ route }) => {
  const { filterType, filterId } = route.params; // filterType can be "service" or "category"
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    fetchFilteredProposals();
  }, [filterType, filterId]); //Refetch when filterType or filterId changes

  const fetchFilteredProposals = async () => {
    try {
      setLoading(true); // Set loading to true before fetching
      const endpoint =
        filterType === "service"
          ? `${BaseUrl}/api/proposal/service/${filterId}`
          : `${BaseUrl}/api/proposal/category/${filterId}`;
      const response = await axios.get(endpoint);
      setProposals(response.data);
    } catch (error) {
      console.error("Error fetching proposals:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingPress = (item) => {
    navigation.navigate("BookingScreen", {
      serviceProposal: item, // Pass the entire service proposal
      provider: item.provider, // Pass the provider details
    });
  };

  const renderProposalItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleBookingPress(item) 
        } // Use handleBookingPress here
      >
        {/* Service Provider Photo */}
        <Image
          source={
            item.provider?.Photo
            ? { uri: `${BaseUrl}/` + item.provider.Photo }
              : require("../../assets/avatar.png") // Default image if no photo
          }
          style={styles.profileImage}
        />

        {/* Service Details */}
        <View style={styles.details}>
          <Text style={styles.providerName}>
            {item.provider?.firstName} {item.provider?.lastName}
          </Text>
          <Text style={styles.serviceName1}>{item.service?.Name}</Text>
          <Text style={styles.rating}>
            ⭐ {item.provider?.averageRating?.toFixed(1)}
          </Text>
          <Text style={styles.price}>{item.price} TND</Text>
        </View>

        {/* Calendar Icon */}
        <TouchableOpacity
          onPress={() => handleBookingPress(item)}
          style={styles.calendarIconContainer}
        >
          <Icon
            name="calendar"
            size={28}
            color={colors.DARK}
            marginRight="15"
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <Text>Loading...</Text>
      ) : proposals.length > 0 ? (
        <FlatList
          data={proposals}
          keyExtractor={(item) => item._id}
          renderItem={renderProposalItem}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <Text>No proposals found.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: colors.LIGHT_GRAY,
  },
  proposalItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.WHITE,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
  },
  providerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  proposalDetails: {
    flex: 1,
  },  proposalDescription: {
    fontSize: 14,
    color: colors.BLACK,
    marginTop: 5,
  },
  proposalPrice: {
    fontSize: 14,
    color: colors.GREEN,
    marginTop: 5,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  profileImage: {
    width: 65,
    height: 65,
    borderRadius: 50,
    justifyContent: "center",
    alignSelf: "center",
    margin: 10
  },
  details: {
    flex: 1,
    justifyContent: "center",
  },
  providerName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  serviceName1: {
    fontSize: 14,
    color: "black",
    textAlign: "left",
  },
  rating: {
    fontSize: 14,
    color: "#f39c12",
  },
  price: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#27ae60",
  },
  calendarIconContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  listContainer: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
});

export default FilteredProposalsScreen;
