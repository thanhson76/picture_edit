import React, { useState } from 'react';
import ControlPanel from './components/ControlPanel';
import OutputPanel from './components/OutputPanel';
import { generateImage, editImage } from './services/geminiService';
import type { AspectRatioValue, UploadedImage, ImageQuality, ModelName } from './types';

const App: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [style, setStyle] = useState('Tất cả');
    const [aspectRatio, setAspectRatio] = useState<AspectRatioValue>('1:1');
    const [quality, setQuality] = useState<ImageQuality>('Standard');
    const [numberOfImages, setNumberOfImages] = useState(1);
    const [selectedModel, setSelectedModel] = useState<ModelName>('imagen-4.0-generate-001');

    const [generatedImages, setGeneratedImages] = useState<string[] | null>(null);
    const [generationHistory, setGenerationHistory] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);

    const handleImageUpload = (files: FileList | null) => {
        if (!files) return;

        const fileArray = Array.from(files);
        const imagePromises: Promise<UploadedImage>[] = fileArray
            .filter(file => !uploadedImages.some(img => img.file.name === file.name && img.file.size === file.size))
            .map(file => {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        resolve({ file, preview: reader.result as string });
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            });

        Promise.all(imagePromises).then(newImages => {
            setUploadedImages(prev => [...prev, ...newImages]);
            // When user uploads a new image, clear the history
            setGenerationHistory([]);
            setGeneratedImages(null);
        });
    };

    const handleRemoveImage = (index: number) => {
        setUploadedImages(prev => prev.filter((_, i) => i !== index));
    };

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                if (typeof reader.result === 'string') {
                    resolve(reader.result.split(',')[1]);
                } else {
                    reject(new Error('Failed to read file as base64 string.'));
                }
            };
            reader.onerror = error => reject(error);
        });
    };
    
    const dataUrlToFile = async (dataUrl: string, fileName: string): Promise<File> => {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        return new File([blob], fileName, { type: blob.type });
    };

    const handleGenerate = async () => {
        if (!prompt.trim() && uploadedImages.length === 0) {
            setError('Vui lòng nhập mô tả hoặc tải ảnh lên để tạo ảnh.');
            return;
        }
        setIsLoading(true);
        setGeneratedImages(null);
        setError(null);
        try {
            let imageDataUrls: string[];
            if (uploadedImages.length > 0) {
                 const imagesToProcess = await Promise.all(
                    uploadedImages.map(async ({ file }) => ({
                        data: await fileToBase64(file),
                        mimeType: file.type,
                    }))
                );
                const resultUrl = await editImage(prompt, imagesToProcess);
                imageDataUrls = [resultUrl];
            } else {
                imageDataUrls = await generateImage(prompt, style, aspectRatio, quality, numberOfImages, selectedModel);
            }
            setGeneratedImages(imageDataUrls);
            setGenerationHistory(prev => [...prev, ...imageDataUrls]);


            // Set the generated image as the new input for the next iteration
            if (imageDataUrls && imageDataUrls.length > 0) {
                // For simplicity, we'll use the first generated image for the next edit cycle
                const newImageFile = await dataUrlToFile(imageDataUrls[0], `edited-image-${Date.now()}.png`);
                setUploadedImages([{ file: newImageFile, preview: imageDataUrls[0] }]);
                setPrompt(''); // Clear prompt for next instruction
            }

        } catch (e: any) {
            setError(`Đã xảy ra lỗi khi tạo ảnh: ${e.message}`);
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSelectImageForEditing = async (imageUrl: string) => {
        const newImageFile = await dataUrlToFile(imageUrl, `selected-image-${Date.now()}.png`);
        setUploadedImages([{ file: newImageFile, preview: imageUrl }]);
        setGeneratedImages([imageUrl]); // Show the selected image in the main view
        setPrompt('');
    };

    const handleCreateNew = () => {
        setGeneratedImages(null);
        setGenerationHistory([]);
        setPrompt('');
        setUploadedImages([]);
        setError(null);
    };

    return (
        <div className="h-screen bg-[#0F172A] text-slate-300 antialiased">
            <main className="h-full flex flex-col lg:flex-row p-4 md:p-8 gap-4 md:gap-8 overflow-y-auto">
                <div className="w-full lg:w-2/5 flex flex-col">
                    <ControlPanel
                        prompt={prompt}
                        setPrompt={setPrompt}
                        selectedStyle={style}
                        setSelectedStyle={setStyle}
                        selectedAspectRatio={aspectRatio}
                        setSelectedAspectRatio={setAspectRatio}
                        selectedQuality={quality}
                        setSelectedQuality={setQuality}
                        numberOfImages={numberOfImages}
                        setNumberOfImages={setNumberOfImages}
                        selectedModel={selectedModel}
                        setSelectedModel={setSelectedModel}
                        onGenerate={handleGenerate}
                        isLoading={isLoading}
                        uploadedImages={uploadedImages}
                        onImageUpload={handleImageUpload}
                        onRemoveImage={handleRemoveImage}
                    />
                </div>
                <div className="w-full lg:w-3/5">
                    <OutputPanel
                        images={generatedImages}
                        history={generationHistory}
                        isLoading={isLoading}
                        error={error}
                        onCreateNew={handleCreateNew}
                        onSelectForEditing={handleSelectImageForEditing}
                    />
                </div>
            </main>
        </div>
    );
};

export default App;