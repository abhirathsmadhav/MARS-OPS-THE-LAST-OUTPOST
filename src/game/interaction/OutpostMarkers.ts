import * as THREE from 'three';
import type { InteractiveObject } from '../../types';
import type { VoxelRock } from '../world/VoxelTerrain';

interface MarkerInstance {
  id: string;
  position: THREE.Vector3;
  sprite: THREE.Sprite;
  groundRing: THREE.Mesh;
  baseColor: string;
  isMissionTarget: boolean;
}

export class OutpostMarkers {
  public group: THREE.Group;
  private markers: MarkerInstance[] = [];
  private animTimer: number = 0;

  constructor() {
    this.group = new THREE.Group();
  }

  public initMarkers(facilities: InteractiveObject[], rocks: VoxelRock[]) {
    // Clean old markers
    while (this.group.children.length > 0) {
      const child = this.group.children[0];
      this.group.remove(child);
    }
    this.markers = [];

    // 1. Build Markers for Outpost Base Facilities
    for (const fac of facilities) {
      let icon = '⚡';
      let label = fac.name;
      let color = '#00f5d4';

      if (fac.type === 'habitat_airlock') {
        icon = '🚪';
        label = 'AIRLOCK [E]';
        color = '#00f5d4';
      } else if (fac.type === 'storage_crate') {
        icon = '📦';
        label = 'SUPPLY CRATE';
        color = '#63b3ed';
      } else if (fac.type === 'habitat_console') {
        icon = '🖥️';
        label = 'ECLSS CONSOLE';
        color = '#00f5d4';
      } else if (fac.type === 'power_inverter') {
        icon = '⚡';
        label = 'SOLAR INVERTER';
        color = '#f6ad55';
      } else if (fac.type === 'solar_array') {
        icon = '☀️';
        label = 'SOLAR ARRAY';
        color = '#ecc94b';
      } else if (fac.type === 'backup_generator') {
        icon = '⚙️';
        label = 'GENERATOR';
        color = '#fc8181';
      } else if (fac.type === 'water_recycler') {
        icon = '💧';
        label = 'WATER RECYCLER';
        color = '#4fd1c5';
      } else if (fac.type === 'greenhouse_tray') {
        icon = '🌱';
        label = 'HYDROPONICS';
        color = '#68d391';
      } else if (fac.type === 'lab_spectrometer' || fac.type === 'lab_terminal') {
        icon = '🔬';
        label = 'SPECTROMETER';
        color = '#b794f4';
      } else if (fac.type === 'oxygen_processor') {
        icon = '💨';
        label = 'MOXIE O2';
        color = '#4fd1c5';
      } else if (fac.type === 'comm_dish') {
        icon = '📡';
        label = 'DEEP SPACE DISH';
        color = '#f6ad55';
      } else if (fac.type === 'exploration_rover') {
        icon = '🚜';
        label = 'MPR-1 ROVER';
        color = '#f6e05e';
      }

      const pos = new THREE.Vector3(fac.position[0], fac.position[1], fac.position[2]);
      const marker = this.createMarkerInstance(fac.id, label, icon, color, pos, 3.2);
      this.markers.push(marker);
      this.group.add(marker.sprite);
      this.group.add(marker.groundRing);
    }

    // 2. Build Markers for Raw Mineral Veins
    for (let i = 0; i < rocks.length; i++) {
      const rock = rocks[i];
      let icon = '⛏️';
      let label = 'ORE';
      let color = '#ecc94b';

      if (rock.type === 'ice') {
        icon = '❄️';
        label = 'WATER ICE';
        color = '#90e0ef';
      } else if (rock.type === 'hematite') {
        icon = '🔴';
        label = 'IRON ORE';
        color = '#e53e3e';
      } else if (rock.type === 'silicon') {
        icon = '💎';
        label = 'SILICON';
        color = '#38b2ac';
      } else {
        icon = '⛏️';
        label = 'REGOLITH';
        color = '#ed8936';
      }

      const id = `rock_${rock.type}_${i}`;
      const marker = this.createMarkerInstance(id, label, icon, color, rock.position, 1.8);
      this.markers.push(marker);
      this.group.add(marker.sprite);
      this.group.add(marker.groundRing);
    }
  }

