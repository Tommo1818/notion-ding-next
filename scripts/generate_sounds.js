const fs = require("fs");
const path = require("path");

const sampleRate = 44100;

function createWavBuffer(numSamples, sampleGenerator) {
  const buffer = Buffer.alloc(44 + numSamples * 2);

  // RIFF header
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + numSamples * 2, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size
  buffer.writeUInt16LE(1, 20);  // PCM format
  buffer.writeUInt16LE(1, 22);  // Mono
  buffer.writeUInt32LE(sampleRate, 24); // Sample rate
  buffer.writeUInt32LE(sampleRate * 2, 28); // Byte rate
  buffer.writeUInt16LE(2, 32);  // Block align
  buffer.writeUInt16LE(16, 34); // Bits per sample
  buffer.write("data", 36);
  buffer.writeUInt32LE(numSamples * 2, 40);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let sample = sampleGenerator(t, i, numSamples);
    // Clamp to [-1.0, 1.0]
    sample = Math.max(-1.0, Math.min(1.0, sample));
    const intSample = Math.floor(sample * 32767);
    buffer.writeInt16LE(intSample, 44 + i * 2);
  }

  return buffer;
}

const assetsDir = path.resolve(__dirname, "../assets");

// 1. Marimba Chime: Warm, woody fundamental with rich harmonic ratios (1.0, 3.98, 9.2) and quick acoustic decay
const marimbaDuration = 0.45;
const marimbaSamples = Math.floor(sampleRate * marimbaDuration);
const marimbaBuf = createWavBuffer(marimbaSamples, (t) => {
  const baseFreq = 523.25; // C5
  const decay1 = Math.exp(-t * 9);
  const decay2 = Math.exp(-t * 22);
  const decay3 = Math.exp(-t * 38);

  const sig =
    0.65 * Math.sin(2 * Math.PI * baseFreq * t) * decay1 +
    0.25 * Math.sin(2 * Math.PI * baseFreq * 3.98 * t) * decay2 +
    0.10 * Math.sin(2 * Math.PI * baseFreq * 9.2 * t) * decay3;

  return sig * 0.9;
});
fs.writeFileSync(path.join(assetsDir, "marimba.wav"), marimbaBuf);
console.log("  [OK] Generated assets/marimba.wav");

// 2. Subtle Pop: Clean, gentle low-passed frequency sweep (bubble / UI pop)
const popDuration = 0.14;
const popSamples = Math.floor(sampleRate * popDuration);
const popBuf = createWavBuffer(popSamples, (t) => {
  // Pitch sweeps down quickly from 650 Hz to 240 Hz
  const freq = 240 + 410 * Math.exp(-t * 45);
  const env = Math.sin((t / popDuration) * Math.PI) * Math.exp(-t * 18);
  const sig = Math.sin(2 * Math.PI * freq * t) * env;
  return sig * 0.95;
});
fs.writeFileSync(path.join(assetsDir, "pop.wav"), popBuf);
console.log("  [OK] Generated assets/pop.wav");

// 3. Mechanical Click: Crisp tactile switch click with crisp impact and short resonance
const clickDuration = 0.08;
const clickSamples = Math.floor(sampleRate * clickDuration);
const clickBuf = createWavBuffer(clickSamples, (t) => {
  const noise = (Math.random() * 2 - 1) * Math.exp(-t * 120);
  const clickTone = Math.sin(2 * Math.PI * 1800 * t) * Math.exp(-t * 90);
  const lowThump = Math.sin(2 * Math.PI * 450 * t) * Math.exp(-t * 50);
  return (noise * 0.4 + clickTone * 0.45 + lowThump * 0.35) * 0.85;
});
fs.writeFileSync(path.join(assetsDir, "click.wav"), clickBuf);
console.log("  [OK] Generated assets/click.wav");

// 4. Zen Bowl: Soothing resonant bell chime with shimmering beating sines
const zenDuration = 0.9;
const zenSamples = Math.floor(sampleRate * zenDuration);
const zenBuf = createWavBuffer(zenSamples, (t) => {
  const f1 = 587.33; // D5
  const f2 = 589.50; // slight beat frequency (2.17 Hz)
  const f3 = 1174.66; // D6 octave harmonic
  const decay = Math.exp(-t * 3.2);

  const sig =
    0.50 * Math.sin(2 * Math.PI * f1 * t) * decay +
    0.40 * Math.sin(2 * Math.PI * f2 * t) * decay +
    0.15 * Math.sin(2 * Math.PI * f3 * t) * Math.exp(-t * 6);

  return sig * 0.85;
});
fs.writeFileSync(path.join(assetsDir, "zen.wav"), zenBuf);
console.log("  [OK] Generated assets/zen.wav");

console.log("All sound library WAV assets generated successfully!");
