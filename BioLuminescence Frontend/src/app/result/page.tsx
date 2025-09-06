"use client";
import Image from "next/image";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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

// Species descriptions with images
const speciesDescriptions: { [key: string]: { description: string; image: string } } = {
  "Alexandrium": {
    description: "Alexandrium is a genus of dinoflagellates known for producing potent neurotoxins that cause paralytic shellfish poisoning (PSP). These armored marine microorganisms are responsible for toxic red tide events.",
    image: "/alex.jpg"
  },
  "Asterionellopsis_glacialis": {
    description: "Asterionellopsis glacialis is a colonial diatom forming distinctive star-shaped colonies. These important primary producers contribute significantly to marine phytoplankton biomass and oxygen production in cooler waters.",
    image: "/ast.jpg"
  }
};

// Separate component that uses useSearchParams
function ResultContent() {
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Check if user came from dashboard
  const fromDashboard = searchParams.get('from') === 'dashboard';

  useEffect(() => {
    try {
      const stored = localStorage.getItem('bioLuminescenceResult');
      if (stored) {
        const parsed: UploadResult = JSON.parse(stored);
        if (parsed && parsed.success) {
          setResult(parsed);
          console.log("Retrieved result:", parsed); // Debug log
        } else {
          setError('No valid result data found');
        }
      } else {
        setError('No analysis result found. Please upload an image first.');
      }
    } catch (e) {
      console.error('Error loading result:', e);
      setError('Failed to load analysis result');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleNewUpload = () => {
    // Clear the stored result and go back to upload page
    localStorage.removeItem('bioLuminescenceResult');
    router.push('/'); // Adjust this path to your upload page route
  };

  const handleDashboardOrBack = () => {
    if (fromDashboard) {
      router.back(); // Go back to dashboard
    } else {
      router.push('/dashboard'); // Go to dashboard
    }
  };

  const toggleDropdown = (species: string) => {
    setOpenDropdown(openDropdown === species ? null : species);
  };

  // Calculate average confidence for each species
  const getAverageConfidences = () => {
    if (!result?.detections) return [];
    
    const confidences: { [key: string]: number[] } = {};
    
    result.detections.forEach(detection => {
      if (!confidences[detection.class_name]) {
        confidences[detection.class_name] = [];
      }
      confidences[detection.class_name].push(detection.confidence);
    });

    return Object.entries(confidences).map(([species, confArray]) => ({
      species,
      avgConfidence: confArray.reduce((sum, conf) => sum + conf, 0) / confArray.length
    })).sort((a, b) => b.avgConfidence - a.avgConfidence);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#282c34]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#61dafb] mb-4 mx-auto"></div>
          <p className="text-white">Loading results...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#282c34] text-white">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">No Results Found</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button 
            onClick={handleNewUpload}
            className="rounded-full bg-[#61dafb] px-6 py-2 font-semibold text-black hover:bg-[#52c0e8] transition"
          >
            Upload New Image
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-screen h-screen items-center justify-center bg-[#282c34] relative">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#282c34]/80 backdrop-blur-sm border-b border-gray-700/50 transition-colors duration-300">
        {/* Left side - Logo and Version */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/')}
            className="flex items-center space-x-4 hover:opacity-80 transition-opacity duration-200"
          >
            <Image
              src="/biosyn3.svg"  // Fixed path - remove "../"
              alt="Biosyn Logo"
              className="w-[5.5vh] h-[5.5vh]"
              width={44}
              height={44}
            />
            <span className="text-white font-semibold text-2xl">BioLuminescence</span>
          </button>
          <span className="text-gray-400 text-base md:text-lg bg-gray-700/50 px-2 py-1 rounded-md">v1.0</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={handleNewUpload}
            className="text-gray-300 hover:text-white transition-colors duration-200 px-3 py-2 rounded-md hover:bg-gray-700/50"
          >
            Upload Again
          </button>
          <button
            onClick={handleDashboardOrBack}
            className="text-gray-300 hover:text-white transition-colors duration-200 px-3 py-2 rounded-md hover:bg-gray-700/50"
          >
            {fromDashboard ? 'Back' : 'Dashboard'}
          </button>
        </div>
      </nav>

      {/* Left Panel - Image Display */}
      <div className="flex flex-col h-[80vh] w-[50vw] bg-[#282c34] p-6 overflow-auto">
        {result && (
          <div className="flex flex-col justify-center items-center h-full">
            <img
              src={result.image}
              alt="Processed result"
              className="w-[40vw] h-[40vw] object-contain rounded-lg shadow-lg border-4 border-black mb-6"
              onError={(e) => {
                console.error('Image failed to load:', result.image);
                setError('Failed to load processed image');
              }}
            />
          </div>
        )}
      </div>

      {/* Right Panel - Results Data */}
      <div className="flex flex-col h-[80vh] w-[50vw] bg-[#282c34] p-8 overflow-auto">
        {result && (
          <>
            {/* Analysis Results Header */}
            <div className="mb-8">
              <h2 className="text-white text-xl font-semibold tracking-wide">Analysis Results</h2>
            </div>

            {/* Statistics Cards - Enhanced Design */}
            <div className="flex justify-center mb-10">
              <div className="bg-gradient-to-br from-[#343a46] to-[#2d3139] p-8 rounded-3xl shadow-2xl border border-gray-600/30 hover:border-[#61dafb]/30  hover:shadow-lg backdrop-blur-sm w-full  transition-all duration-300">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-gray-300 text-sm font-medium uppercase tracking-wider">Unique Species</span>
                      <span className="text-white text-4xl font-light mt-1">{result.unique_species}</span>
                    </div>
                    <div className="w-12 h-12 bg-[#61dafb]/20 rounded-full flex items-center justify-center">
                      <div className="w-6 h-6 bg-[#61dafb] rounded-full"></div>
                    </div>
                  </div>
                  
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-gray-300 text-sm font-medium uppercase tracking-wider">Total Detections</span>
                      <span className="text-white text-4xl font-light mt-1">{result.detections.length}</span>
                    </div>
                    <div className="w-12 h-12 bg-[#61dafb]/20 rounded-full flex items-center justify-center">
                      <div className="w-6 h-6 bg-[#61dafb] rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Prediction Confidence Chart */}
            <div className="mb-6">
              <h3 className="text-white text-xl font-semibold tracking-wide mb-6">Prediction Confidence</h3>
              <div className="space-y-4">
                {getAverageConfidences().map((item, index) => (
                  <div key={index} className="bg-[#343a46] p-5 rounded-xl border border-gray-600/30 hover:border-[#61dafb]/30 transition-all duration-300 hover:shadow-lg relative">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-white font-medium text-lg">{item.species}</span>
                        {speciesDescriptions[item.species] && (
                          <button
                            onClick={() => toggleDropdown(item.species)}
                            className="text-gray-400 hover:text-[#61dafb] transition-colors duration-200 p-1.5 hover:bg-gray-700/50 rounded-full"
                          >
                            <svg 
                              className={`w-6 h-6 font-bold transition-transform duration-200 ${
                                openDropdown === item.species ? 'rotate-180' : ''
                              }`} 
                              fill="currentColor" 
                              viewBox="0 0 20 20"
                              strokeWidth="2"
                            >
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        )}
                      </div>
                      <span className="text-[#61dafb] font-bold text-lg">{(item.avgConfidence * 100).toFixed(1)}%</span>
                    </div>
                    
                    {/* Species Description Dropdown with Image */}
                    {openDropdown === item.species && speciesDescriptions[item.species] && (
                      <div className="mb-4 p-6 bg-[#1e2125] border border-gray-600/50 rounded-lg">
                        <div className="flex gap-4 items-start">
                          {/* Species Image */}
                          <div className="flex-shrink-0">
                            <Image
                              src={speciesDescriptions[item.species].image}
                              alt={item.species}
                              width={120}
                              height={120}
                              className="rounded-lg object-cover border-2 border-[#61dafb]/30 shadow-lg"
                            />
                          </div>
                          {/* Species Description */}
                          <div className="flex-1">
                            <h4 className="text-[#61dafb] font-semibold text-lg mb-3">{item.species}</h4>
                            <p className="text-gray-300 leading-relaxed text-base">
                              {speciesDescriptions[item.species].description}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-700/50 rounded-full h-4 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-[#61dafb] to-[#52c0e8] h-4 rounded-full transition-all duration-700 ease-out shadow-lg"
                          style={{ width: `${item.avgConfidence * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Main component with Suspense wrapper
export default function ResultPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen bg-[#282c34]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#61dafb] mb-4 mx-auto"></div>
          <p className="text-white">Loading results...</p>
        </div>
      </div>
    }>
      <ResultContent />
    </Suspense>
  );
}
