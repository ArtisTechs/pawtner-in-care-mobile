import { FullScreenLoader } from "@/components/ui/full-screen-loader";
import { GlowingCircle } from "@/components/ui/glowing-circle";
import { Colors, RoundedFontFamily } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { authStorage } from "@/services/auth/auth.storage";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function GetStarted() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { session } = useAuth();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [isFirstLoginVariant, setIsFirstLoginVariant] = useState(false);
  const [isVariantReady, setIsVariantReady] = useState(false);

  const firstName = session?.user.firstName?.trim() ?? "";
  const lastName = session?.user.lastName?.trim() ?? "";
  const displayName =
    `${firstName} ${lastName}`.trim().toUpperCase() || "PAWTNER USER";
  const heroHeight = Math.min(
    560,
    Math.max(340, Math.round((height - insets.top - insets.bottom) * 0.58)),
  );

  useEffect(() => {
    let isMounted = true;

    const resolveVariant = async () => {
      try {
        if (!session?.user.id) {
          if (isMounted) {
            setIsFirstLoginVariant(false);
            setIsVariantReady(true);
          }

          return;
        }

        const hasSeenGetStarted = await authStorage.hasSeenGetStarted(
          session.user.id,
        );

        if (isMounted) {
          setIsFirstLoginVariant(!hasSeenGetStarted);
          setIsVariantReady(true);
        }
      } catch {
        if (isMounted) {
          setIsFirstLoginVariant(false);
          setIsVariantReady(true);
        }
      }
    };

    void resolveVariant();

    return () => {
      isMounted = false;
    };
  }, [session?.user.id]);

  const handleGetStarted = async () => {
    if (session?.user.id) {
      await authStorage.markGetStartedSeen(session.user.id);
    }

    router.replace("/(tabs)");
  };

  if (!isVariantReady) {
    return <FullScreenLoader subtitle="Preparing your welcome screen..." />;
  }

  return (
    <View
      style={[
        styles.screen,
        {
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <LinearGradient
        colors={[
          colors.loginHeaderGradientStart,
          colors.loginHeaderGradientEnd,
        ]}
        style={[
          styles.heroPanel,
          { height: heroHeight, paddingTop: insets.top + 8 },
        ]}
      >
        <View style={styles.heroImageWrap}>
          <GlowingCircle
            size={140}
            glowRadius={50}
            style={styles.heroImageGlow}
          />
          <Image
            source={require("../../assets/images/pet-hugging-2.png")}
            style={styles.heroImage}
            resizeMode="contain"
          />
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <Text style={styles.welcome}>
          {isFirstLoginVariant ? "Find Your Paw" : "Welcome Back! 👋"}
        </Text>
        <Text style={styles.name}>
          {isFirstLoginVariant ? "FRIEND WITH US" : displayName}
        </Text>
        <Text style={styles.subtitle}>
          {
            "Let's start your journey with your beloved pets and enjoy life better"
          }
        </Text>

        <Pressable
          onPress={handleGetStarted}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </Pressable>
      </View>
    </View>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.loginCardBackground,
    },
    heroPanel: {
      width: "100%",
      paddingHorizontal: 10,
      justifyContent: "flex-end",
      alignItems: "center",
      borderBottomRightRadius: 48,
      overflow: "hidden",
    },
    heroImage: {
      width: "100%",
      height: "96%",
    },
    heroImageWrap: {
      width: "100%",
      height: "96%",
      alignItems: "center",
      justifyContent: "flex-end",
    },
    heroImageGlow: {
      position: "absolute",
      bottom: 10,
    },
    content: {
      alignItems: "center",
      paddingHorizontal: 24,
      paddingTop: 28,
      paddingBottom: 28,
      flex: 1,
      justifyContent: "center",
    },
    welcome: {
      fontFamily: RoundedFontFamily,
      color: colors.loginTabText,
      fontSize: 20,
      fontWeight: "800",
      textAlign: "center",
      lineHeight: 30,
    },
    name: {
      fontFamily: "Frankfurter-Regular",
      marginTop: 4,
      color: colors.loginHeaderGradientStart,
      fontSize: 32,
      letterSpacing: 0.6,
      textAlign: "center",
      lineHeight: 40,
    },
    subtitle: {
      fontFamily: RoundedFontFamily,
      marginTop: 18,
      color: colors.loginTabText,
      textAlign: "center",
      fontSize: 14,
      lineHeight: 21,
      maxWidth: 290,
    },
    button: {
      marginTop: 26,
      backgroundColor: colors.loginTabActiveBackground,
      borderRadius: 999,
      minWidth: 190,
      minHeight: 54,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 26,
    },
    buttonPressed: {
      opacity: 0.86,
    },
    buttonText: {
      fontFamily: RoundedFontFamily,
      color: colors.loginTabActiveText,
      fontSize: 16,
      fontWeight: "800",
      lineHeight: 22,
    },
  });
