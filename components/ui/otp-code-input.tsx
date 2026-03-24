import React, { useMemo, useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const sanitizeOtp = (value: string, length: number) =>
  value.replace(/\D/g, "").slice(0, length);

type OtpCodeInputProps = {
  activeBorderColor: string;
  backgroundColor: string;
  borderColor: string;
  disabled?: boolean;
  errorBorderColor: string;
  hasError?: boolean;
  length?: number;
  onChange: (value: string) => void;
  textColor: string;
  value: string;
};

export function OtpCodeInput({
  activeBorderColor,
  backgroundColor,
  borderColor,
  disabled = false,
  errorBorderColor,
  hasError = false,
  length = 6,
  onChange,
  textColor,
  value,
}: OtpCodeInputProps) {
  const inputRef = useRef<TextInput | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const normalizedValue = useMemo(() => sanitizeOtp(value, length), [length, value]);
  const activeIndex = Math.min(normalizedValue.length, length - 1);

  const handleChangeText = (text: string) => {
    onChange(sanitizeOtp(text, length));
  };

  return (
    <Pressable
      disabled={disabled}
      onPress={() => inputRef.current?.focus()}
      style={styles.container}
    >
      <TextInput
        ref={inputRef}
        autoComplete="one-time-code"
        keyboardType="number-pad"
        maxLength={length}
        onBlur={() => setIsFocused(false)}
        onChangeText={handleChangeText}
        onFocus={() => setIsFocused(true)}
        style={styles.hiddenInput}
        textContentType="oneTimeCode"
        value={normalizedValue}
      />
      {Array.from({ length }, (_, index) => {
        const isActive = isFocused && index === activeIndex;
        const borderColorValue = hasError
          ? errorBorderColor
          : isActive
            ? activeBorderColor
            : borderColor;

        return (
          <View
            key={`otp-box-${index}`}
            style={[
              styles.box,
              {
                backgroundColor,
                borderColor: borderColorValue,
              },
            ]}
          >
            <Text style={[styles.boxText, { color: textColor }]}>
              {normalizedValue[index] ?? ""}
            </Text>
          </View>
        );
      })}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "82%",
    alignSelf: "center",
    flexDirection: "row",
    justifyContent: "center",
    columnGap: 8,
    marginTop: 6,
    marginBottom: 16,
  },
  box: {
    flex: 1,
    height: 54,
    borderWidth: 1.5,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  boxText: {
    fontSize: 22,
    fontWeight: "700",
  },
  hiddenInput: {
    position: "absolute",
    opacity: 0,
    width: 1,
    height: 1,
  },
});
