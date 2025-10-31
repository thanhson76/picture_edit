import { GoogleGenAI, Modality, Part } from "@google/genai";
import type { AspectRatioValue, ImageQuality, ModelName } from "../types";

type SupportedAspectRatio = "1:1" | "3:4" | "4:3" | "9:16" | "16:9";

function isSupportedAspectRatio(value: string): value is SupportedAspectRatio {
    return ["1:1", "3:4", "4:3", "9:16", "16:9"].includes(value);
}

const handleApiError = (error: unknown): Error => {
    console.error("Lỗi API:", error);
    if (error instanceof Error) {
        if (error.message.includes('RESOURCE_EXHAUSTED') || error.message.includes('429')) {
             return new Error("Lỗi giới hạn sử dụng (Quota). Điều này thường xảy ra khi dự án Google Cloud của bạn chưa bật tính năng thanh toán (billing). Vui lòng [bật thanh toán cho dự án của bạn](https://cloud.google.com/billing/docs/how-to/enable-billing) để tiếp tục sử dụng.");
        }
        return new Error(`Không thể tạo ảnh: ${error.message}`);
    }
    return new Error("Không thể tạo ảnh. Vui lòng thử lại.");
}

export const generateImage = async (
  prompt: string, 
  style: string,
  aspectRatio: AspectRatioValue,
  quality: ImageQuality,
  numImages: number,
  model: ModelName
): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  let fullPrompt = style === 'Tất cả' ? prompt : `${prompt}, theo phong cách ${style}`;
  
  try {
    if (model === 'imagen-4.0-generate-001') {
        if (quality !== 'Standard') {
            fullPrompt += `, chất lượng ${quality}, siêu thực, chi tiết cao`;
        }
        if (!isSupportedAspectRatio(aspectRatio)) {
            throw new Error(`Aspect ratio ${aspectRatio} is not supported by the API.`);
        }
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: fullPrompt,
            config: {
                numberOfImages: numImages,
                outputMimeType: 'image/png',
                aspectRatio: aspectRatio,
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            return response.generatedImages.map(img => `data:image/png;base64,${img.image.imageBytes}`);
        } else {
            throw new Error("Không có hình ảnh nào được tạo từ API.");
        }
    } else if (model === 'gemini-2.5-flash-image') {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: fullPrompt }],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        if (response.candidates && response.candidates.length > 0) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    const base64ImageBytes: string = part.inlineData.data;
                    return [`data:${part.inlineData.mimeType};base64,${base64ImageBytes}`];
                }
            }
        }
        throw new Error("Không có hình ảnh nào được tạo từ API.");
    } else {
        throw new Error(`Model không được hỗ trợ: ${model}`);
    }
  } catch (error) {
    throw handleApiError(error);
  }
};

export const editImage = async (prompt: string, images: { data: string, mimeType: string }[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const imageParts = images.map(image => ({
      inlineData: {
          data: image.data,
          mimeType: image.mimeType,
      },
  }));

  const contents: Part[] = [...imageParts];
  if (prompt.trim()) {
      contents.push({ text: prompt });
  }

  if (contents.length === 0) {
      throw new Error("Cần có mô tả hoặc hình ảnh để tạo ảnh mới.");
  }
  
  try {
      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
              parts: contents,
          },
          config: {
              responseModalities: [Modality.IMAGE],
          },
      });

      if (response.candidates && response.candidates.length > 0) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
            }
        }
      }
      
      throw new Error("Không có hình ảnh nào được tạo từ API.");

  } catch (error) {
      throw handleApiError(error);
  }
};