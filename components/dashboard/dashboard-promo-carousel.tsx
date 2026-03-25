import type { DashboardPromoItem } from "@/features/dashboard/dashboard.data";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Image, ScrollView, StyleSheet, View } from "react-native";

type DashboardPromoCarouselProps = {
  autoPlayIntervalMs?: number;
  itemHeight: number;
  itemWidth: number;
  items: DashboardPromoItem[];
};

export function DashboardPromoCarousel({
  autoPlayIntervalMs = 3400,
  itemHeight,
  itemWidth,
  items,
}: DashboardPromoCarouselProps) {
  const styles = useMemo(() => createStyles(itemHeight, itemWidth), [
    itemHeight,
    itemWidth,
  ]);
  const scrollRef = useRef<ScrollView | null>(null);
  const activeIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    activeIndexRef.current = 0;
    setActiveIndex(0);
    scrollRef.current?.scrollTo({ x: 0, animated: false });
  }, [itemWidth]);

  useEffect(() => {
    if (items.length <= 1) {
      return;
    }

    const intervalId = setInterval(() => {
      const nextIndex = (activeIndexRef.current + 1) % items.length;
      activeIndexRef.current = nextIndex;
      setActiveIndex(nextIndex);
      scrollRef.current?.scrollTo({ x: nextIndex * itemWidth, animated: true });
    }, autoPlayIntervalMs);

    return () => clearInterval(intervalId);
  }, [autoPlayIntervalMs, itemWidth, items.length]);

  const handleMomentumEnd = (offsetX: number) => {
    const nextIndex = Math.round(offsetX / itemWidth);
    activeIndexRef.current = nextIndex;
    setActiveIndex(nextIndex);
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        bounces={false}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) =>
          handleMomentumEnd(event.nativeEvent.contentOffset.x)
        }
      >
        {items.map((item) => (
          <View key={item.id} style={styles.slide}>
            <Image source={item.image} style={styles.image} resizeMode="cover" />
          </View>
        ))}
      </ScrollView>

      {items.length > 1 ? (
        <View style={styles.pagination}>
          {items.map((item, index) => (
            <View
              key={item.id}
              style={[styles.dot, index === activeIndex && styles.dotActive]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const createStyles = (itemHeight: number, itemWidth: number) =>
  StyleSheet.create({
    wrapper: {
      width: itemWidth,
      height: itemHeight,
      borderRadius: 20,
      overflow: "hidden",
    },
    slide: {
      width: itemWidth,
      height: itemHeight,
    },
    image: {
      width: "100%",
      height: "100%",
    },
    pagination: {
      position: "absolute",
      bottom: 8,
      left: 0,
      right: 0,
      flexDirection: "row",
      justifyContent: "center",
      gap: 6,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 999,
      backgroundColor: "rgba(255, 255, 255, 0.54)",
    },
    dotActive: {
      width: 14,
      backgroundColor: "rgba(255, 255, 255, 0.95)",
    },
  });
