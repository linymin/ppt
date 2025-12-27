import React from 'react';
import { PPTPlan } from '@/types';
import { FileText } from 'lucide-react';

interface OutlineViewProps {
  plan: PPTPlan;
}

const TYPE_LABELS: Record<string, string> = {
  cover: '封面/标题',
  catalog: '目录/大纲',
  content: '正文/内容',
  transition: '过渡页',
  ending: '结束页',
};

export function OutlineView({ plan }: OutlineViewProps) {
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 font-sans">
        <div className="space-y-6">
          {/* Main Topic Title */}
          <div className="text-center pb-4 border-b border-gray-100">
             <h1 className="text-lg font-extrabold text-gray-900 tracking-tight leading-tight">{plan.topic}</h1>
             <p className="text-xs text-gray-400 mt-1">共 {plan.pages.length} 页 PPT</p>
          </div>

          {plan.pages.map((page, index) => (
            <div key={page.id} className="relative group">
              {/* Vertical connecting line (decorative) */}
              {index !== plan.pages.length - 1 && (
                <div className="absolute left-3 top-6 bottom-[-24px] w-px bg-gray-100 group-hover:bg-indigo-50 transition-colors" />
              )}
              
              <div className="flex gap-3">
                {/* Page Number Badge */}
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 flex items-center justify-center rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold border border-indigo-100 shadow-sm">
                    {index + 1}
                  </div>
                </div>

                <div className="flex-1 space-y-2 pt-0.5">
                  {/* Header: Title only */}
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-gray-900 leading-tight">
                      {page.title}
                    </h3>
                  </div>
                  
                  {/* Content Body */}
                  <div className="pl-1 space-y-1">
                    {page.content.split('\n').map((line, i) => {
                       const cleanLine = line.trim().replace(/^[-*•]\s*/, '');
                       if (!cleanLine) return null;
                       return (
                         <div key={i} className="flex items-start gap-2 text-sm text-gray-600 leading-relaxed">
                           <span className="w-1 h-1 rounded-full bg-gray-300 mt-2 flex-shrink-0" />
                           <span>{cleanLine}</span>
                         </div>
                       );
                    })}
                  </div>

                  {/* Visual Suggestion Tag */}
                  {(page.visualEnabled !== false && page.visual) && (
                    <div className="pt-1">
                      <div className="inline-flex items-start gap-1.5 px-2 py-1.5 bg-indigo-50/50 border border-indigo-100/50 rounded-md max-w-full">
                        <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider mt-0.5 flex-shrink-0">Vis</span>
                        <span className="text-[10px] text-indigo-900/70 leading-snug italic">
                          {page.visual}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {page.visualEnabled === false && (
                    <div className="pt-1">
                       <span className="inline-block px-1.5 py-0.5 bg-gray-50 text-gray-400 text-[10px] rounded border border-gray-100 italic">
                         无需配图
                       </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {/* End Marker */}
          <div className="flex justify-center pt-4 text-gray-300">
            <span className="w-1 h-1 rounded-full bg-gray-200 mx-0.5" />
            <span className="w-1 h-1 rounded-full bg-gray-200 mx-0.5" />
            <span className="w-1 h-1 rounded-full bg-gray-200 mx-0.5" />
          </div>
        </div>
      </div>
    </div>
  );
}
