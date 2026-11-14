import * as THREE from 'three';

export class CameraController {
  public camera: THREE.OrthographicCamera;
  public zoom: number = 22; // Frustum size
  private minZoom: number = 10;
  private maxZoom: number = 42;
  private aspect: number = 1;
  private targetPosition: THREE.Vector3 = new THREE.Vector3();
  private currentPosition: THREE.Vector3 = new THREE.Vector3();
  public rotationAngle: number = Math.PI / 4; // 45 degrees isometric base
  private targetRotationAngle: number = Math.PI / 4;

  constructor(aspect: number) {
    this.aspect = aspect;
    const frustumSize = this.zoom;
    this.camera = new THREE.OrthographicCamera(
      (-frustumSize * aspect) / 2,
      (frustumSize * aspect) / 2,
      frustumSize / 2,
      -frustumSize / 2,
      0.1,
      1000
    );

    this.updateCameraTransform();
  }

  public setAspect(aspect: number) {
    this.aspect = aspect;
    this.updateProjection();
  }

  public setZoom(newZoom: number) {
    this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, newZoom));
    this.updateProjection();
  }

  public handleWheel(deltaY: number) {
    const zoomDelta = deltaY > 0 ? 2 : -2;
    this.setZoom(this.zoom + zoomDelta);
  }

  public rotateLeft() {
    this.targetRotationAngle += Math.PI / 4; // 45 deg step
  }

  public rotateRight() {
    this.targetRotationAngle -= Math.PI / 4;
  }

  public updateProjection() {
    const frustumSize = this.zoom;
    this.camera.left = (-frustumSize * this.aspect) / 2;
    this.camera.right = (frustumSize * this.aspect) / 2;
    this.camera.top = frustumSize / 2;
    this.camera.bottom = -frustumSize / 2;
    this.camera.updateProjectionMatrix();
  }

  public follow(astronautPos: THREE.Vector3, delta: number) {
    // Smooth dampening towards astronaut position
    this.targetPosition.copy(astronautPos);
    this.currentPosition.lerp(this.targetPosition, Math.min(1.0, 8.0 * delta));

    // Smooth camera rotation
    this.rotationAngle += (this.targetRotationAngle - this.rotationAngle) * Math.min(1.0, 8.0 * delta);

    this.updateCameraTransform();
  }

  private updateCameraTransform() {
    // True Isometric Camera:
    // Positioned at an isometric offset from the follow target
    const distance = 60;
    const elevationAngle = Math.PI / 5.2; // ~35 deg pitch for classic dimetric/isometric look

    const camX = this.currentPosition.x + Math.cos(this.rotationAngle) * Math.cos(elevationAngle) * distance;
    const camY = this.currentPosition.y + Math.sin(elevationAngle) * distance;
    const camZ = this.currentPosition.z + Math.sin(this.rotationAngle) * Math.cos(elevationAngle) * distance;

    this.camera.position.set(camX, camY, camZ);
    this.camera.lookAt(this.currentPosition.x, this.currentPosition.y + 0.8, this.currentPosition.z);
  }
}

