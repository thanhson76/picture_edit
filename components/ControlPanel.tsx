import React from 'react';
import type { AspectRatio, AspectRatioValue, UploadedImage, ImageQuality, ModelName } from '../types';
import { Icon } from './Icon';

interface ControlPanelProps {
    prompt: string;
    setPrompt: (p: string) => void;
    selectedStyle: string;
    setSelectedStyle: (s: string) => void;
    selectedAspectRatio: AspectRatioValue;
    setSelectedAspectRatio: (ar: AspectRatioValue) => void;
    selectedQuality: ImageQuality;
    setSelectedQuality: (q: ImageQuality) => void;
    numberOfImages: number;
    setNumberOfImages: (n: number) => void;
    selectedModel: ModelName;
    setSelectedModel: (m: ModelName) => void;
    onGenerate: () => void;
    isLoading: boolean;
    uploadedImages: UploadedImage[];
    onImageUpload: (files: FileList | null) => void;
    onRemoveImage: (index: number) => void;
}

const STYLES = ['Tất cả', 'Nhiếp ảnh', 'Hoạt hình', 'Tranh sơn dầu', '3D Render', 'Vector', 'Cyberpunk'];
const ASPECT_RATIOS: AspectRatio[] = [
  { label: 'Vuông 1:1', value: '1:1' },
  { label: 'Ngang 16:9', value: '16:9' },
  { label: 'Dọc 9:16', value: '9:16' },
  { label: 'Rộng 4:3', value: '4:3' },
];
const QUALITIES: ImageQuality[] = ['Standard', 'HD', 'FHD', '2K', '4K', '8K'];
const NUM_IMAGES_OPTIONS = [1, 2, 3, 4];
const MODELS: {id: ModelName, name: string}[] = [
    { id: 'imagen-4.0-generate-001', name: 'Imagen 4.0 (Chất lượng cao)' },
    { id: 'gemini-2.5-flash-image', name: 'Gemini Flash (Nhanh)' }
];

const AspectRatioIcon: React.FC<{ ratio: AspectRatioValue }> = ({ ratio }) => {
    let classes = 'border-2 border-slate-400 rounded-sm';
    if (ratio === '1:1') classes += ' w-6 h-6';
    if (ratio === '16:9') classes += ' w-8 h-5';
    if (ratio === '9:16') classes += ' w-5 h-8';
    if (ratio === '4:3') classes += ' w-7 h-5';
    return <div className={classes}></div>;
};


