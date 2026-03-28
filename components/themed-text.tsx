import { StyleSheet, Text, type TextProps } from 'react-native';

import { Typography } from "@/constants/theme";
import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?:
    | 'default'
    | 'title'
    | 'defaultSemiBold'
    | 'subtitle'
    | 'link'
    | 'heading1'
    | 'heading2'
    | 'heading3'
    | 'body1'
    | 'body2'
    | 'body2SemiBold'
    | 'body3';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        type === 'default' || type === 'body1' ? styles.default : undefined,
        type === 'title' || type === 'heading1' ? styles.title : undefined,
        type === 'defaultSemiBold' || type === 'body2SemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' || type === 'heading3' ? styles.subtitle : undefined,
        type === 'heading2' ? styles.heading2 : undefined,
        type === 'body2' ? styles.body2 : undefined,
        type === 'body3' ? styles.body3 : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    ...Typography.body1,
  },
  defaultSemiBold: {
    ...Typography.body2SemiBold,
  },
  title: {
    ...Typography.heading1,
  },
  heading2: {
    ...Typography.heading2,
  },
  subtitle: {
    ...Typography.heading3,
  },
  body2: {
    ...Typography.body2,
  },
  body3: {
    ...Typography.body3,
  },
  link: {
    ...Typography.body1,
    color: '#0a7ea4',
  },
});
