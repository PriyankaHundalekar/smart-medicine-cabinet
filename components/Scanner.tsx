import React, { useRef, useState } from 'react';
import { Camera, Upload, Loader2, AlertCircle, ScanLine } from 'lucide-react';
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
    <div className="flex flex-col items-center justify-center h-full p-6 animate-fade-in relative overflow-hidden bg-gray-50/50">
      
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500"></div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 text-center relative z-10 border border-white/60">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Scan Medicine</h2>
        <p className="text-gray-500 mb-8 font-medium">
          Capture a clear photo of the packaging.
        </p>

        {isAnalyzing ? (
          <div className="flex flex-col items-center py-12 relative">
            <div className="absolute inset-0 bg-blue-50/50 rounded-2xl animate-pulse"></div>
            <div className="relative z-10 flex flex-col items-center">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg mb-6 ring-4 ring-blue-50">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                </div>
                <p className="text-xl font-bold text-gray-800">Analyzing Image...</p>
                <p className="text-sm text-blue-600 mt-2 font-medium bg-blue-50 px-3 py-1 rounded-full">AI is identifying details</p>
            </div>
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
              className="group w-full bg-gradient-to-r from-blue-600 to-violet-600 text-white font-bold py-5 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-xl shadow-blue-500/30 hover:shadow-blue-500/40 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <Camera className="w-6 h-6" />
              <span className="text-lg">Take Photo</span>
            </button>

            <div className="relative flex py-3 items-center">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink mx-4 text-gray-400 text-xs font-bold uppercase tracking-wider">OR</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <label className="group w-full bg-white hover:bg-gray-50 text-gray-700 font-bold py-5 px-6 rounded-2xl flex items-center justify-center gap-3 cursor-pointer transition-all border-2 border-dashed border-gray-200 hover:border-blue-300 hover:text-blue-600">
              <Upload className="w-6 h-6 group-hover:scale-110 transition-transform" />
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
          <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-start gap-3 text-left border border-red-100 animate-fade-in">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}
        
        {!isAnalyzing && (
          <button onClick={onCancel} className="mt-8 text-gray-400 text-sm font-medium hover:text-gray-600 transition-colors">
            Cancel Operation
          </button>
        )}
      </div>

      {/* Futuristic Scan Frame Animation */}
      {!isAnalyzing && (
         <div className="absolute inset-0 pointer-events-none opacity-5">
             <div className="w-full h-1 bg-black absolute top-1/2 animate-[scan_3s_ease-in-out_infinite]"></div>
         </div>
      )}
      <style>{`
        @keyframes scan {
            0% { top: 0%; opacity: 0; }
            50% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};