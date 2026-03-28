import { SosActionButton } from "@/components/sos/sos-action-button";
import React from "react";
import { StyleSheet, View } from "react-native";

type SosFormFooterActionsProps = {
  onCancel: () => void;
  onProceed: () => void;
};

export function SosFormFooterActions({
  onCancel,
  onProceed,
}: SosFormFooterActionsProps) {
  return (
    <View style={styles.row}>
      <SosActionButton
        label="Cancel"
        onPress={onCancel}
        style={[styles.button, styles.cancelButton]}
        variant="primary"
      />
      <SosActionButton
        label="Proceed"
        onPress={onProceed}
        style={[styles.button, styles.proceedButton]}
        variant="primary"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    columnGap: 14,
    marginTop: 18,
  },
  button: {
    flex: 1,
    minHeight: 50,
    borderRadius: 11,
  },
  cancelButton: {
    backgroundColor: "#B6C4D8",
    borderColor: "rgba(255, 255, 255, 0.38)",
  },
  proceedButton: {
    backgroundColor: "#79AEE6",
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
});
