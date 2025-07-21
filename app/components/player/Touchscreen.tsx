
import React, { useEffect, useRef, useState, ChangeEvent } from 'react';
import type { UseBoundStore } from 'zustand';
import type { DjStore } from '../../types';

interface TouchscreenProps {
  deckId: number;
  useStore: UseBoundStore<DjStore>;
  playlist: File[];
  onSelectTrack: (file: File) => void;
  onFileSelected: (file: File) => void;
}

const Touchscreen: React.FC<TouchscreenProps> = ({ deckId, useStore, playlist, onSelectTrack, onFileSelected }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const playerState = (useStore as any)((state: DjStore) => state.players[deckId]);
  const { track, playbackTime, bpm, pitch, isSync } = playerState;
  const isMaster = (useStore as any)((state: DjStore) => state.clock.masterDeckId === deckId);
  const { seek, setLoop, clearLoop } = (useStore as any)((state: DjStore) => state.actions);
  const deckColor = deckId === 0 ? '#06b6d4' : '#f43f5e'; // cyan-500, red-500
  const [zoom, setZoom] = useState(1);
  const [showPlaylist, setShowPlaylist] = useState(false);

  const handleZoomIn = () => setZoom(z => Math.min(4, z + 0.5));
  const handleZoomOut = () => setZoom(z => Math.max(1, z - 0.5));

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelected(file);
  };

  const handleBeatJump = (beats: number) => {
    if (!track) return;
    const beatLen = 60 / bpm;
    let newTime = playbackTime + beats * beatLen;
    newTime = Math.max(0, Math.min(newTime, track.duration));
    seek(deckId, newTime);
  };

  const handleLoopSet = (beats: number) => {
    if (!track) return;
    const beatLen = 60 / bpm;
    const start = playbackTime;
    const end = start + beats * beatLen;
    setLoop(deckId, start, end);
  };

  const handleClearLoop = () => clearLoop(deckId);

  const openFileDialog = () => fileInputRef.current?.click();

  const handleSeek = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!track) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const total = track.waveform.length;
    const visible = Math.floor(total / zoom);
    const playPos = (playbackTime / track.duration) * total;
    const start = Math.max(0, Math.min(total - visible, Math.floor(playPos - visible / 2)));
    const percent = x / rect.width;
    const sample = start + percent * visible;
    const time = (sample / total) * track.duration;
    seek(deckId, time);
  };

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
        const total = track.waveform.length;
        const visible = Math.floor(total / zoom);
        const playPos = (playbackTime / track.duration) * total;
        const start = Math.max(0, Math.min(total - visible, Math.floor(playPos - visible / 2)));
        const end = start + visible;
        const step = width / (end - start);
        const middle = height / 2;

        context.strokeStyle = deckColor;
        context.lineWidth = 2;

        context.beginPath();
        for (let i = start; i < end; i++) {
          const val = track.waveform[i];
          const x = (i - start) * step;
          const y = val * middle;
          context.moveTo(x, middle - y);
          context.lineTo(x, middle + y);
        }
        context.stroke();

        // Hot cues
        playerState.hotCues.forEach(cue => {
          const cuePos = (cue.time / track.duration) * total;
          if (cuePos >= start && cuePos <= end) {
            const x = (cuePos - start) * step;
            context.fillStyle = deckColor;
            context.fillRect(x - 1, 0, 2, height);
          }
        });
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
  }, [track, playbackTime, deckColor, zoom, playerState.hotCues]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full h-60 bg-gray-900 rounded-md p-2 relative border border-gray-700">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        width="600"
        height="200"
        onPointerDown={handleSeek}
      />
      <div className="absolute top-1 left-2 text-xs text-white bg-black/50 px-1 rounded">
        {track ? track.name : 'No Track Loaded'}
      </div>
      {track && (
        <div className="absolute top-1 right-2 text-xs text-white bg-black/50 px-1 rounded flex items-center gap-1">
          {Math.round(bpm * pitch)} BPM | {(pitch * 100).toFixed(1)}% | {track.bitrate} kbps
          {isMaster && <span className="text-yellow-400 font-bold">MASTER</span>}
          {isSync && !isMaster && <i className="fa fa-link text-cyan-400"></i>}
        </div>
      )}
      {track && (
        <div className="absolute bottom-8 left-2 text-xs text-white bg-black/50 px-1 rounded">
          Key: {track.key || '--'}
        </div>
      )}
      <div className="absolute bottom-2 right-2 text-lg font-mono font-bold text-white bg-black/50 px-1 rounded">
        {track ? `${formatTime(playbackTime)} / ${formatTime(track.duration)}` : '0:00 / 0:00'}
      </div>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
        <button onClick={handleZoomOut} className="px-2 py-1 text-xs bg-gray-700 rounded hover:bg-gray-600">-</button>
        <button onClick={handleZoomIn} className="px-2 py-1 text-xs bg-gray-700 rounded hover:bg-gray-600">+</button>
        <button onClick={() => handleBeatJump(-1)} className="px-2 py-1 text-xs bg-gray-700 rounded hover:bg-gray-600">&#171;</button>
        <button onClick={() => handleBeatJump(1)} className="px-2 py-1 text-xs bg-gray-700 rounded hover:bg-gray-600">&#187;</button>
      </div>
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-1">
        {[1,2,4].map(b => (
          <button key={b} onClick={() => handleLoopSet(b)} className="px-2 py-1 text-xs bg-gray-700 rounded hover:bg-gray-600">{b}B</button>
        ))}
        <button onClick={handleClearLoop} className="px-2 py-1 text-xs bg-gray-700 rounded hover:bg-gray-600">CLR</button>
      </div>
      <button
        onClick={() => setShowPlaylist(!showPlaylist)}
        className="absolute top-1/2 right-2 -translate-y-1/2 text-xs bg-gray-700 px-2 py-1 rounded hover:bg-gray-600"
      >
        <i className="fa fa-bars"></i>
      </button>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".mp3" className="hidden" />
      {showPlaylist && (
        <div className="absolute inset-0 bg-black/80 p-2 rounded-md flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white text-sm font-bold">Playlist</span>
            <button onClick={() => setShowPlaylist(false)} className="text-white text-sm">X</button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-1">
            {playlist.map((file, i) => (
              <div
                key={i}
                onClick={() => { onSelectTrack(file); setShowPlaylist(false); }}
                className="p-1 bg-gray-700 text-white rounded cursor-pointer hover:bg-gray-600"
              >
                {file.name}
              </div>
            ))}
          </div>
          <button onClick={openFileDialog} className="mt-2 py-1 bg-gray-600 text-white rounded">Add Track</button>
        </div>
      )}
    </div>
  );
};

export default Touchscreen;
