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
  const { track, playbackTime, bpm, pitch, activeLoop, isPlaying } = state;

  const formatTime = (time: number) => {
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex justify-between items-center text-xs text-gray-300 w-full px-2">
      <div className="flex items-center gap-2 truncate">
        {track?.artwork && (
          <img src={track.artwork} alt="art" className="w-8 h-8 object-cover rounded" />
        )}
        <span className="truncate mr-2">
          {track ? track.name.split('.mp3')[0] : `Deck ${deckId + 1}`}
        </span>
      </div>
      {track && (
        <span className="flex gap-2 items-center">
          <i className={`fa ${isPlaying ? 'fa-play text-green-400' : 'fa-pause text-gray-400'}`}></i>
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
