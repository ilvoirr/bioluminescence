"use client";

import Image from "next/image";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Detection {
  class_name: string;
  confidence: number;
  bbox: [number, number, number, number];
}

interface UploadResult {
  success: boolean;
  image: string;
  detections: Detection[];
  total_count: number;
  file_id: string;
}

interface StoredAnalysis {
  id: string;
  result: UploadResult;
  timestamp: string;
  originalFileName: string;
}

export default function HeroSection() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [navbarBg, setNavbarBg] = useState('bg-[#282c34]/95');
  const [showUploadButton, setShowUploadButton] = useState(false);
  const router = useRouter();

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const saveToHistory = (uploadResult: UploadResult, originalFile: File) => {
    try {
      const existingHistory = localStorage.getItem('bioLuminescenceHistory');
      const history: StoredAnalysis[] = existingHistory ? JSON.parse(existingHistory) : [];
      
      const newAnalysis: StoredAnalysis = {
        id: uploadResult.file_id,
        result: uploadResult,
        timestamp: new Date().toISOString(),
        originalFileName: originalFile.name
      };
      
      history.unshift(newAnalysis); // Add to beginning (newest first)
      localStorage.setItem('bioLuminescenceHistory', JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save to history:', error);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    const file = e.target.files[0];
    setIsLoading(true);
    setUploadStatus('uploading');
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://127.0.0.1:5000/upload", {
        method: "POST",
        body: formData,
      });

      const uploadResult: UploadResult = await res.json();
      
      if (uploadResult.success) {
        setUploadStatus('success');
        localStorage.setItem('bioLuminescenceResult', JSON.stringify(uploadResult));
        
        // Save to dashboard history
        saveToHistory(uploadResult, file);
        
        // Show success animation for 1.5 seconds, then navigate
        setTimeout(() => {
          router.push('/result');
        }, 1500);
      } else {
        setUploadStatus('error');
        setError("Failed to process image");
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Upload failed:", err);
      setUploadStatus('error');
      setError("Upload failed. Make sure the backend server is running.");
      setIsLoading(false);
    }
  };

  const scrollToSection = (offset: number) => {
    window.scrollTo({
      top: offset,
      behavior: 'smooth'
    });
  };

  // Add scroll event listener for dynamic navbar background and upload button visibility
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const vh90 = window.innerHeight * 0.9;
      const vh190 = vh90 + window.innerHeight; // 90vh + 100vh

      // Navbar background logic
      if (scrollY > vh190) {
        setNavbarBg('bg-black');
      } else if (scrollY > vh90) {
        setNavbarBg('bg-[#3a3f47]');
      } else {
        setNavbarBg('bg-[#282c34]/95');
      }

      // Upload button visibility logic
      setShowUploadButton(scrollY > vh90);
    };

    window.addEventListener('scroll', handleScroll);

    // Cleanup function
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="overflow-x-hidden">
      <div className="flex w-screen h-[90vh] items-center justify-center bg-[#282c34] relative">
        {/* Navigation Bar with dynamic background */}
        <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 ${navbarBg} backdrop-blur-sm border-b border-gray-700/50 transition-colors duration-300`}>
          {/* Left side - Logo and Version */}
          <div className="flex items-center space-x-4">
            <Image
              src="/biosyn3.svg"
              alt="Biosyn Logo"
              className="w-[5.5vh] h-[5.5vh]"
              width={0}
              height={0}
              style={{ height: 'auto' }}
            />
            <span className="text-white font-semibold text-2xl">BioLuminescence</span>
            <span className="text-gray-400 text-base md:text-lg bg-gray-700/50 px-2 py-1 rounded-md">v1.0</span>
          </div>

          {/* Right side - Navigation Buttons */}
          <div className="flex items-center space-x-4">
            {showUploadButton && (
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-gray-300 hover:text-white transition-colors duration-200 px-3 py-2 rounded-md hover:bg-gray-700/50"
              >
                Upload Image
              </button>
            )}
            
            <button
              onClick={() => scrollToSection(window.innerHeight * 0.901)}
              className="text-gray-300 hover:text-white transition-colors duration-200 px-3 py-2 rounded-md hover:bg-gray-700/50"
            >
              AI Microscopy
            </button>
            
            <button
              onClick={() => scrollToSection(window.innerHeight * 0.9 + window.innerHeight)}
              className="text-gray-300 hover:text-white transition-colors duration-200 px-3 py-2 rounded-md hover:bg-gray-700/50"
            >
              Raspberry Pi Compatibility
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="text-gray-300 hover:text-white transition-colors duration-200 px-3 py-2 rounded-md hover:bg-gray-700/50"
            >
              Dashboard
            </button>
          </div>
        </nav>

        {/* Main Content */}
        <div className="flex flex-col items-center justify-center p-12">
          {/* Logo and Title */}
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

          {/* Simple Loading Animation - Text and Dots Only */}
          {isLoading && (
            <div className="flex flex-col items-center mb-6">
              <div className="text-center">
                {uploadStatus === 'uploading' ? (
                  <>
                    <p className="text-white text-lg font-medium mb-4">Analyzing biological specimens</p>
                    <div className="flex space-x-1 justify-center">
                      <div 
                        className="w-2 h-2 bg-[#61dafb] rounded-full animate-pulse" 
                        style={{animationDelay: '0s'}}
                      ></div>
                      <div 
                        className="w-2 h-2 bg-[#61dafb] rounded-full animate-pulse" 
                        style={{animationDelay: '0.2s'}}
                      ></div>
                      <div 
                        className="w-2 h-2 bg-[#61dafb] rounded-full animate-pulse" 
                        style={{animationDelay: '0.4s'}}
                      ></div>
                    </div>
                  </>
                ) : uploadStatus === 'success' ? (
                  <>
                    <p className="text-white text-lg font-medium">Analysis Complete!</p>
                    <p className="text-[#61dafb] text-sm mt-2">Redirecting to results...</p>
                  </>
                ) : null}
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-500 text-white p-4 rounded-lg mb-6 max-w-md text-center">
              {error}
            </div>
          )}

          {/* Upload Buttons */}
          {!isLoading && (
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

      {/* Second Flexbox - AI Microscopy Section */}
      <div className="flex w-screen h-screen items-center justify-center bg-[#3a3f47]">
        <div className="max-w-6xl mx-auto px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text Content */}
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                  Revolutionary
                  <span className="text-[#61dafb]"> AI-Powered </span>
                  Microscopy
                </h2>
                <p className="text-xl text-gray-300 leading-relaxed">
                  Transform your observations with data-driven insights and cutting-edge machine learning technology.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-[#61dafb] rounded-full p-2 mt-1">
                    <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Instant Species Recognition</h3>
                    <p className="text-gray-400">Identify microorganisms in seconds with high accuracy using advanced computer processing.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-[#61dafb] rounded-full p-2 mt-1">
                    <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Automated Counting</h3>
                    <p className="text-gray-400">Eliminate manual counting errors with precise organism quantification and statistical analysis.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-[#61dafb] rounded-full p-2 mt-1">
                    <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Real-time Analysis</h3>
                    <p className="text-gray-400">Get comprehensive reports with confidence scores, bounding boxes, and detailed classifications.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Stats/Visual */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700">
                <h3 className="text-2xl font-bold text-white mb-6 text-center">Powered by Advanced Quality AI</h3>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-[#61dafb] mb-2">High</div>
                    <div className="text-gray-400 text-sm">Accuracy Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-[#61dafb] mb-2">&lt;10s</div>
                    <div className="text-gray-400 text-sm">Analysis Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-[#61dafb] mb-2">Multiple</div>
                    <div className="text-gray-400 text-sm">Species Types</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-[#61dafb] mb-2">24/7</div>
                    <div className="text-gray-400 text-sm">Availability</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700">
                <h4 className="text-lg font-semibold text-white mb-4">Ideal Applications</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-[#61dafb] rounded-full"></div>
                    <span className="text-gray-300">Research Laboratories & Medical Diagnostics</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-[#61dafb] rounded-full"></div>
                    <span className="text-gray-300">Educational Institutes & Field Studies</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-[#61dafb] rounded-full"></div>
                    <span className="text-gray-300">Environmental & Pharmaceutical Testing</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-[#61dafb] rounded-full"></div>
                    <span className="text-gray-300">Pathology & Microbiology Studies</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Third Flexbox - Raspberry Pi Section */}
      <div className="flex w-screen h-screen items-center justify-center bg-black">
        <div className="max-w-6xl mx-auto px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Raspberry Pi Image and Stats */}
            <div className="space-y-6">
              <div className="bg-[23272f] from-slate-800 to-slate-900 rounded-2xl ">
                <h3 className="text-2xl font-bold text-white mb-6 text-center">Compatible with</h3>
                
                {/* Raspberry Pi Image Placeholder */}
                <div className="flex justify-center mb-6">
                  <div className="bg-black from-slate-700 to-slate-800 rounded-xl p-6 w-48 h-32 flex items-center justify-center ">
                    <Image
                      src="/raspberry-pi.jpg"
                      alt="Raspberry Pi"
                      width={150}
                      height={100}
                      className="rounded-lg object-cover"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-cyan-400 mb-2">Low</div>
                    <div className="text-slate-400 text-sm">Starting Cost</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-cyan-400 mb-2">No Internet</div>
                    <div className="text-slate-400 text-sm">Required</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-cyan-400 mb-2">100%</div>
                    <div className="text-slate-400 text-sm">Local Control </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-cyan-400 mb-2">Expandable</div>
                    <div className="text-slate-400 text-sm">Storage Capacity</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-600">
                <h4 className="text-lg font-semibold text-white mb-4">Alternative Embedded Systems</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                    <span className="text-slate-300">Raspberry Pi 5</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                    <span className="text-slate-300">Orange Pi 5 Plus, Asus Tinker Board, and NVIDIA Jetson Nano</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                    <span className="text-slate-300">Edge Computing Devices</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                    <span className="text-slate-300">Mini PCs</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Text Content */}
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                  Deploy
                  <span className="text-cyan-400"> Locally </span>
                  <div>Anytime Anywhere</div>
                </h2>
                <p className="text-xl text-slate-300 leading-relaxed">
                  Run BioLuminescence on affordable hardware like Raspberry Pi for completely offline, cost-effective analysis without internet dependency.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-cyan-400 rounded-full p-2 mt-1">
                    <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Offline Analysis</h3>
                    <p className="text-slate-400">Process samples without internet connectivity. Perfect for remote locations, field research, and secure environments.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-cyan-400 rounded-full p-2 mt-1">
                    <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Local Data Storage</h3>
                    <p className="text-slate-400">Store unlimited results locally with complete data ownership. Monitor trends and build historical dataset securely.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-cyan-400 rounded-full p-2 mt-1">
                    <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.736 6.979C9.208 6.193 9.696 6 10 6c.304 0 .792.193 1.264.979a1 1 0 001.715-1.029C12.279 4.784 11.232 4 10 4s-2.279.784-2.979 1.95c-.285.475-.507 1-.67 1.55H6a1 1 0 000 2h.013a9.358 9.358 0 000 1H6a1 1 0 100 2h.351c.163.55.385 1.075.67 1.55C7.721 15.216 8.768 16 10 16s2.279-.784 2.979-1.95a1 1 0 10-1.715-1.029C10.792 13.807 10.304 14 10 14c-.304 0-.792-.193-1.264-.979a4.265 4.265 0 01-.264-.521H9a1 1 0 110-2h-.013a7.78 7.78 0 010-1H9a1 1 0 010-2h-.528a4.265 4.265 0 01.264-.521z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Cost-Effective Setup</h3>
                    <p className="text-slate-400">Deploy on budget-friendly hardware with no subscription fees, cloud costs, or recurring charges.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-cyan-400 rounded-full p-2 mt-1">
                    <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Complete Privacy</h3>
                    <p className="text-slate-400">Keep sensitive research data on-premise while no data leaves your network, ensuring maximum security and compliance.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
