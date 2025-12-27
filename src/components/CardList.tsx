import React, { useState, useEffect } from 'react';
import { PPTPage } from '@/types';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragOverlay,
  DragEndEvent
} from '@dnd-kit/core';
import { 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Trash2, 
  Plus, 
  Type, 
  Image as ImageIcon, 
  GripVertical, 
  Pencil, 
  Sparkles, 
  Check, 
  X, 
  Wand2,
  LayoutList,
  ChevronDown
} from 'lucide-react';

// Simple utility if cn/clsx is not available
function classNames(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

interface CardListProps {
  pages: PPTPage[];
  onUpdatePage: (index: number, updatedPage: PPTPage) => void;
  onAddPage: (index: number) => void;
  onDeletePage: (index: number) => void;
  onReorderPage: (oldIndex: number, newIndex: number) => void;
}

const PAGE_TYPES = [
  { value: 'cover', label: '封面/标题' },
  { value: 'catalog', label: '目录/大纲' },
  { value: 'content', label: '正文/内容' },
  { value: 'transition', label: '过渡页' },
  { value: 'ending', label: '结束页' },
];

export function CardList({ pages, onUpdatePage, onAddPage, onDeletePage, onReorderPage }: CardListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = pages.findIndex((p) => p.id === active.id);
      const newIndex = pages.findIndex((p) => p.id === over.id);
      onReorderPage(oldIndex, newIndex);
    }
    setActiveId(null);
  };

  const handleAddPageClick = (index: number) => {
    // Reset any editing state when adding a new page to avoid conflicts
    setEditingId(null);
    onAddPage(index);
  };

  const handlePolish = async (type: 'visual' | 'content_from_title' | 'polish_content', page: PPTPage) => {
    try {
        const response = await fetch('/api/polish', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                type, 
                context: { title: page.title, content: page.content } 
            }),
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Server error: ${response.status}`);
        }

        const data = await response.json();
        if (data.result || (typeof data === 'object' && (data.content || data.visual))) {
             return data.result || data; // Handle both single string result and JSON object
        }
    } catch (error) {
        console.error('Polish failed', error);
        alert('生成失败，请稍后重试。如果问题持续，请检查后台日志。');
    }
    return null;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable List */}
      <div className="flex-1 pb-10 space-y-1">
        {/* Add Card at Start */}
        <div className="relative group/add h-4 hover:h-10 transition-all flex items-center justify-center">
            <button 
                onClick={() => handleAddPageClick(0)}
                className="opacity-0 group-hover/add:opacity-100 absolute flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-medium rounded-full border border-indigo-100 shadow-sm hover:bg-indigo-100 transition-all z-10"
            >
                <Plus className="w-3 h-3" /> 添加页面
            </button>
            <div className="w-full h-px bg-indigo-200 opacity-0 group-hover/add:opacity-100 transition-opacity" />
        </div>

        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={pages.map(p => p.id)}
                strategy={verticalListSortingStrategy}
            >
                {pages.map((page, index) => (
                    <SortableItem key={page.id} id={page.id}>
                        <PPTCard
                            page={page}
                            index={index}
                            isEditing={editingId === page.id}
                            onEditStart={() => setEditingId(page.id)}
                            onEditCancel={() => setEditingId(null)}
                            onEditSave={(updatedPage) => {
                                onUpdatePage(index, updatedPage);
                                setEditingId(null);
                            }}
                            onDelete={() => onDeletePage(index)}
                            onPolish={handlePolish}
                        />
                        
                        {/* Add Card Between/After - Only show if not dragging */}
                        {activeId !== page.id && (
                            <div className="relative group/add h-4 hover:h-10 transition-all flex items-center justify-center">
                                <button 
                                    onClick={() => handleAddPageClick(index + 1)}
                                    className="opacity-0 group-hover/add:opacity-100 absolute flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-medium rounded-full border border-indigo-100 shadow-sm hover:bg-indigo-100 transition-all z-10"
                                >
                                    <Plus className="w-3 h-3" /> 添加页面
                                </button>
                                <div className="w-full h-px bg-indigo-200 opacity-0 group-hover/add:opacity-100 transition-opacity" />
                            </div>
                        )}
                    </SortableItem>
                ))}
            </SortableContext>
            
            <DragOverlay>
                {activeId ? (
                    <div className="opacity-80">
                         {/* Render a simplified version or the actual card for overlay */}
                         {(() => {
                            const page = pages.find(p => p.id === activeId);
                            if (!page) return null;
                            return (
                                <PPTCard
                                    page={page}
                                    index={pages.findIndex(p => p.id === activeId)}
                                    isEditing={false}
                                    onEditStart={() => {}}
                                    onEditCancel={() => {}}
                                    onEditSave={() => {}}
                                    onDelete={() => {}}
                                    onPolish={handlePolish}
                                />
                            );
                         })()}
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
        
        {pages.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <button
                onClick={() => handleAddPageClick(0)}
                className="flex items-center gap-1.5 px-4 py-2 mx-auto bg-white border border-indigo-100 text-indigo-600 rounded-full shadow-sm hover:bg-indigo-50 hover:border-indigo-200 transition-all text-sm font-medium"
            >
                <Plus className="w-4 h-4" />
                开始添加页面
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function SortableItem(props: any) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging
    } = useSortable({ id: props.id });
  
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.3 : 1,
      zIndex: isDragging ? 999 : 'auto',
      position: 'relative' as const,
    };
  
    // We clone the child to pass drag listeners to a specific handle if needed,
    // or just wrap it. Since PPTCard has the handle, we should probably pass the listeners to it.
    // However, PPTCard is a functional component.
    // Let's modify PPTCard to accept dragHandleProps.
    
    return (
      <div ref={setNodeRef} style={style} {...attributes}>
        {/* Pass listeners to children so they can attach to handle */}
        {React.Children.map(props.children, child => {
            if (React.isValidElement(child)) {
                // Check if it's the PPTCard component (it might be the 'add button' div too if we wrapped both)
                // In our usage, SortableItem wraps PPTCard and the add button div.
                // We only want to pass listeners to PPTCard.
                // Actually, the structure in CardList is:
                // <SortableItem> <PPTCard /> <div add-button /> </SortableItem>
                // So we can clone PPTCard and pass dragListeners.
                
                // Simplified: Pass dragListeners to all children? No.
                // We should probably just pass them to the first child or specifically PPTCard.
                // Or better: Modify PPTCard to accept `dragListeners` prop.
                
                // Let's try to just render children, but we need to get listeners to the handle inside PPTCard.
                // Option A: Pass listeners as a prop to SortableItem's children.
                return React.cloneElement(child as React.ReactElement<any>, { dragListeners: listeners });
            }
            return child;
        })}
      </div>
    );
}

interface PPTCardProps {
  page: PPTPage;
  index: number;
  isEditing: boolean;
  onEditStart: () => void;
  onEditCancel: () => void;
  onEditSave: (page: PPTPage) => void;
  onDelete: () => void;
  onPolish: (type: 'visual' | 'content_from_title' | 'polish_content', page: PPTPage) => Promise<string | null>;
  dragListeners?: any; // Add this
}

function PPTCard({ page, index, isEditing, onEditStart, onEditCancel, onEditSave, onDelete, onPolish, dragListeners }: PPTCardProps) {
  // Local state for editing
  const [editState, setEditState] = useState<PPTPage>(page);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [isPolishingContent, setIsPolishingContent] = useState(false);
  const [isGeneratingVisual, setIsGeneratingVisual] = useState(false);

  // Reset edit state when entering edit mode or page changes
  useEffect(() => {
    if (isEditing) {
      setEditState(page);
    }
  }, [isEditing, page]);

  const handleSave = () => {
    onEditSave(editState);
  };

  const handleVisualToggle = async () => {
    // Current state (defaults to true if undefined)
    const isEnabled = editState.visualEnabled !== false;
    const newState = { ...editState, visualEnabled: !isEnabled };
    setEditState(newState);
    
    // Auto-generate visual prompt if enabling and empty
    if (newState.visualEnabled && !newState.visual) {
        setIsGeneratingVisual(true);
        const result = await onPolish('visual', newState);
        if (result) {
            setEditState(prev => ({ ...prev, visual: result as string }));
        }
        setIsGeneratingVisual(false);
    }
  };

  const handleContentFromTitle = async () => {
    setIsGeneratingContent(true);
    const result = await onPolish('content_from_title', editState);
    if (result) {
        // Handle combined result (content + visual) or simple string
        if (typeof result === 'object' && result !== null) {
            setEditState(prev => ({ 
                ...prev, 
                content: (result as any).content || prev.content,
                visual: (result as any).visual || prev.visual,
                visualEnabled: true // Enable visual when generated
            }));
        } else {
             setEditState(prev => ({ ...prev, content: result as unknown as string }));
        }
    }
    setIsGeneratingContent(false);
  };

  const handlePolishContent = async () => {
    setIsPolishingContent(true);
    const result = await onPolish('polish_content', editState);
    if (result) {
        // Handle combined result (content + visual)
        if (typeof result === 'object' && result !== null) {
             setEditState(prev => ({ 
                ...prev, 
                content: (result as any).content || prev.content,
                visual: (result as any).visual || prev.visual,
                visualEnabled: true // Enable visual when generated
            }));
        } else {
            setEditState(prev => ({ ...prev, content: result as unknown as string }));
        }
    }
    setIsPolishingContent(false);
  };

  const getTypeLabel = (type?: string) => {
    return PAGE_TYPES.find(t => t.value === type)?.label || '封面/标题'; // Default to cover/title if undefined or unknown
  };

  if (isEditing) {
    return (
      <div className="relative bg-white rounded-xl shadow-lg border-2 border-indigo-400/50 ring-4 ring-indigo-50/50 transition-all overflow-hidden">
        {/* Header Row */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-100">
           <div {...dragListeners} className="cursor-grab active:cursor-grabbing touch-none">
             <GripVertical className="w-5 h-5 text-gray-300" />
           </div>
           
           {/* Page Number */}
           <div className="px-2.5 py-0.5 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full whitespace-nowrap">
             第 {index + 1} 页
           </div>

           {/* Type Dropdown (Simplified as select) */}
           <div className="relative">
             <select
               value={editState.type || 'cover'}
               onChange={(e) => setEditState({ ...editState, type: e.target.value })}
               className="appearance-none pl-3 pr-8 py-0.5 bg-gray-100 text-gray-500 text-xs font-medium rounded-full border-none focus:ring-0 cursor-pointer"
             >
               {PAGE_TYPES.map(t => (
                 <option key={t.value} value={t.value}>{t.label}</option>
               ))}
             </select>
             <ChevronDown className="w-3 h-3 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
           </div>

           {/* Title Input */}
           <div className="flex-1 flex items-center gap-2">
               <input 
                 type="text"
                 value={editState.title}
                 onChange={(e) => setEditState({...editState, title: e.target.value})}
                 className="flex-1 min-w-0 text-lg font-bold text-gray-900 border-b border-gray-200 focus:border-indigo-500 focus:outline-none px-1 py-0.5 bg-transparent"
                 placeholder="Page Title"
               />
               <button 
                onClick={handleContentFromTitle}
                disabled={isGeneratingContent}
                className="p-1.5 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                title="Generate content from title"
               >
                 <Wand2 className={`w-4 h-4 ${isGeneratingContent ? 'animate-spin' : ''}`} />
               </button>
           </div>

           {/* Actions */}
           <div className="flex items-center gap-2 ml-2">
             <button onClick={handleSave} className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg transition-colors">
               <Check className="w-5 h-5" />
             </button>
             <button onClick={onEditCancel} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
               <X className="w-5 h-5" />
             </button>
           </div>
        </div>

        {/* Content Section */}
        <div className="p-4 space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-500">
                <Type className="w-4 h-4" />
                <span className="text-sm font-medium">正文内容规划（演示重点）</span>
              </div>
              <button 
                onClick={handlePolishContent}
                disabled={isPolishingContent}
                className="flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-600 rounded text-xs font-medium hover:bg-purple-100 transition-colors"
              >
                <Sparkles className={`w-3 h-3 ${isPolishingContent ? 'animate-spin' : ''}`} />
                润色
              </button>
            </div>
            <textarea
              value={editState.content}
              onChange={(e) => setEditState({...editState, content: e.target.value})}
              className="w-full min-h-[120px] p-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 leading-relaxed resize-y focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
              placeholder="Enter bullet points..."
            />
          </div>

          <div className="h-px bg-gray-100 w-full" />

          {/* Visual Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-gray-500">
                <ImageIcon className="w-4 h-4" />
                <span className="text-sm font-medium">视觉设计建议</span>
              </div>
              
              <button 
                onClick={handleVisualToggle}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${editState.visualEnabled !== false ? 'bg-indigo-600' : 'bg-gray-200'}`}
              >
                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${editState.visualEnabled !== false ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
            </div>
            
            {(editState.visualEnabled !== false) && (
                 <div className="relative">
                     <textarea
                       value={editState.visual}
                       onChange={(e) => setEditState({...editState, visual: e.target.value})}
                       className="w-full min-h-[60px] p-3 bg-white border border-blue-100 rounded-lg text-sm text-gray-600 italic resize-y focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                       placeholder="Visual description..."
                     />
                 </div>
             )}
            {(editState.visualEnabled === false) && (
                <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg text-sm text-gray-400 italic text-center">
                    无需配图
                </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // View Mode
  return (
    <div className="group relative bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all overflow-hidden">
      {/* Header Row */}
      <div className="flex items-center gap-2 p-3 border-b border-gray-50">
        <div {...dragListeners} className="cursor-grab active:cursor-grabbing touch-none opacity-0 group-hover:opacity-100 transition-opacity">
             <GripVertical className="w-4 h-4 text-gray-300" />
        </div>
        
        {/* Page Number */}
        <div className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-full whitespace-nowrap">
          P{index + 1}
        </div>

        {/* Type Label */}
        <div className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-medium rounded-full whitespace-nowrap">
          {getTypeLabel(page.type)}
        </div>

        {/* Title */}
        <h3 className="flex-1 text-lg font-bold text-gray-900 truncate" title={page.title}>
          {page.title}
        </h3>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={onEditStart}
            className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={onDelete}
            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="px-3 py-2">
        <div className="flex items-center gap-1.5 mb-1.5 text-gray-400">
          <Type className="w-3 h-3" />
          <span className="text-[10px] font-medium uppercase tracking-wide">内容规划</span>
        </div>
        <div className="pl-4 space-y-0.5">
          {page.content.split('\n').map((line, i) => {
            const cleanLine = line.trim().replace(/^[-*•]\s*/, '');
            if (!cleanLine) return null;
            return (
              <div key={i} className="flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-300 mt-1.5 flex-shrink-0" />
                <span className="text-sm text-gray-700 leading-snug">{cleanLine}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Visual Section */}
      <div className="px-3 pb-3 pt-1">
        <div className="flex items-center gap-1.5 mb-1.5 text-gray-400">
          <ImageIcon className="w-3 h-3" />
          <span className="text-[10px] font-medium uppercase tracking-wide">视觉建议</span>
        </div>
        {page.visualEnabled !== false ? (
            <div className="p-2 bg-gray-50/50 rounded border border-gray-100/50">
               <div className="flex gap-1.5">
                  <span className="text-indigo-400 mt-0.5">
                     <Sparkles className="w-3 h-3" />
                  </span>
                  <p className="text-xs text-gray-500 leading-snug">
                    {page.visual}
                  </p>
               </div>
            </div>
        ) : (
            <div className="p-2 bg-gray-50/50 rounded border border-gray-100/50 text-center">
                <span className="text-[10px] text-gray-400 italic">无需配图</span>
            </div>
        )}
      </div>
    </div>
  );
}
