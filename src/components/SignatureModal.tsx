/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: (signature: string | null) => void;
  name: string;
}

export const SignatureModal: React.FC<SignatureModalProps> = ({ isOpen, onClose, name }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      const rect = canvas.getBoundingClientRect();
      const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
      const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      const rect = canvas.getBoundingClientRect();
      const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
      const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const save = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      // Check if canvas is empty (optional, but good practice)
      const dataUrl = canvas.toDataURL('image/png');
      onClose(dataUrl);
    }
  };

  return (
    <div className="fixed inset-0 z-[3000] bg-black/95 flex items-center justify-center p-6">
      <div className="bg-[#010409] border border-white/10 p-10 rounded-[3rem] w-full max-w-lg text-center space-y-6 shadow-2xl">
        <h3 className="text-xl font-black text-indigo-400 uppercase tracking-widest">SIGNATURE CAPTURE</h3>
        <p className="text-sm opacity-60">Please sign for {name}</p>
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={400}
            height={200}
            className="w-full h-40 bg-white/5 rounded-2xl border border-dashed border-white/20 cursor-crosshair touch-none"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseOut={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
          <button 
            onClick={clear}
            className="absolute top-2 right-2 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all text-white/40 hover:text-white"
            title="Clear"
          >
            <RotateCcw size={16} />
          </button>
        </div>
        <div className="flex gap-4">
          <button onClick={() => onClose(null)} className="flex-1 py-4 bg-white/5 rounded-2xl font-black uppercase tracking-widest">Cancel</button>
          <button onClick={save} className="flex-[2] py-4 bg-indigo-600 rounded-2xl font-black shadow-xl uppercase tracking-widest">Save Signature</button>
        </div>
      </div>
    </div>
  );
};
