# ✅ TODO: Pioneer XDJ-RR Web-Nachbildung

Eine moderne, browserbasierte DJ-App in React (TypeScript), die den Pioneer XDJ-RR Controller funktional und optisch nachbildet. Modernes UI-Design bleibt erhalten, aber Struktur und Komponenten werden entsprechend umgebaut.

---

## 🧱 Komponentenstruktur aufbauen
- [x] `/CentralDisplay` – zentrales Display für beide Decks mit Waveforms & Infos
- [x] `/Deck` – links/rechts Player-Sektion mit Jogwheel, Transport, Pads etc.
- [x] `/Mixer` – zentrale Mixer-Sektion (2-Kanal + Crossfader, EQ, Color FX)
- [x] `/FX` – Beat FX Sektion mit Effektwahl, Beat-Längen, Depth-Fader
- [x] `/Clock` – zentrale BPM/Sync/Phase Clock
- [x] `/Recording` – Aufnahmefunktion mit `.wav`-Export

---

## 🖥️ CentralDisplay (zentral oben)
- [x] Zeige beide Wellenformen nebeneinander
- [x] Zeige Tracktitel, BPM, Key, Rest-/Laufzeit je Deck
- [-] Optional: Deckfarbe / Cover-Bild / Playhead / Beatgrid

## 🎛️ Decks (links & rechts)
- [-] Jogwheel mit Scratch (VINYL), Pitch Bend, Frame Search
- [-] Buttons: Play, Cue, SYNC, MASTER, MASTER TEMPO
- [x] TEMPO-Fader + RANGE-Button
- [-] Performance-Pads (8x) mit Modi: HOT CUE, BEAT LOOP, SLIP LOOP, BEAT JUMP
- [-] Loop-Controls: In, Out, Reloop/Exit, Auto-Loop, 1/2x, 2x
- [ ] CUE/LOOP Memory, Delete

## 🎚️ Mixer (zentral)
- [x] CH1 & CH2 mit Gain, High/Mid/Low EQ, Volume, Cue, Color FX
- [x] Crossfader
- [-] Master Volume & Booth Volume
- [ ] Optional: VU-Meter pro Kanal

## 🎛️ FX Sektion
- [x] Dropdown zur Effektwahl (Echo, Spiral, Reverb, etc.)
- [x] Beatlängen (1/8 bis 8 Beats)
- [x] Depth/Level-Fader
- [x] FX ON/OFF Button
- [x] Kanal-Zuweisung: CH1, CH2, MASTER, MIC

## ⏱️ Sync-System
- [x] MasterClock mit BPM-Regelung
- [x] SYNC pro Deck (Tempo & Phase syncen)
- [x] MASTER-Button zur Clock-Übernahme
- [-] Visualisierung der BPM & Sync-Zustände

## 🎙️ Aufnahmefunktion
- [x] Aufnahme funktioniert bereits ✔
- [x] `.wav`-Datei beim Stop automatisch generieren und downloaden
- [x] Buttons: Start Recording / Stop Recording
- [ ] Optional: Live-Anzeige von Dauer, Pegel, Dateigröße

---

## 💡 Codex-Hinweise
- Kein Backend, keine Datenbank – alles rein im Browser
- Nur Web Audio API (keine Drittanbieter-Audio-Libs)
- Routing: Deck → FX → Mixer-Kanal → Master → RecorderNode
- Zustand mit Zustand.js managen: `bpm`, `fxState`, `recordingState`, `activeLoop`, `hotCues`

---

**Ziel:** Eine voll funktionsfähige DJ-Konsole im Browser, die den Pioneer XDJ-RR originalgetreu simuliert, aber mit modernem, anpassbarem Frontend umgesetzt ist.
