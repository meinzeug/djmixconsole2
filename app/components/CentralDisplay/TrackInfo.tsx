import React from 'react';
import type { StoreApi } from 'zustand';
import type { DjStore } from '../../types';

interface Props {
  deck: 'left' | 'right';
  useStore: StoreApi<DjStore>;
}

const TrackInfo: React.FC<Props> = ({ deck, useStore }) => {
  const deckId = deck === 'left' ? 0 : 1;
  const state = (useStore as any)((s: DjStore) => s.players[deckId]);
  const { track, playbackTime, bpm, pitch, activeLoop } = state;

  const formatTime = (time: number) => {
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex justify-between text-xs text-gray-300 w-full px-2">
      <span className="truncate mr-2">
        {track ? track.name.split('.mp3')[0] : `Deck ${deckId + 1}`}
      </span>
      {track && (
        <span className="flex gap-2">
          <span>{formatTime(playbackTime)} / {formatTime(track.duration)}</span>
          <span>{Math.round(bpm * pitch)} BPM</span>
          {track.key && <span>Key: {track.key}</span>}
          {activeLoop && <span>Loop</span>}
        </span>
      )}
    </div>
  );
};

export default TrackInfo;
