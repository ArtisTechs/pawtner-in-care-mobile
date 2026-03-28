import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { useEffect } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

import { AuthNavigationGate } from "@/components/auth-navigation-gate";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthProvider } from "@/providers/auth-provider";

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    "Frankfurter-Regular": require("../assets/fonts/Franxurter-w11D9.ttf"),
    "SourceSansPro-Regular": require("../assets/fonts/SourceSansPro-Regular.otf"),
    "SourceSansPro-SemiBold": require("../assets/fonts/SourceSansPro-Semibold.otf"),
    "SourceSansPro-Black": require("../assets/fonts/SourceSansPro-Black.otf"),
  });

  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? "dark" : "light";
  const themeColors = Colors[theme];

  useEffect(() => {
    if (fontsLoaded || fontError) {
      void SplashScreen.hideAsync();
    }
  }, [fontError, fontsLoaded]);

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(themeColors.background);
  }, [themeColors.background]);

  if (fontError) {
    throw fontError;
  }

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AuthProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider value={theme === "dark" ? DarkTheme : DefaultTheme}>
          <View style={{ flex: 1, backgroundColor: themeColors.background }}>
            <AuthNavigationGate />
            <Stack
              screenOptions={{
                contentStyle: { backgroundColor: themeColors.background },
                headerShown: false,
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="events" />
              <Stack.Screen name="volunteer" />
              <Stack.Screen name="donations" />
              <Stack.Screen name="modal" options={{ presentation: "modal" }} />
            </Stack>
            <StatusBar style="auto" />
          </View>
        </ThemeProvider>
      </GestureHandlerRootView>
    </AuthProvider>
  );
}
