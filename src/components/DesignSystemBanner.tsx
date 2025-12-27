
import React from 'react';
import { DesignSystem } from '@/types';
import { Palette, Type, LayoutTemplate } from 'lucide-react';

interface DesignSystemBannerProps {
  design: DesignSystem;
}

export function DesignSystemBanner({ design }: DesignSystemBannerProps) {
  if (!design) return null;

  return (
    <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3 text-sm font-bold text-gray-900">
        <Palette className="w-4 h-4 text-indigo-600" />
        视觉设计方案
      </div>
      
      <div className="grid grid-cols-3 gap-4 h-40">
        {/* Style Section */}
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 flex flex-col h-full overflow-hidden">
          <div className="flex-shrink-0">
            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-2">
              <LayoutTemplate className="w-3.5 h-3.5" />
              设计风格
            </div>
            <div className="font-bold text-indigo-900 text-sm mb-1">{design.style.name}</div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0 space-y-2">
            <p className="text-xs text-gray-600 leading-relaxed">{design.style.description}</p>
            <div className="text-[10px] text-gray-500 bg-white p-2 rounded border border-gray-100">
              <span className="font-semibold block mb-0.5">选择理由：</span>
              <span className="leading-relaxed">{design.style.reason}</span>
            </div>
          </div>
        </div>

        {/* Color Palette Section */}
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 flex flex-col h-full overflow-hidden">
          <div className="flex-shrink-0 flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-2">
            <Palette className="w-3.5 h-3.5" />
            色彩方案
          </div>
          
          <div className="flex-1 flex gap-3 overflow-y-auto custom-scrollbar min-h-0">
            {/* Primary */}
            <div className="flex flex-col gap-1.5 w-1/3 flex-shrink-0">
               <div className="relative w-full h-12 rounded-md shadow-sm ring-1 ring-gray-200 overflow-hidden group">
                 <div 
                   className="absolute inset-0"
                   style={{ backgroundColor: design.colors.primary.hex }}
                 />
               </div>
              <div className="text-center">
                <div className="text-[10px] font-bold text-gray-900">主色</div>
                <div className="text-[9px] font-mono text-gray-500 uppercase">{design.colors.primary.hex}</div>
                <div className="text-[9px] text-gray-400 truncate" title={design.colors.primary.name}>{design.colors.primary.name}</div>
              </div>
            </div>
            
            {/* Separator */}
            <div className="w-px bg-gray-200 h-full flex-shrink-0" />
            
            {/* Secondary */}
            <div className="flex-1 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
               {design.colors.secondary.map((color, idx) => (
                <div key={idx} className="flex items-center gap-2">
                   <div 
                    className="w-6 h-6 rounded shadow-sm ring-1 ring-gray-200 flex-shrink-0"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="min-w-0">
                    <div className="text-[9px] font-bold text-gray-700">辅助色 {idx + 1}</div>
                    <div className="text-[9px] font-mono text-gray-500 uppercase">{color.hex}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Typography Section */}
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 flex flex-col h-full">
          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-2">
            <Type className="w-3.5 h-3.5" />
            字体系统
          </div>
          <div className="flex-1 flex flex-col gap-3 justify-center">
            <div>
              <span className="text-xs text-gray-400 block mb-1">标题字体</span>
              <span className="text-lg font-bold text-gray-900 leading-tight block">{design.fonts.title}</span>
            </div>
            <div className="h-px bg-gray-200" />
            <div>
              <span className="text-xs text-gray-400 block mb-1">正文字体</span>
              <span className="text-sm text-gray-700 block">{design.fonts.body}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
