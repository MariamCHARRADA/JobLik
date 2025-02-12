import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  TextInput,
} from "react-native";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { BaseUrl } from "../../config/config";
import { Ionicons } from "@expo/vector-icons"; // For icons
import colors from "../../utils/colors";

const ServiceSearchScreen = () => {
  const [categories, setCategories] = useState([]);
  const [serviceProviders, setServiceProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState("categories");
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [searchText, setSearchText] = useState("");
  const navigation = useNavigation();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BaseUrl}/api/categories/getCategories`);
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
    setLoading(false);
  };

  const fetchServiceProviders = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BaseUrl}/api/users/serviceProviders`);
      setServiceProviders(response.data);
    } catch (error) {
      console.error("Error fetching service providers:", error);
    }
    setLoading(false);
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const filteredCategories = categories.filter((category) =>
    category.Name.toLowerCase().includes(searchText.toLowerCase())
  );

  const filteredServiceProviders = serviceProviders.filter((provider) =>
    `${provider.firstName} ${provider.lastName}`
      .toLowerCase()
      .includes(searchText.toLowerCase())
  );

  const renderCategory = ({ item }) => (
    <View style={styles.categoryContainer}>
      <TouchableOpacity
        onPress={() => toggleCategory(item._id)}
        style={styles.category}
      >
        <Image
          source={
            item.Photo
              ? { uri: `${BaseUrl}/` + item.Photo }
              : require("../../assets/avatar.png")
          }
          style={styles.CatImage}
        />
        <Text style={styles.categoryText}>{item.Name}</Text>
        <Ionicons
          name={expandedCategory === item._id ? "chevron-up" : "chevron-down"}
          size={20}
          color="#666"
        />
      </TouchableOpacity>

      {expandedCategory === item._id && (
        <View style={styles.servicesContainer}>
          {item.Services.map((service) => (
            <TouchableOpacity
              key={service._id}
              onPress={() =>
                navigation.navigate("ServiceProposalsScreen", {
                  serviceId: service._id,
                  serviceName: service.Name,
                })
              }
              style={styles.serviceItem}
            >
              <Text style={styles.serviceText}>{service.Name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const renderServiceProvider = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("ProviderDetailsScreen", { provider: item })
      }
      style={styles.card}
    >
      <Image
        source={
          item.Photo
            ? { uri: `${BaseUrl}/` + item.Photo }
            : require("../../assets/avatar.png")
        }
        style={styles.providerImage}
      />
      <View style={styles.details}>
        <Text style={styles.providerName}>
          {item.firstName} {item.lastName}
        </Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.rating}>{item.averageRating.toFixed(1)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
        />
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          onPress={() => {
            setSelectedTab("categories");
            fetchCategories();
          }}
          style={[
            styles.tab,
            selectedTab === "categories" && styles.activeTab,
          ]}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === "categories" && styles.activeTabText,
            ]}
          >
            Categories
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setSelectedTab("providers");
            fetchServiceProviders();
          }}
          style={[styles.tab, selectedTab === "providers" && styles.activeTab]}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === "providers" && styles.activeTabText,
            ]}
          >
            Service Providers
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <ActivityIndicator size="large" color={colors.PRIMARY} />
      ) : (
        <FlatList
          data={
            selectedTab === "categories"
              ? filteredCategories
              : filteredServiceProviders
          }
          renderItem={
            selectedTab === "categories" ? renderCategory : renderServiceProvider
          }
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.LIGHT_GRAY,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginHorizontal: 15,
    marginTop: 50,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  searchIcon: {
    marginLeft: 8,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: colors.PRIMARY,
  },
  tabText: {
    fontSize: 17,
    color: "#666",
  },
  activeTabText: {
    color: colors.PRIMARY,
    fontWeight: "bold",
  },
  categoryContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    marginBottom: 10,
    elevation: 1,
    marginHorizontal: 10,
  },
  category: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
  },
  CatImage: {
    width: 50,
    height: 50,
    marginRight: 15,
  },
  categoryText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  servicesContainer: {
    marginLeft: 40,
    marginBottom: 40,
    marginRight: 40,
  },
  serviceItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomColor: colors.PRIMARY,
    borderBottomWidth: 1,
  },
  serviceText: {
    fontSize: 14,
    color: "#666",
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
  providerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  details: {
    flex: 1,
  },
  providerName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rating: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  listContent: {
    paddingBottom: 20,
  },
});

export default ServiceSearchScreen;