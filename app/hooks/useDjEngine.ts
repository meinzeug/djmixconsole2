import { useEffect } from 'react';
import { create, StoreApi } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { DjStore, State, FXState } from '../types';
import { processAudioBuffer } from '../utils/audioUtils';
import detectBpm from 'bpm-detective';

// AudioNodes can't be stored in Zustand state directly. We manage them here.
const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
const masterGain = audioContext.createGain();
const masterEq = {
  low: audioContext.createBiquadFilter(),
  mid: audioContext.createBiquadFilter(),
  high: audioContext.createBiquadFilter(),
};
masterEq.low.type = 'lowshelf';
masterEq.low.frequency.value = 200;
masterEq.mid.type = 'peaking';
masterEq.mid.frequency.value = 1000;
masterEq.mid.Q.value = 0.5;
masterEq.high.type = 'highshelf';
masterEq.high.frequency.value = 10000;
masterEq.low.connect(masterEq.mid).connect(masterEq.high).connect(masterGain).connect(audioContext.destination);

const beatFx = {
  input: audioContext.createGain(),
  delay: audioContext.createDelay(),
  output: audioContext.createGain(),
};
beatFx.input.connect(beatFx.delay).connect(beatFx.output).connect(masterGain);
beatFx.delay.delayTime.value = 0.25;

let mediaRecorder: MediaRecorder | null = null;
let audioChunks: Blob[] = [];

interface AudioNodes {
  source: AudioBufferSourceNode | null;
  gain: GainNode;
  panner: StereoPannerNode;
  eq: { high: BiquadFilterNode; mid: BiquadFilterNode; low: BiquadFilterNode };
  colorFx: BiquadFilterNode;
  beatSend: GainNode;
}
const playerNodes: AudioNodes[] = [];

const createInitialPlayerState = (): State['players'][0] => ({
  track: null,
  isPlaying: false,
  playbackTime: 0,
  volume: 1,
  pitch: 1.0,
  pitchRange: 0.08,
  bpm: 120,
  hotCues: [],
  activeLoop: null,
  isSync: false,
});

const createInitialMixerState = (): State['mixer'] => ({
  masterVolume: 0.8,
  crossfader: 0,
  masterBpm: 120,
  master: { gain: 0.5, eq: { high: 0.5, mid: 0.5, low: 0.5 }, fader: 1 },
  channels: {
    1: { gain: 0.5, eq: { high: 0.5, mid: 0.5, low: 0.5 }, fader: 1, cue: false },
    2: { gain: 0.5, eq: { high: 0.5, mid: 0.5, low: 0.5 }, fader: 1, cue: false },
  },
});

const createInitialFxState = (): FXState => ({
  colorFxType: 'Filter',
  colorFxAmount: { 1: 0, 2: 0 },
  beatFx: {
    active: false,
    effect: 'Echo',
    target: 'Master',
    beatLength: 1,
    depth: 0.5,
  },
});

const createPlayerAudioNodes = (): AudioNodes => {
    const gain = audioContext.createGain();
    const panner = audioContext.createStereoPanner();
    const high = audioContext.createBiquadFilter();
    high.type = 'highshelf'; high.frequency.value = 10000;
    const mid = audioContext.createBiquadFilter();
    mid.type = 'peaking'; mid.frequency.value = 1000; mid.Q.value = 0.5;
    const low = audioContext.createBiquadFilter();
    low.type = 'lowshelf'; low.frequency.value = 200;
    const colorFx = audioContext.createBiquadFilter();
    const beatSend = audioContext.createGain();
    beatSend.gain.value = 0;

    gain
      .connect(low)
      .connect(mid)
      .connect(high)
      .connect(colorFx)
      .connect(panner);
    panner.connect(masterGain);
    panner.connect(beatSend);

    beatSend.connect(beatFx.input);

    return { source: null, gain, panner, eq: { high, mid, low }, colorFx, beatSend };
}

