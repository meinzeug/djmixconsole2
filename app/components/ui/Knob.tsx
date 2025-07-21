import React, { useState, useCallback, useEffect } from 'react';

interface KnobProps {
  label: string;
  value: number; // 0 to 1
  onChange: (value: number) => void;
}

const Knob: React.FC<KnobProps> = ({ label, value, onChange }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (isDragging) {
      const delta = -e.movementY;
      // Increase sensitivity so the full range can be reached with less
      // mouse movement.
      const newValue = Math.max(0, Math.min(1, value + delta * 0.01));
      onChange(newValue);
    }
  }, [isDragging, onChange, value]);

  const handleDoubleClick = useCallback(() => {
    onChange(0.5);
  }, [onChange]);

  useEffect(() => {
    const up = () => setIsDragging(false);
    window.addEventListener('mouseup', up);
    return () => window.removeEventListener('mouseup', up);
  }, []);

  const rotation = value * 270 - 135;

  return (
    <div className="flex flex-col items-center space-y-1 select-none" onMouseMove={handleMouseMove} onMouseLeave={handleMouseUp}>
      <div
        className="w-10 h-10 bg-gray-700 rounded-full border-2 border-gray-600 flex items-center justify-center cursor-pointer"
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
      >
        <div
          className="w-8 h-8 rounded-full bg-gray-800 relative"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <div className="absolute top-0 left-1/2 -ml-px w-0.5 h-3 bg-white"></div>
        </div>
      </div>
      <span className="text-xs text-gray-400">{label}</span>
    </div>
  );
};

export default Knob;