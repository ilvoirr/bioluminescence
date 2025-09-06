"use client";

import Image from "next/image";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useRef, useState } from "react";

interface Detection {
  class_name: string;
  confidence: number;
  bbox: [number, number, number, number];
}

interface SpeciesSummary {
  species: string;
  count: number;
  percentage: number;
}

interface UploadResult {
  success: boolean;
  image: string;
  detections: Detection[];
  total_count: number;
  unique_species: number;
  species_summary: SpeciesSummary[];
  file_id: string;
}

export default function HeroSection() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    const file = e.target.files[0];
    setIsLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://127.0.0.1:5000/upload", {
        method: "POST",
        body: formData,
      });

      const uploadResult: UploadResult = await res.json();
      
      if (uploadResult.success) {
        setResult(uploadResult);
        console.log("Inference result:", uploadResult);
      } else {
        setError("Failed to process image");
      }
    } catch (err) {
      console.error("Upload failed:", err);
      setError("Upload failed. Make sure the backend server is running.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex w-screen min-h-screen items-center justify-center bg-[#282c34] p-4">
      <div className="flex flex-col items-center justify-center p-12 max-w-5xl w-full">
        {/* Logo and Title */}
        {!result && (
          <>
            <Image
              src="/biosyn3.svg"
              alt="Biosyn Logo"
              width={300}
              height={300}
              className="mb-6 w-48 h-48 md:w-64 md:h-64"
              priority
            />

            <h1 className="text-4xl font-bold text-white mb-4">
              BioLuminescence
            </h1>

            <p className="text-lg text-gray-300 mb-6 text-center max-w-md">
              Automated Species Recognition & Analysis
            </p>
          </>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#61dafb] mb-4"></div>
            <p className="text-white">Processing image...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500 text-white p-4 rounded-lg mb-4 max-w-md text-center">
            {error}
          </div>
        )}

        {/* Results Display */}
        {result && (
          <div className="w-full max-w-4xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Analysis Results</h2>
              <button
                onClick={handleReset}
                className="rounded-full bg-gray-600 px-4 py-2 text-white hover:bg-gray-700 transition"
              >
                Upload New Image
              </button>
            </div>

            {/* Processed Image */}
            <div className="mb-6">
              <img
                src={result.image}
                alt="Processed result"
                className="w-full max-w-lg mx-auto rounded-lg shadow-lg"
              />
            </div>

            {/* Enhanced Statistics */}
            <div className="bg-gray-700 rounded-lg p-6 mb-4">
              <h3 className="text-xl font-semibold text-white mb-4">Detection Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#61dafb] text-black p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold">{result.total_count}</div>
                  <div className="text-sm">Total Organisms</div>
                </div>
                <div className="bg-green-500 text-white p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold">{result.unique_species}</div>
                  <div className="text-sm">Unique Species</div>
                </div>
                <div className="bg-purple-500 text-white p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold">{result.detections.length}</div>
                  <div className="text-sm">Total Detections</div>
                </div>
              </div>
            </div>

            {/* Species Breakdown */}
            {result.species_summary && result.species_summary.length > 0 && (
              <div className="bg-gray-700 rounded-lg p-6 mb-4">
                <h3 className="text-xl font-semibold text-white mb-4">Species Breakdown</h3>
                <div className="space-y-3">
                  {result.species_summary.map((species, index) => (
                    <div key={index} className="bg-gray-600 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white font-medium text-lg">{species.species}</span>
                        <span className="text-[#61dafb] font-bold">{species.count} organisms</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-500 rounded-full h-2">
                          <div 
                            className="bg-[#61dafb] h-2 rounded-full transition-all duration-300"
                            style={{ width: `${species.percentage}%` }}
                          />
                        </div>
                        <span className="text-gray-300 text-sm">{species.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Detailed Detection Results */}
            <div className="bg-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">All Detections</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {result.detections.map((detection, index) => (
                  <div key={index} className="flex justify-between items-center bg-gray-600 p-3 rounded">
                    <div className="flex items-center space-x-3">
                      <span className="bg-[#61dafb] text-black text-xs px-2 py-1 rounded font-bold">
                        #{index + 1}
                      </span>
                      <span className="text-white font-medium">{detection.class_name}</span>
                    </div>
                    <span className="text-[#61dafb]">{(detection.confidence * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Upload Buttons - Show only when not displaying results */}
        {!result && !isLoading && (
          <div className="flex space-x-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="rounded-full bg-[#61dafb] px-6 py-2 font-semibold text-black hover:bg-[#52c0e8] transition">
                  Connect with Microscope
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-white text-black shadow-md rounded-md px-2 py-1 text-sm">
                Currently Unavailable
              </TooltipContent>
            </Tooltip>

            <button
              onClick={handleButtonClick}
              disabled={isLoading}
              className="rounded-full border border-gray-400 px-6 py-2 font-semibold text-white hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Upload Image
            </button>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        )}
      </div>
    </div>
  );
}
