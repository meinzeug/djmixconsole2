
import React from 'react';
import type { StoreApi } from 'zustand';
import type { DjStore } from '../../types';
import Knob from '../ui/Knob';
import Fader from '../ui/Fader';

interface ChannelStripProps {
  channelId: number;
  useStore: StoreApi<DjStore>;
  deckColor: 'cyan' | 'red';
}

const ChannelStrip: React.FC<ChannelStripProps> = ({ channelId, useStore, deckColor }) => {
  const mixer = (useStore as any)((state: DjStore) => state.mixer);
  const activeChannel = (useStore as any)((state: DjStore) => state.activeChannel);
  const channelState = mixer.channels[channelId];
  const { setChannelGain, setChannelEq, setChannelFader, toggleChannelCue } = (useStore as any)((state: DjStore) => state.actions);
  const isActive = activeChannel === channelId;

  return (
    <div className={`w-1/4 h-full flex flex-col items-center p-2 space-y-4 rounded-md border ${isActive ? `border-${deckColor}-500 shadow-[0_0_10px_var(--tw-shadow-color)] shadow-${deckColor}-500/50` : 'border-gray-700'}`}>
        <span className={`text-xs font-bold ${isActive ? `text-${deckColor}-400` : 'text-gray-400'}`}>CH {channelId}</span>
        <Knob label="GAIN" value={channelState.gain} onChange={(v) => setChannelGain(channelId, v)} />
        <Knob label="HIGH" value={channelState.eq.high} onChange={(v) => setChannelEq(channelId, 'high', v)} />
        <Knob label="MID" value={channelState.eq.mid} onChange={(v) => setChannelEq(channelId, 'mid', v)} />
        <Knob label="LOW" value={channelState.eq.low} onChange={(v) => setChannelEq(channelId, 'low', v)} />
        <button 
          onClick={() => toggleChannelCue(channelId)}
          className={`w-full py-2 text-xs font-bold rounded ${channelState.cue ? `bg-${deckColor}-500 text-white` : 'bg-gray-700 text-gray-400'}`}
        >
          CUE
        </button>
        <div className="flex-grow flex items-center justify-center w-full">
            <Fader value={channelState.fader} onChange={(v) => setChannelFader(channelId, v)} />
        </div>
    </div>
  );
};

export default ChannelStrip;
