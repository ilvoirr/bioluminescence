"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
  timestamp?: string;
  originalFileName?: string;
}

interface StoredAnalysis {
  id: string;
  result: UploadResult;
  timestamp: string;
  originalFileName: string;
}

export default function DashboardPage() {
  const [analyses, setAnalyses] = useState<StoredAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAnalysis, setSelectedAnalysis] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadStoredAnalyses();
  }, []);

  const loadStoredAnalyses = () => {
    try {
      const stored = localStorage.getItem('bioLuminescenceHistory');
      if (stored) {
        const parsed: StoredAnalysis[] = JSON.parse(stored);
        // Sort by timestamp (newest first)
        const sorted = parsed.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setAnalyses(sorted);
      }
    } catch (error) {
      console.error('Error loading stored analyses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveAnalysesToStorage = (updatedAnalyses: StoredAnalysis[]) => {
    try {
      localStorage.setItem('bioLuminescenceHistory', JSON.stringify(updatedAnalyses));
      setAnalyses(updatedAnalyses);
    } catch (error) {
      console.error('Error saving analyses:', error);
    }
  };

  const deleteAnalysis = (analysisId: string) => {
    const updatedAnalyses = analyses.filter(analysis => analysis.id !== analysisId);
    saveAnalysesToStorage(updatedAnalyses);
  };

  const openAnalysis = (analysis: StoredAnalysis) => {
  // Store the selected result in localStorage for the result page
  localStorage.setItem('bioLuminescenceResult', JSON.stringify(analysis.result));
  router.push('/result?from=dashboard'); // Add the parameter here
};


  const clearAllAnalyses = () => {
    localStorage.removeItem('bioLuminescenceHistory');
    setAnalyses([]);
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate total unique species across all analyses
  const getTotalUniqueSpecies = () => {
    const allUniqueSpecies = new Set<string>();
    analyses.forEach(analysis => {
      analysis.result.detections.forEach(detection => {
        allUniqueSpecies.add(detection.class_name);
      });
    });
    return allUniqueSpecies.size;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#282c34]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#61dafb] mb-4 mx-auto"></div>
          <p className="text-white">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#282c34]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#282c34]/95 backdrop-blur-sm border-b border-gray-700/50">
        {/* Left side - Logo and Version */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/')}
            className="flex items-center space-x-4 hover:opacity-80 transition-opacity duration-200"
          >
            <Image
              src="/biosyn3.svg"
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
            onClick={() => router.push('/')}
            className="text-gray-300 hover:text-white transition-colors duration-200 px-3 py-2 rounded-md hover:bg-gray-700/50"
          >
            Upload New
          </button>
          <span className="text-[#61dafb] font-medium">Dashboard</span>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-24 px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">Analysis Dashboard</h1>
                <p className="text-gray-300 text-lg">
                  {analyses.length === 0 ? 'No analyses yet' : `${analyses.length} analysis${analyses.length !== 1 ? 'es' : ''} stored`}
                </p>
              </div>
              
              {analyses.length > 0 && (
                <button
                  onClick={clearAllAnalyses}
                  className="text-red-400 hover:text-red-300 transition-colors duration-200 px-4 py-2 rounded-md hover:bg-red-500/10 border border-red-500/30 hover:border-red-400/50"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Stats Cards */}
            {analyses.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-[#343a46] to-[#2d3139] p-6 rounded-2xl border border-gray-600/30 hover:border-[#61dafb]/30 transition-all duration-300">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-[#61dafb]/20 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-[#61dafb]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-300 text-sm uppercase tracking-wider">Total Images</p>
                      <p className="text-white text-2xl font-light">{analyses.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#343a46] to-[#2d3139] p-6 rounded-2xl border border-gray-600/30 hover:border-[#61dafb]/30 transition-all duration-300">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-[#61dafb]/20 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-[#61dafb]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-300 text-sm uppercase tracking-wider">Unique Species</p>
                      <p className="text-white text-2xl font-light">
                        {getTotalUniqueSpecies()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#343a46] to-[#2d3139] p-6 rounded-2xl border border-gray-600/30 hover:border-[#61dafb]/30 transition-all duration-300">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-[#61dafb]/20 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-[#61dafb]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-300 text-sm uppercase tracking-wider">Last Analysis</p>
                      <p className="text-white text-lg font-light">
                        {analyses.length > 0 ? formatDate(analyses[0].timestamp).split(',')[0] : 'None'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Analysis Grid */}
          {analyses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-24 h-24 bg-[#343a46] rounded-full flex items-center justify-center mb-6">
                <svg className="w-12 h-12 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No analyses yet</h3>
              <p className="text-gray-400 mb-6 text-center max-w-md">
                Upload your first microscopy image to start building your analysis history.
              </p>
              <button
                onClick={() => router.push('/')}
                className="rounded-full bg-[#61dafb] px-6 py-2 font-semibold text-black hover:bg-[#52c0e8] transition"
              >
                Upload First Image
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {analyses.map((analysis) => (
                <div
                  key={analysis.id}
                  onClick={() => openAnalysis(analysis)}
                  className="bg-gradient-to-br from-[#343a46] to-[#2d3139] rounded-2xl border border-gray-600/30 hover:border-[#61dafb]/50 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-xl group overflow-hidden"
                >
                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={analysis.result.image}
                      alt={`Analysis ${analysis.id}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      onError={(e) => {
                        console.error('Failed to load image:', analysis.result.image);
                      }}
                    />
                    
                    {/* Delete Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        deleteAnalysis(analysis.id);
                      }}
                      className="absolute top-3 right-3 w-8 h-8 bg-red-500/80 hover:bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 z-10"
                    >
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>

                    {/* Overlay with stats */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex justify-between items-end text-white text-sm">
                          <div>
                            <p className="font-medium">{analysis.result.unique_species} species</p>
                            <p className="text-gray-300">{analysis.result.detections.length} detections</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[#61dafb] font-medium">View Results</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-white font-medium text-sm mb-1">
                          Analysis #{analysis.id.slice(-6).toUpperCase()}
                        </h3>
                        <p className="text-gray-400 text-xs">
                          {formatDate(analysis.timestamp)}
                        </p>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex justify-between text-xs">
                      <div className="text-center">
                        <p className="text-[#61dafb] font-semibold">{analysis.result.unique_species}</p>
                        <p className="text-gray-400">Species</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[#61dafb] font-semibold">{analysis.result.detections.length}</p>
                        <p className="text-gray-400">Detections</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[#61dafb] font-semibold">
                          {analysis.result.detections.length > 0 
                            ? Math.round((analysis.result.detections.reduce((sum, d) => sum + d.confidence, 0) / analysis.result.detections.length) * 100)
                            : 0}%
                        </p>
                        <p className="text-gray-400">Avg Conf</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
