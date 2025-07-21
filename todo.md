# ✅ TODO: Pioneer XDJ-RR Web-Nachbildung

Eine moderne, browserbasierte DJ-App in React (TypeScript), die den Pioneer XDJ-RR Controller funktional und optisch nachbildet. Modernes UI-Design bleibt erhalten, aber Struktur und Komponenten werden entsprechend umgebaut.

---

## 🧱 Komponentenstruktur aufbauen
- [ ] `/CentralDisplay` – zentrales Display für beide Decks mit Waveforms & Infos
- [ ] `/Deck` – links/rechts Player-Sektion mit Jogwheel, Transport, Pads etc.
- [ ] `/Mixer` – zentrale Mixer-Sektion (2-Kanal + Crossfader, EQ, Color FX)
- [ ] `/FX` – Beat FX Sektion mit Effektwahl, Beat-Längen, Depth-Fader
- [ ] `/Clock` – zentrale BPM/Sync/Phase Clock
- [ ] `/Recording` – Aufnahmefunktion mit `.wav`-Export

---

## 🖥️ CentralDisplay (zentral oben)
- [ ] Zeige beide Wellenformen nebeneinander
- [ ] Zeige Tracktitel, BPM, Key, Rest-/Laufzeit je Deck
- [ ] Optional: Deckfarbe / Cover-Bild / Playhead / Beatgrid

## 🎛️ Decks (links & rechts)
- [ ] Jogwheel mit Scratch (VINYL), Pitch Bend, Frame Search
- [ ] Buttons: Play, Cue, SYNC, MASTER, MASTER TEMPO
- [ ] TEMPO-Fader + RANGE-Button
- [ ] Performance-Pads (8x) mit Modi: HOT CUE, BEAT LOOP, SLIP LOOP, BEAT JUMP
- [ ] Loop-Controls: In, Out, Reloop/Exit, Auto-Loop, 1/2x, 2x
- [ ] CUE/LOOP Memory, Delete

## 🎚️ Mixer (zentral)
- [ ] CH1 & CH2 mit Gain, High/Mid/Low EQ, Volume, Cue, Color FX
- [ ] Crossfader
- [ ] Master Volume & Booth Volume
- [ ] Optional: VU-Meter pro Kanal

## 🎛️ FX Sektion
- [ ] Dropdown zur Effektwahl (Echo, Spiral, Reverb, etc.)
- [ ] Beatlängen (1/8 bis 8 Beats)
- [ ] Depth/Level-Fader
- [ ] FX ON/OFF Button
- [ ] Kanal-Zuweisung: CH1, CH2, MASTER, MIC

## ⏱️ Sync-System
- [ ] MasterClock mit BPM-Regelung
- [ ] SYNC pro Deck (Tempo & Phase syncen)
- [ ] MASTER-Button zur Clock-Übernahme
- [ ] Visualisierung der BPM & Sync-Zustände

## 🎙️ Aufnahmefunktion
- [x] Aufnahme funktioniert bereits ✔
- [ ] `.wav`-Datei beim Stop automatisch generieren und downloaden
- [ ] Buttons: Start Recording / Stop Recording
- [ ] Optional: Live-Anzeige von Dauer, Pegel, Dateigröße

---

## 💡 Codex-Hinweise
- Kein Backend, keine Datenbank – alles rein im Browser
- Nur Web Audio API (keine Drittanbieter-Audio-Libs)
- Routing: Deck → FX → Mixer-Kanal → Master → RecorderNode
- Zustand mit Zustand.js managen: `bpm`, `fxState`, `recordingState`, `activeLoop`, `hotCues`

---

**Ziel:** Eine voll funktionsfähige DJ-Konsole im Browser, die den Pioneer XDJ-RR originalgetreu simuliert, aber mit modernem, anpassbarem Frontend umgesetzt ist.
