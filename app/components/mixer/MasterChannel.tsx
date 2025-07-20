import React from 'react';
import type { StoreApi } from 'zustand';
import type { DjStore } from '../../types';
import Knob from '../ui/Knob';
import Fader from '../ui/Fader';

interface Props {
  useStore: StoreApi<DjStore>;
}

const MasterChannel: React.FC<Props> = ({ useStore }) => {
  const mixer = (useStore as any)((state: DjStore) => state.mixer);
  const { setMasterVolume, setMasterGain, setMasterEq } = (useStore as any)((state: DjStore) => state.actions);
  const state = mixer.master;

  return (
    <div className="w-1/4 h-full flex flex-col items-center p-2 space-y-4 rounded-md border border-gray-700">
      <span className="text-xs font-bold text-gray-400">MASTER</span>
      <Knob label="GAIN" value={state.gain} onChange={(v) => setMasterGain(v)} />
      <Knob label="HIGH" value={state.eq.high} onChange={(v) => setMasterEq('high', v)} />
      <Knob label="MID" value={state.eq.mid} onChange={(v) => setMasterEq('mid', v)} />
      <Knob label="LOW" value={state.eq.low} onChange={(v) => setMasterEq('low', v)} />
      <div className="flex-grow flex items-center justify-center w-full">
        <Fader value={state.fader} onChange={(v) => setMasterVolume(v)} />
      </div>
    </div>
  );
};

export default MasterChannel;
