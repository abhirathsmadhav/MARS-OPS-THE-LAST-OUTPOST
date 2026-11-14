import * as THREE from 'three';
import { useGameStore } from '../../store/gameStore';
import type { ConstructionRecipe, ObjectType } from '../../types';
import { collisionSystem } from '../core/CollisionSystem';

export class ConstructionManager {
  public group: THREE.Group;
  private previewMesh: THREE.Mesh | null = null;
  public constructedMeshes: Map<string, THREE.Object3D> = new Map();
  public previewPosition: THREE.Vector3 = new THREE.Vector3();
  public canBuildHere: boolean = false;

  constructor() {
    this.group = new THREE.Group();
    this.createGhostPreview();
  }

  private createGhostPreview() {
    const geo = new THREE.BoxGeometry(2, 1.5, 2);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x00f5d4,
      transparent: true,
      opacity: 0.5,
      wireframe: true,
    });
    this.previewMesh = new THREE.Mesh(geo, mat);
    this.previewMesh.visible = false;
    this.group.add(this.previewMesh);
  }

  public update(astronautPos: THREE.Vector3, astronautFacingY: number, activeRecipe: ConstructionRecipe | null, isBuildMode: boolean) {
    if (!isBuildMode || !activeRecipe || !this.previewMesh) {
      if (this.previewMesh) this.previewMesh.visible = false;
      return;
    }

    this.previewMesh.visible = true;

    // Place preview 4 meters ahead of astronaut in their facing direction
    const forwardX = Math.sin(astronautFacingY) * 4.0;
    const forwardZ = Math.cos(astronautFacingY) * 4.0;

    // Grid snapping (2m voxels)
    const rawX = astronautPos.x + forwardX;
    const rawZ = astronautPos.z + forwardZ;

    const snapX = Math.round(rawX / 2) * 2;
    const snapZ = Math.round(rawZ / 2) * 2;

    this.previewPosition.set(snapX, 0.75, snapZ);
    this.previewMesh.position.copy(this.previewPosition);

    // Check if player has required resources
    const store = useGameStore.getState();
    let hasCost = true;
    for (const cost of activeRecipe.cost) {
      if (store.getItemCount(cost.itemId) < cost.quantity) {
        hasCost = false;
        break;
      }
    }

    this.canBuildHere = hasCost;
    const mat = this.previewMesh.material as THREE.MeshBasicMaterial;
    mat.color.setHex(hasCost ? 0x00f5d4 : 0xff3333);
  }

  public placeObject(recipe: ConstructionRecipe): boolean {
    if (!this.canBuildHere) return false;

    const store = useGameStore.getState();
    const id = `const_${recipe.modelType}_${Date.now()}`;
    const success = store.addConstructedObject({
      id,
      type: recipe.modelType,
      position: [this.previewPosition.x, this.previewPosition.y, this.previewPosition.z],
    });

    if (success) {
      this.spawnConstructedMesh(id, recipe.modelType, this.previewPosition);
      return true;
    }
    return false;
  }

  public spawnConstructedMesh(id: string, type: ObjectType, pos: THREE.Vector3) {
    const group = new THREE.Group();
    group.position.copy(pos);

    if (type === 'constructed_solar') {
      const frame = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 0.2, 2.0),
        new THREE.MeshStandardMaterial({ color: 0x2b6cb0, metalness: 0.8, roughness: 0.2 })
      );
      frame.rotation.x = -Math.PI / 6;
      group.add(frame);
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.15, 1.2, 6),
        new THREE.MeshStandardMaterial({ color: 0x718096 })
      );
      post.position.set(0, -0.6, 0);
      group.add(post);
    } else if (type === 'constructed_battery') {
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 1.4, 1.6),
        new THREE.MeshStandardMaterial({ color: 0x38a169, roughness: 0.4 })
      );
      group.add(box);
    } else if (type === 'constructed_tank') {
      const tank = new THREE.Mesh(
        new THREE.CylinderGeometry(0.8, 0.8, 2.0, 8),
        new THREE.MeshStandardMaterial({ color: 0x3182ce, roughness: 0.3, metalness: 0.5 })
      );
      group.add(tank);
    } else if (type === 'constructed_berm') {
      const wall = new THREE.Mesh(
        new THREE.BoxGeometry(3.0, 1.6, 0.8),
        new THREE.MeshStandardMaterial({ color: 0x9c4221, roughness: 0.9, flatShading: true })
      );
      group.add(wall);
    }

    this.group.add(group);
    this.constructedMeshes.set(id, group);
    collisionSystem.addConstructedObstacle(id, type, pos.x, pos.z);
  }
}

