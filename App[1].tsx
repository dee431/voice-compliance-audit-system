import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { ResultCard } from './components/ResultCard';
import { analyzeAudioCompliance } from './services/geminiService';
import { FileData, AnalysisResult, AnalysisStatus } from './types';
import { Activity, ShieldCheck, Loader2, Mic, Scale } from 'lucide-react';

type AppMode = 'verification' | 'transcription';

export default function App() {
  const [mode, setMode] = useState<AppMode>('verification');
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [pdfData, setPdfData] = useState<FileData | null>(null);
  const [referenceText, setReferenceText] = useState('');
  const [guidelines, setGuidelines] = useState('');
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!fileData) {
      setErrorMessage("Please upload an audio file.");
      return;
    }

    if (mode === 'verification' && !referenceText) {
       setErrorMessage("Please provide reference text for verification.");
       return;
    }

    setStatus(AnalysisStatus.PROCESSING);
    setErrorMessage(null);
    setResult(null);

    try {
      const analysis = await analyzeAudioCompliance(
        fileData.data,
        fileData.type,
        referenceText,
        guidelines || "No specific guidelines provided. Please ensure strict accuracy.",
        mode,
        pdfData?.data
      );
      setResult(analysis);
      setStatus(AnalysisStatus.COMPLETED);
    } catch (error) {
      console.error(error);
      setErrorMessage("An error occurred during analysis. Please try again.");
      setStatus(AnalysisStatus.ERROR);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Audio Compliance Auditor</h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Inputs */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              
              {/* Mode Toggle */}
              <div className="bg-slate-100 p-1 rounded-xl flex mb-6">
                <button
                  onClick={() => setMode('verification')}
                  className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-lg transition-all ${
                    mode === 'verification' 
                      ? 'bg-white text-indigo-600 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Scale className="w-4 h-4 mr-2" />
                  Verify Text
                </button>
                <button
                  onClick={() => setMode('transcription')}
                  className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-lg transition-all ${
                    mode === 'transcription' 
                      ? 'bg-white text-indigo-600 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Mic className="w-4 h-4 mr-2" />
                  Transcribe
                </button>
              </div>

              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-bold mr-2">1</span>
                Input Data
              </h2>
              
              <div className="space-y-6">
                <FileUpload 
                  label="Audio Source"
                  accept="audio/*,video/*"
                  helperText="Click to upload audio"
                  onFileSelected={setFileData} 
                />

                <FileUpload 
                  label="Guidelines PDF (Optional)"
                  accept="application/pdf"
                  helperText="Click to upload guidelines PDF"
                  onFileSelected={setPdfData} 
                />

                {mode === 'verification' && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <label htmlFor="refText" className="block text-sm font-medium text-slate-700 mb-2">
                      Reference Text
                    </label>
                    <textarea
                      id="refText"
                      rows={6}
                      className="w-full rounded-xl border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm p-3 bg-slate-50"
                      placeholder="Enter the expected text here..."
                      value={referenceText}
                      onChange={(e) => setReferenceText(e.target.value)}
                    />
                    <p className="mt-1 text-xs text-slate-400">The text you expect the audio to match.</p>
                  </div>
                )}

                <div>
                  <label htmlFor="guidelines" className="block text-sm font-medium text-slate-700 mb-2">
                    {mode === 'transcription' ? 'Formatting Instructions' : 'Additional Instructions'} <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    id="guidelines"
                    rows={4}
                    className="w-full rounded-xl border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm p-3 bg-slate-50"
                    placeholder={mode === 'transcription' ? "e.g. Use [pause] for silences > 4s, lowercase only..." : "e.g. Specific notes not covered in PDF..."}
                    value={guidelines}
                    onChange={(e) => setGuidelines(e.target.value)}
                  />
                </div>

                {errorMessage && (
                  <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
                    {errorMessage}
                  </div>
                )}

                <button
                  onClick={handleAnalyze}
                  disabled={status === AnalysisStatus.PROCESSING || !fileData || (mode === 'verification' && !referenceText)}
                  className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {status === AnalysisStatus.PROCESSING ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      {mode === 'transcription' ? <Mic className="-ml-1 mr-2 h-4 w-4" /> : <Activity className="-ml-1 mr-2 h-4 w-4" />}
                      {mode === 'transcription' ? 'Start Transcription' : 'Run Verification'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-7">
             {status === AnalysisStatus.IDLE && (
               <div className="h-full flex flex-col items-center justify-center p-12 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-300">
                 <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                   {mode === 'transcription' ? <Mic className="w-8 h-8 text-slate-300" /> : <Activity className="w-8 h-8 text-slate-300" />}
                 </div>
                 <h3 className="text-lg font-medium text-slate-900">
                   {mode === 'transcription' ? 'Ready to Transcribe' : 'Ready to Analyze'}
                 </h3>
                 <p className="max-w-sm mt-2 text-sm">
                   {mode === 'transcription' 
                    ? 'Upload an audio file and optional guidelines to generate a formatted transcription.' 
                    : 'Upload an audio file, guidelines, and reference text to start the compliance check.'}
                 </p>
               </div>
             )}

             {status === AnalysisStatus.PROCESSING && (
               <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl shadow-sm border border-slate-200">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                  </div>
                  <h3 className="mt-6 text-lg font-medium text-slate-900">
                    {mode === 'transcription' ? 'Generating Transcription' : 'Processing Audio'}
                  </h3>
                  <p className="text-slate-500 mt-2">
                    {mode === 'transcription' ? 'Listening and applying formatting rules...' : 'Transcribing and verifying compliance against guidelines...'}
                  </p>
               </div>
             )}

             {status === AnalysisStatus.COMPLETED && result && (
               <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <ResultCard result={result} />
               </div>
             )}
          </div>

        </div>
      </main>
    </div>
  );
}