
import React, { useEffect, useRef } from 'react';
import type { StoreApi } from 'zustand';
import type { DjStore } from '../../types';

interface TouchscreenProps {
  deckId: number;
  useStore: StoreApi<DjStore>;
}

const Touchscreen: React.FC<TouchscreenProps> = ({ deckId, useStore }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playerState = (useStore as any)((state: DjStore) => state.players[deckId]);
  const { track, playbackTime, bpm, pitch } = playerState;
  const deckColor = deckId === 0 ? '#06b6d4' : '#f43f5e'; // cyan-500, red-500

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !track) return;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    let animationFrameId: number;
    
    const draw = () => {
      const { width, height } = canvas;
      context.fillStyle = '#111827'; // gray-900
      context.fillRect(0, 0, width, height);
      
      if (track.waveform.length > 0) {
        const step = width / track.waveform.length;
        const middle = height / 2;
        
        context.strokeStyle = deckColor;
        context.lineWidth = 2;
        
        context.beginPath();
        track.waveform.forEach((val, i) => {
          const x = i * step;
          const y = val * middle;
          context.moveTo(x, middle - y);
          context.lineTo(x, middle + y);
        });
        context.stroke();
      }
      
      const progress = playbackTime / track.duration;
      const playheadX = progress * width;
      
      context.fillStyle = 'rgba(255, 255, 255, 0.8)';
      context.fillRect(playheadX, 0, 2, height);

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [track, playbackTime, deckColor]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full h-48 bg-gray-900 rounded-md p-2 relative border border-gray-700">
      <canvas ref={canvasRef} className="w-full h-full" width="500" height="150" />
      <div className="absolute top-2 left-2 text-xs text-white bg-black/50 p-1 rounded">
        {track ? track.name : 'No Track Loaded'}
      </div>
      {track && (
        <div className="absolute top-2 right-2 text-xs text-white bg-black/50 p-1 rounded">
          {Math.round(bpm * pitch)} BPM | {(pitch * 100).toFixed(1)}%
        </div>
      )}
      <div className="absolute bottom-2 right-2 text-lg font-mono font-bold text-white bg-black/50 p-1 rounded">
        {track ? `${formatTime(playbackTime)} / ${formatTime(track.duration)}` : '0:00 / 0:00'}
      </div>
    </div>
  );
};

export default Touchscreen;
