import { BadgeList } from "@/components/profile/badge-list";
import { ProfilePhotoUploader } from "@/components/profile/profile-photo-uploader";
import { ProfileHeader } from "@/components/profile/profile-header";
import { SettingsItem } from "@/components/profile/settings-item";
import { DashboardBottomNavbar } from "@/components/navigation/dashboard-bottom-navbar";
import { AppToast } from "@/components/ui/app-toast";
import { ERROR_MESSAGES } from "@/constants/error-messages";
import { Colors, RoundedFontFamily } from "@/constants/theme";
import {
  PROFILE_BADGES,
  PROFILE_SETTINGS_ITEMS,
} from "@/features/profile/profile.data";
import type { ProfileSettingsKey } from "@/features/profile/profile.types";
import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/services/api/api-error";
import { cloudinaryService } from "@/services/media/cloudinary.service";
import { userService } from "@/services/user/user.service";
import { userStorage } from "@/services/user/user.storage";
import type { UserProfile } from "@/types/user";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  type ImageSourcePropType,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MAX_CONTENT_WIDTH = 420;
const NAVBAR_RESERVED_SPACE = 86;
const normalizeNameValue = (value: string) => value.trim().replace(/\s+/g, " ");

const resolveNonEmptyText = (value: unknown) => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : null;
};

const resolveProfilePictureUri = (
  user: Record<string, unknown> | null | undefined,
) => {
  if (!user) {
    return null;
  }

  const avatarUriCandidates = [
    user.profilePicture,
    user.avatar,
    user.avatarUrl,
    user.profileImage,
    user.profileImageUrl,
    user.photoUrl,
  ];

  for (const candidate of avatarUriCandidates) {
    const resolvedUri = resolveNonEmptyText(candidate);

    if (resolvedUri) {
      return resolvedUri;
    }
  }

  return null;
};

const resolveAvatarSource = (
  profilePictureUri: string | null,
  user: Record<string, unknown> | null | undefined,
): ImageSourcePropType | null => {
  if (profilePictureUri) {
    return { uri: profilePictureUri };
  }

  if (!user) {
    return null;
  }

  const resolvedUri = resolveProfilePictureUri(user);

  return resolvedUri ? { uri: resolvedUri } : null;
};

