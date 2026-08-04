class SoundManager {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  init() {
    if (!this.ctx) {
      try {
        this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (e) {
        console.warn('AudioContext not supported');
      }
    }
  }

  toggle(enabled: boolean) {
    this.enabled = enabled;
  }

  private playTone(freq: number, type: OscillatorType, duration: number, vol: number = 0.1, sweep?: number) {
    if (!this.enabled || !this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    if (sweep) {
      osc.frequency.exponentialRampToValueAtTime(sweep, this.ctx.currentTime + duration);
    }

    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playDealingCards() {
    if (!this.enabled) return;
    const audio = new Audio('/cards/freesound_community-shuffle-cards-46455.mp3');
    audio.volume = 0.5;
    audio.play().catch(e => console.warn('Failed to play dealing cards sound', e));
  }

  playSingleCard() {
    if (!this.enabled) return;
    const audio = new Audio('/cards/oxidvideos-taking-playing-card-2-522516.mp3');
    audio.volume = 0.5;
    audio.play().catch(e => console.warn('Failed to play single card sound', e));
  }

  playCommunityCardsDeal(count: number) {
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        this.playSingleCard();
      }, i * 200);
    }
  }

  playCardDeal() {
    this.playSingleCard();
  }

  playChipsDrop(count: number) {
    if (!this.enabled) return;
    const CHIP_SOUNDS = [
      '/fichas/oxidvideos-placing-poker-chips-522515.mp3',
      '/fichas/oxidvideos-placing-poker-chips-522521.mp3',
      '/fichas/oxidvideos-placing-poker-chips-522523.mp3',
      '/fichas/oxidvideos-poker-chips-522517.mp3',
      '/fichas/freesound_community-handfull-of-poker-chips-95810.mp3',
      '/fichas/freesound_community-allinpushchips2-39133.mp3'
    ];

    const randomSound = CHIP_SOUNDS[Math.floor(Math.random() * CHIP_SOUNDS.length)];
    const audio = new Audio(randomSound);
    audio.volume = 0.6;
    audio.play().catch(e => console.warn('Failed to play chip sound', e));

    if (count >= 12) {
      setTimeout(() => {
        const anotherSound = CHIP_SOUNDS[Math.floor(Math.random() * CHIP_SOUNDS.length)];
        const audio2 = new Audio(anotherSound);
        audio2.volume = 0.6;
        audio2.play().catch(e => console.warn('Failed to play chip sound 2', e));
      }, 150);
    }
  }

  playAllInChips() {
    if (!this.enabled) return;
    const audio = new Audio('/fichas/freesound_community-allinpushchips2-39133.mp3');
    audio.volume = 0.7;
    audio.play().catch(e => console.warn('Failed to play all in chips sound', e));
  }

  playAction(action: 'fold' | 'check' | 'call' | 'raise' | 'allin') {
    switch (action) {
      case 'fold':
        this.playTone(200, 'triangle', 0.2, 0.1, 100);
        break;
      case 'check':
        this.playTone(400, 'sine', 0.1, 0.05);
        break;
      case 'call':
        this.playChipsDrop(Math.floor(Math.random() * 2) + 3);
        break;
      case 'raise':
        this.playChipsDrop(Math.floor(Math.random() * 3) + 5);
        break;
      case 'allin':
        this.playAllInChips();
        break;
    }
  }

  playWin() {
    this.playTone(523.25, 'sine', 0.1, 0.1); // C5
    setTimeout(() => this.playTone(659.25, 'sine', 0.1, 0.1), 100); // E5
    setTimeout(() => this.playTone(783.99, 'sine', 0.2, 0.1), 200); // G5
    setTimeout(() => this.playTone(1046.50, 'sine', 0.4, 0.1), 300); // C6
  }

  playWinnerGlow() {
    // Subtle shimmering chime using multiple high-pitched low-volume tones
    this.playTone(1046.50, 'triangle', 0.5, 0.05, 1200);
    setTimeout(() => this.playTone(1318.51, 'triangle', 0.5, 0.03, 1500), 100);
    setTimeout(() => this.playTone(1567.98, 'triangle', 0.5, 0.02, 1700), 200);
  }
}

export const sounds = new SoundManager();
