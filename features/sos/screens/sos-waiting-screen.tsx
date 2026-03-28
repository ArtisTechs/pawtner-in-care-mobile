import { SosActionButton } from "@/components/sos/sos-action-button";
import { SosResponderContactCard } from "@/components/sos/sos-responder-contact-card";
import { AppToast } from "@/components/ui/app-toast";
import { Colors, RoundedFontFamily } from "@/constants/theme";
import {
  SOS_ASSETS,
  SOS_DEFAULT_LOCATION,
  SOS_DEFAULT_RESPONDER,
  SOS_DEFAULT_ROUTE_POINTS,
} from "@/features/sos/sos.data";
import type { SosFlowData } from "@/features/sos/sos.types";
import {
  normalizeSosParam,
  parseSosFlowDataParam,
  serializeSosFlowData,
} from "@/features/sos/sos.types";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useToast } from "@/hooks/use-toast";
import * as Linking from "expo-linking";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Easing,
  Image,
  type ImageSourcePropType,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MAX_CONTENT_WIDTH = 420;
const WAITING_BLUE_LIGHT = "#2F88EF";
const WAITING_BLUE_DARK = "#236EC4";

const SPEED_STREAKS = [
  {
    delay: 0,
    duration: 1080,
    height: 4,
    id: "trail-1",
    left: 2,
    opacity: 0.62,
    top: 28,
    travelEnd: -84,
    travelStart: 38,
    width: 92,
  },
  {
    delay: 210,
    duration: 980,
    height: 6,
    id: "trail-2",
    left: 22,
    opacity: 0.8,
    top: 50,
    travelEnd: -92,
    travelStart: 44,
    width: 76,
  },
  {
    delay: 120,
    duration: 920,
    height: 3,
    id: "trail-3",
    left: 8,
    opacity: 0.52,
    top: 72,
    travelEnd: -78,
    travelStart: 36,
    width: 64,
  },
  {
    delay: 260,
    duration: 1140,
    height: 5,
    id: "trail-4",
    left: 28,
    opacity: 0.58,
    top: 92,
    travelEnd: -98,
    travelStart: 40,
    width: 90,
  },
  {
    delay: 380,
    duration: 1040,
    height: 4,
    id: "trail-5",
    left: 14,
    opacity: 0.66,
    top: 112,
    travelEnd: -88,
    travelStart: 32,
    width: 70,
  },
] as const;

type DeliveryLoadingAnimationProps = {
  carSource: ImageSourcePropType;
  styles: ReturnType<typeof createStyles>;
};

const normalizePhoneToTelHref = (phone: string) =>
  `tel:${phone.replace(/[^\d+]/g, "")}`;

const normalizePhoneToSmsHref = (phone: string) =>
  `sms:${phone.replace(/[^\d+]/g, "")}`;

const buildFallbackFlowData = (): SosFlowData => ({
  description: "SOS details were submitted.",
  imageUri: "",
  latitude: SOS_DEFAULT_LOCATION.latitude,
  location: SOS_DEFAULT_LOCATION.label,
  longitude: SOS_DEFAULT_LOCATION.longitude,
  reportType: "random-stray",
  responderMessageAvailable: SOS_DEFAULT_RESPONDER.responderMessageAvailable,
  responderName: SOS_DEFAULT_RESPONDER.responderName,
  responderPhone: SOS_DEFAULT_RESPONDER.responderPhone,
  routePoints: SOS_DEFAULT_ROUTE_POINTS,
  submittedAt: new Date().toISOString(),
});

