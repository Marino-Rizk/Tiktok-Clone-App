import { Dimensions, PixelRatio } from "react-native";
const screenWidth = Dimensions.get("window").width;

const screenHeight = Dimensions.get("window").height;

const wp = (widthPercent) => {
  const elemWidth =
    typeof widthPercent === "number" ? widthPercent : parseFloat(widthPercent);

  return PixelRatio.roundToNearestPixel((screenWidth * elemWidth) / 100);
};

const hp = (heightPercent) => {
  const elemHeight =
    typeof heightPercent === "number"
      ? heightPercent
      : parseFloat(heightPercent);

  return PixelRatio.roundToNearestPixel((screenHeight * elemHeight) / 100);
};



export {
  wp,
  hp,
};