const useStore = create<DjStore>()(
  immer((set, get) => ({
    players: [createInitialPlayerState(), createInitialPlayerState()],
    mixer: createInitialMixerState(),
    fx: createInitialFxState(),
    activeChannel: 1,
    isRecording: false,
    actions: {
      initAudio: () => {
        if (audioContext.state === 'suspended') {
          audioContext.resume();
        }
        if (!playerNodes.length) {
          for (let i = 0; i < 2; i++) {
              playerNodes[i] = createPlayerAudioNodes();
          }
        }
      },
      loadTrack: async (deckId, file) => {
        // Always stop and disconnect any currently playing source on this deck
        // before loading the new track to avoid multiple tracks playing
        // simultaneously.
        playerNodes[deckId].source?.stop();
        playerNodes[deckId].source?.disconnect();
        playerNodes[deckId].source = null;
        const arrayBuffer = await file.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        const bitrate = Math.round((file.size * 8) / (audioBuffer.duration * 1000));
        const waveform = processAudioBuffer(audioBuffer);
        let bpm = 120;
        try {
          bpm = detectBpm(audioBuffer);
        } catch {
          bpm = 120;
        }
        set(state => {
          state.players[deckId].track = {
            name: file.name,
            url: URL.createObjectURL(file),
            buffer: audioBuffer,
            waveform,
            duration: audioBuffer.duration,
            bpm,
            bitrate,
            key: undefined,
            artwork: undefined,
          };
          state.players[deckId].playbackTime = 0;
          state.players[deckId].isPlaying = false;
          state.players[deckId].bpm = bpm;
          state.players[deckId].pitch = state.mixer.masterBpm / bpm;
        });
      },
      togglePlay: (deckId) => {
        const { isPlaying, track, playbackTime } = get().players[deckId];
        if (!track) return;

        if (isPlaying) {
          playerNodes[deckId].source?.stop();
          set(state => { state.players[deckId].isPlaying = false; });
        } else {
          const source = audioContext.createBufferSource();
          source.buffer = track.buffer;
          source.playbackRate.value = get().players[deckId].pitch;
          source.connect(playerNodes[deckId].gain);
          source.start(0, playbackTime);
          playerNodes[deckId].source = source;
          (playerNodes[deckId].source as any)._startTime = audioContext.currentTime;
          set(state => { state.players[deckId].isPlaying = true; });
        }
      },
      seek: (deckId, time) => {
        set(state => {
          state.players[deckId].playbackTime = time;
        });
        if (get().players[deckId].isPlaying) {
           get().actions.togglePlay(deckId);
           get().actions.togglePlay(deckId);
        }
      },
      setPitch: (deckId, pitch) => {
         set(state => {
          state.players[deckId].pitch = pitch;
         });
         if(playerNodes[deckId].source){
             playerNodes[deckId].source!.playbackRate.value = pitch;
         }
      },
      setPitchRange: (deckId, range) => {
         set(state => {
           state.players[deckId].pitchRange = range;
           const value = Math.max(1 - range, Math.min(1 + range, state.players[deckId].pitch));
           state.players[deckId].pitch = value;
         });
         if(playerNodes[deckId].source){
             playerNodes[deckId].source!.playbackRate.value = get().players[deckId].pitch;
         }
      },
      nudge: (deckId, delta) => {
         const source = playerNodes[deckId].source;
         if (source) {
           source.playbackRate.value = get().players[deckId].pitch + delta;
         }
      },
      setVolume: (deckId, volume) => {
        set(state => { state.players[deckId].volume = volume; });
      },
      toggleSync: (deckId) => {
         set(state => { state.players[deckId].isSync = !state.players[deckId].isSync; });
      },
      setHotCue: (deckId, cueId) => {
          const { playbackTime, hotCues } = get().players[deckId];
          const newCues = hotCues.filter(c => c.id !== cueId);
          newCues.push({id: cueId, time: playbackTime});
          set(state => { state.players[deckId].hotCues = newCues });
      },
      deleteHotCue: (deckId, cueId) => {
           set(state => {
               state.players[deckId].hotCues = state.players[deckId].hotCues.filter(c => c.id !== cueId);
           });
      },
      jumpToHotCue: (deckId, cueId) => {
          const cue = get().players[deckId].hotCues.find(c => c.id === cueId);
          if (cue) {
              get().actions.seek(deckId, cue.time);
          }
      },
      setLoop: (deckId, start, end) => {
        set(state => {
          state.players[deckId].activeLoop = { start, end };
        });
      },
      clearLoop: (deckId) => {
        set(state => { state.players[deckId].activeLoop = null; });
      },
      setMasterVolume: (volume) => set(state => { state.mixer.masterVolume = volume; state.mixer.master.fader = volume; }),
      setMasterGain: (value) => set(state => { state.mixer.master.gain = value; }),
      setMasterEq: (band, value) => set(state => { state.mixer.master.eq[band] = value; }),
      setCrossfader: (value) => set(state => { state.mixer.crossfader = value; }),
      setMasterBpm: (bpm) => {
          set(state => { state.mixer.masterBpm = bpm; });
          get().players.forEach((player, deckId) => {
            if (player.track) {
              const newPitch = bpm / player.bpm;
              set(s => { s.players[deckId].pitch = newPitch; });
              if (playerNodes[deckId].source) {
                playerNodes[deckId].source!.playbackRate.value = newPitch;
              }
            }
          });
      },
      syncPlayers: () => {
          const state = get();
          if (!state.players[0].track || !state.players[1].track) return;
          const master = state.players[0].isPlaying ? 0 : (state.players[1].isPlaying ? 1 : 0);
          const other = master === 0 ? 1 : 0;
          const beat = 60 / state.mixer.masterBpm;
          const tMaster = state.players[master].playbackTime;
          const tOther = state.players[other].playbackTime;
          const diff = (tMaster % beat) - (tOther % beat);
          let newTime = tOther + diff;
          const duration = state.players[other].track!.duration;
          newTime = ((newTime % duration) + duration) % duration;
          set(s => { s.players[other].playbackTime = newTime; });
          if (state.players[other].isPlaying) {
            playerNodes[other].source?.stop();
            const source = audioContext.createBufferSource();
            source.buffer = state.players[other].track!.buffer;
            source.playbackRate.value = state.players[other].pitch;
            source.connect(playerNodes[other].gain);
            source.start(0, newTime);
            playerNodes[other].source = source;
            (playerNodes[other].source as any)._startTime = audioContext.currentTime;
          }
      },
      setChannelGain: (channelId, gain) => {
          const deckId = channelId - 1;
          if (deckId >= 0 && deckId < 2) {
              set(state => { state.mixer.channels[channelId].gain = gain; });
          }
      },
      setChannelEq: (channelId, band, value) => {
           const deckId = channelId - 1;
           if (deckId >= 0 && deckId < 2) {
              set(state => { state.mixer.channels[channelId].eq[band] = value; });
              const dbValue = (value - 0.5) * 40;
              playerNodes[deckId].eq[band].gain.setValueAtTime(dbValue, audioContext.currentTime);
           }
      },
      setChannelFader: (channelId, value) => {
          const deckId = channelId - 1;
          if (deckId >= 0 && deckId < 2) {
              set(state => { state.mixer.channels[channelId].fader = value; });
          }
      },
      toggleChannelCue: (channelId) => set(state => { state.mixer.channels[channelId].cue = !state.mixer.channels[channelId].cue; }),
      setActiveChannel: (channelId) => set({ activeChannel: channelId }),

      setColorFxType: (type) => set(state => { state.fx.colorFxType = type; }),
      setColorFxAmount: (channelId, amount) => set(state => { state.fx.colorFxAmount[channelId] = amount; }),
      setBeatFxActive: (active) => set(state => { state.fx.beatFx.active = active; }),
      setBeatFxEffect: (effect) => set(state => { state.fx.beatFx.effect = effect; }),
      setBeatFxTarget: (target) => set(state => { state.fx.beatFx.target = target; }),
      setBeatFxBeatLength: (len) => set(state => { state.fx.beatFx.beatLength = len; }),
      setBeatFxDepth: (depth) => set(state => { state.fx.beatFx.depth = depth; }),
      toggleRecording: () => {
          const { isRecording } = get();
          if (isRecording) {
              mediaRecorder?.stop();
          } else {
              const destination = audioContext.createMediaStreamDestination();
              masterGain.connect(destination);
              mediaRecorder = new MediaRecorder(destination.stream);
              mediaRecorder.start();
              mediaRecorder.ondataavailable = event => {
                  audioChunks.push(event.data);
              };
              mediaRecorder.onstop = () => {
                  const blob = new Blob(audioChunks, { type: 'audio/wav' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.style.display = 'none';
                  a.href = url;
                  a.download = `dj-mix-${new Date().toISOString()}.wav`;
                  document.body.appendChild(a);
                  a.click();
                  window.URL.revokeObjectURL(url);
                  audioChunks = [];
                  masterGain.disconnect(destination);
              };
          }
          set({ isRecording: !isRecording });
      },
    },
  }))
);

useStore.subscribe(state => {
  masterGain.gain.value = state.mixer.masterVolume * state.mixer.master.fader * state.mixer.master.gain;
  masterEq.high.gain.value = (state.mixer.master.eq.high - 0.5) * 40;
  masterEq.mid.gain.value = (state.mixer.master.eq.mid - 0.5) * 40;
  masterEq.low.gain.value = (state.mixer.master.eq.low - 0.5) * 40;

  for (let i = 0; i < 2; i++) {
    const channelId = i + 1;
    const channel = state.mixer.channels[channelId];
    const cross = i === 0 ? (1 - state.mixer.crossfader) / 2 : (1 + state.mixer.crossfader) / 2;
    const volume = state.players[i].volume;
    playerNodes[i].gain.gain.value = volume * channel.gain * channel.fader * cross;

    const amt = state.fx.colorFxAmount[channelId] || 0;
    if (state.fx.colorFxType === 'Filter') {
      if (amt >= 0) {
        playerNodes[i].colorFx.type = 'lowpass';
        playerNodes[i].colorFx.frequency.value = 20000 - amt * 19000;
      } else {
        playerNodes[i].colorFx.type = 'highpass';
        playerNodes[i].colorFx.frequency.value = 20 + (-amt) * 990;
      }
    }

    const send = (state.fx.beatFx.active && (state.fx.beatFx.target === `CH${channelId}` || state.fx.beatFx.target === 'Master')) ? state.fx.beatFx.depth : 0;
    playerNodes[i].beatSend.gain.value = send;
  }

  beatFx.delay.delayTime.value = (60 / state.mixer.masterBpm) * state.fx.beatFx.beatLength;
  beatFx.output.gain.value = state.fx.beatFx.depth;
});

const useDjEngine = () => {
  useEffect(() => {
    const interval = setInterval(() => {
      useStore.getState().players.forEach((player, deckId) => {
        if (player.isPlaying && playerNodes[deckId].source && player.track) {
          useStore.setState(state => {
            const sourceNode = playerNodes[deckId].source as any;
            if (sourceNode._startTime) {
              const playedDuration = audioContext.currentTime - sourceNode._startTime;
              let newTime = state.players[deckId].playbackTime + playedDuration;
              const loop = state.players[deckId].activeLoop;
              if (loop) {
                const length = loop.end - loop.start;
                if (newTime > loop.end) {
                  newTime = loop.start + ((newTime - loop.start) % length);
                  playerNodes[deckId].source?.stop();
                  const src = audioContext.createBufferSource();
                  src.buffer = player.track!.buffer;
                  src.playbackRate.value = state.players[deckId].pitch;
                  src.connect(playerNodes[deckId].gain);
                  src.start(0, newTime);
                  playerNodes[deckId].source = src;
                  (playerNodes[deckId].source as any)._startTime = audioContext.currentTime;
                }
              }
              state.players[deckId].playbackTime = newTime % player.track!.duration;
              sourceNode._startTime = audioContext.currentTime;
            }
          });
        }
      })
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return {
    store: useStore as StoreApi<DjStore>,
    useStore,
    isReady: !!audioContext,
  };
};

export default useDjEngine;