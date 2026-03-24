import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { useEffect } from "react";
import { View } from "react-native";
import "react-native-reanimated";

import { AuthNavigationGate } from "@/components/auth-navigation-gate";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthProvider } from "@/providers/auth-provider";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? "dark" : "light";
  const themeColors = Colors[theme];

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(themeColors.background);
  }, [themeColors.background]);

  return (
    <AuthProvider>
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
            <Stack.Screen name="modal" options={{ presentation: "modal" }} />
          </Stack>
          <StatusBar style="auto" />
        </View>
      </ThemeProvider>
    </AuthProvider>
  );
}
