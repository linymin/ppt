'use client';

import React, { useState } from 'react';
import { PPTPlan, PPTPage, GenerationMode } from '@/types';
import { InputForm } from '@/components/InputForm';
import { OutlineView } from '@/components/OutlineView';
import { CardList } from '@/components/CardList';
import { generateMarkdown } from '@/lib/markdown';
import { Download, ArrowLeft } from 'lucide-react';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [plan, setPlan] = useState<PPTPlan | null>(null);

  const handleGenerate = async (input: string, mode: GenerationMode) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input, mode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate plan');
      }

      setPlan(data);
    } catch (error) {
      console.error('Generation failed', error);
      alert('Failed to generate plan. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePage = (index: number, updatedPage: PPTPage) => {
    if (!plan) return;
    const newPages = [...plan.pages];
    newPages[index] = updatedPage;
    setPlan({ ...plan, pages: newPages });
  };

  const handleDeletePage = (index: number) => {
    if (!plan) return;
    const newPages = [...plan.pages];
    newPages.splice(index, 1);
    setPlan({ ...plan, pages: newPages });
  };

  const handleAddPage = (index: number) => {
    if (!plan) return;
    const newPage: PPTPage = {
      id: `new-${Date.now()}`,
      title: 'New Slide',
      content: 'Add content here...',
      visual: 'No visual suggestion yet.',
    };
    const newPages = [...plan.pages];
    newPages.splice(index, 0, newPage);
    setPlan({ ...plan, pages: newPages });
  };

  const handleDownload = () => {
    if (!plan) return;
    const md = generateMarkdown(plan);
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${plan.topic.replace(/\s+/g, '_')}_plan.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!plan) {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white border-b border-gray-200 py-4 px-6 flex items-center justify-between">
            <div className="font-bold text-xl text-indigo-600">PPT Planner</div>
        </header>
        <div className="flex-1 flex items-center justify-center">
            <InputForm onGenerate={handleGenerate} isLoading={isLoading} />
        </div>
      </main>
    );
  }

  return (
    <main className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="h-16 bg-white border-b border-gray-200 px-4 flex items-center justify-between flex-shrink-0 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
                if(confirm('Are you sure you want to go back? Unsaved changes will be lost.')) {
                    setPlan(null);
                }
            }}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-lg text-gray-800 truncate max-w-md" title={plan.topic}>
            {plan.topic}
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
            <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm transition-colors"
            >
                <Download className="w-4 h-4" />
                Download Markdown
            </button>
        </div>
      </header>

      {/* Main Content Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Outline View (40%) */}
        <div className="w-[40%] flex-shrink-0 border-r border-gray-200 bg-gray-900">
            <OutlineView plan={plan} />
        </div>

        {/* Right Panel: Card List (60%) */}
        <div className="flex-1 min-w-0 bg-gray-50">
          <CardList 
            pages={plan.pages}
            onUpdatePage={handleUpdatePage}
            onAddPage={handleAddPage}
            onDeletePage={handleDeletePage}
          />
        </div>
      </div>
    </main>
  );
}
