import React, { useEffect, useState } from "react";
import { StyleSheet, View, Image, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProviderDetailsScreen from "./src/components/ProviderDetailsScreen";

import LoginForm from "./src/components/loginForm";
import RegisterForm from "./src/components/RegisterForm";
import HomeScreen from "./src/components/homeScreen";
import ServiceProposalsScreen from "./src/components/ServiceProposalsScreen";
import BookingScreen from "./src/components/BookingScreen";
import ProfileScreen from "./src/components/profileScreen";
import SearchScreen from "./src/components/searchScreen";
import AddServiceProposalScreen from "./src/components/AddServiceProposalScreen";
import { NavigationContainer } from "@react-navigation/native";
import ProfileDetails from "./src/components/profileDetails";
import FilteredProposalsScreen from "./src/components/FilteredProposalsScreen";
import ClientReservationsScreen from "./src/components/ClientReservationsScreen";
import ServiceProviderReservationsScreen from "./src/components/ServiceProviderReservationsScreen";

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";
import colors from "./utils/colors";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeTabNavigator() {
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem("userData");
        if (storedUserData) {
          const parsedUserData = JSON.parse(storedUserData);
          setUserRole(parsedUserData.role);
        }
      } catch (error) {
        console.error("Error fetching user data", error);
      }
    };

    getUserData();
  }, []);
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 70,
          backgroundColor: "black",
          paddingBottom: 5,
        },
        tabBarLabel: () => null, // This effectively hides the label
        tabBarHideOnKeyboard: true, // Ensures tab bar does hide on keyboard appearance
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name="home-outline"
              size={size}
              color={focused ? colors.PRIMARY : "gray"}
            />
          ),
        }}
      />
      {userRole === "serviceProvider" && (
        <Tab.Screen
          name="AddProposal"
          component={AddServiceProposalScreen}
          options={{
            tabBarIcon: ({ focused, size }) => (
              <Ionicons
                name="add-circle-outline"
                size={size}
                color={focused ? colors.PRIMARY : "gray"}
              />
            ),
          }}
        />
      )}

      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name="search-outline"
              size={size}
              color={focused ? colors.PRIMARY : "gray"}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Account"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name="person-outline"
              size={size}
              color={focused ? colors.PRIMARY : "gray"}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen // The one that comes first
          name="Login"
          component={LoginForm}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Register"
          component={RegisterForm}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ServiceProposalsScreen"
          component={ServiceProposalsScreen}
          options={{ title: "Service Proposals" }}
        />
        <Stack.Screen
          name="BookingScreen"
          component={BookingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ProviderDetailsScreen"
          component={ProviderDetailsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="FilteredProposals"
          component={FilteredProposalsScreen}
          options={{
            title: "Filtered Proposals",
            headerTintColor: colors.DARKER,
          }}
        />
        <Stack.Screen
          name="ClientReservations"
          component={ClientReservationsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ServiceProviderReservations"
          component={ServiceProviderReservationsScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Acceuil"
          component={HomeTabNavigator}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="ProfData"
          component={ProfileDetails}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
