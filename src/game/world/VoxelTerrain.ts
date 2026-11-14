import * as THREE from 'three';
import { collisionSystem } from '../core/CollisionSystem';

export interface VoxelRock {
  mesh: THREE.Mesh;
  type: 'hematite' | 'silicon' | 'ice' | 'regolith';
  position: THREE.Vector3;
  mined: boolean;
}

export class VoxelTerrain {
  public group: THREE.Group;
  public terrainMesh: THREE.Mesh | null = null;
  public dustParticles: THREE.Points | null = null;
  public rocks: VoxelRock[] = [];
  private particlePositions: Float32Array | null = null;

  constructor() {
    this.group = new THREE.Group();
    this.buildTerrain();
    this.buildCratersAndMountains();
    this.spawnMineralNodes();
    this.createAtmosphericDust();
  }

  private buildTerrain() {
    // Large Martian terrain surface with layered stepped terraces
    const size = 140;
    const segments = 70;
    const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
    geometry.rotateX(-Math.PI / 2);

    const pos = geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      pos.setY(i, this.getTerrainHeight(x, z));
    }

    geometry.computeVertexNormals();

    // Voxel-stylized Mars terrain material with warm red-orange palette
    const material = new THREE.MeshStandardMaterial({
      color: 0xc1440e, // Mars rust
      roughness: 0.9,
      metalness: 0.1,
      flatShading: true, // Key for voxel aesthetic!
    });

