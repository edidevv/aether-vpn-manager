class SoundEngine {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    try {
      // @ts-ignore
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    } catch (e) {}
  }

  setEnabled(val: boolean) {
    this.enabled = val;
    if (val && this.ctx?.state === 'suspended') this.ctx.resume();
  }

  private osc(type: OscillatorType, freq: number, dur: number) {
      if (!this.enabled || !this.ctx) return;
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq, this.ctx.currentTime);
      o.connect(g); g.connect(this.ctx.destination);
      g.gain.setValueAtTime(0.1, this.ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
      o.start(); o.stop(this.ctx.currentTime + dur);
  }

  playHover() { this.osc('sine', 800, 0.05); }
  playClick() { this.osc('triangle', 600, 0.1); }
  playConnect() {
      if (!this.enabled || !this.ctx) return;
      [440, 554, 659].forEach((f,i) => setTimeout(() => this.osc('sine', f, 0.5), i*100));
  }
  playDisconnect() {
      if (!this.enabled || !this.ctx) return;
      this.osc('sawtooth', 200, 0.4);
  }

  // ALARMA PENTRU LEAK
  playAlarm() {
      if (!this.enabled || !this.ctx) return;
      const t = this.ctx.currentTime;
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(800, t);
      o.frequency.linearRampToValueAtTime(400, t + 0.3); // Sirena descrescatoare

      g.gain.setValueAtTime(0.1, t);
      g.gain.linearRampToValueAtTime(0, t + 0.3);

      o.connect(g); g.connect(this.ctx.destination);
      o.start(); o.stop(t + 0.3);
  }
}
export const sfx = new SoundEngine();