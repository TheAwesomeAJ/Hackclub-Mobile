import React from "react";
import { Image, StyleSheet, useWindowDimensions, View } from "react-native";

export default function Header() {
  const { width } = useWindowDimensions();
  const HEIGHT = 140;

  return (
    <View style={[styles.wrapper, { width, height: HEIGHT }]}>
      <Image
        source={require("../assets/images/hc-flag.png")}
        style={styles.flag}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    height: 140,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  background: {
    justifyContent: "center",
  },
  image: {
    resizeMode: "cover",
  },
  flag: {
    position: "absolute",
    left: -9,
    top: 35,
    width: 160,
    height: 80,
    resizeMode: "contain",
  },
});
