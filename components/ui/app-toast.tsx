import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { ToastState } from "@/hooks/use-toast";

type AppToastProps = {
  onDismiss: () => void;
  toast: ToastState;
};

export function AppToast({ onDismiss, toast }: AppToastProps) {
  if (!toast) {
    return null;
  }

  const isSuccess = toast.variant === "success";

  return (
    <View pointerEvents="box-none" style={styles.container}>
      <Pressable
        onPress={onDismiss}
        style={[
          styles.toast,
          isSuccess ? styles.successToast : styles.errorToast,
        ]}
      >
        <Text style={styles.message}>{toast.message}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 56,
    left: 16,
    right: 16,
    zIndex: 100,
  },
  toast: {
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: "#000000",
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },
  successToast: {
    backgroundColor: "#1E8E3E",
  },
  errorToast: {
    backgroundColor: "#C53929",
  },
  message: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
