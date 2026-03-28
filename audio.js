// audio.js — Web Audio API chiptune music engine
// AudioContext is created on first user gesture (browser autoplay policy)

window.AudioEngine = (function () {

  // ── Frequency table ──────────────────────────────────────────────────────
  const FREQ = {
    C3:130.81, D3:146.83, E3:164.81, F3:174.61, G3:196.00, A3:220.00, B3:246.94,
    C4:261.63, D4:293.66, E4:329.63, F4:349.23, G4:392.00, A4:440.00, B4:493.88,
    C5:523.25, D5:587.33, E5:659.25, F5:698.46, G5:783.99, A5:880.00, B5:987.77,
    C6:1046.50,
    // Sharps / flats
    'Cs4':277.18,'Ds4':311.13,'Fs4':369.99,'Gs4':415.30,'As4':466.16,
    'Cs5':554.37,'Ds5':622.25,'Fs5':739.99,'Gs5':830.61,'As5':932.33,
    'Bb3':233.08,'Bb4':466.16,'Bb5':932.33,
    'Eb4':311.13,'Eb5':622.25,'Eb6':1244.51,
    'Ab4':415.30,'Ab5':830.61,
    R: 0  // rest
  };

  // ── Song data ─────────────────────────────────────────────────────────────
  // Each note: ['NOTE', durationInBeats]  (1 beat = 1 quarter note)
  // BPM is set per song.

  const SONGS = {

    // Eine Kleine Nachtmusik K.525 – opening theme, G major
    eine_kleine: {
      bpm: 104,
      notes: [
        // Bars 1-2: Famous fanfare opening
        ['G5',0.5],['G5',0.5],['G5',0.5],['D5',1],['G5',0.5],
        ['Fs5',0.5],['E5',0.5],['D5',2],['R',0.5],
        // Bars 3-4
        ['C5',0.5],['C5',0.5],['C5',0.5],['G4',1],['C5',0.5],
        ['B4',0.5],['A4',0.5],['G4',2],['R',0.5],
        // Bars 5-6: ascending answer
        ['D5',0.5],['D5',0.5],['D5',0.5],['A4',1],['D5',0.5],
        ['C5',0.5],['B4',0.5],['A4',2],['R',0.5],
        // Bars 7-8: resolution
        ['G5',1.5],['Fs5',0.25],['E5',0.25],['D5',0.5],
        ['G4',0.5],['A4',0.5],['B4',0.5],['G4',2],['R',0.5],
        // Second section – lyrical second theme
        ['D5',0.5],['E5',0.5],['D5',0.5],['C5',0.5],
        ['B4',0.5],['C5',0.5],['B4',0.5],['A4',0.5],
        ['G4',2],['R',0.5],
        ['A4',0.5],['B4',0.5],['A4',0.5],['G4',0.5],
        ['Fs4',0.5],['G4',0.5],['Fs4',0.5],['E4',0.5],
        ['D4',2],['R',0.5],
      ]
    },

    // Turkish March K.331 – Rondo alla Turca, A minor
    turkish_march: {
      bpm: 116,
      notes: [
        // Bar 1: A minor opening figure (Gs4 = G# is the characteristic harmonic minor note)
        ['A4',0.25],['B4',0.25],['C5',0.25],['B4',0.25],
        ['A4',0.25],['Gs4',0.25],['A4',0.25],['E5',0.25],
        // Bar 2
        ['A4',0.25],['B4',0.25],['C5',0.25],['B4',0.25],
        ['A4',0.5],['E5',0.5],
        // Bar 3: characteristic upward run
        ['A4',0.25],['B4',0.25],['C5',0.25],['D5',0.25],
        ['E5',0.25],['D5',0.25],['C5',0.25],['B4',0.25],
        // Bar 4
        ['A4',1],['R',0.5],
        // Bar 5: second phrase
        ['C5',0.25],['D5',0.25],['E5',0.25],['D5',0.25],
        ['C5',0.25],['B4',0.25],['C5',0.25],['D5',0.25],
        // Bar 6
        ['C5',0.25],['D5',0.25],['E5',0.25],['D5',0.25],
        ['C5',0.5],['G4',0.5],
        // Bar 7: rising figure
        ['E5',0.25],['Fs5',0.25],['Gs5',0.25],['A5',0.25],
        ['Gs5',0.25],['Fs5',0.25],['E5',0.25],['D5',0.25],
        // Bar 8
        ['C5',0.5],['B4',0.5],['A4',1],
        // Bar 9: major section (A major feel)
        ['A4',0.5],['Cs5',0.5],['E5',0.5],['A5',0.5],
        // Bar 10
        ['Gs5',0.5],['Fs5',0.5],['E5',0.5],['Cs5',0.5],
        // Bar 11
        ['A4',0.5],['Cs5',0.5],['E5',0.5],['Cs5',0.5],
        // Bar 12
        ['A4',2],['R',1],
      ]
    },

    // Symphony No. 40 K.550 – opening, G minor
    symphony_40: {
      bpm: 96,
      notes: [
        // The famous short-short-long motif (G minor)
        ['R',0.5],['G4',0.25],['G4',0.25],
        ['Bb4',2],['A4',1.5],['G4',0.5],
        ['R',0.5],['F4',0.25],['F4',0.25],
        ['Ab4',2],['G4',1.5],['F4',0.5],
        // Development
        ['Eb4',0.5],['Eb4',0.5],['D4',0.5],['D4',0.5],
        ['G4',1.5],['Fs4',0.5],['G4',1],
        ['R',0.5],['D5',0.25],['D5',0.25],
        ['F5',2],['Eb5',1.5],['D5',0.5],
        ['R',0.5],['C5',0.25],['C5',0.25],
        ['Eb5',2],['D5',1.5],['C5',0.5],
        // Resolution
        ['Bb4',0.5],['C5',0.5],['D5',0.5],['Eb5',0.5],
        ['F5',1],['G5',1],
        ['D5',2],['R',1],
      ]
    },

    // Magic Flute Overture K.620 – main theme, Eb major
    magic_flute: {
      bpm: 96,
      notes: [
        // Stately fanfare opening
        ['Eb5',1],['Bb4',0.5],['G4',0.5],
        ['Eb4',1],['Bb3',0.5],['Eb4',0.5],
        ['G4',1],['Bb4',1],
        ['Eb5',2],['R',0.5],
        // Main allegro theme
        ['Eb5',0.5],['Eb5',0.5],['Eb5',0.25],['F5',0.25],['G5',0.5],
        ['G5',0.5],['G5',0.5],['G5',0.25],['Ab5',0.25],['Bb5',0.5],
        ['Bb5',1],['G5',0.5],['Eb5',0.5],
        ['F5',1],['Bb4',1],
        // Second phrase
        ['Eb5',0.5],['D5',0.5],['C5',0.5],['Bb4',0.5],
        ['Ab4',0.5],['G4',0.5],['F4',0.5],['Eb4',0.5],
        ['Bb4',1.5],['G4',0.25],['Bb4',0.25],
        ['Eb5',2],['R',1],
      ]
    }
  };

  // ── Engine state ──────────────────────────────────────────────────────────
  let ctx = null;
  let masterGain = null;
  let loopTimer = null;
  let currentSongKey = null;
  let muted = false;
  let initialized = false;
  let activeOscillators = new Set();

  function init() {
    if (initialized) {
      // Resume if suspended (browser autoplay policy)
      if (ctx && ctx.state === 'suspended') ctx.resume();
      return;
    }
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = ctx.createGain();
      masterGain.gain.value = 0.25;
      masterGain.connect(ctx.destination);
      initialized = true;
    } catch (e) {
      console.warn('Web Audio API not available:', e);
    }
  }

  function playNote(freq, startTime, duration) {
    if (!ctx || !masterGain || freq === 0) return;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();

    osc.type = 'square';
    osc.frequency.value = freq;

    // Gain envelope
    const attack = 0.005;
    const release = Math.min(0.05, duration * 0.15);
    env.gain.setValueAtTime(0, startTime);
    env.gain.linearRampToValueAtTime(0.5, startTime + attack);
    env.gain.setValueAtTime(0.5, startTime + duration - release);
    env.gain.linearRampToValueAtTime(0, startTime + duration);

    osc.connect(env);
    env.connect(masterGain);

    activeOscillators.add(osc);
    osc.onended = () => activeOscillators.delete(osc);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  function scheduleSong(songKey) {
    if (!ctx || !masterGain) return;
    const song = SONGS[songKey];
    if (!song) return;

    const beatSecs = 60 / song.bpm;
    let t = ctx.currentTime + 0.05;

    for (const [note, beats] of song.notes) {
      const dur = beats * beatSecs;
      const freq = FREQ[note] || 0;
      if (freq > 0) {
        playNote(freq, t, dur * 0.88);
      }
      t += dur;
    }

    const totalDur = (t - ctx.currentTime) * 1000;
    loopTimer = setTimeout(() => scheduleSong(songKey), totalDur - 100);
  }

  function stopSong() {
    if (loopTimer !== null) {
      clearTimeout(loopTimer);
      loopTimer = null;
    }
    // Stop all in-flight oscillators immediately
    if (ctx) {
      const now = ctx.currentTime;
      for (const osc of activeOscillators) {
        try { osc.stop(now); } catch(e) { /* already stopped */ }
      }
    }
    activeOscillators.clear();
    currentSongKey = null;
  }

  function playSong(songKey) {
    if (!initialized || muted) return;
    stopSong();
    currentSongKey = songKey;
    scheduleSong(songKey);
  }

  function toggleMute() {
    muted = !muted;
    if (!masterGain) return muted;
    if (muted) {
      masterGain.gain.value = 0;
      stopSong();
    } else {
      masterGain.gain.value = 0.25;
    }
    return muted;
  }

  // Short sfx: collect note, stomp, player hit
  function playSfx(type) {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    if (type === 'collect') {
      playNote(FREQ['E5'], t,       0.06);
      playNote(FREQ['G5'], t+0.07,  0.06);
      playNote(FREQ['B5'], t+0.14,  0.10);
    } else if (type === 'stomp') {
      playNote(FREQ['C5'], t,       0.05);
      playNote(FREQ['G4'], t+0.06,  0.10);
    } else if (type === 'hit') {
      playNote(FREQ['A3'], t,       0.08);
      playNote(FREQ['Eb4'], t+0.09, 0.10);
    } else if (type === 'jump') {
      playNote(FREQ['C5'], t,       0.04);
      playNote(FREQ['E5'], t+0.05,  0.04);
    } else if (type === 'levelup') {
      playNote(FREQ['C5'], t,       0.1);
      playNote(FREQ['E5'], t+0.12,  0.1);
      playNote(FREQ['G5'], t+0.24,  0.1);
      playNote(FREQ['C6'], t+0.36,  0.2);
    } else if (type === 'win') {
      playNote(FREQ['G5'], t,       0.12);
      playNote(FREQ['A5'], t+0.13,  0.12);
      playNote(FREQ['B5'], t+0.26,  0.12);
      playNote(FREQ['C6'], t+0.39,  0.25);
    }
  }

  return { init, playSong, stopSong, toggleMute, playSfx,
           isMuted() { return muted; },
           getCurrentSong() { return currentSongKey; },
           playPianoNote(noteKey, durationSecs) {
             if (!initialized) return;
             if (ctx && ctx.state === 'suspended') ctx.resume();
             const freq = FREQ[noteKey] || 0;
             if (freq) playNote(freq, ctx.currentTime + 0.01, durationSecs || 0.4);
           } };
})();
