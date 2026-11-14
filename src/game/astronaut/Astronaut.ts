import * as THREE from 'three';
import { audioManager } from '../audio/AudioManager';
import { collisionSystem } from '../core/CollisionSystem';

export interface AstronautInput {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  sprint: boolean;
  jump: boolean;
  interact: boolean;
}

export class Astronaut {
  public mesh: THREE.Group;
  public position: THREE.Vector3;
  public velocity: THREE.Vector3;
  public isGrounded: boolean = true;
  public isMoving: boolean = false;
  public isSprinting: boolean = false;
  public isInteracting: boolean = false;
  public isMining: boolean = false;
  public isInsideHabitat: boolean = false;
  public isRoverMounted: boolean = false;

  // Body Parts for Animation
  private head: THREE.Group;
  private torso: THREE.Group;
  private leftArm: THREE.Group;
  private rightArm: THREE.Group;
  private leftLeg: THREE.Group;
  private rightLeg: THREE.Group;
  private backpack: THREE.Group;
  public visor: THREE.Mesh;
  private toolInHand: THREE.Group;

  // Visual Effects: Helmet Headlight & Dust Trail
  public headlight: THREE.SpotLight;
  public headlightTarget: THREE.Object3D;
  public dustParticles: THREE.Points;
  private dustPositions: Float32Array;
  private dustOpacities: Float32Array;
  private dustIndex: number = 0;

  // Animation & Physics Timers
  private animTime: number = 0;
  private footstepTimer: number = 0;
  private interactionTimer: number = 0;
  private targetRotationY: number = 0;

  constructor() {
    this.mesh = new THREE.Group();
    this.position = new THREE.Vector3(0, 0, 14); // Start near airlock
    this.velocity = new THREE.Vector3(0, 0, 0);

    // Initialize hierarchical body parts
    this.torso = new THREE.Group();
    this.head = new THREE.Group();
    this.leftArm = new THREE.Group();
    this.rightArm = new THREE.Group();
    this.leftLeg = new THREE.Group();
    this.rightLeg = new THREE.Group();
    this.backpack = new THREE.Group();
    this.toolInHand = new THREE.Group();
    this.visor = new THREE.Mesh();

    // Helmet Headlight Beam (Illuminates terrain and dark interiors)
    this.headlight = new THREE.SpotLight(0xfff5e6, 2.5, 30, Math.PI / 5, 0.4, 1.2);
    this.headlight.position.set(0, 1.6, 0.3);
    this.headlight.castShadow = true;
    this.headlightTarget = new THREE.Object3D();
    this.headlightTarget.position.set(0, 0.5, 8);
    this.mesh.add(this.headlightTarget);
    this.headlight.target = this.headlightTarget;
    this.mesh.add(this.headlight);

    // Dynamic Dust Puff Particle System (Kicked up by boots)
    const dustCount = 80;
    const dustGeo = new THREE.BufferGeometry();
    this.dustPositions = new Float32Array(dustCount * 3);
    this.dustOpacities = new Float32Array(dustCount);

    for (let i = 0; i < dustCount; i++) {
      this.dustPositions[i * 3] = 0;
      this.dustPositions[i * 3 + 1] = -100; // start hidden
      this.dustPositions[i * 3 + 2] = 0;
      this.dustOpacities[i] = 0;
    }

    dustGeo.setAttribute('position', new THREE.BufferAttribute(this.dustPositions, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0xc1440e,
      size: 0.22,
      transparent: true,
      opacity: 0.6,
    });
    this.dustParticles = new THREE.Points(dustGeo, dustMat);

    this.buildVoxelAstronaut();
    this.mesh.position.copy(this.position);
  }

