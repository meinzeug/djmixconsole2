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
    <div className="flex flex-col w-1/4 bg-gray-800/40 border border-gray-700 rounded-md p-2 space-y-2 text-xs">
      <div className="flex justify-between items-center">
        <select value={fx.beatFx.effect} onChange={e => setBeatFxEffect(e.target.value)} className="bg-gray-700 text-white text-xs rounded p-1">
          {effects.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
        <select value={fx.beatFx.target} onChange={e => setBeatFxTarget(e.target.value)} className="bg-gray-700 text-white text-xs rounded p-1">
          {['CH1','CH2','Master'].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button onClick={() => setBeatFxActive(!fx.beatFx.active)} className={`px-2 py-1 rounded ${fx.beatFx.active ? 'bg-cyan-600' : 'bg-gray-700'}`}>ON</button>
      </div>
      <div className="flex gap-1">
        {[1/8,1/4,1/2,1,2,4,8].map(b => (
          <button key={b} onClick={() => setBeatFxBeatLength(b)} className={`flex-1 py-1 rounded ${fx.beatFx.beatLength===b?'bg-cyan-600':'bg-gray-700'}`}>{b}</button>
        ))}
      </div>
      <div>
        <Fader value={fx.beatFx.depth} onChange={setBeatFxDepth} orientation="horizontal" />
      </div>
    </div>
  );
};

export default BeatFxPanel;
