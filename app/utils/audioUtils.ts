
export const processAudioBuffer = (buffer: AudioBuffer): number[] => {
  const data = buffer.getChannelData(0);
  const samples = 1024; // Lower for more detail, higher for performance
  const step = Math.ceil(data.length / samples);
  const waveform = [];

  for (let i = 0; i < data.length; i += step) {
    let max = 0;
    for (let j = 0; j < step; j++) {
      if (data[i + j] > max) {
        max = data[i + j];
      }
    }
    waveform.push(max);
  }

  return waveform;
};
