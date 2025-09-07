import * as THREE from 'three';

export class Scene {
  public instance: THREE.Scene;
  private renderer!: THREE.WebGLRenderer;
  private ambientLight!: THREE.AmbientLight;
  private directionalLight!: THREE.DirectionalLight;

  constructor() {
    this.instance = new THREE.Scene();
    this.setupRenderer();
    this.setupLighting();
  }

  private setupRenderer(): void {
    const canvas = document.getElementById('bg') as HTMLCanvasElement;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
    });

    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x7fb8e5); // Initial light blue background
  }

  private setupLighting(): void {
    // Ambient light for overall illumination
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.instance.add(this.ambientLight);

    // Directional light for depth and definition
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    this.directionalLight.position.set(15, 10, 15);
    this.instance.add(this.directionalLight);

    // Add subtle rim light for better globe definition
    const rimLight = new THREE.PointLight(0x88ccff, 0.3);
    rimLight.position.set(-15, 5, 10);
    this.instance.add(rimLight);
  }

  setBackgroundColor(color: number): void {
    this.renderer.setClearColor(color);
  }

  render(camera: THREE.Camera): void {
    this.renderer.render(this.instance, camera);
  }

  handleResize(): void {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  dispose(): void {
    this.renderer.dispose();
  }
}
