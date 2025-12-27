'use client';

import React, { useState } from 'react';
import { PPTPlan, PPTPage, GenerationMode } from '@/types';
import { InputForm } from '@/components/InputForm';
import { CardList } from '@/components/CardList';
import { OutlineView } from '@/components/OutlineView';
import { ThemeSelector } from '@/components/ThemeSelector'; // Add this
import { generateText } from '@/lib/markdown';
import { Download, ArrowLeft } from 'lucide-react';
import { ColorScheme } from '@/types'; // Add this

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [plan, setPlan] = useState<PPTPlan | null>(null);
  const [originalContent, setOriginalContent] = useState('');
  const [activeTab, setActiveTab] = useState<'cards' | 'original'>('cards');

  const handleGenerate = async (input: string, mode: GenerationMode) => {
    setIsLoading(true);
    setOriginalContent(input); // Save original content
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input, mode }),
      });

      if (!response.ok) {
        throw new Error(response.statusText || 'Failed to generate plan');
      }

      if (!response.body) {
          throw new Error('No response body');
      }

      // Handle streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';

      while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          accumulatedText += chunk;
          // You could add a state to show real-time progress here if needed
      }

      // Helper to extract JSON from the accumulated text
      const extractJSON = (str: string) => {
        let jsonStr = str || '{}';
        // Remove markdown code blocks if present
        const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (codeBlockMatch) {
            jsonStr = codeBlockMatch[1];
        }
        // Find the JSON object
        const firstBrace = jsonStr.indexOf('{');
        const lastBrace = jsonStr.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
        }
        return JSON.parse(jsonStr);
      };

      let data;
      try {
          const parsedContent = extractJSON(accumulatedText);
          
          // Post-process the data (add IDs, normalize content)
          if (parsedContent.pages) {
            parsedContent.pages = parsedContent.pages.map((p: any, idx: number) => ({
                ...p,
                id: `page-${Date.now()}-${idx}`,
                content: Array.isArray(p.content) ? p.content.join('\n') : p.content,
                type: p.type || 'content'
            }));
          }
          data = parsedContent;
      } catch (parseError) {
          console.error('JSON Parse Error:', parseError);
          console.log('Raw text:', accumulatedText);
          throw new Error('Failed to parse AI response. The generated content might be incomplete.');
      }

      // Step 1: Set the content plan first (so user sees result immediately)
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

  const handleReorderPage = (oldIndex: number, newIndex: number) => {
    if (!plan) return;
    const newPages = [...plan.pages];
    const [movedPage] = newPages.splice(oldIndex, 1);
    newPages.splice(newIndex, 0, movedPage);
    setPlan({ ...plan, pages: newPages });
  };

  const handleAddPage = (index: number) => {
    if (!plan) return;
    const newPage: PPTPage = {
      id: `new-${Date.now()}`,
      title: 'New Slide',
      content: 'Add content here...',
      visual: 'No visual suggestion yet.',
      type: 'content',
    };
    const newPages = [...plan.pages];
    newPages.splice(index, 0, newPage);
    setPlan({ ...plan, pages: newPages });
  };

  const handleColorSchemeSelect = (scheme: ColorScheme) => {
    setPlan(prev => prev ? { ...prev, selectedColorScheme: scheme } : null);
  };

  const handleDownload = () => {
    if (!plan) return;
    const text = generateText(plan);
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${plan.topic.replace(/\s+/g, '_')}_plan.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!plan) {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col py-10 px-6">
        <header className="mb-8 flex items-center justify-between max-w-7xl mx-auto w-full">
            <div className="font-bold text-xl text-indigo-600">PPT Planner</div>
        </header>
        <div className="flex-1 flex items-start justify-center">
            <InputForm onGenerate={handleGenerate} isLoading={isLoading} />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 flex justify-center p-2 md:p-4">
      {/* App Container */}
      <div className="w-full max-w-[1800px] bg-white rounded-xl shadow-xl flex flex-col border border-gray-200 min-h-[calc(100vh-2rem)]">
        
        {/* Header */}
        <header className="sticky top-0 z-50 h-12 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 flex items-center justify-between rounded-t-xl">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                  if(confirm('Are you sure you want to go back? Unsaved changes will be lost.')) {
                      setPlan(null);
                  }
              }}
              className="p-1 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="font-bold text-base text-gray-800 truncate max-w-md" title={plan.topic}>
              {plan.topic}
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
              <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium text-xs transition-colors"
              >
                  <Download className="w-3.5 h-3.5" />
                  导出 TXT
              </button>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          
          {/* Theme Selector Banner */}
          <ThemeSelector 
            schemes={plan.colorSchemes} 
            selected={plan.selectedColorScheme}
            onSelect={handleColorSchemeSelect}
          />

          {/* Bottom Split View (Sticky Wrapper) */}
          <div className="sticky top-12 flex-1 flex overflow-hidden p-4 gap-4 h-[calc(100vh-3rem)]">
            
            {/* Left Panel: Outline View */}
            <div className="w-[450px] xl:w-[500px] flex-shrink-0 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden">
                <div className="px-3 py-2 border-b border-gray-100 font-bold bg-gray-50/50 text-gray-700 flex items-center justify-between text-sm">
                   <span>大纲预览</span>
                   <span className="text-[10px] font-normal text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">{plan.pages.length} 页</span>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                   <OutlineView plan={plan} />
                </div>
            </div>

            {/* Right Panel: Content Cards */}
            <div className="flex-1 max-w-4xl bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden">
              {/* Tabs */}
              <div className="p-2 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                 <div className="inline-flex p-1 bg-gray-100 rounded-lg">
                  <button
                    onClick={() => setActiveTab('cards')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                      activeTab === 'cards'
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    内容卡片
                  </button>
                  <button
                    onClick={() => setActiveTab('original')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                      activeTab === 'original'
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    原始内容
                  </button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto bg-gray-50/30 p-4 custom-scrollbar relative">
                {activeTab === 'original' ? (
                   <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                     <div className="whitespace-pre-wrap text-gray-700 leading-relaxed font-mono text-sm">
                       {originalContent}
                     </div>
                   </div>
                ) : (
                  <CardList 
                    pages={plan.pages}
                    onUpdatePage={handleUpdatePage}
                    onAddPage={handleAddPage}
                    onDeletePage={handleDeletePage}
                    onReorderPage={handleReorderPage}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
