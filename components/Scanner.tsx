import React, { useRef, useState } from 'react';
import { Camera, Upload, Loader2, AlertCircle } from 'lucide-react';
import { analyzeMedicineImage } from '../services/geminiService';
import { MedicineData } from '../types';

interface ScannerProps {
  onScanComplete: (data: MedicineData, imageUrl: string) => void;
  onCancel: () => void;
}

export const Scanner: React.FC<ScannerProps> = ({ onScanComplete, onCancel }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        try {
          const result = await analyzeMedicineImage(base64String);
          onScanComplete(result, base64String);
        } catch (err) {
          setError("Failed to analyze image. Please ensure the image is clear and try again.");
          setIsAnalyzing(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError("Error reading file.");
      setIsAnalyzing(false);
    }
  };

  const triggerCamera = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Scan Medicine</h2>
        <p className="text-gray-500 mb-8">
          Take a clear photo of the medicine packaging, bottle label, or blister pack.
        </p>

        {isAnalyzing ? (
          <div className="flex flex-col items-center py-10">
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin mb-4" />
            <p className="text-lg font-medium text-blue-600">Analyzing...</p>
            <p className="text-sm text-gray-400 mt-2">Identifying pill details & checking expiry</p>
          </div>
        ) : (
          <div className="space-y-4">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            
            <button
              onClick={triggerCamera}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-lg shadow-blue-200"
            >
              <Camera className="w-6 h-6" />
              <span>Take Photo</span>
            </button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink mx-4 text-gray-400 text-sm">OR</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <label className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-3 cursor-pointer transition-all border-2 border-dashed border-gray-300">
              <Upload className="w-6 h-6" />
              <span>Upload from Gallery</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-start gap-3 text-left">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}
        
        {!isAnalyzing && (
          <button onClick={onCancel} className="mt-6 text-gray-400 text-sm underline hover:text-gray-600">
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};