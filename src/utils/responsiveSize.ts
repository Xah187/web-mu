// Responsive sizing utilities for web
// Based on the original React Native version

const getWindowDimensions = () => {
  // Always return fixed dimensions to prevent hydration mismatch
  return { width: 375, height: 812 };
};

const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

export const scale = (size: number): number => {
  const { width } = getWindowDimensions();
  return (width / guidelineBaseWidth) * size;
};

export const verticalScale = (size: number): number => {
  const { height } = getWindowDimensions();
  return (height / guidelineBaseHeight) * size;
};

// تحديد إذا كان الجهاز تابلت
export const isTablet = (): boolean => {
  const { width } = getWindowDimensions();
  return width >= 600;
};

// دالة للتحجيم التكيفي
export const verticalScaleisTablet = (baseSize: number): number => {
  if (isTablet()) {
    return baseSize * 1.2; // زيادة الحجم بـ 20% للتابلت
  }
  return baseSize; // الحجم العادي للجوال
};

export const moderateScale = (size: number, factor = 0.5): number =>
  size + (scale(size) - size) * factor;

export const moderateScaleVertical = (size: number, factor = 0.5): number =>
  size + (verticalScale(size) - size) * factor;

export const textScale = (percent: number): number => {
  const { height, width } = getWindowDimensions();
  const ratio = height / width;
  const deviceHeight = height * (ratio > 1.8 ? 0.126 : 0.15);
  const heightPercent = (percent * deviceHeight) / 100;
  return Math.round(heightPercent);
};

// Utility function to convert scale to rem units
export const rem = (pixels: number): string => {
  const baseFontSize = 16; // Default browser font size
  return `${pixels / baseFontSize}rem`;
};

// Utility function to convert scale to viewport units
export const vw = (pixels: number): string => {
  const { width } = getWindowDimensions();
  const percentage = (pixels / width) * 100;
  return `${percentage}vw`;
};

export const vh = (pixels: number): string => {
  const { height } = getWindowDimensions();
  const percentage = (pixels / height) * 100;
  return `${percentage}vh`;
};