const DeliveryLoadingAnimation = ({
  carSource,
  styles,
}: DeliveryLoadingAnimationProps) => {
  const bounceAnimation = useRef(new Animated.Value(0)).current;
  const tiltAnimation = useRef(new Animated.Value(0)).current;
  const wheelSpinAnimation = useRef(new Animated.Value(0)).current;
  const speedLineAnimations = useRef(
    SPEED_STREAKS.map(() => new Animated.Value(0)),
  ).current;

  useEffect(() => {
    const animationLoops: Animated.CompositeAnimation[] = [
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnimation, {
            duration: 760,
            easing: Easing.linear,
            toValue: 1,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnimation, {
            duration: 760,
            easing: Easing.linear,
            toValue: 0,
            useNativeDriver: true,
          }),
        ]),
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(tiltAnimation, {
            duration: 1400,
            easing: Easing.linear,
            toValue: 1,
            useNativeDriver: true,
          }),
          Animated.timing(tiltAnimation, {
            duration: 1400,
            easing: Easing.linear,
            toValue: 0,
            useNativeDriver: true,
          }),
        ]),
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(wheelSpinAnimation, {
            duration: 560,
            easing: Easing.linear,
            toValue: 1,
            useNativeDriver: true,
          }),
          Animated.timing(wheelSpinAnimation, {
            duration: 0,
            easing: Easing.linear,
            toValue: 0,
            useNativeDriver: true,
          }),
        ]),
      ),
    ];

    SPEED_STREAKS.forEach((streak, index) => {
      const speedLineAnimation = speedLineAnimations[index];
      animationLoops.push(
        Animated.loop(
          Animated.sequence([
            Animated.delay(streak.delay),
            Animated.timing(speedLineAnimation, {
              duration: streak.duration,
              easing: Easing.linear,
              toValue: 1,
              useNativeDriver: true,
            }),
            Animated.timing(speedLineAnimation, {
              duration: 0,
              easing: Easing.linear,
              toValue: 0,
              useNativeDriver: true,
            }),
          ]),
        ),
      );
    });

    animationLoops.forEach((animation) => animation.start());

    return () => {
      animationLoops.forEach((animation) => animation.stop());
    };
  }, [bounceAnimation, speedLineAnimations, tiltAnimation, wheelSpinAnimation]);

  const vehicleAnimatedStyle = useMemo(
    () => ({
      transform: [
        {
          translateY: bounceAnimation.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [1.4, -3.6, 1.4],
          }),
        },
        {
          rotate: tiltAnimation.interpolate({
            inputRange: [0, 0.25, 0.5, 0.75, 1],
            outputRange: ["-0.5deg", "0deg", "0.7deg", "0deg", "-0.5deg"],
          }),
        },
      ],
    }),
    [bounceAnimation, tiltAnimation],
  );

  const wheelRotate = wheelSpinAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.vehicleIllustrationWrap}>
      <View style={styles.speedLinesWrap}>
        {SPEED_STREAKS.map((streak, index) => {
          const progress = speedLineAnimations[index];

          return (
            <Animated.View
              key={streak.id}
              style={[
                styles.speedStreak,
                {
                  height: streak.height,
                  left: streak.left,
                  opacity: progress.interpolate({
                    inputRange: [0, 0.1, 0.85, 1],
                    outputRange: [0, streak.opacity, streak.opacity * 0.55, 0],
                  }),
                  top: streak.top,
                  transform: [
                    {
                      translateX: progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [streak.travelStart, streak.travelEnd],
                      }),
                    },
                    {
                      scaleX: progress.interpolate({
                        inputRange: [0, 0.55, 1],
                        outputRange: [0.5, 1.24, 1.42],
                      }),
                    },
                  ],
                  width: streak.width,
                },
              ]}
            />
          );
        })}
      </View>

      <Animated.View style={[styles.vehicleHolder, vehicleAnimatedStyle]}>
        <Image
          source={carSource}
          style={styles.vehicleImage}
          resizeMode="contain"
        />

        <Animated.View
          style={[
            styles.wheelSpinner,
            styles.frontWheelSpinner,
            { transform: [{ rotate: wheelRotate }] },
          ]}
        >
          <View style={styles.wheelSpinnerMark} />
        </Animated.View>

        <Animated.View
          style={[
            styles.wheelSpinner,
            styles.rearWheelSpinner,
            { transform: [{ rotate: wheelRotate }] },
          ]}
        >
          <View style={styles.wheelSpinnerMark} />
        </Animated.View>
      </Animated.View>
    </View>
  );
};