  private buildVoxelAstronaut() {
    // NASA White Spacesuit Material
    const suitMat = new THREE.MeshStandardMaterial({
      color: 0xf4f7f6,
      roughness: 0.35,
      metalness: 0.1,
      flatShading: true,
    });

    // Dark Carbon Tech / Joint Material
    const jointMat = new THREE.MeshStandardMaterial({
      color: 0x242d38,
      roughness: 0.8,
      flatShading: true,
    });

    // Golden Reflective Visor
    const visorMat = new THREE.MeshStandardMaterial({
      color: 0xffb703,
      roughness: 0.08,
      metalness: 0.92,
    });

    // NASA Blue Chevron Accent
    const accentMat = new THREE.MeshStandardMaterial({
      color: 0x0077b6,
      roughness: 0.4,
    });

    // 1. TORSO
    const chest = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.82, 0.46), suitMat);
    chest.position.set(0, 0.9, 0);
    chest.castShadow = true;
    this.torso.add(chest);

    // Chest Control Unit (DCM)
    const dcm = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.36, 0.1), jointMat);
    dcm.position.set(0, 0.95, 0.25);
    this.torso.add(dcm);

    // Glowing Oxygen / Status LEDs on chest
    const o2Led = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.06, 0.04),
      new THREE.MeshBasicMaterial({ color: 0x00f5d4 })
    );
    o2Led.position.set(0.08, 1.02, 0.31);
    this.torso.add(o2Led);

    const batLed = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.06, 0.04),
      new THREE.MeshBasicMaterial({ color: 0x48bb78 })
    );
    batLed.position.set(-0.08, 1.02, 0.31);
    this.torso.add(batLed);

    // NASA Shoulder Patches
    const patchL = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.16, 0.16), accentMat);
    patchL.position.set(-0.37, 1.12, 0);
    const patchR = patchL.clone();
    patchR.position.set(0.37, 1.12, 0);
    this.torso.add(patchL);
    this.torso.add(patchR);

    // 2. HEAD & HELMET
    const helmet = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.56, 0.56), suitMat);
    helmet.position.set(0, 0, 0);
    helmet.castShadow = true;
    this.head.add(helmet);

    // Reflective Gold Visor
    this.visor = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.34, 0.12), visorMat);
    this.visor.position.set(0, 0.02, 0.25);
    this.head.add(this.visor);

    // Helmet Headlamp Lamp Housing
    const lampHousing = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.1, 0.08),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    lampHousing.position.set(0, 0.24, 0.26);
    this.head.add(lampHousing);

    this.head.position.set(0, 1.55, 0);

    // 3. PLSS BACKPACK (Portable Life Support System)
    const plssBox = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.78, 0.36), suitMat);
    plssBox.position.set(0, 0.9, -0.36);
    plssBox.castShadow = true;
    this.backpack.add(plssBox);

    // Dual High-Pressure Oxygen Cylinders
    const tankMat = new THREE.MeshStandardMaterial({ color: 0xc1440e, metalness: 0.5 });
    const tank1 = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.62, 6), tankMat);
    tank1.position.set(-0.16, 0.9, -0.52);
    const tank2 = tank1.clone();
    tank2.position.set(0.16, 0.9, -0.52);
    this.backpack.add(tank1);
    this.backpack.add(tank2);

    // Backpack Status Bar (Telemetry Beacon)
    const statusLed = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.08, 0.04),
      new THREE.MeshBasicMaterial({ color: 0x00f5d4 })
    );
    statusLed.position.set(0, 1.18, -0.55);
    this.backpack.add(statusLed);

    // 4. ARMS & GLOVES
    // Left Arm
    this.leftArm.position.set(-0.48, 1.25, 0);
    const armL = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.62, 0.24), suitMat);
    armL.position.set(0, -0.31, 0);
    armL.castShadow = true;
    this.leftArm.add(armL);
    const gloveL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.18, 0.26), jointMat);
    gloveL.position.set(0, -0.63, 0);
    this.leftArm.add(gloveL);

    // Right Arm
    this.rightArm.position.set(0.48, 1.25, 0);
    const armR = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.62, 0.24), suitMat);
    armR.position.set(0, -0.31, 0);
    armR.castShadow = true;
    this.rightArm.add(armR);
    const gloveR = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.18, 0.26), jointMat);
    gloveR.position.set(0, -0.63, 0);
    this.rightArm.add(gloveR);

    // Right Hand Multi-Tool (laser cutter / scanner / wrench)
    const toolBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.36, 0.18),
      new THREE.MeshStandardMaterial({ color: 0xff6b35, metalness: 0.6 })
    );
    const toolEmitter = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.22, 6),
      new THREE.MeshBasicMaterial({ color: 0x00f5d4 })
    );
    toolEmitter.rotateX(Math.PI / 2);
    toolEmitter.position.set(0, -0.16, 0.14);
    this.toolInHand.add(toolBody);
    this.toolInHand.add(toolEmitter);
    this.toolInHand.position.set(0, -0.72, 0.12);
    this.rightArm.add(this.toolInHand);

    // 5. LEGS & BOOTS
    // Left Leg
    this.leftLeg.position.set(-0.21, 0.55, 0);
    const legL = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.56, 0.26), suitMat);
    legL.position.set(0, -0.28, 0);
    legL.castShadow = true;
    this.leftLeg.add(legL);
    const bootL = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.22, 0.36), jointMat);
    bootL.position.set(0, -0.59, 0.04);
    bootL.castShadow = true;
    this.leftLeg.add(bootL);

    // Right Leg
    this.rightLeg.position.set(0.21, 0.55, 0);
    const legR = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.56, 0.26), suitMat);
    legR.position.set(0, -0.28, 0);
    legR.castShadow = true;
    this.rightLeg.add(legR);
    const bootR = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.22, 0.36), jointMat);
    bootR.position.set(0, -0.59, 0.04);
    bootR.castShadow = true;
    this.rightLeg.add(bootR);

    // Assemble character mesh hierarchy
    this.mesh.add(this.torso);
    this.mesh.add(this.head);
    this.mesh.add(this.backpack);
    this.mesh.add(this.leftArm);
    this.mesh.add(this.rightArm);
    this.mesh.add(this.leftLeg);
    this.mesh.add(this.rightLeg);
  }

  public update(
    delta: number,
    input: AstronautInput,
    terrainHeightFn: (x: number, z: number) => number,
    cameraAngle: number = Math.PI / 4
  ) {
    // 1. Process Camera-Relative Movement
    // When player presses W, move in the forward view direction of the camera!
    // When player presses D, move right relative to camera!
    let inputX = 0;
    let inputZ = 0;
    if (input.forward) inputZ -= 1;
    if (input.backward) inputZ += 1;
    if (input.left) inputX -= 1;
    if (input.right) inputX += 1;

    this.isMoving = inputX !== 0 || inputZ !== 0;
    this.isSprinting = input.sprint && this.isMoving;

    const baseSpeed = this.isRoverMounted ? 11.5 : 5.0; // Fast traversal when driving rover!
    const sprintSpeed = this.isRoverMounted ? 16.5 : 7.6;
    const targetSpeed = this.isSprinting ? sprintSpeed : baseSpeed;

    if (this.isMoving) {
      // Normalize diagonal vector
      const len = Math.sqrt(inputX * inputX + inputZ * inputZ);
      const normX = inputX / len;
      const normZ = inputZ / len;

      // Project relative to current camera azimuth angle
      // Camera is looking towards center with rotation `cameraAngle`.
      // Forward view vector: (-cos(angle), -sin(angle))
      // Right view vector: (sin(angle), -cos(angle))
      const camForwardX = -Math.cos(cameraAngle);
      const camForwardZ = -Math.sin(cameraAngle);
      const camRightX = Math.sin(cameraAngle);
      const camRightZ = -Math.cos(cameraAngle);

      // Desired world velocity
      const targetVelX = (camRightX * normX - camForwardX * normZ) * targetSpeed;
      const targetVelZ = (camRightZ * normX - camForwardZ * normZ) * targetSpeed;

      // Smooth acceleration with Mars inertia
      const accelRate = 18.0;
      this.velocity.x += (targetVelX - this.velocity.x) * Math.min(1.0, accelRate * delta);
      this.velocity.z += (targetVelZ - this.velocity.z) * Math.min(1.0, accelRate * delta);

      // Face direction of movement
      this.targetRotationY = Math.atan2(this.velocity.x, this.velocity.z);

      // Spawn dust puff beneath boots
      if (this.isGrounded && Math.random() < (this.isSprinting ? 0.6 : 0.3)) {
        this.emitDustPuff(this.position.x, this.position.y, this.position.z);
      }
    } else {
      // Smooth deceleration / friction
      const friction = 14.0;
      this.velocity.x += (0 - this.velocity.x) * Math.min(1.0, friction * delta);
      this.velocity.z += (0 - this.velocity.z) * Math.min(1.0, friction * delta);
    }

    // 2. Mars Gravity & Jump (0.38g floaty jumping!)
    const marsGravity = -13.5; // m/s^2
    if (input.jump && this.isGrounded) {
      this.velocity.y = 5.6;
      this.isGrounded = false;
      audioManager.playFootstep();
      this.emitDustPuff(this.position.x, this.position.y, this.position.z);
    }

    if (!this.isGrounded) {
      this.velocity.y += marsGravity * delta;
    }

    // 3. Integrate Position with Solid Physical Obstacle Collisions
    const nextPos = new THREE.Vector3(
      this.position.x + this.velocity.x * delta,
      this.position.y + this.velocity.y * delta,
      this.position.z + this.velocity.z * delta
    );

    // Resolve collision against outpost buildings, habitat walls, solar arrays, rover
    const collisionResult = collisionSystem.resolveCollision(nextPos, this.velocity, 0.45);
    this.position.x = collisionResult.position.x;
    this.position.z = collisionResult.position.z;
    this.position.y = collisionResult.position.y;
    this.velocity.x = collisionResult.velocity.x;
    this.velocity.z = collisionResult.velocity.z;

    // Boundary constraints (Valley basin radius 52m)
    const distFromOrigin = Math.sqrt(this.position.x * this.position.x + this.position.z * this.position.z);
    if (distFromOrigin > 52) {
      const clampRatio = 52 / distFromOrigin;
      this.position.x *= clampRatio;
      this.position.z *= clampRatio;
      this.velocity.x *= -0.2; // gentle bounce
      this.velocity.z *= -0.2;
    }

    // Ground & Slope Collision Physics (Foot base elevation offset +0.18m)
    const groundHeight = terrainHeightFn(this.position.x, this.position.z) + 0.18;
    if (this.position.y <= groundHeight) {
      if (!this.isGrounded && this.velocity.y < -3.0) {
        // Landing impact
        this.emitDustPuff(this.position.x, groundHeight, this.position.z);
        audioManager.playFootstep();
      }
      this.position.y = groundHeight;
      this.velocity.y = 0;
      this.isGrounded = true;
    }

    // Check if inside Zone A Habitat Hub
    const distToHabCenter = Math.sqrt(this.position.x * this.position.x + this.position.z * this.position.z);
    this.isInsideHabitat = distToHabCenter < 8.2;

    // Smooth Astronaut Rotation
    let diff = this.targetRotationY - this.mesh.rotation.y;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    this.mesh.rotation.y += diff * Math.min(1.0, 15.0 * delta);

    // Update Mesh Position
    this.mesh.position.copy(this.position);

    // 4. Update Animations & Dust Particles
    this.animateBones(delta);
    this.updateDustParticles(delta);

    // 5. Footstep Audio Cadence
    if (this.isMoving && this.isGrounded) {
      this.footstepTimer += delta;
      const stepInterval = this.isSprinting ? 0.28 : 0.42;
      if (this.footstepTimer >= stepInterval) {
        this.footstepTimer = 0;
        audioManager.playFootstep();
      }
    } else {
      this.footstepTimer = 0;
    }
  }

  private animateBones(delta: number) {
    this.animTime += delta;

    if (this.isMining || this.isInteracting) {
      // Mining / Repairing animation: Arm swings down rhythmically
      this.interactionTimer += delta * 9;
      const swing = Math.sin(this.interactionTimer);
      this.rightArm.rotation.x = -Math.PI / 2.5 + swing * 0.45;
      this.leftArm.rotation.x = -Math.PI / 4;
      this.torso.rotation.x = 0.15 + swing * 0.05;
      this.head.rotation.x = 0.22;
      this.leftLeg.rotation.x = 0;
      this.rightLeg.rotation.x = 0;
      return;
    }

    if (this.isMoving) {
      // Walking / Sprinting stride
      const animSpeed = this.isSprinting ? 15 : 9.5;
      const legStride = this.isSprinting ? 0.8 : 0.55;
      const armStride = this.isSprinting ? 0.75 : 0.48;

      const stride = Math.sin(this.animTime * animSpeed);

      // Alternating legs & arms
      this.leftLeg.rotation.x = stride * legStride;
      this.rightLeg.rotation.x = -stride * legStride;
      this.leftArm.rotation.x = -stride * armStride;
      this.rightArm.rotation.x = stride * armStride;

      // Subtle torso bounce and sway
      this.torso.position.y = Math.abs(Math.sin(this.animTime * animSpeed)) * 0.08;
      this.torso.rotation.z = Math.sin(this.animTime * animSpeed * 0.5) * 0.04;
      this.head.position.y = 1.55 + Math.abs(Math.sin(this.animTime * animSpeed)) * 0.08;
    } else {
      // Idle breathing
      const idleBreath = Math.sin(this.animTime * 2.2) * 0.03;
      this.torso.position.y = idleBreath;
      this.head.position.y = 1.55 + idleBreath * 1.2;
      this.leftArm.rotation.x = idleBreath * 0.5;
      this.rightArm.rotation.x = -idleBreath * 0.5;
      this.leftArm.rotation.z = -0.08;
      this.rightArm.rotation.z = 0.08;
      this.leftLeg.rotation.x = 0;
      this.rightLeg.rotation.x = 0;
      this.torso.rotation.x = 0;
      this.torso.rotation.z = 0;
    }
  }

  private emitDustPuff(x: number, y: number, z: number) {
    const idx = (this.dustIndex % (this.dustPositions.length / 3)) * 3;
    this.dustPositions[idx] = x + (Math.random() - 0.5) * 0.4;
    this.dustPositions[idx + 1] = y + 0.1;
    this.dustPositions[idx + 2] = z + (Math.random() - 0.5) * 0.4;
    this.dustOpacities[this.dustIndex % (this.dustPositions.length / 3)] = 1.0;
    this.dustIndex++;
  }

  private updateDustParticles(delta: number) {
    const count = this.dustPositions.length / 3;
    const pos = this.dustParticles.geometry.attributes.position;
    for (let i = 0; i < count; i++) {
      if (this.dustOpacities[i] > 0) {
        this.dustOpacities[i] -= delta * 1.8;
        this.dustPositions[i * 3 + 1] += delta * 0.25; // drift up
        if (this.dustOpacities[i] <= 0) {
          this.dustPositions[i * 3 + 1] = -100; // hide
        }
      }
    }
    pos.needsUpdate = true;
  }

  public triggerActionAnimation(type: 'mine' | 'repair' | 'interact', duration: number = 0.8) {
    if (type === 'mine') this.isMining = true;
    else this.isInteracting = true;

    setTimeout(() => {
      this.isMining = false;
      this.isInteracting = false;
    }, duration * 1000);
  }

  public teleportTo(x: number, y: number, z: number, rotY?: number) {
    this.position.set(x, y, z);
    this.velocity.set(0, 0, 0);
    this.mesh.position.copy(this.position);
    if (rotY !== undefined) {
      this.targetRotationY = rotY;
      this.mesh.rotation.y = rotY;
    }
  }
}
