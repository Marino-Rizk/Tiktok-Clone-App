import { Dimensions, PixelRatio } from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const parsePercent = (value) => {
  const num = typeof value === "number" ? value : parseFloat(value);
  return isNaN(num) ? 0 : num;
};

const wp = (widthPercent) =>
  PixelRatio.roundToNearestPixel((screenWidth * parsePercent(widthPercent)) / 100);

const hp = (heightPercent) =>
  PixelRatio.roundToNearestPixel((screenHeight * parsePercent(heightPercent)) / 100);

export { wp, hp };
