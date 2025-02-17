import React, { useEffect, useState } from "react";
import { View, Text, Image, FlatList, ActivityIndicator, StyleSheet,TouchableOpacity } from "react-native";
import axios from "axios";
import { BaseUrl } from "../../config/config";
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from "@react-navigation/native";
import colors from "../../utils/colors";

const ServiceProposalsScreen = ({ route }) => {
  const { serviceId, serviceName } = route.params;
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation= useNavigation();

    // Set the stack screen title dynamically
    useEffect(() => {
      navigation.setOptions({ title: `${serviceName} proposals`,
        headerTitleStyle: {
          fontSize: 20,
          fontWeight: "bold",
          color: colors.DARK,
        },
        });
    }, [serviceName]);

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      const response = await axios.get(`${BaseUrl}/api/proposal/service/${serviceId}`);
      setProposals(response.data);
    } catch (error) {
      console.error("Error fetching proposals:", error);
    }
    setLoading(false);
  };

  const handleBookingPress = async (item) => {
    console.log("test")
    navigation.navigate('BookingScreen', {
      serviceProposal: item, // Pass the entire service proposal
      provider: item.provider, // Pass the provider details
      serviceId: serviceId,
    });
  };
  const renderProposalItem = ({ item }) => (
    <View style={styles.card}>
      <Image
        source={
          item.provider?.Photo
            ? { uri: `${BaseUrl}/` + item.provider.Photo }
            : require("../../assets/avatar.png")
        }
        style={styles.profileImage}
      />
      <View style={styles.details}>
        <Text style={styles.providerName}>
          {item.provider?.firstName} {item.provider?.lastName}
        </Text>
        <Text style={styles.serviceName}>{item.title}</Text>
        <Text style={styles.rating}>⭐ {item.provider?.averageRating.toFixed(1)}</Text>
        <Text style={styles.price}>{item.price} TND</Text>
      </View>
      <TouchableOpacity
        onPress={() => handleBookingPress(item)}
        >
      <Icon name="calendar" size={28} color={colors.DARK} marginRight= "15" />
    </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      
      {loading ? (
        <ActivityIndicator size="large" color={colors.BLACK}/>
      ) : proposals.length > 0 ? (
        <FlatList
          data={proposals}
          renderItem={renderProposalItem}
          keyExtractor={(item) => item._id}
        />
      ) : (
        <Text style={styles.noProposals}>No service proposals available.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 15
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    marginBottom: 10,
    elevation: 1,
    marginHorizontal: 10,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 50,
    marginRight: 12,
  },
  details: {
    flex: 1,
  },
  providerName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  serviceName: {
    fontSize: 14,
    color: "#777",
  },
  rating: {
    fontSize: 14,
    color: "#777",
  },
  price: {
    fontSize: 14,
    color: colors.GREEN,
    fontWeight: "bold",
  },
  noProposals: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
  },
});

export default ServiceProposalsScreen;