const ControlPanel: React.FC<ControlPanelProps> = ({
    prompt,
    setPrompt,
    selectedStyle,
    setSelectedStyle,
    selectedAspectRatio,
    setSelectedAspectRatio,
    selectedQuality,
    setSelectedQuality,
    numberOfImages,
    setNumberOfImages,
    selectedModel,
    setSelectedModel,
    onGenerate,
    isLoading,
    uploadedImages,
    onImageUpload,
    onRemoveImage
}) => {
    const hasUploadedImages = uploadedImages.length > 0;

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onImageUpload(event.target.files);
        event.target.value = '';
    };

    return (
        <div className="bg-[#1E293B] p-6 rounded-lg h-full flex flex-col">
            <div className="flex-grow overflow-y-auto pr-2">
                <h1 className="text-2xl font-bold text-white mb-6">Tạo ảnh bằng AI</h1>

                <div className="mb-6">
                    <label htmlFor="prompt" className="block text-sm font-medium text-slate-300 mb-2">Mô tả của bạn (Prompt)</label>
                    <textarea
                        id="prompt"
                        rows={5}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        placeholder="Mô tả hình ảnh bạn muốn tạo... ví dụ: Một phi hành gia cưỡi ngựa trên sao Hỏa theo phong cách siêu thực"
                    />
                </div>

                <div className="mb-6">
                    <h2 className="text-sm font-medium text-slate-300 mb-3">Tải ảnh lên (tùy chọn)</h2>
                     <div className="relative bg-slate-800 border-2 border-dashed border-slate-700 rounded-lg p-6 text-center transition-colors hover:border-blue-500">
                        <Icon name="image" className="mx-auto h-10 w-10 text-slate-500 mb-2" />
                        <label htmlFor="image-upload" className="font-semibold text-blue-500 hover:text-blue-400 cursor-pointer focus:outline-none">
                            <span>Nhấn để tải lên</span>
                            <input id="image-upload" name="image-upload" type="file" multiple accept="image/*" className="sr-only" onChange={handleFileChange} />
                        </label>
                        <p className="text-xs text-slate-500 mt-1">hoặc kéo và thả</p>
                    </div>
                    {uploadedImages.length > 0 && (
                        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {uploadedImages.map((image, index) => (
                                <div key={`${image.file.name}-${index}`} className="relative group aspect-square">
                                    <img src={image.preview} alt={`upload preview ${index}`} className="w-full h-full object-cover rounded-md" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md"></div>
                                    <button
                                        onClick={() => onRemoveImage(index)}
                                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                                        aria-label="Remove image"
                                    >
                                        <Icon name="x" className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {!hasUploadedImages && (
                    <>
                        <div className="mb-6">
                            <h2 className="text-sm font-medium text-slate-300 mb-3">Model</h2>
                            <div className="flex flex-wrap gap-2">
                                {MODELS.map(model => (
                                    <button
                                        key={model.id}
                                        onClick={() => setSelectedModel(model.id)}
                                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${selectedModel === model.id ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                                    >
                                        {model.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mb-6">
                            <h2 className="text-sm font-medium text-slate-300 mb-3">Phong cách</h2>
                            <div className="flex flex-wrap gap-2">
                                {STYLES.map(style => (
                                    <button
                                        key={style}
                                        onClick={() => setSelectedStyle(style)}
                                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${selectedStyle === style ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                                    >
                                        {style}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {selectedModel === 'imagen-4.0-generate-001' && (
                            <>
                                <div className="mb-6">
                                    <h2 className="text-sm font-medium text-slate-300 mb-3">Chất lượng</h2>
                                    <div className="flex flex-wrap gap-2">
                                        {QUALITIES.map(quality => (
                                            <button
                                                key={quality}
                                                onClick={() => setSelectedQuality(quality)}
                                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${selectedQuality === quality ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                                            >
                                                {quality}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="mb-6">
                                    <h2 className="text-sm font-medium text-slate-300 mb-3">Số lượng ảnh</h2>
                                    <div className="flex flex-wrap gap-2">
                                        {NUM_IMAGES_OPTIONS.map(num => (
                                            <button
                                                key={num}
                                                onClick={() => setNumberOfImages(num)}
                                                className={`w-12 h-10 rounded-lg text-sm font-medium transition-all duration-200 ${numberOfImages === num ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                                            >
                                                {num}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h2 className="text-sm font-medium text-slate-300 mb-3">Tỷ lệ khung hình</h2>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {ASPECT_RATIOS.map(ratio => (
                                            <button
                                                key={ratio.value}
                                                onClick={() => setSelectedAspectRatio(ratio.value)}
                                                className={`p-3 rounded-lg flex flex-col items-center justify-center space-y-2 transition-all duration-200 border-2 ${selectedAspectRatio === ratio.value ? 'bg-blue-600/20 border-blue-500' : 'bg-slate-800 border-transparent hover:border-slate-600'}`}
                                            >
                                                <AspectRatioIcon ratio={ratio.value} />
                                                <span className={`text-xs ${selectedAspectRatio === ratio.value ? 'text-white' : 'text-slate-400'}`}>{ratio.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>
            <div className="flex-shrink-0 pt-6">
                <button
                    onClick={onGenerate}
                    disabled={isLoading}
                    className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors duration-200 disabled:bg-slate-600 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                         <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                         <span>Đang tạo...</span>
                        </>
                    ) : (
                        <>
                        <Icon name="sparkles" className="w-5 h-5"/>
                        <span>Tạo ảnh</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default ControlPanel;