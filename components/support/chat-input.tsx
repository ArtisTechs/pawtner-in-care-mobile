import { Colors, RoundedFontFamily } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

type ChatInputProps = {
  bottomInset: number;
  onChangeText: (value: string) => void;
  onSend: () => void;
  placeholder?: string;
  value: string;
};

export function ChatInput({
  bottomInset,
  onChangeText,
  onSend,
  placeholder = "Ask me something...",
  value,
}: ChatInputProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const styles = useMemo(() => createStyles(colors), [colors]);
  const canSend = value.trim().length > 0;

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: Math.max(bottomInset, 10),
        },
      ]}
    >
      <View style={styles.inputShell}>
        <TextInput
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="rgba(203, 224, 247, 0.72)"
          returnKeyType="send"
          selectionColor={colors.dashboardHeaderText}
          style={styles.input}
          value={value}
          onSubmitEditing={onSend}
        />
      </View>

      <Pressable
        accessibilityRole="button"
        disabled={!canSend}
        onPress={onSend}
        style={({ pressed }) => [
          styles.sendButton,
          !canSend && styles.sendButtonDisabled,
          pressed && canSend && styles.pressed,
        ]}
      >
        <MaterialIcons color={colors.dashboardHeaderText} name="send" size={30} />
      </Pressable>
    </View>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingTop: 10,
      paddingHorizontal: 20,
    },
    inputShell: {
      flex: 1,
      minHeight: 48,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: "rgba(217, 235, 255, 0.85)",
      backgroundColor: "rgba(89, 151, 218, 0.36)",
      justifyContent: "center",
      paddingHorizontal: 16,
    },
    input: {
      fontFamily: RoundedFontFamily,
      color: colors.dashboardHeaderText,
      fontSize: 18,
      lineHeight: 22,
      fontWeight: "700",
      paddingVertical: 8,
    },
    sendButton: {
      width: 46,
      height: 46,
      borderRadius: 23,
      alignItems: "center",
      justifyContent: "center",
    },
    sendButtonDisabled: {
      opacity: 0.45,
    },
    pressed: {
      opacity: 0.82,
    },
  });
