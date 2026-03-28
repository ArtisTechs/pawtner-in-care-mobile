import type { ImageSourcePropType } from "react-native";

type SosAssets = {
  backIcon: ImageSourcePropType;
  previewPlaceholder: ImageSourcePropType;
};

export const SOS_ASSETS: SosAssets = {
  backIcon: require("../../assets/images/back-icon.png"),
  previewPlaceholder: require("../../assets/images/dog.png"),
};
