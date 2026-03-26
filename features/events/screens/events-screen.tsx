import { CalendarMonthView } from "@/components/events/calendar-month-view";
import { DateFilterButton } from "@/components/events/date-filter-button";
import { EventCard } from "@/components/events/event-card";
import { EventDetailsModal } from "@/components/events/event-details-modal";
import { type EventsTabKey, EventsTabs } from "@/components/events/events-tabs";
import {
  type BottomFilterSection,
  FilterBottomModal,
} from "@/components/ui/filter-bottom-modal";
import { Colors, RoundedFontFamily } from "@/constants/theme";
import {
  createCalendarDate,
  getMonthTitle,
  toDateKey,
} from "@/features/events/events-calendar";
import { EVENTS_ASSETS, EVENTS_MOCK_DATA } from "@/features/events/events.data";
import type { EventItem } from "@/features/events/events.types";
import { useColorScheme } from "@/hooks/use-color-scheme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Linking,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MAX_CONTENT_WIDTH = 420;

const FALLBACK_DATE = createCalendarDate(2019, 8, 1);
const LOCAL_FILTER_SECTION_KEY = "local-events-date-filter";

type LocalEventsFilterKey = "today" | "week" | "month" | "year";

const LOCAL_EVENTS_FILTER_OPTIONS: {
  key: LocalEventsFilterKey;
  label: string;
}[] = [
  { key: "today", label: "TODAY" },
  { key: "week", label: "THIS WEEK" },
  { key: "month", label: "THIS MONTH" },
  { key: "year", label: "THIS YEAR" },
];

const getDateFromEvent = (eventItem: EventItem) =>
  createCalendarDate(eventItem.year, eventItem.month - 1, eventItem.day);

const isSameMonthAndYear = (left: Date, right: Date) =>
  left.getMonth() === right.getMonth() && left.getFullYear() === right.getFullYear();

