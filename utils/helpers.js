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

const validateForm = (formData) => {
  if (formData.email !== undefined && !formData.email.trim()) {
    return 'Email is required';
  }
  if (formData.email !== undefined && !formData.email.includes('@')) {
    return 'Please enter a valid email';
  }
  if (formData.username !== undefined && !formData.username.trim()) {
    return 'Username is required';
  }
  if (formData.password !== undefined && formData.password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  if (formData.confirmPassword !== undefined && formData.password !== formData.confirmPassword) {
    return 'Passwords do not match';
  }
  return null;
};

export function timeAgo(timestamp) {
  const now = Date.now();
  const diff = Math.floor((now - timestamp) / 1000); // in seconds
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function formatFollowers(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return num.toString();
}

export function formatLikes(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return num.toString();
}

export function formatViews(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return num.toString();
}

export { wp, hp, validateForm };

// Media helpers
export function guessMimeFromUri(uri, kind) {
  try {
    const lower = (uri || '').toLowerCase();
    const afterQ = lower.split('?')[0];
    const ext = afterQ.includes('.') ? afterQ.substring(afterQ.lastIndexOf('.') + 1) : '';
    if (kind === 'video') {
      if (ext === 'mp4') return 'video/mp4';
      if (ext === 'mov') return 'video/mov';
      if (ext === 'avi') return 'video/avi';
      if (ext === 'mkv') return 'video/mkv';
      return 'video/mp4';
    }
    if (kind === 'image') {
      if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
      if (ext === 'png') return 'image/png';
      if (ext === 'webp') return 'image/webp';
      return 'image/jpeg';
    }
    return null;
  } catch {
    return kind === 'video' ? 'video/mp4' : 'image/jpeg';
  }
}

export function normalizeMime(kind, mime, uri) {
  if (!mime || !mime.includes('/')) {
    return guessMimeFromUri(uri, kind);
  }
  const lower = mime.toLowerCase();
  if (kind === 'video') {
    if (lower === 'video/quicktime') return 'video/mov';
    if (lower === 'video/x-matroska') return 'video/mkv';
    if (lower === 'video/3gpp' || lower === 'video/3gp') return 'video/mp4';
    return lower;
  }
  if (kind === 'image') {
    if (lower === 'image/jpg') return 'image/jpeg';
    return lower;
  }
  return lower;
}

export function normalizePickedAsset(asset, kind) {
  if (!asset) return null;
  const uri = asset.uri;
  const providedMime = asset.mimeType || asset.type;
  const mime = normalizeMime(kind, providedMime, uri);
  const lower = (uri || '').toLowerCase();
  const afterQ = lower.split('?')[0];
  const ext = afterQ.includes('.') ? afterQ.substring(afterQ.lastIndexOf('.') + 1) : (kind === 'video' ? 'mp4' : 'jpg');
  const fallbackName = `${kind === 'video' ? 'video' : 'thumbnail'}.${ext}`;
  return {
    uri,
    type: mime,
    name: asset.fileName || asset.name || fallbackName,
    width: asset.width,
    height: asset.height,
    duration: asset.duration,
    size: asset.fileSize || asset.size,
  };
}

export function assetsAreSame(a, b) {
  if (!a || !b) return false;
  return a.uri === b.uri;
}