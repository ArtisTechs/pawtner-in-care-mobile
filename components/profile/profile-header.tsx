import { Colors, RoundedFontFamily } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useMemo } from "react";
import {
  Image,
  type ImageSourcePropType,
  StyleSheet,
  Text,
  View,
} from "react-native";

type ProfileHeaderProps = {
  avatarSource: ImageSourcePropType | null;
  email: string;
  fullName: string;
};

export function ProfileHeader({
  avatarSource,
  email,
  fullName,
}: ProfileHeaderProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <View style={styles.avatarWrap}>
        {avatarSource ? (
          <Image source={avatarSource} style={styles.avatar} resizeMode="cover" />
        ) : (
          <View style={styles.avatarFallback}>
            <MaterialIcons
              color={colors.dashboardBottomIcon}
              name="person"
              size={60}
            />
          </View>
        )}
      </View>

      <Text numberOfLines={1} style={styles.name}>
        {fullName}
      </Text>
      <Text numberOfLines={1} style={styles.email}>
        {email}
      </Text>
    </View>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      alignItems: "center",
      marginTop: -58,
      paddingHorizontal: 20,
    },
    avatarWrap: {
      width: 108,
      height: 108,
      borderRadius: 999,
      borderWidth: 3,
      borderColor: colors.white,
      overflow: "hidden",
      backgroundColor: colors.white,
      shadowColor: colors.dashboardShadow,
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.2,
      shadowRadius: 7,
      elevation: 5,
    },
    avatar: {
      width: "100%",
      height: "100%",
    },
    avatarFallback: {
      width: "100%",
      height: "100%",
      alignItems: "center",
      justifyContent: "center",
    },
    name: {
      marginTop: 12,
      fontFamily: RoundedFontFamily,
      color: colors.dashboardHeaderText,
      fontSize: 20,
      lineHeight: 27,
      fontWeight: "900",
      textAlign: "center",
    },
    email: {
      marginTop: 2,
      fontFamily: RoundedFontFamily,
      color: colors.dashboardSubtleText,
      fontSize: 14,
      lineHeight: 16,
      fontWeight: "600",
      textAlign: "center",
    },
  });
