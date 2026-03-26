import { Colors, RoundedFontFamily } from "@/constants/theme";
import {
  buildMonthGrid,
  isSameCalendarDate,
  toDateKey,
  WEEKDAY_LABELS,
} from "@/features/events/events-calendar";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type CalendarMonthViewProps = {
  monthDate: Date;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
};

export function CalendarMonthView({
  monthDate,
  selectedDate,
  onSelectDate,
}: CalendarMonthViewProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const styles = useMemo(() => createStyles(colors), [colors]);
  const calendarCells = useMemo(() => buildMonthGrid(monthDate), [monthDate]);

  return (
    <View>
      <View style={styles.weekdaysRow}>
        {WEEKDAY_LABELS.map((label) => (
          <Text key={label} style={styles.weekdayLabel}>
            {label}
          </Text>
        ))}
      </View>

      <View style={styles.daysGrid}>
        {calendarCells.map((cell) => {
          const selected = isSameCalendarDate(cell.date, selectedDate);

          return (
            <Pressable
              key={toDateKey(cell.date)}
              accessibilityRole="button"
              onPress={() => onSelectDate(cell.date)}
              style={({ pressed }) => [
                styles.dayCell,
                pressed && styles.dayCellPressed,
              ]}
            >
              <Text
                style={[
                  styles.dayText,
                  !cell.isCurrentMonth && styles.dayTextOutsideMonth,
                  selected && styles.dayTextSelected,
                ]}
              >
                {cell.day}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    weekdaysRow: {
      flexDirection: "row",
      marginBottom: 8,
      marginTop: 6,
    },
    weekdayLabel: {
      width: "14.2857%",
      textAlign: "center",
      fontFamily: RoundedFontFamily,
      color: "#5E90CC",
      fontSize: 13,
      lineHeight: 18,
      fontWeight: "700",
    },
    daysGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
    },
    dayCell: {
      width: "14.2857%",
      minHeight: 38,
      alignItems: "center",
      justifyContent: "center",
    },
    dayCellPressed: {
      opacity: 0.82,
    },
    dayText: {
      fontFamily: RoundedFontFamily,
      color: "#4A82C4",
      fontSize: 14,
      lineHeight: 18,
      fontWeight: "700",
      borderBottomWidth: 3,
      borderBottomColor: "transparent",
      paddingBottom: 2,
    },
    dayTextOutsideMonth: {
      color: "rgba(74, 130, 196, 0.38)",
    },
    dayTextSelected: {
      color: colors.dashboardBottomIcon,
      borderBottomColor: "#6FA7E4",
    },
  });