export default function EventsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width, MAX_CONTENT_WIDTH);
  const styles = useMemo(
    () => createStyles(colors, contentWidth),
    [colors, contentWidth],
  );

  const todayDate = useMemo(() => {
    const now = new Date();

    return createCalendarDate(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);
  const initialSelectedDate = todayDate ?? FALLBACK_DATE;
  const initialMonthDate = createCalendarDate(
    initialSelectedDate.getFullYear(),
    initialSelectedDate.getMonth(),
    1,
  );
  const [activeTab, setActiveTab] = useState<EventsTabKey>("events");
  const [selectedDate, setSelectedDate] = useState(initialSelectedDate);
  const [visibleMonthDate, setVisibleMonthDate] = useState(initialMonthDate);
  const [activeLocalFilter, setActiveLocalFilter] =
    useState<LocalEventsFilterKey>("today");
  const [draftLocalFilter, setDraftLocalFilter] =
    useState<LocalEventsFilterKey>("today");
  const [isLocalFilterModalVisible, setIsLocalFilterModalVisible] =
    useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  const todayKey = useMemo(() => toDateKey(todayDate), [todayDate]);

  const eventsForSelectedDate = useMemo(() => {
    const selectedDateKey = toDateKey(selectedDate);

    return EVENTS_MOCK_DATA.filter((eventItem) => {
      if (eventItem.type !== "events") {
        return false;
      }

      return toDateKey(getDateFromEvent(eventItem)) === selectedDateKey;
    });
  }, [selectedDate]);

  const localEvents = useMemo(
    () => EVENTS_MOCK_DATA.filter((eventItem) => eventItem.type === "local"),
    [],
  );

  const visibleLocalEvents = useMemo(() => {
    const currentYear = todayDate.getFullYear();
    const currentMonth = todayDate.getMonth();
    const startOfWeek = createCalendarDate(
      todayDate.getFullYear(),
      todayDate.getMonth(),
      todayDate.getDate() - todayDate.getDay(),
    );
    const endOfWeek = createCalendarDate(
      startOfWeek.getFullYear(),
      startOfWeek.getMonth(),
      startOfWeek.getDate() + 6,
    );

    return localEvents.filter((eventItem) => {
      const eventDate = getDateFromEvent(eventItem);
      const eventTime = eventDate.getTime();

      if (activeLocalFilter === "today") {
        return toDateKey(eventDate) === todayKey;
      }

      if (activeLocalFilter === "week") {
        return (
          eventTime >= startOfWeek.getTime() && eventTime <= endOfWeek.getTime()
        );
      }

      if (activeLocalFilter === "month") {
        return (
          eventDate.getFullYear() === currentYear &&
          eventDate.getMonth() === currentMonth
        );
      }

      return eventDate.getFullYear() === currentYear;
    });
  }, [activeLocalFilter, localEvents, todayDate, todayKey]);

  const localFilterSections = useMemo<BottomFilterSection[]>(
    () => [
      {
        key: LOCAL_FILTER_SECTION_KEY,
        title: "Date Range",
        options: LOCAL_EVENTS_FILTER_OPTIONS,
        selectedKeys: [draftLocalFilter],
      },
    ],
    [draftLocalFilter],
  );

  const localFilterLabel = useMemo(
    () =>
      LOCAL_EVENTS_FILTER_OPTIONS.find(
        (option) => option.key === activeLocalFilter,
      )?.label ?? "TODAY",
    [activeLocalFilter],
  );

  const visibleEvents =
    activeTab === "events" ? eventsForSelectedDate : visibleLocalEvents;
  const emptyStateMessage =
    activeTab === "events"
      ? "No events scheduled for this date."
      : "No local events available.";

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(tabs)");
  };

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);

    if (!isSameMonthAndYear(date, visibleMonthDate)) {
      setVisibleMonthDate(createCalendarDate(date.getFullYear(), date.getMonth(), 1));
    }
  };

  const handleChangeMonth = (offset: 1 | -1) => {
    setVisibleMonthDate((currentMonthDate) => {
      const nextMonthDate = createCalendarDate(
        currentMonthDate.getFullYear(),
        currentMonthDate.getMonth() + offset,
        1,
      );

      setSelectedDate((currentDate) => {
        const maxDayInNextMonth = new Date(
          nextMonthDate.getFullYear(),
          nextMonthDate.getMonth() + 1,
          0,
        ).getDate();
        const nextDay = Math.min(currentDate.getDate(), maxDayInNextMonth);

        return createCalendarDate(
          nextMonthDate.getFullYear(),
          nextMonthDate.getMonth(),
          nextDay,
        );
      });

      return nextMonthDate;
    });
  };

  const handleJumpToToday = () => {
    setSelectedDate(todayDate);
    setVisibleMonthDate(
      createCalendarDate(todayDate.getFullYear(), todayDate.getMonth(), 1),
    );
  };

  const handleOpenLocalFilter = () => {
    setDraftLocalFilter(activeLocalFilter);
    setIsLocalFilterModalVisible(true);
  };

  const handleCloseLocalFilter = () => {
    setIsLocalFilterModalVisible(false);
  };

  const handleToggleLocalFilter = (sectionKey: string, optionKey: string) => {
    if (sectionKey !== LOCAL_FILTER_SECTION_KEY) {
      return;
    }

    setDraftLocalFilter(optionKey as LocalEventsFilterKey);
  };

  const handleResetLocalFilter = () => {
    setDraftLocalFilter("today");
    setActiveLocalFilter("today");
    setIsLocalFilterModalVisible(false);
  };

  const handleConfirmLocalFilter = () => {
    setActiveLocalFilter(draftLocalFilter);
    setIsLocalFilterModalVisible(false);
  };

  const handleOpenCard = (_eventItem: EventItem) => {
    setSelectedEvent(_eventItem);
  };

  const handlePressVisitNow = (eventItem: EventItem) => {
    setSelectedEvent(eventItem);
  };

  const handlePressFacebook = (eventItem: EventItem) => {
    if (!eventItem.facebookUrl) {
      return;
    }

    void Linking.openURL(eventItem.facebookUrl);
  };

  const handleCloseEventModal = () => {
    setSelectedEvent(null);
  };

  const renderMonthNav = () => (
    <View style={styles.monthNavigationWrap}>
      <DateFilterButton label="TODAY" onPress={handleJumpToToday} />
      <View style={styles.monthArrowsWrap}>
        <Pressable
          accessibilityRole="button"
          hitSlop={8}
          onPress={() => handleChangeMonth(-1)}
          style={({ pressed }) => [
            styles.monthArrowButton,
            pressed && styles.arrowPressed,
          ]}
        >
          <MaterialIcons
            color={colors.dashboardBottomIcon}
            name="chevron-left"
            size={26}
          />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          hitSlop={8}
          onPress={() => handleChangeMonth(1)}
          style={({ pressed }) => [
            styles.monthArrowButton,
            pressed && styles.arrowPressed,
          ]}
        >
          <MaterialIcons
            color={colors.dashboardBottomIcon}
            name="chevron-right"
            size={26}
          />
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />

      <View
        style={[
          styles.headerWrap,
          {
            paddingTop: insets.top + 8,
          },
        ]}
      >
        <View style={styles.headerContent}>
          <Pressable
            accessibilityRole="button"
            onPress={handleBack}
            style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
          >
            <Image
              source={EVENTS_ASSETS.backIcon}
              style={styles.backIcon}
              resizeMode="contain"
            />
          </Pressable>

          <Text style={styles.headerTitle}>EVENTS</Text>
        </View>
      </View>

      <View style={styles.panelWrap}>
        <View style={styles.panel}>
          <View style={styles.panelContent}>
            <View style={styles.topContent}>
              <EventsTabs
                activeTab={activeTab}
                onChangeTab={setActiveTab}
                rightAccessory={
                  activeTab === "events" ? (
                    renderMonthNav()
                  ) : (
                    <DateFilterButton
                      label={localFilterLabel}
                      onPress={handleOpenLocalFilter}
                      showDropdownIcon
                    />
                  )
                }
              />

              {activeTab === "events" ? (
                <View style={styles.calendarSection}>
                  <Text style={styles.monthTitle}>{getMonthTitle(visibleMonthDate)}</Text>
                  <CalendarMonthView
                    monthDate={visibleMonthDate}
                    selectedDate={selectedDate}
                    onSelectDate={handleSelectDate}
                  />
                </View>
              ) : null}
            </View>
            <View style={styles.cardsSection}>
              <FlatList
                data={visibleEvents}
                keyExtractor={(item) => item.id}
                ItemSeparatorComponent={() => <View style={styles.cardsItemSeparator} />}
                renderItem={({ item }) => (
                  <EventCard
                    event={item}
                    onPress={handleOpenCard}
                    onPressFacebook={handlePressFacebook}
                    onPressVisitNow={handlePressVisitNow}
                  />
                )}
                ListEmptyComponent={
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>{emptyStateMessage}</Text>
                  </View>
                }
                contentContainerStyle={[
                  styles.cardsListContent,
                  {
                    paddingBottom: Math.max(insets.bottom, 16) + 12,
                  },
                ]}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </View>
        </View>
      </View>

      <FilterBottomModal
        visible={isLocalFilterModalVisible}
        title="Local Events Filter"
        resetLabel="Reset"
        confirmLabel="Apply"
        sections={localFilterSections}
        onClose={handleCloseLocalFilter}
        onToggleOption={handleToggleLocalFilter}
        onReset={handleResetLocalFilter}
        onConfirm={handleConfirmLocalFilter}
      />

      <EventDetailsModal
        event={selectedEvent}
        onClose={handleCloseEventModal}
        onPressFacebook={handlePressFacebook}
      />
    </View>
  );
}