  private createMarkerInstance(
    id: string,
    label: string,
    icon: string,
    color: string,
    pos: THREE.Vector3,
    heightOffset: number
  ): MarkerInstance {
    // 1. Crisp Canvas Billboard Sprite
    const canvas = document.createElement('canvas');
    canvas.width = 384;
    canvas.height = 96;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // Background pill
      ctx.fillStyle = 'rgba(10, 16, 26, 0.85)';
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(10, 10, 364, 76, 16);
      ctx.fill();
      ctx.stroke();

      // Icon & Text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${icon} ${label}`, 192, 48);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: 0.92,
      depthTest: false, // Ensures marker text is readable and not occluded!
    });

    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(3.4, 0.85, 1);
    sprite.position.set(pos.x, pos.y + heightOffset, pos.z);

    // 2. Holographic Ground Ring
    const ringGeo = new THREE.RingGeometry(1.2, 1.45, 16);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.45,
    });
    const groundRing = new THREE.Mesh(ringGeo, ringMat);
    groundRing.position.set(pos.x, pos.y + 0.05, pos.z);

    return {
      id,
      position: pos.clone(),
      sprite,
      groundRing,
      baseColor: color,
      isMissionTarget: false,
    };
  }

  public update(
    delta: number,
    astronautPos: THREE.Vector3,
    activeTargetPos: [number, number, number] | null,
    showHighlights: boolean
  ) {
    this.animTimer += delta * 3;
    this.group.visible = showHighlights;
    if (!showHighlights) return;

    for (const m of this.markers) {
      const dist = m.position.distanceTo(astronautPos);

      // Check if this marker is the active mission target
      let isTarget = false;
      if (activeTargetPos) {
        const dx = m.position.x - activeTargetPos[0];
        const dz = m.position.z - activeTargetPos[2];
        if (dx * dx + dz * dz < 9.0) {
          isTarget = true;
        }
      }

      m.isMissionTarget = isTarget;

      // Bobbing floating height
      const bob = Math.sin(this.animTimer + m.position.x * 0.5) * 0.15;
      m.sprite.position.y = (m.id.startsWith('rock_') ? 1.8 : 3.2) + bob;

      // Ground ring rotation
      m.groundRing.rotation.y += (isTarget ? 2.5 : 1.0) * delta;

      // Dynamic scale and opacity based on distance & target state
      if (isTarget) {
        // High-priority mission target: Pulsing large golden/cyan badge!
        const pulse = 1.0 + Math.sin(this.animTimer * 2) * 0.18;
        m.sprite.scale.set(4.2 * pulse, 1.05 * pulse, 1);
        (m.sprite.material as THREE.SpriteMaterial).opacity = 1.0;
        (m.groundRing.material as THREE.MeshBasicMaterial).opacity = 0.85;
      } else if (dist < 12) {
        // Near astronaut: clear crisp scale
        m.sprite.scale.set(3.4, 0.85, 1);
        (m.sprite.material as THREE.SpriteMaterial).opacity = 0.95;
        (m.groundRing.material as THREE.MeshBasicMaterial).opacity = 0.5;
      } else {
        // Distant marker: subtle and neat
        m.sprite.scale.set(2.8, 0.7, 1);
        (m.sprite.material as THREE.SpriteMaterial).opacity = Math.max(0.35, 1.0 - dist / 55);
        (m.groundRing.material as THREE.MeshBasicMaterial).opacity = 0.25;
      }
    }
  }

  public removeMarker(id: string) {
    const idx = this.markers.findIndex((m) => m.id === id);
    if (idx !== -1) {
      const m = this.markers[idx];
      this.group.remove(m.sprite);
      this.group.remove(m.groundRing);
      this.markers.splice(idx, 1);
    }
  }
}

