
import React from 'react';
import type { StoreApi } from 'zustand';
import type { DjStore } from '../types';
import ChannelStrip from './mixer/ChannelStrip';
import Fader from './ui/Fader';

interface MixerProps {
  useStore: StoreApi<DjStore>;
}

const Mixer: React.FC<MixerProps> = ({ useStore }) => {
  const { mixer, isRecording } = useStore.getState();
  const { setCrossfader, toggleRecording } = useStore.getState().actions;

  return (
    <div className="flex flex-col w-1/3 bg-gray-900/50 border border-gray-700 rounded-lg p-3 space-y-4">
      <div className="flex justify-center items-start flex-grow gap-2">
        <ChannelStrip channelId={1} useStore={useStore} deckColor="cyan" />
        <ChannelStrip channelId={2} useStore={useStore} deckColor="red" />
        {/* Channels 3 and 4 are for future expansion */}
        <div className="w-1/4 h-full bg-gray-800/30 rounded-md border border-gray-700 flex flex-col p-2 opacity-50"><span className="text-xs text-center text-gray-500">CH 3</span></div>
        <div className="w-1/4 h-full bg-gray-800/30 rounded-md border border-gray-700 flex flex-col p-2 opacity-50"><span className="text-xs text-center text-gray-500">CH 4</span></div>
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
      
      <div className="flex items-center justify-center p-2 border-t border-gray-700">
         <button
            onClick={toggleRecording}
            className={`px-4 py-2 rounded-md flex items-center gap-2 font-bold transition-colors ${
              isRecording 
              ? 'bg-red-600 text-white animate-pulse' 
              : 'bg-gray-700 text-gray-300 hover:bg-red-800'
            }`}
          >
            <i className={`fa-solid fa-circle ${isRecording ? 'text-white' : 'text-red-500'}`}></i>
            {isRecording ? 'REC' : 'REC'}
        </button>
      </div>
    </div>
  );
};

export default Mixer;
