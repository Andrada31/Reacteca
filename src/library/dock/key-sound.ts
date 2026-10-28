let audio: AudioContext | null = null;
let output: AudioNode | null = null;
let touchNoise: AudioBuffer | null = null;

/** Overall loudness, 0–1. */
const volume = 0.4;
/** Everything above this is rolled off; lower is softer and more muffled. */
const softness = 4000;

/** The click's body: [frequency in Hz, level, fade time constant in seconds]. */
const body = [
  [2000, 0.14, 0.006],
  [1050, 0.1, 0.004],
] as const;

/**
 * A soft, dry tick like a phone's default keyboard click: a 3ms burst of noise (the touch) over
 * two fixed tones that fade within a few milliseconds, giving it a small, woody body, all through
 * a low-pass filter that takes off the harsh top. Synthesised, so there's no audio file to ship.
 *
 * Browsers only allow sound after the user has clicked or typed on the page, so until then
 * this stays silent (and doesn't queue up clicks for later).
 */
export function playKeySound() {
  if (typeof AudioContext === 'undefined') return;
  if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return;
  audio ??= new AudioContext();
  if (audio.state === 'suspended') void audio.resume();

  if (!output) {
    const soften = audio.createBiquadFilter();
    soften.type = 'lowpass';
    soften.frequency.value = softness;
    const level = audio.createGain();
    level.gain.value = volume;
    soften.connect(level).connect(audio.destination);
    output = soften;
  }

  const now = audio.currentTime;

  // Fixed pitches that start at full level and fade fast, so it ticks rather than rings or bubbles.
  for (const [frequency, level, fade] of body) {
    const tone = audio.createOscillator();
    tone.frequency.value = frequency;
    const gain = audio.createGain();
    gain.gain.setValueAtTime(level, now);
    gain.gain.setTargetAtTime(0, now, fade);
    tone.connect(gain).connect(output);
    tone.start(now);
    tone.stop(now + fade * 8);
  }

  if (!touchNoise) {
    const length = Math.floor(audio.sampleRate * 0.003);
    touchNoise = audio.createBuffer(1, length, audio.sampleRate);
    const data = touchNoise.getChannelData(0);
    for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 2;
  }
  const touch = audio.createBufferSource();
  touch.buffer = touchNoise;
  const crisp = audio.createBiquadFilter();
  crisp.type = 'highpass';
  crisp.frequency.value = 2000;
  const touchGain = audio.createGain();
  touchGain.gain.value = 0.07;
  touch.connect(crisp).connect(touchGain).connect(output);
  touch.start(now);
}
