/*
https://github.com/hackclub/hcb-mobile/blob/main/src/utils/haptics.ts

MIT License

Copyright (c) 2024 The Hack Foundation

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

/**
 * Performs haptic feedback optimized for each platform.
 * On Android, uses the haptic engine (performAndroidHapticsAsync).
 * On iOS, uses the standard haptic APIs.
 */

export const impactAsync = async (style: Haptics.ImpactFeedbackStyle) => {
  if (Platform.OS === "android") {
    switch (style) {
      case Haptics.ImpactFeedbackStyle.Light:
        return Haptics.performAndroidHapticsAsync(
          Haptics.AndroidHaptics.Clock_Tick,
        );
      case Haptics.ImpactFeedbackStyle.Medium:
        return Haptics.performAndroidHapticsAsync(
          Haptics.AndroidHaptics.Context_Click,
        );
      case Haptics.ImpactFeedbackStyle.Heavy:
        return Haptics.performAndroidHapticsAsync(
          Haptics.AndroidHaptics.Keyboard_Press,
        );
      case Haptics.ImpactFeedbackStyle.Rigid:
        return Haptics.performAndroidHapticsAsync(
          Haptics.AndroidHaptics.Virtual_Key,
        );
      case Haptics.ImpactFeedbackStyle.Soft:
        return Haptics.performAndroidHapticsAsync(
          Haptics.AndroidHaptics.Segment_Frequent_Tick,
        );
      default:
        return Haptics.performAndroidHapticsAsync(
          Haptics.AndroidHaptics.Context_Click,
        );
    }
  }
  return Haptics.impactAsync(style);
};

export const notificationAsync = async (
  type: Haptics.NotificationFeedbackType,
) => {
  if (Platform.OS === "android") {
    switch (type) {
      case Haptics.NotificationFeedbackType.Success:
        return Haptics.performAndroidHapticsAsync(
          Haptics.AndroidHaptics.Confirm,
        );
      case Haptics.NotificationFeedbackType.Warning:
        return Haptics.performAndroidHapticsAsync(
          Haptics.AndroidHaptics.Reject,
        );
      case Haptics.NotificationFeedbackType.Error:
        return Haptics.performAndroidHapticsAsync(
          Haptics.AndroidHaptics.Reject,
        );
      default:
        return Haptics.performAndroidHapticsAsync(
          Haptics.AndroidHaptics.Context_Click,
        );
    }
  }
  return Haptics.notificationAsync(type);
};

export const selectionAsync = async () => {
  if (Platform.OS === "android") {
    return Haptics.performAndroidHapticsAsync(
      Haptics.AndroidHaptics.Segment_Tick,
    );
  }
  return Haptics.selectionAsync();
};

export const dragStartAsync = async () => {
  if (Platform.OS === "android") {
    return Haptics.performAndroidHapticsAsync(
      Haptics.AndroidHaptics.Drag_Start,
    );
  }
  return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
};

export const longPressAsync = async () => {
  if (Platform.OS === "android") {
    return Haptics.performAndroidHapticsAsync(
      Haptics.AndroidHaptics.Long_Press,
    );
  }
  return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
};

export const toggleAsync = async (isOn: boolean) => {
  if (Platform.OS === "android") {
    return Haptics.performAndroidHapticsAsync(
      isOn
        ? Haptics.AndroidHaptics.Toggle_On
        : Haptics.AndroidHaptics.Toggle_Off,
    );
  }
  return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};

export const gestureStartAsync = async () => {
  if (Platform.OS === "android") {
    return Haptics.performAndroidHapticsAsync(
      Haptics.AndroidHaptics.Gesture_Start,
    );
  }
  return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};

export const gestureEndAsync = async () => {
  if (Platform.OS === "android") {
    return Haptics.performAndroidHapticsAsync(
      Haptics.AndroidHaptics.Gesture_End,
    );
  }
  return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};

export const textHandleMoveAsync = async () => {
  if (Platform.OS === "android") {
    return Haptics.performAndroidHapticsAsync(
      Haptics.AndroidHaptics.Text_Handle_Move,
    );
  }
  return Haptics.selectionAsync();
};

export { ImpactFeedbackStyle, NotificationFeedbackType } from "expo-haptics";
