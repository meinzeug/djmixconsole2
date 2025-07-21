
import React, { useRef, useState } from 'react';
import type { UseBoundStore } from 'zustand';
import type { DjStore } from '../../types';

interface JogWheelProps {
  deckId: number;
  useStore: UseBoundStore<DjStore>;
}

const JogWheel: React.FC<JogWheelProps> = ({ deckId, useStore }) => {
  const playerState = (useStore as any)((state: DjStore) => state.players[deckId]);
  const { track, isPlaying, pitch, bpm } = playerState;
  const { nudge } = (useStore as any)((state: DjStore) => state.actions);
  const dragging = useRef(false);
  const lastY = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  
  const deckColor = deckId === 0 ? 'cyan' : 'red';
  const rotationSpeed = isPlaying ? (10 / pitch) : 0;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    lastY.current = e.clientY;
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    const delta = lastY.current - e.clientY;
    lastY.current = e.clientY;
    nudge(deckId, delta / 200);
  };

  const handlePointerUp = () => {
    dragging.current = false;
    nudge(deckId, 0);
    setIsDragging(false);
  };
  
  return (
    <div className="relative w-48 h-48 md:w-56 md:h-56" onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp} style={{cursor: isDragging ? 'grabbing' : 'grab'}}>
      <div
        className={`w-full h-full rounded-full bg-gray-800 border-4 border-gray-700 flex items-center justify-center transition-shadow duration-300 shadow-[0_0_15px_rgba(0,0,0,0.5)] ${isPlaying ? `shadow-${deckColor}-500/50` : ''}`}
      >
        <div
          className="absolute w-full h-full rounded-full"
          style={{
            animation: isPlaying ? `spin ${rotationSpeed}s linear infinite` : 'none',
          }}
        >
          <div className={`absolute top-0 left-1/2 -ml-1 w-2 h-4 bg-${deckColor}-400 rounded-full`}></div>
        </div>
        <div className="w-24 h-24 rounded-full bg-gray-900 flex flex-col items-center justify-center text-center p-1 z-10">
          <span className="text-xs text-gray-400 truncate w-full">{track ? track.name.split('.mp3')[0] : `Deck ${deckId + 1}`}</span>
          <span className={`font-bold text-lg text-${deckColor}-400`}>{track ? `${(bpm * pitch).toFixed(1)} BPM` : "0 BPM"}</span>
        </div>
      </div>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default JogWheel;
