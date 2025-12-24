import React from 'react';
import { PPTPlan } from '@/types';

interface OutlineViewProps {
  plan: PPTPlan;
}

export function OutlineView({ plan }: OutlineViewProps) {
  return (
    <div className="h-full bg-gray-900 text-gray-100 p-8 overflow-y-auto font-mono text-sm leading-relaxed shadow-inner">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
           <h1 className="text-xl font-bold text-white mb-4"># {plan.topic}</h1>
        </div>

        {plan.pages.map((page, index) => (
          <div key={page.id} className="space-y-4">
            <div className="text-indigo-300 font-bold">
              ## Page {index + 1} [{index === 0 ? '封面' : index === 1 ? '目录' : '正文'}]: {page.title}
            </div>
            
            <div className="pl-4 text-gray-300 whitespace-pre-wrap">
              {page.content.split('\n').map((line, i) => (
                 <div key={i}>{line.trim().startsWith('-') || line.trim().match(/^\d+\./) ? line : `- ${line}`}</div>
              ))}
            </div>

            <div className="pl-4 text-gray-500 italic">
              ![{page.visual}]
            </div>

            <div className="text-gray-700">---</div>
          </div>
        ))}
      </div>
    </div>
  );
}
