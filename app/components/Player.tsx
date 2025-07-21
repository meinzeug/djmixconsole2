
import React, { useRef, ChangeEvent } from 'react';
import type { UseBoundStore } from 'zustand';
import type { DjStore } from '../types';
import JogWheel from './player/JogWheel';
import Fader from './ui/Fader';

interface PlayerProps {
  deckId: number;
  useStore: UseBoundStore<DjStore>;
}

const Player: React.FC<PlayerProps> = ({ deckId, useStore }) => {
  const playerState = (useStore as any)((state: DjStore) => state.players[deckId]);
  const { loadTrack, togglePlay, setPitch, setPitchRange, setHotCue, jumpToHotCue, deleteHotCue, setLoop, clearLoop, toggleSync, syncPlayers, setMasterDeck, seek } =
    (useStore as any)((state: DjStore) => state.actions);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelected = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      loadTrack(deckId, file);
    }
  };

  const deckColor = deckId === 0 ? 'cyan' : 'red';

  const handlePitchChange = (value: number) => {
    const range = playerState.pitchRange;
    const newPitch = (1 - range) + value * (range * 2);
    setPitch(deckId, newPitch);
  };

  const handleLoop = (beats: number) => {
    if (!playerState.track) return;
    const beatLength = 60 / playerState.bpm;
    const start = playerState.playbackTime;
    const end = start + beats * beatLength;
    setLoop(deckId, start, end);
  };

  const handleCue = () => {
    if (playerState.isPlaying) togglePlay(deckId);
    seek(deckId, 0);
  };

  return (
    <div className="flex flex-col w-1/3 bg-gray-900/50 border border-gray-700 rounded-lg p-3 space-y-3">
      <div className="flex justify-center">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-1 text-xs bg-gray-700 rounded hover:bg-gray-600"
        >Load Track</button>
        <input
          type="file"
          accept=".mp3"
          ref={fileInputRef}
          onChange={handleFileSelected}
          className="hidden"
        />
      </div>
      <div className="flex-grow flex items-center justify-center gap-2">
        <JogWheel deckId={deckId} useStore={useStore} />
        <div className="h-48 flex flex-col items-center">
          <Fader
            value={(playerState.pitch - (1 - playerState.pitchRange)) / (playerState.pitchRange * 2)}
            onChange={handlePitchChange}
            orientation="vertical"
          />
          <div className="flex gap-1 mt-1">
            <button
              onClick={() => setPitchRange(deckId, 0.08)}
              className={`px-1 text-xs rounded bg-gray-700 hover:bg-gray-600 text-${deckColor}-400`}
            >8%</button>
            <button
              onClick={() => setPitchRange(deckId, 0.16)}
              className={`px-1 text-xs rounded bg-gray-700 hover:bg-gray-600 text-${deckColor}-400`}
            >16%</button>
          </div>
          <span className={`text-xs font-bold mt-1 text-${deckColor}-400`}>Pitch</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: 8 }).map((_, i) => {
          const hotCue = playerState.hotCues.find(c => c.id === i);
          const isActive = !!hotCue;
          return (
            <button
              key={i}
              onClick={() => jumpToHotCue(deckId, i)}
              onDoubleClick={(e) => { e.preventDefault(); setHotCue(deckId, i); }}
              onContextMenu={(e) => { e.preventDefault(); deleteHotCue(deckId, i); }}
              className={`py-3 rounded text-sm font-bold transition-all duration-200 ${
                isActive
                  ? `bg-${deckColor}-500 text-white shadow-[0_0_8px_var(--tw-shadow-color)] shadow-${deckColor}-500`
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
            >
              Hot Cue {i + 1}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-5 gap-2">
        {[1,2,4,8].map(len => (
          <button
            key={len}
            onClick={() => handleLoop(len)}
            className="py-2 bg-gray-700 text-gray-200 rounded hover:bg-gray-600 text-xs font-bold"
          >
            {len} Beat
          </button>
        ))}
        <button
          onClick={() => clearLoop(deckId)}
          className="py-2 bg-gray-700 text-gray-200 rounded hover:bg-gray-600 text-xs font-bold"
        >Clear</button>
      </div>
      
      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={handleCue}
          className="py-4 rounded bg-gray-800 border border-gray-600 text-lg hover:bg-gray-700"
        >
          CUE
        </button>
        <button
          onClick={() => togglePlay(deckId)}
          className={`py-4 rounded text-lg font-bold ${
            playerState.isPlaying ? `bg-${deckColor}-600 animate-pulse` : `bg-gray-800`
          } border border-${deckColor}-500`}
        >
          {playerState.isPlaying ? <i className="fa fa-pause"></i> : <i className="fa fa-play"></i>}
        </button>
        <button
          onClick={() => toggleSync(deckId)}
          className="py-4 rounded bg-gray-800 hover:bg-gray-700 border border-gray-600 text-lg"
        >
          SYNC
        </button>
        <button
          onClick={() => setMasterDeck(deckId)}
          className="py-4 rounded bg-gray-800 hover:bg-gray-700 border border-gray-600 text-lg"
        >
          MASTER
        </button>
      </div>
    </div>
  );
};

export default Player;
