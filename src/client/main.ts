import { Scene } from './globe/Scene';
import { Globe } from './globe/Globe';
import { Camera } from './globe/Camera';
import { UIController } from './ui/UIController';
import { useGameStore, GameState } from './store/gameStore';
import { LocationService, type SelectedLocation } from './utils/LocationService';

type GameStoreState = {
  currentState: GameState;
  currentLocation: SelectedLocation | null;
  isSpinning: boolean;
};

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

    void this.initializeLocationService();
    this.setupGameStoreSubscription();
    this.setupEventListeners();
    this.animate();
  }

  private async initializeLocationService() {
    try {
      const locationService = LocationService.getInstance();
      await locationService.loadLocations();
      console.log(
        `Location service initialized with ${locationService.getLocationCount()} locations`
      );
    } catch (error) {
      console.error('Failed to initialize location service:', error);
    }
  }

  private setupGameStoreSubscription() {
    useGameStore.subscribe((state) => {
      this.uiController.updateUI(state);
      this.handleStateChange(state);
    });
  }

  private handleStateChange(state: GameStoreState) {
    const { currentState, currentLocation } = state;

    switch (currentState) {
      case GameState.SPINNING:
        this.globe.startSpin(0.08);
        break;

      case GameState.ZOOMING:
        this.globe.slowSpin(0.03);
        this.camera.zoomIn();

        // Zoom to the selected location if available
        if (
          currentLocation &&
          currentLocation.latitude !== undefined &&
          currentLocation.longitude !== undefined
        ) {
          this.globe.zoomToLocation(currentLocation.latitude, currentLocation.longitude);
        }

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
        this.camera.zoomOut();
        this.globe.hideRim();
        this.globe.resetRotation();
        this.scene.setBackgroundColor(0x7fb8e5);
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
