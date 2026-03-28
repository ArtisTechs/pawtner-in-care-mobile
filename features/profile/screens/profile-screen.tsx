import { BadgeList } from "@/components/profile/badge-list";
import { ProfileHeader } from "@/components/profile/profile-header";
import { SettingsItem } from "@/components/profile/settings-item";
import { DashboardBottomNavbar } from "@/components/navigation/dashboard-bottom-navbar";
import { Colors, RoundedFontFamily } from "@/constants/theme";
import {
  PROFILE_BADGES,
  PROFILE_SETTINGS_ITEMS,
} from "@/features/profile/profile.data";
import type { ProfileSettingsKey } from "@/features/profile/profile.types";
import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  type ImageSourcePropType,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MAX_CONTENT_WIDTH = 420;
const NAVBAR_RESERVED_SPACE = 86;

const resolveNonEmptyText = (value: unknown) => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : null;
};

const resolveAvatarSource = (
  user: Record<string, unknown> | null | undefined,
): ImageSourcePropType | null => {
  if (!user) {
    return null;
  }

  const avatarUriCandidates = [
    user.avatar,
    user.avatarUrl,
    user.profileImage,
    user.profileImageUrl,
    user.photoUrl,
  ];

  for (const candidate of avatarUriCandidates) {
    const resolvedUri = resolveNonEmptyText(candidate);

    if (resolvedUri) {
      return { uri: resolvedUri };
    }
  }

  return null;
};

export default function ProfileScreen() {
  const router = useRouter();
  const { session, signOut } = useAuth();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width, MAX_CONTENT_WIDTH);
  const styles = useMemo(
    () => createStyles(colors, contentWidth),
    [colors, contentWidth],
  );
  const [isSigningOut, setIsSigningOut] = useState(false);

  const userRecord = session?.user as Record<string, unknown> | undefined;
  const fullName = useMemo(() => {
    const firstName = resolveNonEmptyText(userRecord?.firstName);
    const lastName = resolveNonEmptyText(userRecord?.lastName);
    const fallbackName = resolveNonEmptyText(userRecord?.name);
    const combinedName = [firstName, lastName].filter(Boolean).join(" ").trim();

    return combinedName || fallbackName || "Pawtner User";
  }, [userRecord?.firstName, userRecord?.lastName, userRecord?.name]);
  const email = useMemo(
    () => resolveNonEmptyText(userRecord?.email) ?? "user@pawtner.app",
    [userRecord?.email],
  );
  const avatarSource = useMemo(() => resolveAvatarSource(userRecord), [userRecord]);

  const handleSignOut = async () => {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);

    try {
      await signOut();
      router.replace("/(auth)/login");
    } finally {
      setIsSigningOut(false);
    }
  };

  const handlePressAddBadge = () => {
    // TODO: connect add badge flow when profile badge management screen is available.
  };

  const handlePressSetting = (settingKey: ProfileSettingsKey) => {
    if (settingKey === "profile-settings") {
      // TODO: route to profile settings screen once implemented.
      return;
    }

    router.push("/change-password");
  };

  return (
    <View style={styles.screen}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.loginHeaderGradientEnd}
      />

      <LinearGradient
        colors={[
          colors.loginHeaderGradientEnd,
          colors.dashboardScreenBackground,
          colors.loginHeaderGradientStart,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View
          style={[
            styles.contentWrap,
            {
              paddingTop: insets.top + 10,
            },
          ]}
        >
          <View style={styles.actionsRow}>
            <Pressable
              accessibilityRole="button"
              disabled={isSigningOut}
              onPress={handleSignOut}
              style={({ pressed }) => [
                styles.logoutButton,
                (pressed || isSigningOut) && styles.logoutButtonPressed,
              ]}
            >
              <MaterialIcons color={colors.white} name="logout" size={18} />
              <Text style={styles.logoutText}>
                {isSigningOut ? "Signing Out..." : "Sign Out"}
              </Text>
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              {
                paddingBottom: NAVBAR_RESERVED_SPACE + insets.bottom + 12,
              },
            ]}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.profileCard}>
              <ProfileHeader
                avatarSource={avatarSource}
                email={email}
                fullName={fullName}
              />

              <BadgeList badges={PROFILE_BADGES} onPressAdd={handlePressAddBadge} />

              <Text style={styles.generalLabel}>GENERAL</Text>

              <View style={styles.settingsList}>
                {PROFILE_SETTINGS_ITEMS.map((item) => (
                  <SettingsItem
                    key={item.key}
                    label={item.label}
                    onPress={() => handlePressSetting(item.key)}
                  />
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </LinearGradient>

      <DashboardBottomNavbar activeKey="profile" />
    </View>
  );
}

const createStyles = (colors: typeof Colors.light, contentWidth: number) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.dashboardScreenBackground,
    },
    gradient: {
      flex: 1,
      alignItems: "center",
    },
    contentWrap: {
      flex: 1,
      width: contentWidth,
    },
    actionsRow: {
      minHeight: 44,
      paddingHorizontal: 18,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
    },
    logoutButton: {
      minHeight: 32,
      borderRadius: 999,
      paddingHorizontal: 10,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
      backgroundColor: colors.loginError,
      shadowColor: "rgba(90, 20, 20, 0.4)",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.22,
      shadowRadius: 4,
      elevation: 3,
    },
    logoutButtonPressed: {
      opacity: 0.85,
    },
    logoutText: {
      fontFamily: RoundedFontFamily,
      color: colors.white,
      fontSize: 14,
      lineHeight: 15,
      fontWeight: "800",
    },
    scrollContent: {
      alignItems: "center",
      paddingTop: 56,
      paddingHorizontal: 10,
    },
    profileCard: {
      width: "100%",
      borderRadius: 36,
      borderWidth: 2,
      borderColor: "rgba(255, 255, 255, 0.95)",
      backgroundColor: "rgba(40, 111, 188, 0.82)",
      paddingHorizontal: 16,
      paddingBottom: 24,
      minHeight: 480,
    },
    generalLabel: {
      marginTop: 14,
      paddingHorizontal: 2,
      fontFamily: RoundedFontFamily,
      color: colors.dashboardHeaderText,
      fontSize: 14,
      lineHeight: 17,
      fontWeight: "900",
      letterSpacing: 0.7,
    },
    settingsList: {
      marginTop: 8,
      gap: 8,
    },
    pressed: {
      opacity: 0.84,
    },
  });
