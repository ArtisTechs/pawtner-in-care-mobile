import { SosActionButton } from "@/components/sos/sos-action-button";
import { Colors, RoundedFontFamily } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

type SosResponderContactCardProps = {
  isMessageAvailable: boolean;
  onCall: () => void;
  onMessage: () => void;
};

export function SosResponderContactCard({
  isMessageAvailable,
  onCall,
  onMessage,
}: SosResponderContactCardProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Contact Responder</Text>

      <View style={styles.actionsRow}>
        <SosActionButton
          label="Call"
          onPress={onCall}
          style={styles.actionButton}
          variant="primary"
        />
        <SosActionButton
          disabled={!isMessageAvailable}
          label="Message"
          onPress={onMessage}
          style={styles.actionButton}
          variant="soft"
        />
      </View>
    </View>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    card: {
      borderRadius: 10,
      backgroundColor: "rgba(240, 247, 255, 0.96)",
      paddingVertical: 12,
      paddingHorizontal: 14,
      shadowColor: colors.dashboardShadow,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 4,
    },
    title: {
      fontFamily: RoundedFontFamily,
      fontSize: 16,
      lineHeight: 20,
      fontWeight: "900",
      textAlign: "center",
      color: colors.dashboardScreenBackground,
    },
    actionsRow: {
      marginTop: 10,
      flexDirection: "row",
      justifyContent: "center",
      columnGap: 12,
    },
    actionButton: {
      width: 92,
      minHeight: 38,
      borderRadius: 10,
    },
  });
