import React from 'react';
import { PPTPage } from '@/types';
import { Trash2, Plus, Type, Layout, Image as ImageIcon, GripVertical } from 'lucide-react';

interface CardListProps {
  pages: PPTPage[];
  onUpdatePage: (index: number, updatedPage: PPTPage) => void;
  onAddPage: (index: number) => void;
  onDeletePage: (index: number) => void;
}

export function CardList({ pages, onUpdatePage, onAddPage, onDeletePage }: CardListProps) {
  return (
    <div className="h-full overflow-y-auto bg-gray-50 p-6 space-y-4">
      {/* Add First Slide Button if empty or at top */}
      {pages.length === 0 && (
          <button
            onClick={() => onAddPage(0)}
            className="w-full py-8 border-2 border-dashed border-gray-300 rounded-xl text-gray-400 hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50 transition-all flex flex-col items-center justify-center gap-2"
          >
            <Plus className="w-8 h-8" />
            <span className="font-medium">Add First Slide</span>
          </button>
      )}

      {pages.map((page, index) => (
        <React.Fragment key={page.id}>
          {/* Card Item */}
          <div className="group relative bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            {/* Header / Title */}
            <div className="flex items-center gap-4 p-4 border-b border-gray-100 bg-gray-50/50 rounded-t-xl">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                {index + 1}
              </div>
              <div className="flex-1">
                <input
                    type="text"
                    value={page.title}
                    onChange={(e) => onUpdatePage(index, { ...page, title: e.target.value })}
                    className="w-full bg-transparent border-none p-0 text-base font-semibold text-gray-900 placeholder-gray-400 focus:ring-0"
                    placeholder="Slide Title"
                />
              </div>
              <button
                onClick={() => onDeletePage(index)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete slide"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Content */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        <Layout className="w-3 h-3" />
                        Content
                    </div>
                    <textarea
                        value={page.content}
                        onChange={(e) => onUpdatePage(index, { ...page, content: e.target.value })}
                        className="w-full h-32 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
                        placeholder="Bullet points or script..."
                    />
                </div>

                {/* Visual */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        <ImageIcon className="w-3 h-3" />
                        Visual
                    </div>
                    <textarea
                        value={page.visual}
                        onChange={(e) => onUpdatePage(index, { ...page, visual: e.target.value })}
                        className="w-full h-32 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 italic focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
                        placeholder="Visual description..."
                    />
                </div>
            </div>
          </div>

          {/* Insert Button Between Cards */}
          <div className="relative py-2 group/insert">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-transparent group-hover/insert:border-indigo-200 transition-colors"></div>
            </div>
            <div className="relative flex justify-center">
              <button
                onClick={() => onAddPage(index + 1)}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-gray-200 bg-white text-xs font-medium text-gray-500 shadow-sm hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all opacity-0 group-hover/insert:opacity-100 transform scale-95 group-hover/insert:scale-100"
              >
                <Plus className="w-3 h-3" />
                Add Slide
              </button>
            </div>
          </div>
        </React.Fragment>
      ))}
      
      {/* Bottom padding for scrolling */}
      <div className="h-10"></div>
    </div>
  );
}
