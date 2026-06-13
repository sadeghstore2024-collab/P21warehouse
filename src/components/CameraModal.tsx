/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, RefreshCw } from 'lucide-react';

interface CameraModalProps {
  isOpen: boolean;
  onClose: (photo: string | null) => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImg, setCapturedImg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && !capturedImg) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, capturedImg]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, 
        audio: false 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("عدم دسترسی به دوربین. لطفا مجوز دسترسی را بررسی کنید.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImg(dataUrl);
        stopCamera();
      }
    }
  };

  const retake = () => {
    setCapturedImg(null);
    startCamera();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[3000] bg-black/95 flex items-center justify-center p-6">
      <div className="bg-[#010409] border border-white/10 p-10 rounded-[3rem] w-full max-w-lg text-center space-y-6 shadow-2xl">
        <h3 className="text-xl font-black text-cyan-400 uppercase tracking-widest">CAMERA MODULE</h3>
        
        <div className="aspect-video bg-black rounded-2xl border border-white/10 flex items-center justify-center overflow-hidden relative">
          {error ? (
            <div className="text-red-500 text-xs p-4">{error}</div>
          ) : capturedImg ? (
            <img src={capturedImg} className="w-full h-full object-cover" />
          ) : (
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
            />
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="flex gap-4">
          <button 
            onClick={() => { stopCamera(); onClose(null); }} 
            className="flex-1 py-4 bg-white/5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2"
          >
            <X size={18} /> انصراف
          </button>
          
          {capturedImg ? (
            <>
              <button 
                onClick={retake} 
                className="flex-1 py-4 bg-white/10 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <RefreshCw size={18} /> تکرار
              </button>
              <button 
                onClick={() => onClose(capturedImg)} 
                className="flex-1 py-4 bg-cyan-600 rounded-2xl font-black shadow-xl uppercase tracking-widest"
              >
                تایید
              </button>
            </>
          ) : (
            <button 
              onClick={capture} 
              disabled={!!error}
              className="flex-[2] py-4 bg-cyan-600 rounded-2xl font-black shadow-xl uppercase tracking-widest disabled:opacity-50"
            >
              ثبت تصویر
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
