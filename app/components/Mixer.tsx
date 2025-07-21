
import React from 'react';
import type { UseBoundStore } from 'zustand';
import type { DjStore } from '../types';
import ChannelStrip from './mixer/ChannelStrip';
import MasterChannel from './mixer/MasterChannel';
import BeatFxPanel from './mixer/BeatFxPanel';
import Fader from './ui/Fader';
import MasterClock from './Clock/MasterClock';

interface MixerProps {
  useStore: UseBoundStore<DjStore>;
}

const Mixer: React.FC<MixerProps> = ({ useStore }) => {
  const mixer = (useStore as any)((state: DjStore) => state.mixer);
  const fx = (useStore as any)((state: DjStore) => state.fx);
  const { setCrossfader, setColorFxType } =
    (useStore as any)((state: DjStore) => state.actions);

  return (
    <div className="flex flex-col w-1/3 bg-gray-900/50 border border-gray-700 rounded-lg p-3 space-y-4">
      <div className="flex justify-center items-start flex-grow gap-2">
        <ChannelStrip channelId={1} useStore={useStore} deckColor="cyan" />
        <ChannelStrip channelId={2} useStore={useStore} deckColor="red" />
        <MasterChannel useStore={useStore} />
        <BeatFxPanel useStore={useStore} />
      </div>

      <div className="flex items-center justify-between text-xs px-2">
        <label className="mr-2 text-gray-300">Color FX</label>
        <select value={fx.colorFxType} onChange={e => setColorFxType(e.target.value)} className="bg-gray-800 text-white rounded p-1">
          {["Filter", "Dub Echo", "Sweep", "Noise", "Crush", "Space", "Shimmer", "Chorus", "Short Delay", "Long Delay"].map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center space-x-4 px-4">
        <div className="text-xs font-bold text-cyan-400">CH 1</div>
        <div className="flex-grow">
          <Fader 
            value={(mixer.crossfader + 1) / 2} 
            onChange={(v) => setCrossfader(v * 2 - 1)}
            orientation="horizontal"
          />
        </div>
        <div className="text-xs font-bold text-red-400">CH 2</div>
      </div>
      
      <MasterClock useStore={useStore} />
    </div>
  );
};

export default Mixer;
