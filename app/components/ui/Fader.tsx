
import React from 'react';

interface FaderProps {
  value: number; // 0 to 1
  onChange: (value: number) => void;
  orientation?: 'vertical' | 'horizontal';
}

const Fader: React.FC<FaderProps> = ({ value, onChange, orientation = 'vertical' }) => {
  const isVertical = orientation === 'vertical';

  return (
    <div className={`relative ${isVertical ? 'h-full w-10' : 'w-full h-10'} flex items-center justify-center`}>
      <div className={`absolute ${isVertical ? 'w-1 h-full' : 'h-1 w-full'} bg-gray-900 rounded-full`}></div>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className={`w-full h-full appearance-none bg-transparent cursor-pointer ${
          isVertical ? '[writing-mode:bt-lr]' : ''
        }`}
        style={{
          '--thumb-bg': '#4b5563', // gray-600
          '--thumb-border': '#374151', // gray-700
        } as React.CSSProperties}
      />
      <style>{`
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: ${isVertical ? '32px' : '16px'};
          height: ${isVertical ? '16px' : '32px'};
          background: var(--thumb-bg);
          border: 2px solid var(--thumb-border);
          border-radius: 4px;
        }
        input[type=range]::-moz-range-thumb {
          width: ${isVertical ? '32px' : '16px'};
          height: ${isVertical ? '16px' : '32px'};
          background: var(--thumb-bg);
          border: 2px solid var(--thumb-border);
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};

export default Fader;
