import { Colors, RoundedFontFamily } from "@/constants/theme";
import type { SupportChatMessage } from "@/features/support/support.types";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React, { useMemo } from "react";
import {
  Image,
  type ImageSourcePropType,
  StyleSheet,
  Text,
  View,
} from "react-native";

type ChatBubbleProps = {
  botIconSource: ImageSourcePropType;
  message: SupportChatMessage;
};

export function ChatBubble({ botIconSource, message }: ChatBubbleProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const styles = useMemo(() => createStyles(colors), [colors]);
  const isBotMessage = message.sender === "bot";

  if (!isBotMessage) {
    return (
      <View style={styles.userContainer}>
        <View style={styles.userBubble}>
          <Text style={styles.userText}>{message.text}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.botContainer}>
      <View style={styles.botRow}>
        <Image source={botIconSource} style={styles.botAvatar} resizeMode="contain" />
        <View style={styles.botBubble}>
          <Text style={styles.botText}>{message.text}</Text>
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    botContainer: {
      width: "100%",
      alignItems: "flex-start",
    },
    botRow: {
      maxWidth: "84%",
      flexDirection: "row",
      alignItems: "flex-end",
      gap: 8,
    },
    botAvatar: {
      width: 26,
      height: 26,
      marginBottom: 2,
    },
    botBubble: {
      maxWidth: "100%",
      borderRadius: 16,
      borderBottomLeftRadius: 12,
      backgroundColor: "rgba(229, 241, 255, 0.95)",
      paddingHorizontal: 14,
      paddingVertical: 11,
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.65)",
    },
    botText: {
      fontFamily: RoundedFontFamily,
      color: colors.dashboardBottomIcon,
      fontSize: 14,
      lineHeight: 18,
      fontWeight: "700",
    },
    userContainer: {
      width: "100%",
      alignItems: "flex-end",
    },
    userBubble: {
      maxWidth: "76%",
      borderRadius: 16,
      borderBottomRightRadius: 12,
      backgroundColor: "rgba(148, 198, 248, 0.96)",
      paddingHorizontal: 14,
      paddingVertical: 11,
      borderWidth: 1,
      borderColor: "rgba(205, 232, 255, 0.86)",
    },
    userText: {
      fontFamily: RoundedFontFamily,
      color: colors.dashboardBottomIconActive,
      fontSize: 14,
      lineHeight: 18,
      fontWeight: "700",
    },
  });
