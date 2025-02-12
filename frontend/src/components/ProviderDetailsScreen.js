import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Linking,
} from "react-native";
import axios from "axios";
import { BaseUrl } from "../../config/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import colors from "../../utils/colors";
import Ionicons from "react-native-vector-icons/Ionicons";
import Icon from "react-native-vector-icons/FontAwesome";

const ProviderDetailsScreen = ({ route, navigation }) => {
  const { provider } = route.params; // Get the providerId from the navigation params
  const [proposals, setProposals] = useState([]);
  const [comments, setComments] = useState([]); // State to store comments
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0); // Default rating value
  const [isCommenting, setIsCommenting] = useState(false); // To handle loading state for comment submission

  useEffect(() => {
    fetchServiceProposals();
    fetchProviderComments(); // Fetch comments when the component mounts
  }, []);

  const fetchServiceProposals = async () => {
    try {
      const response = await axios.get(
        `${BaseUrl}/api/proposal/provider/${provider._id}`
      );
      setProposals(response.data);
    } catch (error) {
      console.error("Error fetching service proposals:", error);
    }
    setLoading(false);
  };

  const fetchProviderComments = async () => {
    try {
      const response = await axios.get(
        `${BaseUrl}/api/users/${provider._id}/profile`
      );
      setComments(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleBookingPress = (item) => {
    navigation.navigate("BookingScreen", {
      serviceProposal: item, // Pass the entire service proposal
      provider: item.provider, // Pass the provider details
    });
  };

  const handleAddComment = async () => {
    if (!comment || rating <= 0) {
      alert("Please add a comment and provide a rating.");
      return;
    }
    const token = await AsyncStorage.getItem("Token");
    const Token = JSON.parse(token);
    // Check if the token exists
    if (!token) {
      alert("You need to be logged in to add a comment.");
      return;
    }
    setIsCommenting(true);

    try {
      const response = await axios.post(
        `${BaseUrl}/api/users/${provider._id}/comments`,
        {
          comment,
          rating,
        },
        {
          headers: {
            Authorization: `Bearer ${Token}`, // Add token to the headers
          },
        }
      );
      alert("Comment added successfully!");
      setComment(""); // Reset the input after submission
      setRating(0); // Reset the rating after submission
      fetchProviderComments(); // Refresh the comments list
    } catch (error) {
      console.error("Error submitting comment:", error);
      alert("Failed to add comment. Please try again.");
    }

    setIsCommenting(false);
  };
  const renderStars = (selectedRating) => {
    let stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity key={i} onPress={() => setRating(i)}>
          <Ionicons
            name={i <= selectedRating ? "star" : "star-outline"}
            size={16}
            color={i <= selectedRating ? "#FFD700" : "#D3D3D3"}
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <ActivityIndicator size="large" color={colors.PRIMARY} marginTop="100" />
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons
            name="arrow-back"
            size={24}
            color={colors.DARKER}
            style={{  left: -155, position: "absolute", top: 10 }}
          />
        </TouchableOpacity>

        {/* Provider Details */}
        <View style={styles.providerRow}>
          <Image
            source={
              provider?.Photo
                ? { uri: `${BaseUrl}/` + provider.Photo }
                : require("../../assets/avatar.png")
            }
            style={styles.providerImage}
          />
          <View style={styles.providerDetails}>
            <Text style={styles.providerName}>
              {provider.firstName} {provider.lastName}
            </Text>
            <Text style={styles.providerInfo}>📞 {provider.phone}</Text>
            <Text style={styles.providerInfo}>📍 {provider.city}</Text>

            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={15} color="#FFD700" />
              <Text style={styles.ratingText}>
                {provider.averageRating.toFixed(1)}
              </Text>
            </View>
          </View>
        </View>

        {/* Service Proposals Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Service Proposals</Text>
          <FlatList
            data={proposals}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.proposalCard}
                onPress={() => handleBookingPress(item)}
              >
                <Text style={styles.proposalTitle}>{item.title}</Text>
                <Text style={styles.proposalDescription}>
                  {item.description}
                </Text>
                <Text style={styles.proposalPrice}>{item.price} TND</Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Comments Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Reviews</Text>
          {comments.comments?.length > 0 ? (
            comments.comments.map((comment) => (
              <View key={comment._id} style={styles.commentContainer}>
                <Image
                  source={
                    comment.clientId?.Photo
                      ? { uri: `${BaseUrl}/` + comment.clientId.Photo }
                      : require("../../assets/avatar.png")
                  }
                  style={styles.profileImage}
                />
                <View style={styles.commentContent}>
                  <Text style={styles.commentClient}>
                    {comment.clientId?.firstName || "Unknown"}{" "}
                    {comment.clientId?.lastName || "User"}
                  </Text>
                  <View style={styles.ratingContainer}>
                    {renderStars(comment.rating || 0)}
                  </View>
                  <Text style={styles.commentText}>{comment.comment}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noComments}>
              No comments available for this provider.
            </Text>
          )}
          {/* Add Comment Section */}
          <View style={styles.addCommentSection}>
            <Text style={styles.sectionTitle}>Add A Review :</Text>
            <TextInput
              style={styles.commentInput}
              placeholder="Write your review here..."
              placeholderTextColor="#999"
              value={comment}
              onChangeText={setComment}
              multiline
            />
            <View style={styles.starRatingContainer}>
              <Text style={styles.ratingLabel}>Rate this provider:</Text>
              <View style={styles.starsContainer}>{renderStars(rating)}</View>
            </View>
            <TouchableOpacity
              style={styles.addCommentButton}
              onPress={handleAddComment}
              disabled={isCommenting}
            >
              {isCommenting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.addCommentButtonText}>Post</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.LIGHT_GRAY,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  providerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.PERFECT_GRAY,
    padding: 22,
    borderRadius: 20,
    marginVertical: 10,
    elevation: 2,
    width: "99%",
    alignSelf: "center",
  },
  providerImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 15,
  },
  providerDetails: {
    flex: 1,
  },
  providerName: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.DARKER,
  },
  providerInfo: {
    fontSize: 14,
    color: colors.BLACK,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 14,
    color: colors.DARK,
    marginLeft: 4,
  },
  priceDescriptionContainer: {
    marginBottom: 20,
  },
  price: {
    fontSize: 15,
    fontWeight: "bold",
    color: colors.GREEN,
    textAlign: "right",
    marginRight: 10,
  },
  description: {
    fontSize: 14,
    color: colors.BLACK,
    textAlign: "left",
    marginLeft: 10,
  },
  commentsSection: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.DARK,
    marginBottom: 20,
  },

  commentContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.WHITE,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    elevation: 1,
    marginHorizontal: 2,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 50,
    marginRight: 10,
  },
  commentContent: {
    flex: 1,
  },
  commentClient: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.DARKER,
  },
  commentText: {
    fontSize: 14,
    color: colors.BLACK,
    marginTop: 5,
  },
  noComments: {
    fontSize: 14,
    color: colors.DARK,
    textAlign: "center",
  },
  addCommentSection: {
    marginTop: 10,
    width: "100%",
  },
  commentInput: {
    backgroundColor: colors.WHITE,
    borderRadius: 10,
    borderWidth: 1,
    height: 100,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    textAlignVertical: "top",
  },
  starRatingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  ratingLabel: {
    fontSize: 14,
    color: colors.DARK,
    marginRight: 10,
  },
  starsContainer: {
    flexDirection: "row",
  },
  addCommentButton: {
    backgroundColor: colors.PRIMARY,
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    marginBottom: 20
  },
  addCommentButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.WHITE,
  },
  card: {
    backgroundColor: colors.PERFECT_GRAY,
    borderRadius: 17,
    padding: 15,
    marginVertical: 10,
    elevation: 2,
    width: "99%",
    alignSelf: "center",
  },
  proposalCard: {
    width: "99%",
    alignSelf: "center",
    backgroundColor: colors.WHITE,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  proposalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.DARKER,
    marginBottom: 5,
  },
  proposalDescription: {
    fontSize: 14,
    color: colors.BLACK,
  },
  proposalPrice: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "bold",
    color: colors.GREEN,
    alignSelf: "flex-end",
  },
});

export default ProviderDetailsScreen;
