import lottie, { AnimationItem } from 'lottie-web';

export class LoadingAnimation {
  private animation: AnimationItem | null = null;
  private container: HTMLElement | null = null;

  constructor() {}

  async show(): Promise<void> {
    // Create loading overlay
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      backdrop-filter: blur(10px);
    `;

    // Create animation container
    this.container = document.createElement('div');
    this.container.style.cssText = `
      width: 200px;
      height: 200px;
      margin-bottom: 20px;
    `;

    // Create loading text
    const loadingText = document.createElement('div');
    loadingText.textContent = 'Planning your adventure...';
    loadingText.style.cssText = `
      color: white;
      font-size: 1.2rem;
      font-weight: 600;
      text-align: center;
      animation: pulse 2s infinite;
    `;

    // Add pulse animation CSS
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0%, 100% { opacity: 0.6; }
        50% { opacity: 1; }
      }
    `;
    document.head.appendChild(style);

    overlay.appendChild(this.container);
    overlay.appendChild(loadingText);
    document.body.appendChild(overlay);

    // Load and play Lottie animation
    try {
      this.animation = lottie.loadAnimation({
        container: this.container,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: '/loading-animation.json', // Path to our Lottie file
      });
    } catch (error) {
      console.warn('Could not load Lottie animation, using fallback:', error);
      // Fallback: simple spinning globe emoji
      this.container.innerHTML = `
        <div style="
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 4rem;
          animation: spin 2s linear infinite;
        ">🌍</div>
      `;

      const spinStyle = document.createElement('style');
      spinStyle.textContent = `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(spinStyle);
    }
  }

  hide(): void {
    // Remove the loading overlay
    const overlay = document.querySelector('.loading-overlay');
    if (overlay) {
      overlay.remove();
    }

    // Destroy Lottie animation
    if (this.animation) {
      this.animation.destroy();
      this.animation = null;
    }

    this.container = null;
  }

  updateText(text: string): void {
    const overlay = document.querySelector('.loading-overlay');
    const loadingText = overlay?.querySelector('div:last-child');
    if (loadingText) {
      loadingText.textContent = text;
    }
  }
}
