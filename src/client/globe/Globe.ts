import * as THREE from 'three';

export class Globe {
  public earthSphere!: THREE.Mesh;
  public rim!: THREE.Mesh;
  private spinSpeed = 0;
  private targetSpinSpeed = 0;
  private earthRadius = 6;

  constructor(scene: THREE.Scene) {
    this.createGlobe(scene);
    this.createRim(scene);
  }

  private createGlobe(scene: THREE.Scene): void {
    const loader = new THREE.TextureLoader();
    const mapTexture = loader.load('/earth_atmos_alt.png');
    // Remove encoding line for now to avoid Three.js version conflicts

    const earthGeometry = new THREE.SphereGeometry(this.earthRadius, 64, 64);
    const earthMaterial = new THREE.MeshPhongMaterial({
      map: mapTexture,
      specular: 0x000000,
      shininess: 0,
    });

    this.earthSphere = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(this.earthSphere);
  }

  private createRim(scene: THREE.Scene): void {
    const rimGeometry = new THREE.RingGeometry(this.earthRadius + 0.2, this.earthRadius + 0.4, 64);
    const rimMaterial = new THREE.MeshBasicMaterial({
      color: 0xff4500, // Reddit orange
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });

    this.rim = new THREE.Mesh(rimGeometry, rimMaterial);
    scene.add(this.rim);
  }

  startSpin(speed: number): void {
    this.targetSpinSpeed = speed;
  }

  slowSpin(speed: number): void {
    this.targetSpinSpeed = speed;
  }

  stopSpin(): void {
    this.targetSpinSpeed = 0;
  }

  showRim(): void {
    const material = this.rim.material as THREE.MeshBasicMaterial;
    material.opacity = 1;
  }

  hideRim(): void {
    const material = this.rim.material as THREE.MeshBasicMaterial;
    material.opacity = 0;
  }

  update(): void {
    // Smooth spin speed transition
    this.spinSpeed += (this.targetSpinSpeed - this.spinSpeed) * 0.05;

    if (Math.abs(this.spinSpeed) > 0.001) {
      this.earthSphere.rotation.y += this.spinSpeed;
      this.rim.rotation.z += this.spinSpeed * 0.5; // Rim rotates slower
    }
  }

  getSpinSpeed(): number {
    return this.spinSpeed;
  }

  isSpinning(): boolean {
    return Math.abs(this.spinSpeed) > 0.001;
  }
}
