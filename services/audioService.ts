
class AudioService {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private playTone(freq: number, type: OscillatorType, duration: number, volume: number = 0.1) {
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playWater() {
    this.playTone(400, 'sine', 0.3, 0.1);
    setTimeout(() => this.playTone(600, 'sine', 0.3, 0.08), 100);
  }

  playSun() {
    this.playTone(800, 'triangle', 0.4, 0.05);
    setTimeout(() => this.playTone(1000, 'triangle', 0.4, 0.03), 150);
  }

  playLove() {
    this.playTone(523.25, 'sine', 0.5, 0.1); // C5
    setTimeout(() => this.playTone(659.25, 'sine', 0.5, 0.08), 100); // E5
    setTimeout(() => this.playTone(783.99, 'sine', 0.5, 0.06), 200); // G5
  }
}

export const audioService = new AudioService();
