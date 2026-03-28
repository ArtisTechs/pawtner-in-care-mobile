import { ChatBubble } from "@/components/support/chat-bubble";
import { ChatHeader } from "@/components/support/chat-header";
import { ChatInput } from "@/components/support/chat-input";
import { Colors } from "@/constants/theme";
import { SUPPORT_ASSETS } from "@/features/support/support.data";
import type {
  SupportChatMessage,
  SupportChatSender,
} from "@/features/support/support.types";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MAX_CONTENT_WIDTH = 420;
const BOT_REPLY_DELAY_MS = 650;
const INITIAL_BOT_PROMPT = "How can I help you?";
const INPUT_EXTRA_BOTTOM_PADDING = 14;

const createChatMessage = (
  text: string,
  sender: SupportChatSender,
): SupportChatMessage => ({
  id: `${sender}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  text,
  sender,
  timestamp: Date.now(),
});

const buildBotReply = (userMessage: string) => {
  const normalizedMessage = userMessage.trim().toLowerCase();

  if (normalizedMessage.includes("donat")) {
    return "You can donate through GCash or bank transfer in our Donation screen.";
  }

  if (
    normalizedMessage.includes("stray") ||
    normalizedMessage.includes("dog") ||
    normalizedMessage.includes("cat")
  ) {
    return "We rescue and support stray dogs and cats through food, shelter, and medical care.";
  }

  return "Thanks for your message. I can help with shelter donations and related questions.";
};

export default function SupportChatScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width, MAX_CONTENT_WIDTH);
  const styles = useMemo(
    () => createStyles(colors, contentWidth),
    [colors, contentWidth],
  );
  const messageListRef = useRef<FlatList<SupportChatMessage>>(null);
  const replyTimerIdsRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const [draftMessage, setDraftMessage] = useState("");
  const [messages, setMessages] = useState<SupportChatMessage[]>(() => [
    createChatMessage(INITIAL_BOT_PROMPT, "bot"),
  ]);

  useEffect(() => {
    return () => {
      replyTimerIdsRef.current.forEach((timerId) => clearTimeout(timerId));
      replyTimerIdsRef.current = [];
    };
  }, []);

  const scrollToLatest = useCallback((animated: boolean) => {
    requestAnimationFrame(() => {
      messageListRef.current?.scrollToEnd({ animated });
    });
  }, []);

  useEffect(() => {
    scrollToLatest(true);
  }, [messages.length, scrollToLatest]);

  const handleSendMessage = () => {
    const trimmedMessage = draftMessage.trim();

    if (!trimmedMessage) {
      return;
    }

    setDraftMessage("");
    setMessages((currentMessages) => [
      ...currentMessages,
      createChatMessage(trimmedMessage, "user"),
    ]);

    const timerId = setTimeout(() => {
      setMessages((currentMessages) => [
        ...currentMessages,
        createChatMessage(buildBotReply(trimmedMessage), "bot"),
      ]);
      replyTimerIdsRef.current = replyTimerIdsRef.current.filter(
        (activeTimerId) => activeTimerId !== timerId,
      );
    }, BOT_REPLY_DELAY_MS);

    replyTimerIdsRef.current.push(timerId);
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(tabs)");
  };

  return (
    <View style={styles.screen}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.loginHeaderGradientStart}
      />

      <LinearGradient
        colors={[
          colors.loginHeaderGradientStart,
          colors.dashboardScreenBackground,
          colors.loginHeaderGradientEnd,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 0}
        >
          <View style={styles.contentWrap}>
            <ChatHeader
              avatarSource={SUPPORT_ASSETS.dogBotIcon}
              backIconSource={SUPPORT_ASSETS.backIcon}
              onPressBack={handleBack}
              titleText="DOG BOT"
              topInset={insets.top}
            />

            <FlatList
              ref={messageListRef}
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <ChatBubble botIconSource={SUPPORT_ASSETS.dogBotIcon} message={item} />
              )}
              ItemSeparatorComponent={() => <View style={styles.messageGap} />}
              contentContainerStyle={styles.messageListContent}
              keyboardShouldPersistTaps="handled"
              onContentSizeChange={() => scrollToLatest(true)}
              onLayout={() => scrollToLatest(false)}
              showsVerticalScrollIndicator={false}
              style={styles.messageList}
            />

            <ChatInput
              value={draftMessage}
              onChangeText={setDraftMessage}
              onSend={handleSendMessage}
              bottomInset={insets.bottom + INPUT_EXTRA_BOTTOM_PADDING}
            />
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}

const createStyles = (
  colors: typeof Colors.light,
  contentWidth: number,
) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.dashboardScreenBackground,
    },
    gradient: {
      flex: 1,
      alignItems: "center",
    },
    keyboardAvoidingView: {
      flex: 1,
      width: "100%",
      alignItems: "center",
    },
    contentWrap: {
      flex: 1,
      width: contentWidth,
    },
    messageList: {
      flex: 1,
      width: "100%",
    },
    messageListContent: {
      flexGrow: 1,
      justifyContent: "flex-end",
      paddingTop: 8,
      paddingHorizontal: 24,
      paddingBottom: 12,
    },
    messageGap: {
      height: 12,
    },
  });
