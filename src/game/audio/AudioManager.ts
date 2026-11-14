// Web Audio API Procedural Sound Engine for MARS OPS

class MarsAudioManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  
  // Ambient nodes
  private windNode: AudioBufferSourceNode | null = null;
  private windFilter: BiquadFilterNode | null = null;
  private generatorOsc: OscillatorNode | null = null;
  private generatorGain: GainNode | null = null;
  private alarmOsc: OscillatorNode | null = null;
  private alarmGain: GainNode | null = null;
  private isAlarmPlaying: boolean = false;

  private breathingInterval: number | null = null;

  public init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
      this.ambientGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.startMartianWind();
      this.startGeneratorHum();
      this.startBreathingCycle();
    } catch (e) {
      console.warn('AudioContext failed to initialize:', e);
    }
  }

  public resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.8, this.ctx.currentTime);
    }
  }

  public setMasterVolume(vol: number) {
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, vol)), this.ctx.currentTime);
    }
  }

  public setAmbientVolume(vol: number) {
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setValueAtTime(Math.max(0, Math.min(1, vol)), this.ctx.currentTime);
    }
  }

  public setSfxVolume(vol: number) {
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(Math.max(0, Math.min(1, vol)), this.ctx.currentTime);
    }
  }

  // --- AMBIENT SOUNDS ---

  private createNoiseBuffer(seconds: number = 3): AudioBuffer {
    if (!this.ctx) throw new Error('No audio context');
    const bufferSize = this.ctx.sampleRate * seconds;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      // Brown noise for wind
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5; // Gain boost
    }
    return buffer;
  }

  private startMartianWind() {
    if (!this.ctx || !this.ambientGain) return;
    try {
      const buffer = this.createNoiseBuffer(5);
      this.windNode = this.ctx.createBufferSource();
      this.windNode.buffer = buffer;
      this.windNode.loop = true;

      this.windFilter = this.ctx.createBiquadFilter();
      this.windFilter.type = 'bandpass';
      this.windFilter.frequency.setValueAtTime(260, this.ctx.currentTime);
      this.windFilter.Q.setValueAtTime(3.0, this.ctx.currentTime);

      const windGain = this.ctx.createGain();
      windGain.gain.setValueAtTime(0.35, this.ctx.currentTime);

      this.windNode.connect(this.windFilter);
      this.windFilter.connect(windGain);
      windGain.connect(this.ambientGain);

      this.windNode.start();

      // Low frequency wind gust oscillation
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(0.15, this.ctx.currentTime);
      lfoGain.gain.setValueAtTime(150, this.ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(this.windFilter.frequency);
      lfo.start();
    } catch (e) {
      console.warn('Failed to start wind audio:', e);
    }
  }

  public setStormWindIntensity(intensity: number) {
    if (!this.ctx || !this.windFilter) return;
    // intensity 0 to 1
    const targetFreq = 260 + intensity * 600;
    const targetQ = 3.0 - intensity * 1.5;
    this.windFilter.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.5);
    this.windFilter.Q.setTargetAtTime(targetQ, this.ctx.currentTime, 0.5);
  }

  private startGeneratorHum() {
    if (!this.ctx || !this.ambientGain) return;
    try {
      this.generatorOsc = this.ctx.createOscillator();
      this.generatorGain = this.ctx.createGain();

      this.generatorOsc.type = 'triangle';
      this.generatorOsc.frequency.setValueAtTime(55, this.ctx.currentTime); // 55Hz low hum
      this.generatorGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

      this.generatorOsc.connect(this.generatorGain);
      this.generatorGain.connect(this.ambientGain);
      this.generatorOsc.start();
    } catch (e) {
      console.warn('Generator hum error:', e);
    }
  }

  private startBreathingCycle() {
    if (this.breathingInterval) clearInterval(this.breathingInterval);
    this.breathingInterval = window.setInterval(() => {
      this.playSpacesuitBreath();
    }, 7000);
  }

  public playSpacesuitBreath() {
    if (!this.ctx || !this.ambientGain || this.isMuted) return;
    try {
      const buffer = this.createNoiseBuffer(1.4);
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.06, now + 0.6);
      gain.gain.linearRampToValueAtTime(0.001, now + 1.4);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.ambientGain);

      source.start(now);
      source.stop(now + 1.5);
    } catch {
      // ignore
    }
  }

  // --- SOUND EFFECTS ---

  public playFootstep() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    try {
      const bufferSize = this.ctx.sampleRate * 0.08;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }

      const source = this.ctx.createBufferSource();
      source.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(350 + Math.random() * 100, this.ctx.currentTime);
      filter.Q.setValueAtTime(1.5, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      source.start();
    } catch {
      // ignore
    }
  }

  public playUiClick() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.04);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch {
      // ignore
    }
  }

  public playInteract() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.13);
    } catch {
      // ignore
    }
  }

  public playMineRock() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      // Thud + crack
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.12);
      oscGain.gain.setValueAtTime(0.3, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(oscGain);
      oscGain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.13);

      // Crunch noise
      const buffer = this.createNoiseBuffer(0.1);
      const src = this.ctx.createBufferSource();
      src.buffer = buffer;
      const f = this.ctx.createBiquadFilter();
      f.type = 'highpass';
      f.frequency.setValueAtTime(1200, now);
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.25, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      src.connect(f);
      f.connect(g);
      g.connect(this.sfxGain);
      src.start(now);
      src.stop(now + 0.1);
    } catch {
      // ignore
    }
  }

  public playRepairSpark() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(1200 + Math.random() * 800, now);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.09);
    } catch {
      // ignore
    }
  }

  public playSuccessChime() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      const now = this.ctx.currentTime;
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.09);

        gain.gain.setValueAtTime(0, now + idx * 0.09);
        gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.09 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.4);

        osc.connect(gain);
        gain.connect(this.sfxGain!);

        osc.start(now + idx * 0.09);
        osc.stop(now + idx * 0.09 + 0.45);
      });
    } catch {
      // ignore
    }
  }

  public playConstruct() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.linearRampToValueAtTime(600, now + 0.18);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch {
      // ignore
    }
  }

  public playAirVent() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    try {
      const buffer = this.createNoiseBuffer(0.8);
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, this.ctx.currentTime);
      filter.Q.setValueAtTime(2.0, this.ctx.currentTime);
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.35, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);
      source.start(now);
      source.stop(now + 0.85);
    } catch {
      // ignore
    }
  }

  public playGeneratorLoop() {
    this.playSuccessChime();
    this.playRepairSpark();
  }

  public playAlarm(active: boolean) {
    if (!this.ctx || !this.sfxGain) return;
    if (active && !this.isAlarmPlaying) {
      this.isAlarmPlaying = true;
      try {
        this.alarmOsc = this.ctx.createOscillator();
        this.alarmGain = this.ctx.createGain();
        this.alarmOsc.type = 'sawtooth';
        
        // Warble between 700Hz and 950Hz
        const now = this.ctx.currentTime;
        this.alarmOsc.frequency.setValueAtTime(750, now);
        
        const lfo = this.ctx.createOscillator();
        lfo.frequency.setValueAtTime(2.5, now);
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.setValueAtTime(200, now);
        lfo.connect(lfoGain);
        lfoGain.connect(this.alarmOsc.frequency);
        lfo.start(now);

        this.alarmGain.gain.setValueAtTime(this.isMuted ? 0 : 0.2, now);
        this.alarmOsc.connect(this.alarmGain);
        this.alarmGain.connect(this.sfxGain);
        this.alarmOsc.start(now);
      } catch {
        // ignore
      }
    } else if (!active && this.isAlarmPlaying) {
      this.isAlarmPlaying = false;
      if (this.alarmOsc) {
        try {
          this.alarmOsc.stop();
          this.alarmOsc.disconnect();
          this.alarmOsc = null;
        } catch {
          // ignore
        }
      }
    }
  }
}

export const audioManager = new MarsAudioManager();

