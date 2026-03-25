import {
  usePathname,
  useRouter,
  useRootNavigationState,
  useSegments,
} from "expo-router";
import { useEffect } from "react";

import { useAuth } from "@/hooks/use-auth";

export function AuthNavigationGate() {
  const { isHydrating, session } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const segments = useSegments();
  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    if (!rootNavigationState?.key || isHydrating) {
      return;
    }

    const topSegment = segments[0];
    const isAuthRoute = topSegment === "(auth)";
    const isRootIndex = pathname === "/";
    const isGetStartedRoute = pathname === "/(auth)/get-started";

    if (!session && !isAuthRoute && !isRootIndex) {
      router.replace("/(auth)/login");
      return;
    }

    if (!session && isGetStartedRoute) {
      router.replace("/(auth)/login");
      return;
    }

    if (session && isAuthRoute && !isGetStartedRoute) {
      router.replace("/(auth)/get-started");
    }
  }, [isHydrating, pathname, rootNavigationState?.key, router, segments, session]);

  return null;
}
