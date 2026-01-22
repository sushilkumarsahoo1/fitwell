import { COLORS } from "@constants/index";
import { useAuth } from "@context/AuthContext";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
    DashboardScreen,
    FoodLoggingScreen,
    ProgressScreen,
    SettingsScreen,
    WorkoutLoggingScreen,
} from "@screens/app";
import { SignInScreen, SignUpScreen } from "@screens/auth";
import {
    ActivityLevelScreen,
    FitnessGoalScreen,
    ProfileSetupScreen,
} from "@screens/onboarding";
import React from "react";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const AuthStack = () => {
  const [authScreen, setAuthScreen] = React.useState<"signin" | "signup">(
    "signin",
  );

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {authScreen === "signin" ? (
        <Stack.Screen name="SignIn">
          {() => (
            <SignInScreen
              onSuccess={() => setAuthScreen("signin")}
              onNavigateToSignUp={() => setAuthScreen("signup")}
            />
          )}
        </Stack.Screen>
      ) : (
        <Stack.Screen name="SignUp">
          {() => (
            <SignUpScreen
              onSuccess={() => setAuthScreen("signin")}
              onNavigateToSignIn={() => setAuthScreen("signin")}
            />
          )}
        </Stack.Screen>
      )}
    </Stack.Navigator>
  );
};

const OnboardingStack = () => {
  const [step, setStep] = React.useState<"profile" | "goal" | "activity">(
    "profile",
  );

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {step === "profile" && (
        <Stack.Screen name="ProfileSetup">
          {() => <ProfileSetupScreen onSuccess={() => setStep("goal")} />}
        </Stack.Screen>
      )}
      {step === "goal" && (
        <Stack.Screen name="FitnessGoal">
          {() => <FitnessGoalScreen onSuccess={() => setStep("activity")} />}
        </Stack.Screen>
      )}
      {step === "activity" && (
        <Stack.Screen name="ActivityLevel">
          {() => <ActivityLevelScreen onSuccess={() => setStep("profile")} />}
        </Stack.Screen>
      )}
    </Stack.Navigator>
  );
};

const AppStack = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.neutral.text,
        tabBarStyle: {
          borderTopColor: COLORS.neutral.border,
          backgroundColor: "white",
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginTop: -4,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>🏠</Text>
          ),
        }}
        component={DashboardScreen}
      />

      <Tab.Screen
        name="Food"
        options={{
          tabBarLabel: "Food",
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>🍎</Text>
          ),
        }}
        component={FoodLoggingScreen}
      />

      <Tab.Screen
        name="Workout"
        options={{
          tabBarLabel: "Workout",
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>💪</Text>
          ),
        }}
        component={WorkoutLoggingScreen}
      />

      <Tab.Screen
        name="Progress"
        options={{
          tabBarLabel: "Progress",
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>📊</Text>
          ),
        }}
      >
        {() => <ProgressScreen />}
      </Tab.Screen>

      <Tab.Screen
        name="Settings"
        options={{
          tabBarLabel: "Settings",
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>⚙️</Text>
          ),
        }}
      >
        {() => <SettingsScreen />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <Text>Loading...</Text>
  </View>
);

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, profile, loading, profileFetched } = useAuth();

  const isProfileComplete = !!(
    profile &&
    profile.name &&
    profile.age &&
    profile.height_cm &&
    profile.weight_kg &&
    profile.gender &&
    profile.activity_level &&
    profile.fitness_goal
  );

  if (loading || (isAuthenticated && !profileFetched)) {
    return (
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Loading"
            options={{ headerShown: false }}
            component={LoadingScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthStack} />
        ) : !isProfileComplete ? (
          <Stack.Screen name="Onboarding" component={OnboardingStack} />
        ) : (
          <Stack.Screen name="App" component={AppStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

import { Text, View } from "react-native";
