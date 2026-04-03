import { Colors, RoundedFontFamily } from "@/constants/theme";
import { resolveImageSource } from "@/features/community/community.data";
import type { CommunityImageSource } from "@/features/community/community.types";
import { useColorScheme } from "@/hooks/use-color-scheme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Image, Modal, Pressable, StyleSheet, Text, View } from "react-native";

type CommunityImagePreviewModalProps = {
  images: CommunityImageSource[];
  initialIndex?: number;
  onClose: () => void;
  visible: boolean;
};

export function CommunityImagePreviewModal({
  images,
  initialIndex = 0,
  onClose,
  visible,
}: CommunityImagePreviewModalProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const styles = useMemo(() => createStyles(colors), [colors]);
  const totalImages = images.length;
  const hasImage = totalImages > 0;
  const clampIndex = useCallback(
    (index: number) => Math.max(0, Math.min(index, Math.max(0, totalImages - 1))),
    [totalImages],
  );
  const [activeIndex, setActiveIndex] = useState(() => clampIndex(initialIndex));

  useEffect(() => {
    if (!visible) {
      return;
    }

    setActiveIndex(clampIndex(initialIndex));
  }, [clampIndex, initialIndex, visible]);

  const resolvedSource = hasImage
    ? resolveImageSource(images[activeIndex])
    : null;
  const shouldShowCounter = totalImages > 1;
  const canGoLeft = activeIndex > 0;
  const canGoRight = activeIndex < totalImages - 1;

  const handlePrevImage = () => {
    if (!canGoLeft) {
      return;
    }

    setActiveIndex((currentIndex) => currentIndex - 1);
  };

  const handleNextImage = () => {
    if (!canGoRight) {
      return;
    }

    setActiveIndex((currentIndex) => currentIndex + 1);
  };

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible && hasImage}
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close image preview"
          onPress={onClose}
          style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
        >
          <MaterialIcons color={colors.white} name="close" size={24} />
        </Pressable>

        {resolvedSource ? (
          <Image source={resolvedSource} style={styles.image} resizeMode="contain" />
        ) : null}

        {shouldShowCounter ? (
          <View style={styles.counterBadge}>
            <Text style={styles.counterText}>
              {activeIndex + 1} / {totalImages}
            </Text>
          </View>
        ) : null}

        {shouldShowCounter ? (
          <>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Previous image"
              disabled={!canGoLeft}
              onPress={handlePrevImage}
              style={({ pressed }) => [
                styles.arrowButton,
                styles.leftArrowButton,
                !canGoLeft && styles.arrowButtonDisabled,
                pressed && canGoLeft && styles.pressed,
              ]}
            >
              <MaterialIcons color={colors.white} name="chevron-left" size={30} />
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Next image"
              disabled={!canGoRight}
              onPress={handleNextImage}
              style={({ pressed }) => [
                styles.arrowButton,
                styles.rightArrowButton,
                !canGoRight && styles.arrowButtonDisabled,
                pressed && canGoRight && styles.pressed,
              ]}
            >
              <MaterialIcons color={colors.white} name="chevron-right" size={30} />
            </Pressable>
          </>
        ) : null}
      </View>
    </Modal>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: "rgba(3, 10, 20, 0.98)",
      alignItems: "center",
      justifyContent: "center",
    },
    closeButton: {
      position: "absolute",
      top: 54,
      right: 20,
      zIndex: 2,
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(13, 42, 78, 0.72)",
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.38)",
    },
    image: {
      width: "100%",
      height: "100%",
    },
    counterBadge: {
      position: "absolute",
      bottom: 36,
      alignSelf: "center",
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: "rgba(13, 42, 78, 0.92)",
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.24)",
    },
    counterText: {
      fontFamily: RoundedFontFamily,
      color: colors.white,
      fontSize: 12,
      lineHeight: 14,
      fontWeight: "800",
    },
    arrowButton: {
      position: "absolute",
      top: "50%",
      marginTop: -24,
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(13, 42, 78, 0.72)",
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.28)",
    },
    leftArrowButton: {
      left: 16,
    },
    rightArrowButton: {
      right: 16,
    },
    arrowButtonDisabled: {
      opacity: 0.36,
    },
    pressed: {
      opacity: 0.84,
    },
  });
