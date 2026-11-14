import * as THREE from 'three';

export class NavigationBeacon {
  public group: THREE.Group;
  private beaconBeam: THREE.Mesh;
  private targetRing: THREE.Mesh;
  private rippleRing: THREE.Mesh;
  private floatingDiamond: THREE.Mesh;
  private targetSprite: THREE.Sprite;
  private pathwayPoints: THREE.Points;
  private pathwayPositions: Float32Array;
  private animTimer: number = 0;
  public targetPosition: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  public isActive: boolean = true;
  private maxTrailNodes: number = 24;

  constructor() {
    this.group = new THREE.Group();

    // 1. Tall Sky Light Pillar / Holographic Vertical Beam (Reaches 30m into the sky)
    const beamGeo = new THREE.CylinderGeometry(0.35, 0.9, 32, 12, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x00f5d4,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this.beaconBeam = new THREE.Mesh(beamGeo, beamMat);
    this.beaconBeam.position.set(0, 16, 0);
    this.group.add(this.beaconBeam);

    // 2. Concentric Ground Target Rings
    const ringGeo = new THREE.RingGeometry(1.6, 2.0, 24);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00f5d4,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
    });
    this.targetRing = new THREE.Mesh(ringGeo, ringMat);
    this.targetRing.position.set(0, 0.08, 0);
    this.group.add(this.targetRing);

    // Secondary expanding ripple ring
    const rippleGeo = new THREE.RingGeometry(0.2, 0.45, 24);
    rippleGeo.rotateX(-Math.PI / 2);
    const rippleMat = new THREE.MeshBasicMaterial({
      color: 0x00f5d4,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
    });
    this.rippleRing = new THREE.Mesh(rippleGeo, rippleMat);
    this.rippleRing.position.set(0, 0.06, 0);
    this.group.add(this.rippleRing);

    // 3. Floating Holographic Diamond Marker
    const diamondGeo = new THREE.OctahedronGeometry(0.75, 0);
    const diamondMat = new THREE.MeshBasicMaterial({
      color: 0xfff5e6,
      wireframe: false,
    });
    this.floatingDiamond = new THREE.Mesh(diamondGeo, diamondMat);
    this.floatingDiamond.position.set(0, 3.4, 0);
    this.group.add(this.floatingDiamond);

    // 4. Floating 3D Target Text Sprite Billboard
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'rgba(10, 16, 26, 0.9)';
      ctx.strokeStyle = '#00f5d4';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.roundRect(10, 10, 492, 108, 20);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#00f5d4';
      ctx.font = 'bold 44px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🎯 ACTIVE OBJECTIVE', 256, 64);
    }
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false,
    });
    this.targetSprite = new THREE.Sprite(spriteMat);
    this.targetSprite.scale.set(4.5, 1.12, 1);
    this.targetSprite.position.set(0, 4.6, 0);
    this.group.add(this.targetSprite);

    // 5. Dynamic Ground Light Trail (glowing pathway from astronaut to target)
    this.pathwayPositions = new Float32Array(this.maxTrailNodes * 3);
    const trailGeo = new THREE.BufferGeometry();
    trailGeo.setAttribute('position', new THREE.BufferAttribute(this.pathwayPositions, 3));
    const trailMat = new THREE.PointsMaterial({
      color: 0x00f5d4,
      size: 0.45,
      transparent: true,
      opacity: 0.9,
    });
    this.pathwayPoints = new THREE.Points(trailGeo, trailMat);
    this.group.add(this.pathwayPoints);
  }

  public setTarget(
    pos: [number, number, number] | THREE.Vector3,
    color: number = 0x00f5d4,
    targetName?: string,
    dist?: number
  ) {
    if (Array.isArray(pos)) {
      this.targetPosition.set(pos[0], pos[1], pos[2]);
    } else {
      this.targetPosition.copy(pos);
    }

    // Position beacon at the target
    this.beaconBeam.position.set(this.targetPosition.x, 16, this.targetPosition.z);
    this.targetRing.position.set(this.targetPosition.x, 0.08, this.targetPosition.z);
    this.rippleRing.position.set(this.targetPosition.x, 0.06, this.targetPosition.z);
    this.floatingDiamond.position.set(this.targetPosition.x, 3.4, this.targetPosition.z);
    this.targetSprite.position.set(this.targetPosition.x, 4.6, this.targetPosition.z);

    (this.beaconBeam.material as THREE.MeshBasicMaterial).color.setHex(color);
    (this.targetRing.material as THREE.MeshBasicMaterial).color.setHex(color);
    (this.rippleRing.material as THREE.MeshBasicMaterial).color.setHex(color);
    (this.pathwayPoints.material as THREE.PointsMaterial).color.setHex(color);

    // Update sprite text if name and dist provided
    if (targetName) {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'rgba(10, 16, 26, 0.92)';
        ctx.strokeStyle = '#00f5d4';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.roundRect(10, 10, 492, 108, 20);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ff6b35';
        ctx.font = 'bold 28px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`OBJECTIVE [${dist !== undefined ? dist + 'm' : ''}]`, 256, 42);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px monospace';
        ctx.fillText(targetName, 256, 84);
      }
      this.targetSprite.material.map = new THREE.CanvasTexture(canvas);
      this.targetSprite.material.needsUpdate = true;
    }
  }

  public update(delta: number, astronautPos?: THREE.Vector3) {
    if (!this.group.visible) return;

    this.animTimer += delta * 3.5;

    // Rotate beam and rings
    this.beaconBeam.rotation.y += 0.8 * delta;
    this.targetRing.rotation.y += 1.5 * delta;

    // Expand ripple ring
    const rippleScale = 1.0 + (this.animTimer % 2.0) * 3.5;
    this.rippleRing.scale.set(rippleScale, rippleScale, rippleScale);
    (this.rippleRing.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.85 - (this.animTimer % 2.0) * 0.42);

    // Bob floating diamond
    const bob = Math.sin(this.animTimer) * 0.35;
    this.floatingDiamond.position.y = 3.4 + bob;
    this.floatingDiamond.rotation.y += 2.0 * delta;
    this.floatingDiamond.rotation.x = Math.sin(this.animTimer * 0.5) * 0.2;

    this.targetSprite.position.y = 4.6 + bob * 0.5;

    // Pulse beam opacity
    const pulse = 0.4 + Math.sin(this.animTimer) * 0.22;
    (this.beaconBeam.material as THREE.MeshBasicMaterial).opacity = pulse;

    // Update Ground Breadcrumb Trail from astronaut to target
    if (astronautPos) {
      const posAttr = this.pathwayPoints.geometry.attributes.position;
      const count = this.maxTrailNodes;
      for (let i = 0; i < count; i++) {
        // Interpolate between astronaut position and target position
        const t = (i + 1) / (count + 1);
        const x = astronautPos.x + (this.targetPosition.x - astronautPos.x) * t;
        const z = astronautPos.z + (this.targetPosition.z - astronautPos.z) * t;
        
        // Ground height + small hover
        const y = 0.12 + Math.sin(this.animTimer * 4 - i * 0.4) * 0.05;

        posAttr.setXYZ(i, x, y, z);
      }
      posAttr.needsUpdate = true;
    }
  }
}
