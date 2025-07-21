import React, { useEffect, useCallback } from "react";
import Player from "./components/Player";
import Mixer from "./components/Mixer";
import { CentralDisplay } from "./components/CentralDisplay";
import useDjEngine from "./hooks/useDjEngine";
import type { DjStore } from "./types";

const App: React.FC = () => {
  const { store, isReady } = useDjEngine();

  useEffect(() => {
    store.getState().actions.initAudio();
  }, [store]);

  const handleKeydown = useCallback(
    (e: KeyboardEvent) => {
      const { actions, activeChannel } = store.getState();
      const { players, mixer } = store.getState();

      // Prevent browser shortcuts
      if (e.key === " " || e.key === "Tab" || e.key.startsWith("Arrow")) {
        e.preventDefault();
      }

      // Deck 1 Controls
      const hotCueKeys1: { [key: string]: number } = {
        q: 0,
        w: 1,
        e: 2,
        r: 3,
        t: 4,
        y: 5,
        u: 6,
        i: 7,
      };
      if (hotCueKeys1[e.key.toLowerCase()] !== undefined) {
        if (e.shiftKey)
          actions.deleteHotCue(0, hotCueKeys1[e.key.toLowerCase()]);
        else actions.jumpToHotCue(0, hotCueKeys1[e.key.toLowerCase()]);
      }
      if (e.code === "Space") actions.togglePlay(0);
      if (e.key.toLowerCase() === "z") actions.toggleSync(0);
      if (e.key.toLowerCase() === "x")
        actions.setPitch(0, players[0].pitch === 1.0 ? 1.06 : 1.0); // Simplified key shift
      if (e.key === "ArrowLeft") actions.setPitch(0, players[0].pitch - 0.01);
      if (e.key === "ArrowRight") actions.setPitch(0, players[0].pitch + 0.01);

      // Deck 2 Controls
      const hotCueKeys2: { [key: string]: number } = {
        u: 0,
        i: 1,
        o: 2,
        p: 3,
        h: 4,
        j: 5,
        k: 6,
        l: 7,
      };
      if (hotCueKeys2[e.key.toLowerCase()] !== undefined && players[1].track) {
        if (e.shiftKey)
          actions.deleteHotCue(1, hotCueKeys2[e.key.toLowerCase()]);
        else actions.jumpToHotCue(1, hotCueKeys2[e.key.toLowerCase()]);
      }
      if (e.code === "Enter") actions.togglePlay(1);

      // Mixer Controls
      if (["1", "2"].includes(e.key)) actions.setActiveChannel(parseInt(e.key));

      if (e.key === "ArrowUp")
        actions.setChannelGain(
          activeChannel,
          Math.min(1, mixer.channels[activeChannel].gain + 0.05),
        );
      if (e.key === "ArrowDown")
        actions.setChannelGain(
          activeChannel,
          Math.max(0, mixer.channels[activeChannel].gain - 0.05),
        );

      if (e.key.toLowerCase() === "r")
        actions.setChannelEq(
          activeChannel,
          "high",
          Math.min(1, mixer.channels[activeChannel].eq.high + 0.05),
        );
      if (e.key.toLowerCase() === "f")
        actions.setChannelEq(
          activeChannel,
          "mid",
          Math.min(1, mixer.channels[activeChannel].eq.mid + 0.05),
        );
      if (e.key.toLowerCase() === "v")
        actions.setChannelEq(
          activeChannel,
          "low",
          Math.min(1, mixer.channels[activeChannel].eq.low + 0.05),
        );

      if (e.code === "Tab") {
        e.preventDefault();
        actions.setCrossfader(mixer.crossfader < 0 ? 1 : -1);
      }

      if (e.key.toLowerCase() === "h") actions.toggleChannelCue(activeChannel);
    },
    [store],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeydown);
    return () => {
      window.removeEventListener("keydown", handleKeydown);
    };
  }, [handleKeydown]);

  return (
    <div className="min-h-screen bg-gray-900 bg-opacity-90 bg-[radial-gradient(#111_1px,transparent_1px)] [background-size:16px_16px] text-white flex flex-col items-center justify-center p-2 font-sans overflow-hidden">
      <div className="w-full max-w-[1800px] flex flex-col items-center gap-2 p-4 bg-black/50 rounded-xl border border-gray-700 shadow-2xl shadow-cyan-500/10">
        <CentralDisplay useStore={store} />
        <div className="w-full flex justify-between gap-2">
          <Player deckId={0} useStore={store} />
          <Mixer useStore={store} />
          <Player deckId={1} useStore={store} />
        </div>
      </div>
      <footer className="text-gray-500 text-xs mt-4">
        <p>
          AI DJ Mix Console. Based on Pioneer DJ CDJ-3000 & DJM-A9. Keyboard
          controls are active.
        </p>
      </footer>
    </div>
  );
};

export default App;
