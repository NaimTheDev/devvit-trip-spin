import * as THREE from 'three';
import { lerp } from '../utils/math';

export class Camera {
  public instance: THREE.PerspectiveCamera;
  private currentZ: number;
  private targetZ: number;

  private static readonly INITIAL_Z = 20;
  private static readonly ZOOMED_Z = 12;

  constructor() {
    this.instance = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    this.currentZ = Camera.INITIAL_Z;
    this.targetZ = Camera.INITIAL_Z;
    this.instance.position.z = this.currentZ;
    this.instance.lookAt(0, 0, 0);
  }

  zoomIn(): void {
    this.targetZ = Camera.ZOOMED_Z;
  }

  zoomOut(): void {
    this.targetZ = Camera.INITIAL_Z;
  }

  update(): void {
    // Smooth camera zoom transition
    this.currentZ = lerp(this.currentZ, this.targetZ, 0.02);
    this.instance.position.z = this.currentZ;
  }

  handleResize(): void {
    this.instance.aspect = window.innerWidth / window.innerHeight;
    this.instance.updateProjectionMatrix();
  }

  getCurrentZ(): number {
    return this.currentZ;
  }

  getTargetZ(): number {
    return this.targetZ;
  }
}
