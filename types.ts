export type AspectRatioValue = "1:1" | "16:9" | "9:16" | "4:3";

export type AspectRatio = {
  label: string;
  value: AspectRatioValue;
};

export interface UploadedImage {
  file: File;
  preview: string;
}

export type ImageQuality = 'Standard' | 'HD' | 'FHD' | '2K' | '4K' | '8K';

export type ModelName = 'imagen-4.0-generate-001' | 'gemini-2.5-flash-image';