import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  ScrollView,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { BaseUrl } from "../../config/config";
import { Calendar } from "react-native-calendars";
import moment from "moment";
import AsyncStorage from "@react-native-async-storage/async-storage";
import colors from "../../utils/colors"; // Your custom color palette
import { Ionicons } from "@expo/vector-icons"; // For icons

const BookingScreen = ({ route, navigation }) => {
  const { serviceProposal, provider } = route.params;
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [selectedTime, setSelectedTime] = useState(null);
  const [userData, setUserData] = useState(null);
  const [comment, setComment] = useState(""); // Use only one state for the comment
  const [comments, setComments] = useState([]);
  const [rating, setRating] = useState(0); // Default rating value
  const [isCommenting, setIsCommenting] = useState(false); // To handle loading state for comment submission

  useEffect(() => {
    fetchProviderComments(); // Fetch comments when the component mounts
  }, []);

  // Render interactive star rating
  const renderStars = (selectedRating) => {
    let stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity key={i} onPress={() => setRating(i)}>
          <Ionicons
            name={i <= selectedRating ? "star" : "star-outline"}
            size={15}
            color={i <= selectedRating ? "#FFD700" : "#D3D3D3"}
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem("userData");
        const UserData1 = JSON.parse(userData);
        setUserData(UserData1);
      } catch (e) {
        console.log("error fetching user data", e);
      }
    };

    fetchUserData();
  }, []);

  // Fetch provider comments from the backend
  const fetchProviderComments = async () => {
    try {
      const response = await axios.get(
        `${BaseUrl}/api/users/${provider._id}/profile`
      );
      setComments(response.data.comments || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const onDaySelect = async (day) => {
    const dateString = moment(day.dateString).format("YYYY-MM-DD");
    setSelectedDate(dateString);
    setSelectedTime(null); // Reset selected time when a new day is selected

    try {
      const response = await axios.get(
        `${BaseUrl}/api/reservations/${provider._id}/availability`,
        {
          params: { date: dateString },
        }
      );
      console.log("Available Times:", response.data.slots); // Debugging

      const slots = response.data.slots;
      if (slots && slots.length > 0) {
        setAvailableTimes(slots);
        setShowTimeModal(true);
      } else {
        console.error("No slots available or error fetching slots");
      }
    } catch (error) {
      console.error("Error fetching available times:", error);
    }
  };

  const onTimeSelect = (time) => {
    setSelectedTime(time);
  };

  const handleProfilePress = async () => {
    navigation.navigate("ProviderDetailsScreen", {
      provider: provider
    });
  };

  const createReservation = async () => {
    // Check if the user is trying to book their own service
    if (userData._id === provider._id) {
      Alert.alert("Sorry,", "You cannot book your own service.");
      return;
    }
    try {
       const response = await axios.post(
        `${BaseUrl}/api/reservations/createReservation`,
        {
          Date: selectedDate,
          Time: selectedTime,
          ServiceProposal: serviceProposal._id,
          ServiceProvider: provider._id,
          Client: userData._id,
        }
      );

      console.log("Reservation created:", response.data);

      // Update availableTimes to mark the selected slot as "confirmed"
      const updatedTimes = availableTimes.map((slot) =>
        slot.time === selectedTime ? { ...slot, status: "confirmed" } : slot
      );
      setAvailableTimes(updatedTimes);

      // Show success message
      Alert.alert(
        "Reservation Pending 🕒",
        `Your reservation is on its way to ${provider.firstName}! ${provider.firstName} will confirm soon. Don’t worry, it’s worth the wait! 😊`,
        [
          {
            text: "Got it!",
            onPress: () => {
              setSelectedTime(null); // Reset selected time
              setShowTimeModal(false); // Close the modal
            },
          },
        ]
      );

    }
    catch (error) {
          console.log("now");
             Alert.alert(
                 "Oops! 😅",
                 "This slot is already booked! Please pick another one."
             );
        
    }
  };
  const handleAddComment = async () => {
    if (!comment || rating <= 0) {
      Alert.alert("Error", "Please add a comment and provide a rating.");
      return;
    }

    const token = await AsyncStorage.getItem("Token");
    const Token = JSON.parse(token);

    if (!token) {
      Alert.alert("Error", "You need to be logged in to add a comment.");
      return;
    }

    setIsCommenting(true);

    try {
      const response = await axios.post(
        `${BaseUrl}/api/users/${provider?._id}/comments`,
        {
          comment,
          rating,
          clientId: userData?._id,
        },
        {
          headers: {
            Authorization: `Bearer ${Token}`,
          },
        }
      );

      // Update the comments state with the new comment
      const newCommentData = {
        _id: response.data._id, // Ensure the backend returns the new comment ID
        comment: comment,
        rating: rating,
        clientId: {
          _id: userData?._id,
          firstName: userData?.firstName,
          lastName: userData?.lastName,
          Photo: userData?.Photo,
        },
      };
      setComments([...comments, newCommentData]);

      // Clear the input and reset the rating
      setComment("");
      setRating(0);

      Alert.alert("Success", "Your comment has been added!");
    } catch (error) {
      console.error("Error adding comment:", error);
      Alert.alert("Error", "Failed to add comment. Please try again.");
    }

    setIsCommenting(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons
            name="arrow-back"
            size={24}
            color={colors.DARKER}
            style={{ marginTop: 5 }}
          />
        </TouchableOpacity>
        {/* Provider Details */}
        <View style={styles.providerRow}>
          <TouchableOpacity onPress={handleProfilePress}>
            <Image
              source={
                provider?.Photo
                  ? { uri: `${BaseUrl}/` + provider.Photo }
                  : require("../../assets/avatar.png")
              }
              style={styles.providerImage}
            />
          </TouchableOpacity>

          <View style={styles.providerDetails}>
          <TouchableOpacity onPress={handleProfilePress}>

            <Text style={styles.providerName}>
              {provider.firstName} {provider.lastName}
            </Text>
            </TouchableOpacity>
            <Text style={styles.providerInfo}>📞 {provider.phone}</Text>
            <Text style={styles.providerInfo}>📍 {provider?.address}</Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>
                {provider.averageRating.toFixed(1)}
              </Text>
            </View>
          </View>
        </View>

        {/* Price and Description */}
        <View style={styles.priceDescriptionContainer}>
          <Text style={styles.price}>{serviceProposal.price} TND</Text>
          <Text style={styles.title}>{serviceProposal.title}</Text>
          <Text style={styles.description}>{serviceProposal.description}</Text>
        </View>

        {/* Calendar */}
        <View style={styles.calendarContainer}>
          <Calendar
            onDayPress={onDaySelect}
            markedDates={{
              [moment(selectedDate).format("YYYY-MM-DD")]: { selected: true },
            }}
            theme={{
              backgroundColor: colors.WHITE,
              calendarBackground: colors.WHITE,
              textSectionTitleColor: colors.DARK,
              selectedDayBackgroundColor: colors.PRIMARY,
              selectedDayTextColor: colors.WHITE,
              todayTextColor: colors.PRIMARY,
              dayTextColor: colors.BLACK,
              textDisabledColor: colors.LIGHT_GRAY,
              arrowColor: colors.PRIMARY,
              monthTextColor: colors.DARKER,
              textDayFontWeight: "500",
              textMonthFontWeight: "bold",
              textDayHeaderFontWeight: "500",
            }}
          />
        </View>

        {/* Time Slot Modal */}
        <Modal
          visible={showTimeModal}
          onRequestClose={() => setShowTimeModal(false)}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setShowTimeModal(false)}
              >
                <Ionicons name="arrow-back" size={24} color={colors.DARKER} />
              </TouchableOpacity>
              <FlatList
                numColumns={3}
                data={availableTimes}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.timeSlot,
                      selectedTime === item.time && styles.timeSlotSelected,
                      item.status === "confirmed" && styles.timeSlotConfirmed,
                    ]}
                    onPress={() =>
                      item.status !== "confirmed" && onTimeSelect(item.time)
                    }
                    disabled={item.status === "confirmed"}
                  >
                    <Text style={styles.timeSlotText}>{item.time}</Text>
                  </TouchableOpacity>
                )}
              />
              {selectedTime && (
                <TouchableOpacity
                  onPress={createReservation}
                  style={styles.bookButton}
                >
                  <Text style={styles.bookButtonText}>Book Now</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Modal>

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <Text style={styles.sectionTitle}>Reviews</Text>
          {comments.length > 0 ? (
            comments.map((comment, index) => (
              <View key={index} style={styles.commentContainer}>
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
  },
  providerImage: {
    width: 80,
    height: 80,
    borderRadius: 50,
    marginRight: 15,
    marginLeft: 50,
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
    marginVertical: 20,
    backgroundColor: colors.PERFECT_GRAY,
    borderRadius: 15,
    paddingBottom: 25,
    elevation: 1,
    width: "98%",
    padding: 15,
    alignSelf: "center",
  },
  price: {
    fontSize: 15,
    fontWeight: "bold",
    color: colors.GREEN,
    textAlign: "right",
    marginRight: 10,
  },
  title: {
    position: "absolute",
    top: 13,
    left: 25,
    fontSize: 18,
    fontWeight: "bold",
  },
  description: {
    fontSize: 14,
    color: colors.BLACK,
    textAlign: "left",
    marginLeft: 10,
    marginTop: 10,
  },
  calendarContainer: {
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: colors.WHITE,
    borderRadius: 15,
    paddingTop: 30,
    padding: 16,
    width: "70%",
    height: "32%",
  },
  backButton: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 1,
  },

  timeSlot: {
    width: "28%",
    padding: 8,
    backgroundColor: colors.LIGHT_GRAY,
    margin: 5,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  timeSlotText: {
    fontSize: 14,
    color: colors.BLACK,
  },
  timeSlotSelected: {
    borderColor: colors.PRIMARY,
    borderWidth: 1,
  },
  timeSlotConfirmed: {
    backgroundColor: colors.LIGHTER_GRAY,
  },
  bookButton: {
    backgroundColor: colors.PRIMARY,
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    marginTop: 16,
  },
  bookButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.WHITE,
  },
  commentsSection: {
    marginTop: 10,
    backgroundColor: colors.PERFECT_GRAY,
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: "98%",
    alignItems: "center",
    alignSelf: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.DARKER,
    marginBottom: 10,
  },
  commentContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.WHITE,
    borderRadius: 10,
    padding: 10,
    marginBottom: 9,
    elevation: 1,
    marginHorizontal: 2,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 50,
    marginRight: 10,
    marginTop: 5,
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
    color: colors.BLACK,
    textAlign: "center",
    marginBottom: 10,
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
  },
  addCommentButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.WHITE,
  },
});

export default BookingScreen;
