'use client';

import React, { useState, useRef } from 'react';
// تعديل المسار ليتناسب مع هيكل المجلدات لديك
import { GLYPH_LIBRARY } from '../data/glyphs'; 

interface GlyphInstance {
  instanceId: string;
  id: string;
  path: string;
  rotation: number;
  scale: number;
  flipX: boolean;
}

export default function JSeshEditor() {
  const [canvasGlyphs, setCanvasGlyphs] = useState<GlyphInstance[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // إضافة رمز جديد للوحة العمل [cite: 8, 30]
  const addGlyph = (glyph: typeof GLYPH_LIBRARY[0]) => {
    const newInstance: GlyphInstance = {
      instanceId: Math.random().toString(36).substr(2, 9),
      id: glyph.id,
      path: glyph.path,
      rotation: 0,
      scale: 1,
      flipX: false,
    };
    setCanvasGlyphs([...canvasGlyphs, newInstance]);
    setSelectedId(newInstance.instanceId);
  };

  // تحديث خصائص الرمز (تدوير، تكبير، عكس) [cite: 9, 19]
  const updateGlyph = (updates: Partial<GlyphInstance>) => {
    if (!selectedId) return;
    setCanvasGlyphs(canvasGlyphs.map(g => 
      g.instanceId === selectedId ? { ...g, ...updates } : g
    ));
  };

  const deleteGlyph = () => {
    setCanvasGlyphs(canvasGlyphs.filter(g => g.instanceId !== selectedId));
    setSelectedId(null);
  };

  // الوظيفة الجوهرية: النسخ كـ Vector متوافق مع برامج المكتب [cite: 9, 18, 20]
  const copyAsVector = async () => {
    if (!svgRef.current || canvasGlyphs.length === 0) return;
    
    const svgClone = svgRef.current.cloneNode(true) as SVGSVGElement;
    const svgString = new XMLSerializer().serializeToString(svgClone);

    // MIME-Type Handling: لضمان الجودة عند اللصق في Word [cite: 13, 22]
    const htmlBlob = new Blob([
      `<div style="width:600px; height:auto;">${svgString}</div>`
    ], { type: 'text/html' });
    
    const textBlob = new Blob([
      canvasGlyphs.map(g => g.id).join(' ')
    ], { type: 'text/plain' });

    try {
      const data = [new ClipboardItem({
        'text/html': htmlBlob,
        'text/plain': textBlob,
      })];
      await navigator.clipboard.write(data);
      alert("🚀 Copied successfully! Paste it into Word or Google Docs.");
    } catch (err) {
      console.error("Clipboard Error:", err);
      alert("Error copying to clipboard.");
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar: مكتبة الرموز */}
      <aside className="w-72 bg-white border-r border-slate-200 shadow-xl flex flex-col">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xl font-black tracking-tight text-blue-600 uppercase">JSesh Web</h2>
          <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-widest">Sign Library Engine</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-3">
          {GLYPH_LIBRARY.map(glyph => (
            <button 
              key={glyph.id}
              onClick={() => addGlyph(glyph)}
              className="group p-3 border border-slate-100 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all flex flex-col items-center shadow-sm"
            >
              <svg width="45" height="45" viewBox="0 0 100 100" className="group-hover:scale-110 transition-transform">
                <path d={glyph.path} fill="#334155" />
              </svg>
              <span className="text-[10px] mt-2 font-mono font-bold text-slate-500">{glyph.id}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* منطقة العمل */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              disabled={!selectedId}
              onClick={() => {
                const g = canvasGlyphs.find(x => x.instanceId === selectedId);
                if (g) updateGlyph({ rotation: g.rotation + 90 });
              }}
              className="p-2 hover:bg-slate-100 rounded-lg disabled:opacity-30 transition-colors border text-xl" title="Rotate 90°"
            >
              🔄
            </button>
            <button 
              disabled={!selectedId}
              onClick={() => {
                const g = canvasGlyphs.find(x => x.instanceId === selectedId);
                if (g) updateGlyph({ flipX: !g.flipX });
              }}
              className="p-2 hover:bg-slate-100 rounded-lg disabled:opacity-30 transition-colors border text-xl" title="Flip Horizontal"
            >
              ↔️
            </button>
            <button 
              disabled={!selectedId}
              onClick={deleteGlyph}
              className="p-2 hover:bg-red-50 text-red-500 rounded-lg disabled:opacity-30 transition-colors border text-xl" title="Delete"
            >
              🗑️
            </button>
          </div>

          <button 
            onClick={copyAsVector}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-bold shadow-lg transition-all active:scale-95 flex items-center gap-2"
          >
            <span>Copy as Vector</span>
            <span className="text-[10px] bg-blue-500 px-2 py-1 rounded-full text-blue-100 uppercase">SVG Native</span>
          </button>
        </header>

        {/* لوحة الرسم (SVG Canvas) [cite: 3, 4] */}
        <div className="flex-1 relative p-12 overflow-auto flex items-center justify-center bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px]">
          <div className="bg-white shadow-2xl rounded-sm border border-slate-200 relative p-4">
            <svg 
              ref={svgRef}
              width="800" 
              height="300" 
              viewBox="0 0 800 300"
              className="overflow-visible"
            >
              <rect width="800" height="300" fill="none" />
              {canvasGlyphs.map((g, i) => (
                <g 
                  key={g.instanceId}
                  onClick={(e) => { e.stopPropagation(); setSelectedId(g.instanceId); }}
                  className="cursor-pointer"
                  transform={`
                    translate(${70 + (i * 140)}, 150) 
                    scale(${g.scale}) 
                    rotate(${g.rotation}) 
                    ${g.flipX ? 'scale(-1, 1)' : ''}
                  `}
                >
                  <path 
                    d={g.path} 
                    fill={selectedId === g.instanceId ? '#2563eb' : '#1e293b'} 
                    className="transition-colors duration-200"
                  />
                  {selectedId === g.instanceId && (
                    <rect x="-55" y="-55" width="110" height="110" fill="none" stroke="#2563eb" strokeWidth="2" strokeDasharray="4" />
                  )}
                </g>
              ))}
            </svg>
          </div>
        </div>

        <footer className="h-12 bg-white border-t border-slate-200 px-8 flex items-center text-[11px] text-slate-400 font-bold justify-between tracking-widest">
          <div>ENGINEER: OSAMA SADEK | SENIOR AUTOMATION</div>
          <div className="flex gap-6">
            <span>QUADRAT: 1800x1800</span>
            <span className="text-green-500">SYSTEM: ONLINE</span>
          </div>
        </footer>
      </main>
    </div>
  );
}