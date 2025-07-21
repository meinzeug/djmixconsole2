import React from 'react';
import type { StoreApi } from 'zustand';
import type { DjStore } from '../../types';
import TrackInfo from './TrackInfo';
import DualWaveform from './DualWaveform';

interface Props {
  useStore: StoreApi<DjStore>;
}

const CentralDisplay: React.FC<Props> = ({ useStore }) => (
  <div className="w-full bg-gray-900/70 border border-gray-700 rounded-md p-2 mb-2 space-y-2">
    <TrackInfo deck="left" useStore={useStore} />
    <DualWaveform useStore={useStore} />
    <TrackInfo deck="right" useStore={useStore} />
  </div>
);

export default CentralDisplay;
