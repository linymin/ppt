import React, { useState } from 'react';
import { GenerationMode } from '@/types';
import { Sparkles } from 'lucide-react';

interface InputFormProps {
  onGenerate: (input: string, mode: GenerationMode) => void;
  isLoading: boolean;
}

export function InputForm({ onGenerate, isLoading }: InputFormProps) {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<GenerationMode>('slide');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onGenerate(input, mode);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
      <div className="text-center mb-6">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">AI PPT Planner</h1>
        <p className="text-lg text-gray-500">Turn your detailed content into a structured presentation in seconds.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div>
          <label className="block text-base font-semibold text-gray-700 mb-3">
            Your Content / Topic
          </label>
          <textarea
            className="w-full h-64 p-5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-y text-gray-900 text-base leading-relaxed placeholder-gray-400"
            placeholder="Paste your article, report, or detailed thoughts here. The more context you provide, the better the result..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-start md:items-end justify-between">
          <div className="w-full md:w-auto flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Generation Mode
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setMode('detail')}
                className={`p-3 border rounded-lg text-left transition-all ${
                  mode === 'detail'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500'
                    : 'border-gray-200 hover:border-indigo-200 text-gray-600'
                }`}
              >
                <div className="font-semibold text-sm">Detailed Script</div>
                <div className="text-xs mt-0.5 opacity-80">Full text content</div>
              </button>
              <button
                type="button"
                onClick={() => setMode('slide')}
                className={`p-3 border rounded-lg text-left transition-all ${
                  mode === 'slide'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500'
                    : 'border-gray-200 hover:border-indigo-200 text-gray-600'
                }`}
              >
                <div className="font-semibold text-sm">Presentation Slides</div>
                <div className="text-xs mt-0.5 opacity-80">Bulleted points</div>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-full md:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold rounded-lg shadow transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Plan
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