export default function SosWaitingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { hideToast, showToast, toast } = useToast();
  const params = useLocalSearchParams<{
    flowData?: string | string[];
  }>();
  const serializedFlowData = normalizeSosParam(params.flowData);
  const parsedFlowData = parseSosFlowDataParam(params.flowData);
  const flowData = parsedFlowData ?? buildFallbackFlowData();
  const isMessageActionAvailable = Boolean(flowData.responderPhone.trim());
  const nextSerializedFlowData =
    serializedFlowData ?? serializeSosFlowData(flowData);
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const waitingBlueBackground =
    colorScheme === "dark" ? WAITING_BLUE_DARK : WAITING_BLUE_LIGHT;
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width, MAX_CONTENT_WIDTH);
  const styles = useMemo(
    () => createStyles(colors, contentWidth, waitingBlueBackground),
    [colors, contentWidth, waitingBlueBackground],
  );

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/sos");
  };

  const handleCallResponder = () => {
    void Linking.openURL(normalizePhoneToTelHref(flowData.responderPhone));
  };

  const handleMessageResponder = () => {
    void Linking.openURL(normalizePhoneToSmsHref(flowData.responderPhone)).catch(
      () => {
        showToast("Could not open messaging app.");
      },
    );
  };

  const handleSeeResponderOnMap = () => {
    router.push({
      pathname: "/sos/tracker",
      params: {
        flowData: nextSerializedFlowData,
      },
    });
  };

  const handleCancelRequest = () => {
    showToast("SOS request cancelled.");
    router.replace("/(tabs)");
  };

  return (
    <View style={styles.screen}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={waitingBlueBackground}
      />
      <AppToast onDismiss={hideToast} toast={toast} />

      <View
        style={[
          styles.contentWrap,
          {
            paddingTop: insets.top + 12,
            paddingBottom: insets.bottom + 16,
          },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          onPress={handleBack}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.pressed,
          ]}
        >
          <Image
            source={SOS_ASSETS.backIcon}
            style={styles.backIcon}
            resizeMode="contain"
          />
        </Pressable>

        <Text style={styles.titleText}>
          We had just notified the responders
        </Text>

        <DeliveryLoadingAnimation
          carSource={SOS_ASSETS.emergencyVehicle}
          styles={styles}
        />

        <Text style={styles.waitingText}>Wait for their response</Text>

        <View style={styles.contactCardWrap}>
          <SosResponderContactCard
            isMessageAvailable={isMessageActionAvailable}
            onCall={handleCallResponder}
            onMessage={handleMessageResponder}
          />
        </View>

        <SosActionButton
          label="See responder on the map"
          onPress={handleSeeResponderOnMap}
          style={styles.seeMapButton}
          variant="soft"
        />

        <SosActionButton
          label="Cancel request"
          onPress={handleCancelRequest}
          style={styles.cancelButton}
          variant="ghost"
        />
      </View>
    </View>
  );
}

const createStyles = (
  colors: typeof Colors.light,
  contentWidth: number,
  waitingBlueBackground: string,
) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: waitingBlueBackground,
      alignItems: "center",
    },
    contentWrap: {
      flex: 1,
      width: contentWidth,
      paddingHorizontal: 14,
      alignItems: "center",
    },
    backButton: {
      alignSelf: "flex-start",
      width: 34,
      height: 34,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
    },
    backIcon: {
      width: 24,
      height: 24,
      tintColor: colors.white,
    },
    titleText: {
      marginTop: 34,
      maxWidth: 270,
      fontFamily: RoundedFontFamily,
      fontSize: 20,
      lineHeight: 26,
      fontWeight: "900",
      textAlign: "center",
      color: colors.dashboardHeaderText,
    },
    vehicleIllustrationWrap: {
      marginTop: 72,
      width: "100%",
      height: 188,
      overflow: "visible",
      justifyContent: "center",
      position: "relative",
    },
    speedLinesWrap: {
      ...StyleSheet.absoluteFillObject,
      left: -8,
      right: 112,
      top: 44,
      bottom: 44,
      position: "absolute",
    },
    speedStreak: {
      position: "absolute",
      borderRadius: 999,
      backgroundColor: "rgba(255, 255, 255, 0.95)",
    },
    vehicleHolder: {
      position: "absolute",
      right: -2,
      top: 46,
      width: 252,
      height: 124,
      justifyContent: "center",
      alignItems: "center",
    },
    vehicleImage: {
      width: 240,
      height: 116,
    },
    wheelSpinner: {
      position: "absolute",
      width: 18,
      height: 18,
      borderRadius: 999,
      borderWidth: 1.5,
      borderColor: "rgba(13, 71, 161, 0.68)",
      alignItems: "center",
      justifyContent: "flex-start",
    },
    frontWheelSpinner: {
      bottom: 14,
      left: 55,
    },
    rearWheelSpinner: {
      bottom: 14,
      right: 56,
    },
    wheelSpinnerMark: {
      width: 3,
      height: 5,
      borderRadius: 999,
      marginTop: 1.2,
      backgroundColor: "rgba(255, 255, 255, 0.95)",
    },
    waitingText: {
      marginTop: 44,
      fontFamily: RoundedFontFamily,
      fontSize: 16,
      lineHeight: 20,
      fontWeight: "700",
      color: "rgba(231, 240, 255, 0.88)",
      textAlign: "center",
    },
    contactCardWrap: {
      marginTop: 68,
      width: "90%",
    },
    seeMapButton: {
      marginTop: 35,
      width: "100%",
      minHeight: 40,
    },
    cancelButton: {
      marginTop: 10,
    },
    pressed: {
      opacity: 0.84,
    },
  });
