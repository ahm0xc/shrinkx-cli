export const IMAGE_FORMATS = new Set(["jpg", "jpeg", "png", "webp", "avif"]);

export const VIDEO_FORMATS = new Set(["mp4", "mov", "avi", "mkv", "webm"]);

export const ALL_FORMATS = new Set([...IMAGE_FORMATS, ...VIDEO_FORMATS]);
