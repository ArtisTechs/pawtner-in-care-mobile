import { HeroesWallTabs } from "@/components/heroes-wall/heroes-wall-tabs";
import { LeaderboardHeaderRow } from "@/components/heroes-wall/leaderboard-header-row";
import { LeaderboardRow } from "@/components/heroes-wall/leaderboard-row";
import { TopHeroCard } from "@/components/heroes-wall/top-hero-card";
import { Colors, DisplayFontFamily } from "@/constants/theme";
import {
  HEROES_WALL_ASSETS,
  getHeroesLeaderboardByPeriod,
} from "@/features/heroes-wall/heroes-wall.data";
import type {
  HeroLeaderboardEntry,
  HeroesWallPeriod,
} from "@/features/heroes-wall/heroes-wall.types";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MAX_CONTENT_WIDTH = 420;

const HEADER_ROW_HEIGHT = 40;

export default function HeroesWallScreen() {
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

  const [activePeriod, setActivePeriod] = useState<HeroesWallPeriod>("weekly");

  const leaderboardEntries = useMemo(
    () => getHeroesLeaderboardByPeriod(activePeriod),
    [activePeriod],
  );
  const topHeroes = leaderboardEntries.slice(0, 3);
  const topHero = topHeroes[0];
  const secondHero = topHeroes[1];
  const thirdHero = topHeroes[2];
  const remainingHeroes = leaderboardEntries.slice(3);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(tabs)");
  };

  const handlePressLeaderboardRow = (_hero: HeroLeaderboardEntry) => {
    // Reserved for donor profile drilldown once that flow is implemented.
  };

  return (
    <View style={styles.screen}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.loginScreenBackground}
      />

      <View
        style={[
          styles.contentWrap,
          {
            paddingTop: insets.top + 8,
          },
        ]}
      >
        <View style={styles.headerContent}>
          <Pressable
            accessibilityRole="button"
            onPress={handleBack}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          >
            <Image
              source={HEROES_WALL_ASSETS.backIcon}
              style={styles.backIcon}
              resizeMode="contain"
            />
          </Pressable>

          <Text style={styles.headerTitle}>HEROES WALL</Text>
        </View>

        <View style={styles.fixedTopSection}>
          <HeroesWallTabs activeTab={activePeriod} onChangeTab={setActivePeriod} />

          <View style={styles.topThreeWrap}>
            {secondHero ? <TopHeroCard hero={secondHero} /> : null}
            {topHero ? <TopHeroCard hero={topHero} isTopRank /> : null}
            {thirdHero ? <TopHeroCard hero={thirdHero} /> : null}
          </View>

          <View style={styles.headerRowWrap}>
            <LeaderboardHeaderRow />
          </View>
        </View>

        <View style={styles.listPanel}>
          <FlatList
            data={remainingHeroes}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <LeaderboardRow hero={item} onPress={handlePressLeaderboardRow} />
            )}
            ItemSeparatorComponent={() => <View style={styles.rowGap} />}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No heroes yet for this period.</Text>
              </View>
            }
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: insets.bottom + 20 },
            ]}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors: typeof Colors.light, contentWidth: number) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.loginScreenBackground,
      alignItems: "center",
    },
    contentWrap: {
      flex: 1,
      width: contentWidth,
      paddingHorizontal: 12,
    },
    headerContent: {
      minHeight: 42,
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    },
    backButton: {
      position: "absolute",
      left: 0,
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: "center",
      justifyContent: "center",
    },
    backIcon: {
      width: 24,
      height: 24,
      tintColor: colors.dashboardBottomIcon,
    },
    headerTitle: {
      fontFamily: DisplayFontFamily,
      color: colors.loginHeaderGradientStart,
      fontSize: 36,
      lineHeight: 36,
      letterSpacing: 0.5,
      textAlign: "center",
    },
    fixedTopSection: {
      paddingTop: 14,
    },
    topThreeWrap: {
      marginTop: 16,
      marginBottom: 14,
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
      paddingHorizontal: 6,
      minHeight: 166,
    },
    headerRowWrap: {
      marginTop: 6,
      marginBottom: 10,
      minHeight: HEADER_ROW_HEIGHT,
    },
    rowGap: {
      height: 10,
    },
    listPanel: {
      flex: 1,
      borderRadius: 18,
      backgroundColor: "rgba(160, 160, 160, 0.34)",
      padding: 12,
      overflow: "hidden",
    },
    listContent: {
      flexGrow: 1,
    },
    emptyState: {
      minHeight: 150,
      borderRadius: 18,
      backgroundColor: "rgba(255, 255, 255, 0.6)",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 18,
    },
    emptyText: {
      fontFamily: DisplayFontFamily,
      color: colors.loginHeaderGradientStart,
      fontSize: 22,
      lineHeight: 24,
      textAlign: "center",
    },
    pressed: {
      opacity: 0.84,
    },
  });