const createStyles = (
  colors: typeof Colors.light,
  contentWidth: number,
) => {
  const roundedText = { fontFamily: RoundedFontFamily } as const;

  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.dashboardScreenBackground,
      alignItems: "center",
    },
    headerWrap: {
      width: "100%",
      alignItems: "center",
      paddingBottom: 14,
    },
    headerContent: {
      width: contentWidth,
      minHeight: 42,
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      paddingHorizontal: 24,
    },
    backButton: {
      position: "absolute",
      left: 24,
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: "center",
      justifyContent: "center",
    },
    backButtonPressed: {
      opacity: 0.84,
    },
    backIcon: {
      width: 24,
      height: 24,
    },
    headerTitle: {
      ...roundedText,
      color: colors.dashboardHeaderText,
      fontSize: 18,
      lineHeight: 22,
      fontWeight: "900",
      letterSpacing: 0.8,
    },
    panelWrap: {
      flex: 1,
      width: "100%",
      alignItems: "center",
    },
    panel: {
      flex: 1,
      width: contentWidth,
      backgroundColor: colors.loginCardBackground,
      borderTopLeftRadius: 38,
      borderTopRightRadius: 38,
      overflow: "hidden",
    },
    panelContent: {
      flex: 1,
      paddingTop: 24,
    },
    topContent: {
      paddingHorizontal: 24,
    },
    calendarSection: {
      marginTop: 12,
    },
    monthTitle: {
      ...roundedText,
      color: colors.dashboardBottomIconActive,
      fontSize: 16,
      lineHeight: 22,
      fontWeight: "900",
      marginBottom: 8,
    },
    monthNavigationWrap: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    monthArrowsWrap: {
      flexDirection: "row",
      alignItems: "center",
      gap: 2,
    },
    monthArrowButton: {
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: "center",
      justifyContent: "center",
    },
    arrowPressed: {
      opacity: 0.82,
    },
    cardsSection: {
      marginTop: 14,
      flex: 1,
      width: "100%",
      alignSelf: "stretch",
      borderRadius: 32,
      backgroundColor: colors.petDetailsSheetBackground,
      paddingVertical: 14,
      paddingHorizontal: 12,
      overflow: "hidden",
    },
    cardsListContent: {
      flexGrow: 1,
    },
    cardsItemSeparator: {
      height: 10,
    },
    emptyState: {
      minHeight: 110,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(255, 255, 255, 0.45)",
      paddingHorizontal: 18,
    },
    emptyStateText: {
      ...roundedText,
      color: colors.dashboardBottomIcon,
      fontSize: 14,
      lineHeight: 18,
      fontWeight: "700",
      textAlign: "center",
    },
  });
};