    this.terrainMesh = new THREE.Mesh(geometry, material);
    this.terrainMesh.receiveShadow = true;
    this.group.add(this.terrainMesh);
  }

  private buildCratersAndMountains() {
    // Add distinct crater formations around the outpost
    const craterLocations = [
      { x: -35, z: 25, radius: 10, depth: 2.5 },
      { x: 30, z: -35, radius: 12, depth: 3.0 },
      { x: -28, z: -30, radius: 8, depth: 2.0 },
    ];

    craterLocations.forEach((c) => {
      // Crater Rim (raised torus/ring)
      const rimGeo = new THREE.TorusGeometry(c.radius, 1.2, 5, 12);
      rimGeo.rotateX(Math.PI / 2);
      const rimMat = new THREE.MeshStandardMaterial({
        color: 0x9e330a,
        roughness: 0.95,
        flatShading: true,
      });
      const rim = new THREE.Mesh(rimGeo, rimMat);
      rim.position.set(c.x, 0.4, c.z);
      rim.castShadow = true;
      rim.receiveShadow = true;
      this.group.add(rim);

      // Crater interior basin
      const basinGeo = new THREE.CylinderGeometry(c.radius * 0.85, 0.5, c.depth, 10);
      const basinMat = new THREE.MeshStandardMaterial({
        color: 0x5a1f06,
        roughness: 1.0,
        flatShading: true,
      });
      const basin = new THREE.Mesh(basinGeo, basinMat);
      basin.position.set(c.x, -c.depth * 0.4, c.z);
      this.group.add(basin);
    });

    // Perimeter jagged voxel monolithic rocks
    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x7a290c,
      roughness: 0.85,
      flatShading: true,
    });

    for (let i = 0; i < 35; i++) {
      const angle = (i / 35) * Math.PI * 2;
      const radius = 55 + Math.random() * 12;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      const rockScaleX = 3 + Math.random() * 4;
      const rockScaleY = 5 + Math.random() * 9;
      const rockScaleZ = 3 + Math.random() * 4;

      const boxGeo = new THREE.BoxGeometry(rockScaleX, rockScaleY, rockScaleZ);
      const rock = new THREE.Mesh(boxGeo, rockMat);
      rock.position.set(x, rockScaleY * 0.4, z);
      rock.rotation.y = Math.random() * Math.PI;
      rock.castShadow = true;
      rock.receiveShadow = true;
      this.group.add(rock);
      collisionSystem.addBox(`perimeter_rock_${i}`, x, z, rockScaleX * 0.5, rockScaleZ * 0.5);
    }
  }

  private spawnMineralNodes() {
    // Mineral resource deposits that the player can mine and collect
    const colors = {
      hematite: 0x8b1e0f, // Deep iron red
      silicon: 0x2a9d8f,  // Crystalline turquoise-silver
      ice: 0x90e0ef,      // Translucent cyan-white
      regolith: 0xe76f51, // Bright Martian ochre
    };

    const nodePositions = [
      // Close to outpost for early missions
      { type: 'regolith', x: -8, z: 12 },
      { type: 'regolith', x: 10, z: -8 },
      { type: 'hematite', x: -14, z: -12 },
      { type: 'silicon', x: 15, z: 14 },
      // Near crater edge (Mission 3 & 4 Ice)
      { type: 'ice', x: -32, z: 22 },
      { type: 'ice', x: -36, z: 27 },
      { type: 'ice', x: -30, z: 28 },
      // Surface deposits
      { type: 'hematite', x: 26, z: -20 },
      { type: 'hematite', x: 32, z: -15 },
      { type: 'silicon', x: -22, z: -24 },
      { type: 'silicon', x: -18, z: 26 },
      { type: 'regolith', x: 20, z: 28 },
      { type: 'regolith', x: -15, z: 32 },
      { type: 'ice', x: 28, z: -32 },
    ] as const;

    nodePositions.forEach((posInfo, index) => {
      const type = posInfo.type;
      const group = new THREE.Group();

      // Compound voxel cluster for the ore node
      const mat = new THREE.MeshStandardMaterial({
        color: colors[type],
        roughness: type === 'ice' ? 0.2 : 0.7,
        metalness: type === 'silicon' ? 0.8 : type === 'hematite' ? 0.6 : 0.1,
        flatShading: true,
      });

      // Central core
      const core = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.0, 1.2), mat);
      core.castShadow = true;
      core.receiveShadow = true;
      group.add(core);

      // Surrounding crystal chunks
      for (let k = 0; k < 4; k++) {
        const chunk = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.7, 0.5), mat);
        chunk.position.set((Math.random() - 0.5) * 1.2, 0.3 + Math.random() * 0.4, (Math.random() - 0.5) * 1.2);
        chunk.rotation.set(Math.random() * 0.4, Math.random() * Math.PI, Math.random() * 0.4);
        group.add(chunk);
      }

      // Height from terrain
      const y = this.getTerrainHeight(posInfo.x, posInfo.z);
      group.position.set(posInfo.x, y + 0.5, posInfo.z);
      group.userData = {
        isResource: true,
        resourceType: type,
        nodeIndex: index,
        nodeId: `ore_${type}_${index}`,
      };

      this.group.add(group);
      collisionSystem.addBox(`ore_node_${index}`, posInfo.x, posInfo.z, 0.7, 0.7);
      this.rocks.push({
        mesh: core,
        type,
        position: new THREE.Vector3(posInfo.x, y, posInfo.z),
        mined: false,
      });
    });
  }

  private createAtmosphericDust() {
    // Dynamic particle system representing blowing Martian dust
    const particleCount = 1200;
    const geometry = new THREE.BufferGeometry();
    this.particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      this.particlePositions[i * 3] = (Math.random() - 0.5) * 120;
      this.particlePositions[i * 3 + 1] = 0.5 + Math.random() * 15;
      this.particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 120;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(this.particlePositions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xdf6f38,
      size: 0.18,
      transparent: true,
      opacity: 0.45,
    });

    this.dustParticles = new THREE.Points(geometry, material);
    this.group.add(this.dustParticles);
  }

  public update(delta: number, stormIntensity: number = 0) {
    // Swirl dust particles
    if (this.dustParticles && this.particlePositions) {
      const posAttr = this.dustParticles.geometry.attributes.position;
      const speedMultiplier = 1.0 + stormIntensity * 4.5;

      for (let i = 0; i < this.particlePositions.length / 3; i++) {
        let x = posAttr.getX(i);
        let y = posAttr.getY(i);
        let z = posAttr.getZ(i);

        // Wind blows East-Southeast with turbulence
        x += (3.5 * speedMultiplier + Math.sin(z * 0.1)) * delta;
        z += (1.8 * speedMultiplier + Math.cos(x * 0.1)) * delta;
        y += Math.sin(x * 0.2 + z * 0.2) * delta * (1 + stormIntensity * 2);

        // Wrap around bounds
        if (x > 65) x = -65;
        if (z > 65) z = -65;
        if (y > 18) y = 0.5;
        if (y < 0.2) y = 14;

        posAttr.setXYZ(i, x, y, z);
      }
      posAttr.needsUpdate = true;

      // Adjust particle opacity and size during storms
      const mat = this.dustParticles.material as THREE.PointsMaterial;
      mat.opacity = 0.35 + stormIntensity * 0.55;
      mat.size = 0.18 + stormIntensity * 0.25;
    }
  }

  public getTerrainHeight(x: number, z: number): number {
    const distFromCenter = Math.sqrt(x * x + z * z);
    
    // The entire Martian outpost compound (Zones A through F, radius ~36m) is 100% flat!
    // This completely eliminates any terrain clipping, structure floating, or astronaut sinking!
    if (distFromCenter <= 34) {
      return 0;
    }

    // Smooth Hermite cubic transition blend between outpost compound (34m) and rolling Martian dunes (48m)
    const blendFactor = Math.min(1.0, Math.max(0.0, (distFromCenter - 34) / 14));
    const smoothBlend = blendFactor * blendFactor * (3 - 2 * blendFactor);

    // Natural Martian dunes
    const dune1 = Math.sin(x * 0.08) * Math.cos(z * 0.08) * 2.2;
    const dune2 = Math.sin(x * 0.18 + 1.2) * Math.sin(z * 0.15) * 1.1;
    let height = smoothBlend * (dune1 + dune2);

    // Perimeter mountain ridges in the distance
    if (distFromCenter > 50) {
      const mountainFactor = (distFromCenter - 50) * 0.35;
      const mountainNoise = Math.sin(x * 0.12) * Math.cos(z * 0.12) * 4.0;
      height += Math.max(0, mountainFactor + mountainNoise);
    }

    return height;
  }
}
