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
    <div className="max-w-2xl mx-auto mt-20 p-6 bg-white rounded-xl shadow-lg border border-gray-100">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">AI PPT Planner</h1>
        <p className="text-gray-500">Turn your ideas into a structured presentation in seconds.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Idea
          </label>
          <textarea
            className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none text-gray-900"
            placeholder="Describe your presentation topic, e.g., 'A marketing plan for a new coffee brand targeting students...'"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Generation Mode
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setMode('detail')}
              className={`p-4 border rounded-lg text-left transition-all ${
                mode === 'detail'
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500'
                  : 'border-gray-200 hover:border-indigo-200 text-gray-600'
              }`}
            >
              <div className="font-semibold">Detailed Script</div>
              <div className="text-xs mt-1 opacity-80">Full text content for reading</div>
            </button>
            <button
              type="button"
              onClick={() => setMode('slide')}
              className={`p-4 border rounded-lg text-left transition-all ${
                mode === 'slide'
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500'
                  : 'border-gray-200 hover:border-indigo-200 text-gray-600'
              }`}
            >
              <div className="font-semibold">Presentation Slides</div>
              <div className="text-xs mt-1 opacity-80">Bulleted points for slides</div>
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold rounded-lg shadow transition-colors flex items-center justify-center gap-2"
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
      </form>
    </div>
  );
}
