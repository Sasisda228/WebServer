import imageCompression from "browser-image-compression"

export interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
  quality?: number;
}

/**
 * Compress a single image file.
 */
export const compressImage = async (
  file: File,
  options: CompressionOptions = {}
): Promise<File> => {
  const {
    maxSizeMB = 8,
    maxWidthOrHeight = 1920,
    useWebWorker = true,
    quality = 0.8,
  } = options;

  return await imageCompression(file, {
    maxSizeMB,
    maxWidthOrHeight,
    useWebWorker,
    initialQuality: quality,
  });
};

/**
 * Compress multiple image files.
 */
export const compressMultipleImages = async (
  files: File[],
  options: CompressionOptions = {}
): Promise<File[]> => {
  return Promise.all(files.map((file) => compressImage(file, options)));
};