export default function ProfileScreen() {
  const router = useRouter();
  const { session, signOut, updateSessionUser } = useAuth();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const { hideToast, showToast, toast } = useToast();
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width, MAX_CONTENT_WIDTH);
  const styles = useMemo(
    () => createStyles(colors, contentWidth),
    [colors, contentWidth],
  );
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingProfilePhoto, setIsUploadingProfilePhoto] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isEditNameModalVisible, setIsEditNameModalVisible] = useState(false);

  const userRecord = session?.user as Record<string, unknown> | undefined;
  const initialFirstName = useMemo(
    () => resolveNonEmptyText(userRecord?.firstName) ?? "",
    [userRecord?.firstName],
  );
  const initialMiddleName = useMemo(
    () => resolveNonEmptyText(userRecord?.middleName) ?? "",
    [userRecord?.middleName],
  );
  const initialLastName = useMemo(
    () => resolveNonEmptyText(userRecord?.lastName) ?? "",
    [userRecord?.lastName],
  );
  const initialProfilePicture = useMemo(
    () => resolveProfilePictureUri(userRecord) ?? null,
    [userRecord],
  );
  const fallbackName = useMemo(
    () => resolveNonEmptyText(userRecord?.name),
    [userRecord?.name],
  );
  const [firstName, setFirstName] = useState(initialFirstName);
  const [middleName, setMiddleName] = useState(initialMiddleName);
  const [lastName, setLastName] = useState(initialLastName);
  const [profilePictureUri, setProfilePictureUri] = useState<string | null>(
    initialProfilePicture,
  );
  const [draftFirstName, setDraftFirstName] = useState("");
  const [draftMiddleName, setDraftMiddleName] = useState("");
  const [draftLastName, setDraftLastName] = useState("");
  const [draftProfilePictureUri, setDraftProfilePictureUri] = useState<
    string | null
  >(initialProfilePicture);

  const fullName = useMemo(() => {
    const combinedName = [firstName, middleName, lastName]
      .filter(Boolean)
      .join(" ")
      .trim();

    return combinedName || fallbackName || "Pawtner User";
  }, [fallbackName, firstName, middleName, lastName]);
  const email = useMemo(
    () => resolveNonEmptyText(userRecord?.email) ?? "user@pawtner.app",
    [userRecord?.email],
  );
  const avatarSource = useMemo(
    () => resolveAvatarSource(profilePictureUri, userRecord),
    [profilePictureUri, userRecord],
  );

  useEffect(() => {
    setFirstName(initialFirstName);
    setMiddleName(initialMiddleName);
    setLastName(initialLastName);
    setProfilePictureUri(initialProfilePicture);
    setDraftProfilePictureUri(initialProfilePicture);
  }, [initialFirstName, initialLastName, initialMiddleName, initialProfilePicture]);

  useEffect(() => {
    const userId = resolveNonEmptyText(userRecord?.id);

    if (!userId) {
      return;
    }

    let isMounted = true;

    const hydrateCachedName = async () => {
      const cachedProfile = await userStorage.getUserProfile(userId);

      if (!isMounted || !cachedProfile) {
        return;
      }

      setFirstName(resolveNonEmptyText(cachedProfile.firstName) ?? "");
      setMiddleName(resolveNonEmptyText(cachedProfile.middleName) ?? "");
      setLastName(resolveNonEmptyText(cachedProfile.lastName) ?? "");
      setProfilePictureUri(resolveNonEmptyText(cachedProfile.profilePicture) ?? null);
    };

    void hydrateCachedName();

    return () => {
      isMounted = false;
    };
  }, [userRecord?.id]);

  const handleSignOut = async () => {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);

    try {
      await signOut();
      router.replace("/(auth)/login");
    } finally {
      setIsSigningOut(false);
    }
  };

  const handlePressAddBadge = () => {
    // TODO: connect add badge flow when profile badge management screen is available.
  };

  const persistProfileDetails = async ({
    nextFirstName,
    nextLastName,
    nextMiddleName,
    nextProfilePictureUri,
    successMessage = "Profile updated.",
  }: {
    nextFirstName: string;
    nextLastName: string;
    nextMiddleName: string;
    nextProfilePictureUri: string | null;
    successMessage?: string;
  }) => {
    const userId = resolveNonEmptyText(userRecord?.id);
    const accessToken = resolveNonEmptyText(session?.accessToken);
    const currentUserProfile = (session?.user ?? {}) as UserProfile;
    const resolvedEmail = resolveNonEmptyText(currentUserProfile.email) ?? email;

    if (!userId || !accessToken || !resolvedEmail) {
      showToast("Unable to update profile right now.", "error");
      return null;
    }

    const normalizedRole = resolveNonEmptyText(currentUserProfile.role);
    const resolvedRole = normalizedRole?.toUpperCase() === "ADMIN" ? "ADMIN" : "USER";

    setIsSavingProfile(true);

    try {
      const updatedProfile = await userService.updateUser({
        payload: {
          email: resolvedEmail,
          firstName: nextFirstName,
          lastName: nextLastName,
          middleName: nextMiddleName || null,
          profilePicture: nextProfilePictureUri,
          role: resolvedRole,
        },
        token: accessToken,
        userId,
      });

      const normalizedFirstName =
        resolveNonEmptyText(updatedProfile.firstName) ?? nextFirstName;
      const normalizedMiddleName =
        resolveNonEmptyText(updatedProfile.middleName) ?? nextMiddleName;
      const normalizedLastName =
        resolveNonEmptyText(updatedProfile.lastName) ?? nextLastName;
      const normalizedProfilePicture =
        resolveNonEmptyText(updatedProfile.profilePicture) ?? nextProfilePictureUri;
      const normalizedFullName =
        [normalizedFirstName, normalizedMiddleName, normalizedLastName]
          .filter(Boolean)
          .join(" ")
          .trim() ||
        fallbackName ||
        "Pawtner User";

      const nextUserProfile: UserProfile = {
        ...currentUserProfile,
        ...updatedProfile,
        email: resolveNonEmptyText(updatedProfile.email) ?? resolvedEmail,
        firstName: normalizedFirstName,
        id: userId,
        lastName: normalizedLastName,
        middleName: normalizedMiddleName || null,
        name: normalizedFullName,
        profilePicture: normalizedProfilePicture,
        role: resolveNonEmptyText(updatedProfile.role) ?? resolvedRole,
      };

      setFirstName(normalizedFirstName);
      setMiddleName(normalizedMiddleName);
      setLastName(normalizedLastName);
      setProfilePictureUri(normalizedProfilePicture);
      await updateSessionUser(nextUserProfile);
      showToast(successMessage);
      return nextUserProfile;
    } catch (error) {
      showToast(
        getErrorMessage(error, "Unable to save profile changes."),
        "error",
      );
      return null;
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleOpenEditProfileNames = () => {
    setDraftFirstName(firstName);
    setDraftMiddleName(middleName);
    setDraftLastName(lastName);
    setDraftProfilePictureUri(profilePictureUri);
    setIsEditNameModalVisible(true);
  };

  const handleCancelEditProfileNames = () => {
    setDraftFirstName("");
    setDraftMiddleName("");
    setDraftLastName("");
    setDraftProfilePictureUri(profilePictureUri);
    setIsEditNameModalVisible(false);
  };

  const handleSaveProfileNames = () => {
    if (isSavingProfile || isUploadingProfilePhoto) {
      if (isUploadingProfilePhoto) {
        showToast("Please wait for the photo upload to finish.");
      }
      return;
    }

    const nextFirstName = normalizeNameValue(draftFirstName);
    const nextMiddleName = normalizeNameValue(draftMiddleName);
    const nextLastName = normalizeNameValue(draftLastName);

    if (!nextFirstName) {
      showToast(ERROR_MESSAGES.firstNameRequired, "error");
      return;
    }

    if (!nextLastName) {
      showToast(ERROR_MESSAGES.lastNameRequired, "error");
      return;
    }

    void persistProfileDetails({
      nextFirstName,
      nextLastName,
      nextMiddleName,
      nextProfilePictureUri: draftProfilePictureUri,
    }).then((result) => {
      if (!result) {
        return;
      }

      setIsEditNameModalVisible(false);
      setDraftFirstName("");
      setDraftMiddleName("");
      setDraftLastName("");
      setDraftProfilePictureUri(resolveNonEmptyText(result.profilePicture) ?? null);
    });
  };

  const handleDraftPhotoChange = async (selectedPhotoUri: string | null) => {
    if (!selectedPhotoUri) {
      setDraftProfilePictureUri(null);
      showToast("Profile photo cleared.");
      return;
    }

    if (/^https?:\/\//i.test(selectedPhotoUri)) {
      setDraftProfilePictureUri(selectedPhotoUri);
      showToast("Profile photo ready to save.");
      return;
    }

    const previousPhotoUri = draftProfilePictureUri;
    setDraftProfilePictureUri(selectedPhotoUri);
    setIsUploadingProfilePhoto(true);
    showToast("Uploading profile photo...");

    try {
      const uploadedPhotoUri = await cloudinaryService.uploadImage({
        uri: selectedPhotoUri,
      });

      setDraftProfilePictureUri(uploadedPhotoUri);
      showToast("Profile photo uploaded.");
    } catch (error) {
      setDraftProfilePictureUri(previousPhotoUri);
      showToast(
        getErrorMessage(error, "Unable to upload profile photo right now."),
        "error",
      );
    } finally {
      setIsUploadingProfilePhoto(false);
    }
  };

  const handlePressSetting = (settingKey: ProfileSettingsKey) => {
    if (settingKey === "profile-settings") {
      handleOpenEditProfileNames();
      return;
    }

    router.push("/change-password");
  };

  return (
    <View style={styles.screen}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.loginHeaderGradientEnd}
      />
      <AppToast onDismiss={hideToast} toast={toast} />

      <LinearGradient
        colors={[
          colors.loginHeaderGradientEnd,
          colors.dashboardScreenBackground,
          colors.loginHeaderGradientStart,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View
          style={[
            styles.contentWrap,
            {
              paddingTop: insets.top + 10,
            },
          ]}
        >
          <View style={styles.actionsRow}>
            <Pressable
              accessibilityRole="button"
              disabled={isSigningOut}
              onPress={handleSignOut}
              style={({ pressed }) => [
                styles.logoutButton,
                (pressed || isSigningOut) && styles.logoutButtonPressed,
              ]}
            >
              <MaterialIcons color={colors.white} name="logout" size={18} />
              <Text style={styles.logoutText}>
                {isSigningOut ? "Signing Out..." : "Sign Out"}
              </Text>
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              {
                paddingBottom: NAVBAR_RESERVED_SPACE + insets.bottom + 12,
              },
            ]}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.profileCard}>
              <ProfileHeader
                avatarSource={avatarSource}
                email={email}
                fullName={fullName}
              />

              <BadgeList badges={PROFILE_BADGES} onPressAdd={handlePressAddBadge} />

              <Text style={styles.generalLabel}>GENERAL</Text>

              <View style={styles.settingsList}>
                {PROFILE_SETTINGS_ITEMS.map((item) => (
                  <SettingsItem
                    key={item.key}
                    label={item.label}
                    onPress={() => handlePressSetting(item.key)}
                  />
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </LinearGradient>

      <Modal
        animationType="fade"
        onRequestClose={handleCancelEditProfileNames}
        transparent
        visible={isEditNameModalVisible}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            accessibilityRole="button"
            onPress={handleCancelEditProfileNames}
            style={StyleSheet.absoluteFill}
          />

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.modalKeyboardWrap}
          >
            <View
              style={[
                styles.modalCard,
                {
                  paddingBottom: insets.bottom + 16,
                },
              ]}
            >
              <Text style={styles.modalTitle}>Edit Profile Name</Text>

              <ProfilePhotoUploader
                disabled={isSavingProfile}
                isUploading={isUploadingProfilePhoto}
                onChangePhoto={handleDraftPhotoChange}
                onError={(message) => showToast(message, "error")}
                photoUri={draftProfilePictureUri}
              />

              <View style={styles.modalInputGroup}>
                <Text style={styles.modalInputLabel}>First Name</Text>
                <TextInput
                  autoCapitalize="words"
                  autoCorrect={false}
                  onChangeText={setDraftFirstName}
                  placeholder="Enter first name"
                  placeholderTextColor="rgba(42, 102, 171, 0.56)"
                  style={styles.modalInput}
                  value={draftFirstName}
                />
              </View>

              <View style={styles.modalInputGroup}>
                <Text style={styles.modalInputLabel}>Middle Name</Text>
                <TextInput
                  autoCapitalize="words"
                  autoCorrect={false}
                  onChangeText={setDraftMiddleName}
                  placeholder="Enter middle name"
                  placeholderTextColor="rgba(42, 102, 171, 0.56)"
                  style={styles.modalInput}
                  value={draftMiddleName}
                />
              </View>

              <View style={styles.modalInputGroup}>
                <Text style={styles.modalInputLabel}>Last Name</Text>
                <TextInput
                  autoCapitalize="words"
                  autoCorrect={false}
                  onChangeText={setDraftLastName}
                  placeholder="Enter last name"
                  placeholderTextColor="rgba(42, 102, 171, 0.56)"
                  style={styles.modalInput}
                  value={draftLastName}
                />
              </View>

              <View style={styles.modalButtonRow}>
                <Pressable
                  accessibilityRole="button"
                  disabled={isSavingProfile || isUploadingProfilePhoto}
                  onPress={handleCancelEditProfileNames}
                  style={({ pressed }) => [
                    styles.modalCancelButton,
                    (isSavingProfile || isUploadingProfilePhoto) &&
                      styles.modalCancelButtonDisabled,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.modalCancelButtonText}>Cancel</Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  disabled={isSavingProfile || isUploadingProfilePhoto}
                  onPress={handleSaveProfileNames}
                  style={({ pressed }) => [
                    styles.modalSaveButton,
                    (isSavingProfile || isUploadingProfilePhoto) &&
                      styles.modalSaveButtonDisabled,
                    pressed &&
                      !isSavingProfile &&
                      !isUploadingProfilePhoto &&
                      styles.pressed,
                  ]}
                >
                  <Text style={styles.modalSaveButtonText}>
                    {isUploadingProfilePhoto
                      ? "Uploading..."
                      : isSavingProfile
                        ? "Saving..."
                        : "Save"}
                  </Text>
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <DashboardBottomNavbar activeKey="profile" />
    </View>
  );
}

const createStyles = (colors: typeof Colors.light, contentWidth: number) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.dashboardScreenBackground,
    },
    gradient: {
      flex: 1,
      alignItems: "center",
    },
    contentWrap: {
      flex: 1,
      width: contentWidth,
    },
    actionsRow: {
      minHeight: 44,
      paddingHorizontal: 18,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
    },
    logoutButton: {
      minHeight: 32,
      borderRadius: 999,
      paddingHorizontal: 10,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
      backgroundColor: colors.loginError,
      shadowColor: "rgba(90, 20, 20, 0.4)",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.22,
      shadowRadius: 4,
      elevation: 3,
    },
    logoutButtonPressed: {
      opacity: 0.85,
    },
    logoutText: {
      fontFamily: RoundedFontFamily,
      color: colors.white,
      fontSize: 14,
      lineHeight: 15,
      fontWeight: "800",
    },
    scrollContent: {
      alignItems: "center",
      paddingTop: 56,
      paddingHorizontal: 10,
    },
    profileCard: {
      width: "100%",
      borderRadius: 36,
      borderWidth: 2,
      borderColor: "rgba(255, 255, 255, 0.95)",
      backgroundColor: "rgba(40, 111, 188, 0.82)",
      paddingHorizontal: 16,
      paddingBottom: 24,
      minHeight: 480,
    },
    generalLabel: {
      marginTop: 14,
      paddingHorizontal: 2,
      fontFamily: RoundedFontFamily,
      color: colors.dashboardHeaderText,
      fontSize: 14,
      lineHeight: 17,
      fontWeight: "900",
      letterSpacing: 0.7,
    },
    settingsList: {
      marginTop: 8,
      gap: 8,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(11, 28, 51, 0.38)",
      justifyContent: "flex-end",
    },
    modalKeyboardWrap: {
      width: "100%",
    },
    modalCard: {
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      backgroundColor: "#E8F1FB",
      paddingHorizontal: 16,
      paddingTop: 16,
      gap: 10,
    },
    modalTitle: {
      fontFamily: RoundedFontFamily,
      color: colors.dashboardBottomIconActive,
      fontSize: 22,
      lineHeight: 26,
      fontWeight: "900",
      textAlign: "center",
    },
    modalInputGroup: {
      gap: 6,
    },
    modalInputLabel: {
      fontFamily: RoundedFontFamily,
      color: colors.dashboardBottomIcon,
      fontSize: 13,
      lineHeight: 15,
      fontWeight: "800",
      paddingHorizontal: 2,
    },
    modalInput: {
      minHeight: 46,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: "rgba(29, 78, 136, 0.2)",
      backgroundColor: colors.white,
      paddingHorizontal: 12,
      fontFamily: RoundedFontFamily,
      color: colors.dashboardBottomIcon,
      fontSize: 15,
      lineHeight: 20,
      fontWeight: "700",
    },
    modalButtonRow: {
      marginTop: 4,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    },
    modalCancelButton: {
      flex: 1,
      minHeight: 44,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: "rgba(29, 78, 136, 0.24)",
      backgroundColor: "rgba(255,255,255,0.9)",
      alignItems: "center",
      justifyContent: "center",
    },
    modalCancelButtonDisabled: {
      opacity: 0.7,
    },
    modalSaveButton: {
      flex: 1,
      minHeight: 44,
      borderRadius: 22,
      backgroundColor: colors.dashboardBottomBarBackground,
      alignItems: "center",
      justifyContent: "center",
    },
    modalSaveButtonDisabled: {
      opacity: 0.7,
    },
    modalCancelButtonText: {
      fontFamily: RoundedFontFamily,
      color: colors.dashboardBottomIcon,
      fontSize: 16,
      lineHeight: 18,
      fontWeight: "800",
    },
    modalSaveButtonText: {
      fontFamily: RoundedFontFamily,
      color: colors.dashboardBottomIconActive,
      fontSize: 16,
      lineHeight: 18,
      fontWeight: "900",
    },
    pressed: {
      opacity: 0.84,
    },
  });
