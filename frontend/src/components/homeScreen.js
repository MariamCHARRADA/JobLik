import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import axios from "axios";
import { BaseUrl } from "../../config/config";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/FontAwesome";
import colors from "../../utils/colors";

const { width } = Dimensions.get("window");

const logoAvatar = require("../../assets/avatar.png");
const logo = require("../../assets/jobLogo.png");

export default function HomeScreen({ route }) {
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  const flatListRef = useRef(null);
  let scrollIndex = 0;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          `${BaseUrl}/api/categories/getCategories`
        );
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    const fetchProposals = async () => {
      try {
        const response = await axios.get(
          `${BaseUrl}/api/proposal/get5Proposals`
        );
        setProposals(response.data);
      } catch (error) {
        console.error("Error fetching proposals:", error);
      }
    };

    const fetchUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem("userData");
        const UserData1 = JSON.parse(userData);
        setUserData(UserData1);
      } catch (e) {
        console.log("error fetching user data", e);
      }
    };

    const fetchAllData = () => {
      fetchUserData();
      fetchCategories();
      fetchServices();
      fetchProposals();
    };

    // Initial fetch when component mounts
    fetchAllData();

    // Set up interval to fetch data every 5 seconds (5000ms)
    const interval = setInterval(fetchAllData, 5000);

    // Clean up the interval when component unmounts
    return () => clearInterval(interval);
  }, []);

  const fetchServices = async () => {
    try {
      const response = await axios.get(`${BaseUrl}/api/services/getServices`);
      setServices(response.data);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (flatListRef.current && services.length > 0) {
        if (scrollIndex < services.length - 1) {
          // Scroll to the next item
          scrollIndex++;
          flatListRef.current.scrollToIndex({
            index: scrollIndex,
            animated: true,
            viewPosition: 0.5, // Centers the item
          });
        } else {
          // Reset to the first item
          scrollIndex = 0;
          flatListRef.current.scrollToIndex({
            index: scrollIndex,
            animated: true,
            viewPosition: 0.5,
          });
        }
      }
    }, 10000); // Auto-scroll every 1.5 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, [services]);

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() =>
        navigation.navigate("FilteredProposals", {
          filterType: "category", // Filter by category
          filterId: item._id, // Use item._id instead of category._id
        })
      }
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: `${BaseUrl}/` + item.Photo }}
          style={styles.categoryImage}
        />
      </View>
      <Text style={styles.categoryText}>{item.Name}</Text>
    </TouchableOpacity>
  );

  const renderProposalItem = ({ item }) => {
    return (
      <View style={styles.card}>
        {/* Service Provider Photo */}
        <Image
          source={
            item.provider.Photo
              ? { uri: `${BaseUrl}/` + item.provider.Photo }
              : require("../../assets/avatar.png") // Default image if no photo
          }
          style={styles.profileImage}
        />

        {/* Service Details */}
        <View style={styles.details}>
          <Text style={styles.providerName}>
            {item.provider.firstName} {item.provider.lastName}
          </Text>
          <Text style={styles.serviceName1}>{item.service?.Name}</Text>
          <Text style={styles.rating}>
            ⭐ {item.provider.averageRating.toFixed(1)}
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
      </View>
    );
  };
  const handleBookingPress = async (item) => {
    console.log("test");
    navigation.navigate("BookingScreen", {
      serviceProposal: item, // Pass the entire service proposal
      provider: item.provider, // Pass the provider details
    });
  };
  const handleServicePress = (item) => {
    navigation.navigate("FilteredProposals", {
      filterType: "service",
      filterId: item._id,
    });
  };

  return (
    <View style={styles.container}>
      <FlatList
        ListHeaderComponent={
          <>
            <View style={styles.Header}>
              <Text style={styles.HeaderText}>JobLik</Text>
            </View>

            {/* Popular Services Section */}
            <Text style={styles.headerTextServices}>Popular services🚀</Text>
            <FlatList
              ref={flatListRef}
              data={services}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.imageWrapper}
                  onPress={() => handleServicePress(item)}
                >
                  <Text style={styles.TextService}>{item.Name}</Text>
                  <Image
                    source={{ uri: `${BaseUrl}/` + item.Photo }}
                    style={styles.carouselImage}
                  />
                </TouchableOpacity>
              )}
              getItemLayout={(data, index) => ({
                length: width * 0.6 + 10, // Width of each item + margin
                offset: (width * 0.6 + 10) * index,
                index,
              })}
            />
  
            {/* Categories Section */}
            <Text style={styles.headerTextCategories}>Categories📌</Text>
            <View style={styles.container1}>

            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={categories}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => item._id.toString()}
            />

            {/* Newest Proposals Section */}
            <Text style={styles.headerTextCategories}>Newest Proposals 📢 </Text>
</View>
          </>
          
        }

        data={proposals}
        keyExtractor={(item) => item._id}
        renderItem={renderProposalItem}
        contentContainerStyle={styles.listContainer}
      />

    </View>

  );
  
}
const styles = StyleSheet.create({

  headerTextServices: {
    position: "absolute",
    top: 90,
    left: 10,
    fontSize: 23,
    fontWeight: "bold",
    color: "black",
    textAlign: "left",
  },
  headerTextCategories: {
    marginTop: 10,
    marginBottom: 5,
    left: 10,
    fontSize: 21,
    fontWeight: "bold",
    color: "black",
    textAlign: "left",
  },
  listContainer: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: "100%",
    alignSelf: "center"
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginVertical: 6,
    marginHorizontal: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
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

  TextService: {
    fontSize: 20,
    position: "relative",
    left: 15,
    top: 110,
    zIndex: 100,
    color: "white",
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 2, height: 1 },
    textShadowRadius: 4,
  },

  // Home screen container
  container: {
    backgroundColor: colors.PERFECT_GRAY,
    flex: 1,
    width: "111%",
    alignSelf: "center",
        marginTop: -10,

  },
  // logo
  Header: {
    backgroundColor: colors.PRIMARY,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: Dimensions.get("window").height * 0.105,
  },
  HeaderText: {
    color: colors.WHITE,
    fontWeight: "bold",
    fontSize: 30,
    marginLeft: 20,
    marginTop: 35,
    marginBottom: 15,
  },
  logoAvatar: {
    width: 50,
    height: 50,
    marginTop: 35,
    marginBottom: 15,
  },
  slogan: {
    fontSize: 15,
    fontFamily: "serif",
    fontWeight: "bold",
    color: "#3d3d3d",
  },

  //services scroll
  servicesList: {
    marginTop: 5,
    flexDirection: "row",
  },

  carouselImage: {
    width: width * 0.6,
    height: width * 0.6 * 0.56,
    borderRadius: 15,
    resizeMode: "cover",
  },
  imageWrapper: {
    margin: 5,
    marginTop: 30,
  },

  // Categories List
  categoriesText: {
    alignSelf: "flex-start",
    fontFamily: "serif",
    marginBottom: 20,
    paddingHorizontal: 8,
    fontSize: 14,
    color: "#000",
  },

  imageContainer: {
    justifyContent: "center",
    alignItems: "center",
    height: 60,
    width: 60,
    borderRadius: 50,
    marginHorizontal: 10,
    backgroundColor: colors.WHITE,
    borderColor: "#ddd",
    elevation: 2,
  },
  categoryItem: {
    alignItems: "center", // Centers content
  },
  categoryImage: {
    width: 40, // Adjust size as needed
    height: 40,
    backgroundColor: colors.WHITE,
    padding: 10,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "black",
    textAlign: "center", // Ensures one-line text is centered
    marginTop: 5, // Space between image and text
  },
  calendarIconContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
});
