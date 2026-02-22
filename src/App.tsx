/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  Languages, 
  Copy, 
  Check, 
  RotateCcw, 
  Sparkles, 
  ArrowRightLeft,
  Info,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';

// Initialize Gemini AI
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export default function App() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationWarning, setValidationWarning] = useState<string | null>(null);
  const [mode, setMode] = useState<'toBengali' | 'toBanglish'>('toBengali');

  useEffect(() => {
    if (input.length > 0 && input.length < 3) {
      setValidationWarning("Input is a bit short. Results might be inaccurate.");
    } else if (input.length > 0 && mode === 'toBengali' && /^[0-9\s!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/.test(input)) {
      setValidationWarning("Input seems to contain only symbols or numbers.");
    } else {
      setValidationWarning(null);
    }
  }, [input, mode]);

  const handleConvert = async () => {
    if (!input.trim()) return;
    if (input.length < 2) {
      setError("Please enter at least 2 characters.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const model = "gemini-3-flash-preview";
      
      const systemInstruction = mode === 'toBengali' 
        ? "You are an expert Bengali linguist. Your task is to convert Romanized/Phonetic Bangla text (e.g., 'ami bhalo achi') into correct Bengali script (আমি ভালো আছি). \n\nRules:\n1. Preserve all line breaks and paragraph structure from the input.\n2. If the input is already in Bengali script but has errors, fix them.\n3. If the input is English, translate it to Bengali.\n4. If the input is gibberish or non-linguistic (like just random symbols), return 'Invalid input'.\n5. Only return the converted/fixed text, nothing else. Do not include any explanations or notes."
        : "You are an expert Bengali linguist. Your task is to convert Bengali script (আমি ভালো আছি) into Romanized/Phonetic Bangla (Banglish) (e.g., 'ami bhalo achi'). \n\nRules:\n1. Preserve all line breaks and paragraph structure from the input.\n2. Use standard, easy-to-read phonetic spelling (Banglish).\n3. If the input is already in Banglish, improve the spelling if needed.\n4. If the input is English, translate it to Banglish.\n5. If the input is gibberish or non-linguistic, return 'Invalid input'.\n6. Only return the converted text, nothing else. Do not include any explanations or notes.";

      const response = await genAI.models.generateContent({
        model,
        contents: input,
        config: {
          systemInstruction,
        },
      });

      const text = response.text || "";
      if (text.toLowerCase().includes("invalid input")) {
        setError("The AI couldn't recognize this as valid text to convert. Please try again.");
        setOutput('');
      } else {
        setOutput(text.trim());
      }
    } catch (err: any) {
      console.error("Conversion error:", err);
      
      const errorMessage = err.message?.toLowerCase() || "";
      
      if (errorMessage.includes("api key") || errorMessage.includes("403") || errorMessage.includes("401")) {
        setError("Invalid API Key. Please ensure your Gemini API key is correctly configured in the environment.");
      } else if (errorMessage.includes("fetch") || errorMessage.includes("network") || errorMessage.includes("failed to fetch")) {
        setError("Network error. Please check your internet connection and try again.");
      } else if (errorMessage.includes("quota") || errorMessage.includes("429")) {
        setError("API quota exceeded. Please wait a moment before trying again.");
      } else {
        setError("An unexpected error occurred. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setInput('');
    setOutput('');
    setError(null);
    setValidationWarning(null);
  };

  const toggleMode = () => {
    setMode(prev => prev === 'toBengali' ? 'toBanglish' : 'toBengali');
    handleReset();
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[480px] bg-white rounded-[24px] shadow-sm border border-black/5 overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-bottom border-black/5 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-sm shadow-emerald-200">
              <Languages size={22} />
            </div>
            <div>
              <h1 className="text-[17px] font-semibold text-zinc-900 leading-tight">Bangla Converter</h1>
              <p className="text-[12px] text-zinc-500 font-medium">
                {mode === 'toBengali' ? 'Phonetic to Bengali Script' : 'Bengali Script to Banglish'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleMode}
              className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-emerald-600 hover:text-emerald-700"
              title="Switch Mode"
            >
              <ArrowRightLeft size={18} />
            </button>
            <button 
              onClick={handleReset}
              className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-400 hover:text-zinc-600"
              title="Reset"
            >
              <RotateCcw size={18} />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 space-y-5">
          {/* Mode Selector Tabs */}
          <div className="flex p-1 bg-zinc-100 rounded-xl">
            <button
              onClick={() => { setMode('toBengali'); handleReset(); }}
              className={`flex-1 py-2 text-[12px] font-bold rounded-lg transition-all ${
                mode === 'toBengali' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              Phonetic → Bengali
            </button>
            <button
              onClick={() => { setMode('toBanglish'); handleReset(); }}
              className={`flex-1 py-2 text-[12px] font-bold rounded-lg transition-all ${
                mode === 'toBanglish' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              Bengali → Banglish
            </button>
          </div>

          {/* Input Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                {mode === 'toBengali' ? 'Input (Phonetic / Romanized)' : 'Input (Bengali Script)'}
              </label>
              <span className="text-[10px] text-zinc-400 font-mono">
                {input.length} chars
              </span>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode === 'toBengali' ? "e.g., ami bhalo achi..." : "উদা: আমি ভালো আছি..."}
              className="w-full h-40 p-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none text-[15px] text-zinc-800 placeholder:text-zinc-400 leading-relaxed"
            />
            <AnimatePresence>
              {validationWarning && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-[11px] text-amber-600 font-medium px-1 flex items-center gap-1"
                >
                  <Info size={12} />
                  {validationWarning}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Action Button */}
          <button
            onClick={handleConvert}
            disabled={isLoading || !input.trim()}
            className={`w-full py-4 rounded-2xl font-semibold text-[15px] flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
              isLoading || !input.trim() 
                ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed' 
                : 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-lg shadow-zinc-200'
            }`}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles size={18} className="text-emerald-400" />
                {mode === 'toBengali' ? 'Convert to Bengali' : 'Convert to Banglish'}
              </>
            )}
          </button>

          {/* Output Section */}
          <AnimatePresence mode="wait">
            {(output || error) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 pt-2"
              >
                <div className="flex items-center justify-between px-1">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                    {mode === 'toBengali' ? 'Result (Bengali Script)' : 'Result (Banglish)'}
                  </label>
                  {output && (
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-wider transition-colors"
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  )}
                </div>
                
                {error ? (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-[14px] font-medium">
                    {error}
                  </div>
                ) : (
                  <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl min-h-[80px] text-[18px] text-zinc-900 font-medium leading-relaxed whitespace-pre-wrap">
                    {output}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-50 border-t border-black/5 flex items-center justify-center gap-4">
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-medium uppercase tracking-widest">
            <Info size={12} />
            Powered by Gemini AI
          </div>
        </div>
      </motion.div>

      {/* Background Decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-100/30 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/30 blur-[120px] rounded-full" />
      </div>
    </div>
  );
}
