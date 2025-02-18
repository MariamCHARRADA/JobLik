import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
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
  const scrollIndex = useRef(0);

  // Fetch data functions
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
      const response = await axios.get(`${BaseUrl}/api/proposal/get5Proposals`);
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

  const fetchServices = async () => {
    try {
      const response = await axios.get(`${BaseUrl}/api/services/getServices`);
      setServices(response.data);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const fetchAllData = () => {
    fetchUserData();
    fetchCategories();
    fetchServices();
    fetchProposals();
  };

  useEffect(() => {
    // Initial fetch when component mounts
    fetchAllData();

    // Set up interval to fetch data every 5 seconds (5000ms)
    const interval = setInterval(fetchAllData, 5000);

    // Clean up the interval when component unmounts
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (flatListRef.current && services.length > 0) {
        // Update the scroll index
        scrollIndex.current = (scrollIndex.current + 1) % services.length;

        // Scroll to the next item
        flatListRef.current.scrollToIndex({
          index: scrollIndex.current,
          animated: true,
          viewPosition: 0.5, // Centers the item
        });
      }
    }, 1500); // Auto-scroll every 1.5 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, [services]);

  // Render functions
  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() =>
        navigation.navigate("FilteredProposals", {
          filterType: "category",
          filterId: item._id,
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

        <Text style={styles.serviceName1}>{item?.title}</Text>
        <Text style={styles.providerName}>
          {item.provider?.firstName} {item.provider?.lastName}
        </Text>

        <Text style={styles.rating}>
          ⭐ {item.provider?.averageRating.toFixed(1)}
        </Text>
        <Text style={styles.price}>{item.price} TND</Text>
      </View>
      <TouchableOpacity
        onPress={() => handleBookingPress(item)}
        style={styles.calendarIconContainer}
      >
        <Icon name="calendar" size={28} color={colors.DARK} marginRight="15" />
      </TouchableOpacity>
    </View>
  );

  const handleBookingPress = async (item) => {
    navigation.navigate("BookingScreen", {
      serviceProposal: item,
      provider: item.provider,
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
                length: width * 0.6 + 10,
                offset: (width * 0.6 + 10) * index,
                index,
              })}
            />
            {/* Categories Section */}
            <Text style={styles.headerTextCategories}>Categories📌</Text>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={categories}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => item._id.toString()}
            />

            {/* Newest Proposals Section */}
            <Text style={styles.headerTextCategories}>Proposals Feed 📢</Text>
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
    alignSelf: "center",
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
    fontSize: 14,
    color: "#777",
    textAlign: "left",
    fontStyle: "italic",
  },
  serviceName2: {
    fontSize: 14,
    color: "black",
    textAlign: "left",
  },
  serviceName1: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  rating: {
    fontSize: 14,
    color: "#666",
  },
  price: {
    fontSize: 14,
    color: colors.GREEN,
    fontWeight: "bold",
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
  container: {
    backgroundColor: colors.PERFECT_GRAY,
    flex: 1,
    width: "111%",
    alignSelf: "center",
    marginTop: -10,
  },
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
    alignItems: "center",
  },
  categoryImage: {
    width: 40,
    height: 40,
    backgroundColor: colors.WHITE,
    padding: 10,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "black",
    textAlign: "center",
    marginTop: 5,
  },
  calendarIconContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
});
