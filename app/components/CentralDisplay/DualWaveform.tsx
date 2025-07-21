import React, { useEffect, useRef } from 'react';
import type { StoreApi } from 'zustand';
import type { DjStore } from '../../types';

interface Props {
  useStore: StoreApi<DjStore>;
}

const drawWave = (
  canvas: HTMLCanvasElement,
  waveform: number[],
  progress: number,
  color: string
) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const { width, height } = canvas;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#1f2937';
  ctx.fillRect(0, 0, width, height);
  if (waveform.length) {
    const step = width / waveform.length;
    ctx.strokeStyle = color;
    ctx.beginPath();
    for (let i = 0; i < waveform.length; i++) {
      const val = waveform[i];
      const x = i * step;
      const y = (1 - val) * (height / 2);
      ctx.moveTo(x, y);
      ctx.lineTo(x, height - y);
    }
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  const x = progress * width;
  ctx.fillRect(x, 0, 2, height);
};

const DualWaveform: React.FC<Props> = ({ useStore }) => {
  const canvasLeft = useRef<HTMLCanvasElement>(null);
  const canvasRight = useRef<HTMLCanvasElement>(null);
  const [left, right] = (useStore as any)((s: DjStore) => [s.players[0], s.players[1]]);

  useEffect(() => {
    if (canvasLeft.current && left.track) {
      drawWave(
        canvasLeft.current,
        left.track.waveform,
        left.playbackTime / left.track.duration,
        '#06b6d4'
      );
    }
    if (canvasRight.current && right.track) {
      drawWave(
        canvasRight.current,
        right.track.waveform,
        right.playbackTime / right.track.duration,
        '#f43f5e'
      );
    }
  }, [left, right]);

  return (
    <div className="flex w-full gap-1 items-center">
      <canvas ref={canvasLeft} className="flex-1 h-20 bg-gray-800 rounded" width={400} height={80} />
      <canvas ref={canvasRight} className="flex-1 h-20 bg-gray-800 rounded" width={400} height={80} />
    </div>
  );
};

export default DualWaveform;
