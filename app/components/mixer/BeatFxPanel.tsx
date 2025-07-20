import React from 'react';
import type { StoreApi } from 'zustand';
import type { DjStore } from '../../types';
import Fader from '../ui/Fader';

const effects = [
  "Echo", "Ping Pong", "Spiral", "Reverb", "Flanger", "Phaser", "Delay",
  "Filter", "Roll", "Slip Roll", "Vinyl Brake", "Helix",
  "Shimmer Reverb", "Mobius", "Enigma Jet", "Triplet Filter", "Comp"
];

interface Props {
  useStore: StoreApi<DjStore>;
}

const BeatFxPanel: React.FC<Props> = ({ useStore }) => {
  const fx = (useStore as any)((state: DjStore) => state.fx);
  const { setBeatFxActive, setBeatFxEffect, setBeatFxTarget, setBeatFxBeatLength, setBeatFxDepth } =
    (useStore as any)((state: DjStore) => state.actions);

  return (
    <div className="flex flex-col items-center w-1/4 h-full bg-gray-800/40 border border-gray-700 rounded-md p-2 space-y-2 text-xs">
      <select
        value={fx.beatFx.effect}
        onChange={(e) => setBeatFxEffect(e.target.value)}
        className="w-full bg-gray-700 text-white text-xs rounded p-1"
      >
        {effects.map((e) => (
          <option key={e} value={e}>
            {e}
          </option>
        ))}
      </select>
      <select
        value={fx.beatFx.target}
        onChange={(e) => setBeatFxTarget(e.target.value)}
        className="w-full bg-gray-700 text-white text-xs rounded p-1"
      >
        {['CH1', 'CH2', 'Master'].map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <button
        onClick={() => setBeatFxActive(!fx.beatFx.active)}
        className={`w-full px-2 py-1 rounded ${fx.beatFx.active ? 'bg-cyan-600' : 'bg-gray-700'}`}
      >
        ON
      </button>
      <div className="grid grid-cols-4 gap-1 w-full">
        {[1 / 8, 1 / 4, 1 / 2, 1, 2, 4, 8].map((b) => (
          <button
            key={b}
            onClick={() => setBeatFxBeatLength(b)}
            className={`py-1 rounded ${fx.beatFx.beatLength === b ? 'bg-cyan-600' : 'bg-gray-700'}`}
          >
            {b}
          </button>
        ))}
      </div>
      <div className="flex-grow flex items-center justify-center w-full">
        <Fader value={fx.beatFx.depth} onChange={setBeatFxDepth} />
      </div>
    </div>
  );
};

export default BeatFxPanel;
