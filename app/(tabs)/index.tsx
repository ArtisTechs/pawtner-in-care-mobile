import { Pressable, StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/hooks/use-auth";

export default function HomeScreen() {
  const { session, signOut } = useAuth();

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.heroCard}>
        <ThemedText type="title">
          Welcome, {session?.user.firstName ?? "Pawtner user"}
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Your auth session is now handled through a dedicated provider and
          service layer instead of the screen owning API logic.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.detailsCard}>
        <ThemedText type="subtitle">Session Details</ThemedText>
        <ThemedText>Email: {session?.user.email ?? "-"}</ThemedText>
        <ThemedText>Role: {session?.user.role ?? "-"}</ThemedText>
        <ThemedText>ID: {session?.user.id ?? "-"}</ThemedText>
      </ThemedView>

      <Pressable onPress={signOut} style={styles.button}>
        <ThemedText style={styles.buttonText}>Sign out</ThemedText>
      </Pressable>

      <ThemedView style={styles.notesCard}>
        <ThemedText type="subtitle">Auth Layer Standard</ThemedText>
        <ThemedText>Screens handle form state and navigation only.</ThemedText>
        <ThemedText>
          Services own endpoint paths, payloads, and response types.
        </ThemedText>
        <ThemedText>
          The auth provider owns session restore, login persistence, and
          logout.
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 16,
    justifyContent: "center",
  },
  heroCard: {
    gap: 10,
    padding: 20,
    borderRadius: 20,
    backgroundColor: "rgba(46, 111, 190, 0.10)",
  },
  subtitle: {
    lineHeight: 22,
  },
  detailsCard: {
    gap: 8,
    padding: 20,
    borderRadius: 20,
    backgroundColor: "rgba(46, 111, 190, 0.08)",
  },
  notesCard: {
    gap: 8,
    padding: 20,
    borderRadius: 20,
    backgroundColor: "rgba(46, 111, 190, 0.05)",
  },
  button: {
    alignSelf: "flex-start",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: "#2D74C3",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
