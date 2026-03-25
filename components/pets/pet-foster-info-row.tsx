import { PET_ASSETS } from "@/features/pets/pets.data";
import { Colors, RoundedFontFamily } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React, { useMemo } from "react";
import {
  Image,
  type ImageSourcePropType,
  StyleSheet,
  Text,
  View,
} from "react-native";

type PetFosterInfoRowProps = {
  avatar?: ImageSourcePropType | string;
  name: string;
  role: string;
};

const resolveImageSource = (
  image: PetFosterInfoRowProps["avatar"],
): ImageSourcePropType => {
  if (!image) {
    return PET_ASSETS.dogDefault;
  }

  if (typeof image === "string") {
    const normalized = image.trim();

    return normalized ? { uri: normalized } : PET_ASSETS.dogDefault;
  }

  return image;
};

export function PetFosterInfoRow({ avatar, name, role }: PetFosterInfoRowProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const styles = useMemo(() => createStyles(colors), [colors]);
  const avatarSource = resolveImageSource(avatar);

  return (
    <View style={styles.row}>
      <Image source={avatarSource} style={styles.avatar} resizeMode="cover" />
      <View style={styles.textWrap}>
        <Text numberOfLines={1} style={styles.name}>
          {name}
        </Text>
        <Text numberOfLines={1} style={styles.role}>
          {role}
        </Text>
      </View>
    </View>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 18,
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.4)",
    },
    textWrap: {
      marginLeft: 10,
      flex: 1,
    },
    name: {
      fontFamily: RoundedFontFamily,
      color: colors.petDetailsTextPrimary,
      fontSize: 16,
      lineHeight: 19,
      fontWeight: "800",
    },
    role: {
      marginTop: 1,
      fontFamily: RoundedFontFamily,
      color: colors.petDetailsTextSecondary,
      fontSize: 12,
      lineHeight: 15,
      fontWeight: "600",
    },
  });
