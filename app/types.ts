
export interface Track {
  name: string;
  url: string;
  buffer: AudioBuffer;
  waveform: number[];
  duration: number;
  bpm: number;
  /** Estimated audio bitrate in kbps */
  bitrate: number;
  /** Musical key of the track if detected */
  key?: string;
  /** Optional artwork URL extracted from metadata */
  artwork?: string;
}

export interface HotCue {
  id: number;
  time: number;
}

export interface Loop {
  start: number;
  end: number;
}

export interface PlayerState {
  track: Track | null;
  isPlaying: boolean;
  playbackTime: number;
  volume: number;
  pitch: number;
  /** Maximum pitch deviation from 1.0 (0.08 = +-8%) */
  pitchRange: number;
  bpm: number;
  hotCues: HotCue[];
  activeLoop: Loop | null;
  isSync: boolean;
}

export interface MixerState {
  masterVolume: number;
  crossfader: number; // -1 (left) to 1 (right)
  masterBpm: number;
  channels: {
    [key: number]: {
      gain: number;
      eq: {
        high: number;
        mid: number;
        low: number;
      };
      fader: number;
      cue: boolean;
    };
  };
}

export interface DjStore extends State {
  actions: Actions;
}

export interface State {
  players: PlayerState[];
  mixer: MixerState;
  activeChannel: number;
  isRecording: boolean;
}

export interface Actions {
  loadTrack: (deckId: number, file: File) => Promise<void>;
  togglePlay: (deckId: number) => void;
  seek: (deckId: number, time: number) => void;
  setVolume: (deckId: number, volume: number) => void;
  setPitch: (deckId: number, pitch: number) => void;
  setPitchRange: (deckId: number, range: number) => void;
  nudge: (deckId: number, delta: number) => void;
  toggleSync: (deckId: number) => void;
  setHotCue: (deckId: number, cueId: number) => void;
  deleteHotCue: (deckId: number, cueId: number) => void;
  jumpToHotCue: (deckId: number, cueId: number) => void;
  setLoop: (deckId: number, start: number, end: number) => void;
  clearLoop: (deckId: number) => void;

  setMasterVolume: (volume: number) => void;
  setCrossfader: (value: number) => void;
  setChannelGain: (channelId: number, gain: number) => void;
  setChannelEq: (channelId: number, band: 'high' | 'mid' | 'low', value: number) => void;
  setChannelFader: (channelId: number, value: number) => void;
  toggleChannelCue: (channelId: number) => void;
  setActiveChannel: (channelId: number) => void;

  setMasterBpm: (bpm: number) => void;
  syncPlayers: () => void;

  toggleRecording: () => void;
  initAudio: () => void;
}
