import React from 'react';
import type { UseBoundStore } from 'zustand';
import type { DjStore } from '../../types';

interface Props {
  useStore: UseBoundStore<DjStore>;
}

const MasterClock: React.FC<Props> = ({ useStore }) => {
  const masterBpm = (useStore as any)((s: DjStore) => s.mixer.masterBpm);
  const clockRunning = (useStore as any)((s: DjStore) => s.clock.running);
  const isRecording = (useStore as any)((s: DjStore) => s.isRecording);
  const { setMasterBpm, syncPlayers, startClock, stopClock, toggleRecording } =
    (useStore as any)((s: DjStore) => s.actions);

  return (
    <div className="flex items-center justify-center p-2 border-t border-gray-700 space-x-2">
      <input
        type="number"
        value={masterBpm}
        onChange={(e) => {
          const v = parseFloat(e.target.value);
          if (!isNaN(v)) setMasterBpm(v);
        }}
        className="w-20 text-center bg-gray-800 text-white py-1 rounded border border-gray-600"
      />
      <button
        onClick={syncPlayers}
        className="px-4 py-2 rounded-md bg-gray-700 text-gray-300 hover:bg-cyan-800 font-bold flex items-center gap-2"
      >
        <i className="fa fa-sync" />
        SYNC
      </button>
      <button
        onClick={clockRunning ? stopClock : startClock}
        className="px-4 py-2 rounded-md bg-gray-700 text-gray-300 hover:bg-cyan-800 font-bold"
      >
        {clockRunning ? 'STOP' : 'START'}
      </button>
      <button
        onClick={toggleRecording}
        className={`px-4 py-2 rounded-md flex items-center gap-2 font-bold transition-colors ${
          isRecording ? 'bg-red-600 text-white animate-pulse' : 'bg-gray-700 text-gray-300 hover:bg-red-800'
        }`}
      >
        <i className={`fa-solid fa-circle ${isRecording ? 'text-white' : 'text-red-500'}`}></i>
        {isRecording ? 'REC' : 'REC'}
      </button>
    </div>
  );
};

export default MasterClock;
