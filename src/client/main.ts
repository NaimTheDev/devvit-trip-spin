import { Scene } from './globe/Scene';
import { Globe } from './globe/Globe';
import { Camera } from './globe/Camera';
import { UIController } from './ui/UIController';
import { useGameStore, GameState } from './store/gameStore';

interface GameStoreState {
  currentState: GameState;
  currentCountry: string;
  isSpinning: boolean;
}

class TravelRouletteApp {
  private scene: Scene;
  private globe: Globe;
  private camera: Camera;
  private uiController: UIController;

  constructor() {
    this.scene = new Scene();
    this.globe = new Globe(this.scene.instance);
    this.camera = new Camera();
    this.uiController = new UIController();

    this.setupGameStoreSubscription();
    this.setupEventListeners();
    this.animate();
  }

  private setupGameStoreSubscription() {
    useGameStore.subscribe((state, prevState) => {
      this.uiController.updateUI(state);

      this.handleStateChange(state, prevState);
    });
  }

  private handleStateChange(state: GameStoreState, prevState: GameStoreState) {
    const { currentState } = state;

    switch (currentState) {
      case GameState.SPINNING:
        this.globe.startSpin(0.08);
        break;

      case GameState.ZOOMING:
        this.globe.slowSpin(0.03);
        this.camera.zoomIn();
        // Change background and show rim after a delay
        setTimeout(() => {
          this.scene.setBackgroundColor(0x2d3748);
          this.globe.showRim();
        }, 500);
        break;

      case GameState.RESULT:
        this.globe.stopSpin();
        break;

      case GameState.IDLE:
        if (prevState.currentState === GameState.ZOOMING) {
          this.camera.zoomOut();
          this.globe.hideRim();
          this.scene.setBackgroundColor(0x7fb8e5);
        }
        break;
    }
  }

  private setupEventListeners() {
    document.querySelector('.spin-button')?.addEventListener('click', () => {
      const { currentState, startSpin, resetToIdle } = useGameStore.getState();

      if (currentState === GameState.RESULT) {
        resetToIdle();
      } else if (currentState === GameState.IDLE) {
        void startSpin();
      }
    });

    window.addEventListener('resize', () => {
      this.camera.handleResize();
      this.scene.handleResize();
    });
  }

  private animate = () => {
    requestAnimationFrame(this.animate);

    this.globe.update();
    this.camera.update();
    this.scene.render(this.camera.instance);
  };
}

// Initialize app when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new TravelRouletteApp();
  });
} else {
  new TravelRouletteApp();
}
