import { ALL_FORMATS, IMAGE_FORMATS } from "./constants";

export function isImage(filePath: string): boolean {
  return IMAGE_FORMATS.has(getExt(filePath));
}

export function isValidFormat(format: string): boolean {
  return ALL_FORMATS.has(format.toLowerCase());
}

function getExt(filePath: string): string {
  return filePath.split(".").pop()?.toLowerCase() ?? "";
}
