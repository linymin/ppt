import React, { useState, useEffect } from 'react';
import { ColorScheme } from '@/types';
import { Palette, Check, RefreshCw } from 'lucide-react';

interface ColorSchemeSelectorProps {
  schemes?: ColorScheme[];
  selected?: ColorScheme;
  onSelect: (scheme: ColorScheme) => void;
}

export function ThemeSelector({ schemes = [], selected, onSelect }: ColorSchemeSelectorProps) {
  const [customScheme, setCustomScheme] = useState<ColorScheme>({
    name: '自定义',
    primary: '#666666', // 主色 (30%)
    secondary: ['#F5F5F7', '#000000'], // [背景色 (60%), 点缀色 (10%)]
    description: '自定义配色方案'
  });
  const [isCustomActive, setIsCustomActive] = useState(false);

  // Initialize selected scheme if not set and schemes exist
  useEffect(() => {
    if (!selected && schemes.length > 0) {
        onSelect(schemes[0]);
    }
  }, [schemes, selected, onSelect]);

  const handleCustomChange = (key: 'primary' | 'secondary0' | 'secondary1', value: string) => {
    const newScheme = { ...customScheme };
    if (key === 'primary') {
        newScheme.primary = value;
    } else if (key === 'secondary0') {
        newScheme.secondary = [value, customScheme.secondary[1]];
    } else if (key === 'secondary1') {
        newScheme.secondary = [customScheme.secondary[0], value];
    }

    setCustomScheme(newScheme);
    
    // Notify parent if custom is active
    if (isCustomActive) {
        onSelect(newScheme);
    }
  };

  const selectPreset = (scheme: ColorScheme) => {
      setIsCustomActive(false);
      onSelect(scheme);
  };

  const selectCustom = () => {
      setIsCustomActive(true);
      onSelect(customScheme);
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-2 mb-3 text-sm text-gray-500 font-medium">
            <Palette className="w-4 h-4" />
            <span>配色方案建议</span>
        </div>
        
        <div className="flex flex-wrap gap-4">
            {/* Presets */}
            {schemes.map((scheme, idx) => {
                const isSelected = !isCustomActive && selected?.name === scheme.name; // Simple check by name
                return (
                    <button
                        key={idx}
                        onClick={() => selectPreset(scheme)}
                        className={`group relative flex flex-col items-start gap-2 p-2 rounded-lg border-2 transition-all min-w-[140px] text-left ${
                            isSelected 
                            ? 'border-indigo-500 bg-indigo-50/50' 
                            : 'border-transparent hover:border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                        <div className="flex gap-1">
                            {/* Background (60%) */}
                            <div 
                                className="w-8 h-8 rounded-full shadow-sm border border-black/5" 
                                style={{ backgroundColor: scheme.secondary[0] }} 
                                title={`背景色 (60%): ${scheme.secondary[0]}`}
                            />
                            {/* Primary (30%) */}
                            <div 
                                className="w-8 h-8 rounded-full shadow-sm border border-black/5 -ml-3" 
                                style={{ backgroundColor: scheme.primary }} 
                                title={`主色 (30%): ${scheme.primary}`}
                            />
                            {/* Accent (10%) */}
                            <div 
                                className="w-8 h-8 rounded-full shadow-sm border border-black/5 -ml-3" 
                                style={{ backgroundColor: scheme.secondary[1] }} 
                                title={`点缀色 (10%): ${scheme.secondary[1]}`}
                            />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-gray-900">{scheme.name}</div>
                        </div>
                        {isSelected && (
                            <div className="absolute top-2 right-2 text-indigo-500">
                                <Check className="w-4 h-4" />
                            </div>
                        )}
                    </button>
                );
            })}

            {/* Custom Option */}
            <div 
                className={`relative flex flex-col items-start gap-2 p-2 rounded-lg border-2 transition-all min-w-[140px] ${
                    isCustomActive
                    ? 'border-indigo-500 bg-indigo-50/50' 
                    : 'border-transparent hover:border-gray-200 hover:bg-gray-50'
                }`}
                onClick={!isCustomActive ? selectCustom : undefined}
            >
                 <div className="flex gap-1 items-center">
                    {/* Background Picker (60%) */}
                    <div className="relative w-8 h-8 rounded-full overflow-hidden shadow-sm border border-black/5 cursor-pointer hover:scale-105 transition-transform" title="背景色 (60%)">
                        <input 
                            type="color" 
                            value={customScheme.secondary[0]}
                            onChange={(e) => handleCustomChange('secondary0', e.target.value)}
                            className="absolute inset-[-4px] w-[150%] h-[150%] p-0 border-0 cursor-pointer"
                        />
                    </div>
                    {/* Primary Picker (30%) */}
                    <div className="relative w-8 h-8 rounded-full overflow-hidden shadow-sm border border-black/5 -ml-3 cursor-pointer hover:scale-105 transition-transform" title="主色 (30%)">
                        <input 
                            type="color" 
                            value={customScheme.primary}
                            onChange={(e) => handleCustomChange('primary', e.target.value)}
                            className="absolute inset-[-4px] w-[150%] h-[150%] p-0 border-0 cursor-pointer"
                        />
                    </div>
                    {/* Accent Picker (10%) */}
                     <div className="relative w-8 h-8 rounded-full overflow-hidden shadow-sm border border-black/5 -ml-3 cursor-pointer hover:scale-105 transition-transform" title="点缀色 (10%)">
                        <input 
                            type="color" 
                            value={customScheme.secondary[1]}
                            onChange={(e) => handleCustomChange('secondary1', e.target.value)}
                            className="absolute inset-[-4px] w-[150%] h-[150%] p-0 border-0 cursor-pointer"
                        />
                    </div>
                </div>
                <div>
                    <div className="text-xs font-bold text-gray-900">自定义</div>
                    <div className="text-[10px] text-gray-500">点击色块修改</div>
                </div>
                {isCustomActive && (
                     <div className="absolute top-2 right-2 text-indigo-500">
                        <Check className="w-4 h-4" />
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}
