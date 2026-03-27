import { Colors, RoundedFontFamily } from "@/constants/theme";
import { DONATION_ASSETS } from "@/features/donations/donations.data";
import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { donationStorage } from "@/services/donations/donation.storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MAX_CONTENT_WIDTH = 420;
const MAX_IMAGE_SIZE = 266;
const MIN_IMAGE_SIZE = 182;
const TOP_PANEL_HEIGHT_RATIO = 0.55;

export default function DonationIntroScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const donationIntroUserId = session?.user.id ?? "guest";
  const [isCheckingIntroStatus, setIsCheckingIntroStatus] = useState(true);
  const contentWidth = Math.min(width, MAX_CONTENT_WIDTH);
  const imageSize = Math.min(
    MAX_IMAGE_SIZE,
    Math.max(MIN_IMAGE_SIZE, contentWidth - 52),
  );
  const availableHeight = height - insets.top - insets.bottom;
  const topPanelHeight = Math.max(
    imageSize + 92,
    Math.round(availableHeight * TOP_PANEL_HEIGHT_RATIO),
  );
  const styles = useMemo(
    () => createStyles(colors, contentWidth, imageSize, topPanelHeight),
    [colors, contentWidth, imageSize, topPanelHeight],
  );

  useEffect(() => {
    let isMounted = true;

    const resolveIntroStatus = async () => {
      try {
        const hasSeenDonationIntro = await donationStorage.hasSeenDonationIntro(
          donationIntroUserId,
        );

        if (!isMounted) {
          return;
        }

        if (hasSeenDonationIntro) {
          router.replace("/donations/home");
          return;
        }
      } finally {
        if (isMounted) {
          setIsCheckingIntroStatus(false);
        }
      }
    };

    void resolveIntroStatus();

    return () => {
      isMounted = false;
    };
  }, [donationIntroUserId, router]);

  const handlePressDonateNow = async () => {
    try {
      await donationStorage.markDonationIntroSeen(donationIntroUserId);
    } finally {
      router.replace("/donations/home");
    }
  };

  if (isCheckingIntroStatus) {
    return <View style={styles.loadingScreen} />;
  }

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />

      <View style={styles.content}>
        <LinearGradient
          colors={[colors.loginHeaderGradientStart, colors.loginHeaderGradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.topPanel,
            {
              paddingTop: insets.top + 18,
            },
          ]}
        >
          <View style={styles.heroFrame}>
            <Image
              source={DONATION_ASSETS.frontPageIcon}
              style={styles.heroImage}
              resizeMode="contain"
            />
          </View>
        </LinearGradient>

        <View
          style={[
            styles.bottomPanel,
            {
              paddingBottom: Math.max(insets.bottom, 26),
            },
          ]}
        >
          <Text style={styles.headline}>Not All Heroes Wear Capes</Text>
          <Text style={styles.headline}>Some Simply Choose To Care</Text>

          <View style={styles.subtextWrap}>
            <Text style={styles.subtext}>Your small donation can feed and</Text>
            <Text style={styles.subtext}>protect a stray today.</Text>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={handlePressDonateNow}
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.buttonText}>Donate Now</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const createStyles = (
  colors: typeof Colors.light,
  contentWidth: number,
  imageSize: number,
  topPanelHeight: number,
) => {
  const roundedText = { fontFamily: RoundedFontFamily } as const;

  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.loginCardBackground,
      alignItems: "center",
    },
    loadingScreen: {
      flex: 1,
      backgroundColor: colors.loginCardBackground,
    },
    content: {
      flex: 1,
      width: contentWidth,
      backgroundColor: colors.loginCardBackground,
    },
    topPanel: {
      width: "100%",
      height: topPanelHeight,
      alignItems: "center",
      justifyContent: "center",
      paddingBottom: 26,
      borderBottomLeftRadius: 34,
      borderBottomRightRadius: 34,
      overflow: "hidden",
    },
    heroFrame: {
      width: imageSize,
      height: imageSize,
      borderRadius: 999,
      borderWidth: 4,
      borderColor: "rgba(255, 255, 255, 0.95)",
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      alignItems: "center",
      justifyContent: "center",
      padding: 10,
    },
    heroImage: {
      width: "100%",
      height: "100%",
    },
    bottomPanel: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 34,
      paddingHorizontal: 24,
    },
    headline: {
      ...roundedText,
      color: colors.loginHeaderGradientStart,
      fontSize: 21,
      lineHeight: 23,
      fontWeight: "900",
      textAlign: "center",
      letterSpacing: 0.2,
    },
    subtextWrap: {
      marginTop: 18,
      alignItems: "center",
    },
    subtext: {
      ...roundedText,
      color: colors.loginTabText,
      fontSize: 16,
      lineHeight: 19,
      fontWeight: "700",
      textAlign: "center",
    },
    button: {
      marginTop: 34,
      minWidth: 156,
      minHeight: 46,
      borderRadius: 999,
      paddingHorizontal: 26,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.loginTabActiveBackground,
    },
    buttonPressed: {
      opacity: 0.86,
    },
    buttonText: {
      ...roundedText,
      color: colors.loginTabActiveText,
      fontSize: 18,
      lineHeight: 20,
      fontWeight: "900",
    },
  });
};
