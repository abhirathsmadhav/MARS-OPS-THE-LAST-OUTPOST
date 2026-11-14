import * as THREE from 'three';
import type { InteractiveObject } from '../../types';
import { useGameStore } from '../../store/gameStore';
import { audioManager } from '../audio/AudioManager';
import { collisionSystem } from '../core/CollisionSystem';
import type { VoxelRock } from '../world/VoxelTerrain';
import type { Astronaut } from '../astronaut/Astronaut';

export class InteractionSystem {
  public group: THREE.Group;
  private targetRing: THREE.Mesh;
  private targetChevron: THREE.Group;
  public activeObject: (InteractiveObject & { isRock?: boolean; rockRef?: VoxelRock }) | null = null;
  private interactionRadius: number = 4.8; // Comfortable interaction range
  private animTimer: number = 0;

  constructor() {
    this.group = new THREE.Group();

    // 1. Ground Target Ring
    const ringGeo = new THREE.RingGeometry(1.3, 1.55, 20);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00f5d4,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    this.targetRing = new THREE.Mesh(ringGeo, ringMat);
    this.targetRing.visible = false;
    this.group.add(this.targetRing);

    // 2. Floating Animated 3D Chevron Marker above object
    this.targetChevron = new THREE.Group();
    const chevronGeo = new THREE.ConeGeometry(0.35, 0.65, 4);
    chevronGeo.rotateX(Math.PI); // Point down
    const chevronMat = new THREE.MeshBasicMaterial({
      color: 0x00f5d4,
      wireframe: false,
    });
    const chevronMesh = new THREE.Mesh(chevronGeo, chevronMat);
    this.targetChevron.add(chevronMesh);

    // Inner glowing diamond
    const diamond = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.2, 0),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    this.targetChevron.add(diamond);

    this.targetChevron.visible = false;
    this.group.add(this.targetChevron);
  }

  public update(
    astronautPos: THREE.Vector3,
    staticObjects: InteractiveObject[],
    rocks: VoxelRock[],
    delta: number
  ) {
    this.animTimer += delta * 4;

    let closestDist = this.interactionRadius;
    let closestObj: (InteractiveObject & { isRock?: boolean; rockRef?: VoxelRock }) | null = null;

    // 1. Check static base facilities
    for (const obj of staticObjects) {
      const pos = new THREE.Vector3(obj.position[0], obj.position[1], obj.position[2]);
      const dist = pos.distanceTo(astronautPos);
      if (dist < closestDist) {
        closestDist = dist;
        closestObj = obj;
      }
    }

    // 2. Check unmined mineral rocks
    for (const rock of rocks) {
      if (rock.mined) continue;
      const dist = rock.position.distanceTo(astronautPos);
      if (dist < closestDist) {
        closestDist = dist;
        const rockName =
          rock.type === 'hematite'
            ? 'Iron Hematite Vein (Fe2O3)'
            : rock.type === 'silicon'
            ? 'Silicon Crystal Nodule (SiO2)'
            : rock.type === 'ice'
            ? 'Subsurface Water Ice Deposit (H2O)'
            : 'Martian Surface Regolith Pile';

        closestObj = {
          id: `rock_${rock.type}_${rock.position.x.toFixed(0)}_${rock.position.z.toFixed(0)}`,
          name: rockName,
          type:
            rock.type === 'hematite'
              ? 'mineral_hematite'
              : rock.type === 'silicon'
              ? 'mineral_silicon'
              : rock.type === 'ice'
              ? 'mineral_ice'
              : 'mineral_regolith',
          position: [rock.position.x, rock.position.y, rock.position.z],
          zone: 'Zone F: Surface Ore',
          actions: ['Mine Sample [E]'],
          status: 'ready',
          health: 100,
          infoText: `Raw planetary resource. Harvest with EVA Multi-Tool.`,
          isRock: true,
          rockRef: rock,
        };
      }
    }

    this.activeObject = closestObj;

    // Update 3D Visual Indicators
    if (closestObj) {
      const targetPos = new THREE.Vector3(closestObj.position[0], closestObj.position[1], closestObj.position[2]);

      // Ground Ring
      this.targetRing.visible = true;
      this.targetRing.position.set(targetPos.x, targetPos.y + 0.08, targetPos.z);
      this.targetRing.rotation.y += 1.8 * delta;

      // Floating Chevron with bobbing animation
      this.targetChevron.visible = true;
      const bobY = Math.sin(this.animTimer) * 0.18;
      const heightOffset = closestObj.isRock ? 1.6 : 3.2;
      this.targetChevron.position.set(targetPos.x, targetPos.y + heightOffset + bobY, targetPos.z);
      this.targetChevron.rotation.y += 2.2 * delta;

      // Update Zustand HUD Store
      useGameStore.getState().setCurrentInteraction({
        objectId: closestObj.id,
        name: closestObj.name,
        type: closestObj.type,
        promptText: `[E] ${closestObj.actions[0] || 'Interact'}`,
        actions: closestObj.actions,
        canInteract: true,
      });
    } else {
      this.targetRing.visible = false;
      this.targetChevron.visible = false;
      useGameStore.getState().setCurrentInteraction(null);
    }
  }

  public executeCurrentInteraction(
    astronautTriggerFn: (type: 'mine' | 'repair' | 'interact') => void,
    astronaut?: Astronaut
  ) {
    if (!this.activeObject) return;

    const store = useGameStore.getState();
    const obj = this.activeObject;

    if (obj.isRock && obj.rockRef) {
      // 1. Mine Mineral Deposit
      astronautTriggerFn('mine');
      audioManager.playMineRock();

      obj.rockRef.mined = true;
      obj.rockRef.mesh.visible = false;
      if (obj.rockRef.mesh.parent) {
        obj.rockRef.mesh.parent.visible = false;
      }
      // Remove physical collision from mined rock
      collisionSystem.removeObstacle(`ore_node_${obj.id}`);

      // Hide marker immediately
      this.targetRing.visible = false;
      this.targetChevron.visible = false;
      this.activeObject = null;
      store.setCurrentInteraction(null);

      const rawType = obj.rockRef.type;
      const itemId = rawType === 'hematite' ? 'iron' : rawType;
      const itemName =
        rawType === 'hematite'
          ? 'Iron Hematite Ore'
          : rawType === 'silicon'
          ? 'Silicon Ingot'
          : rawType === 'ice'
          ? 'Cryogenic Water Ice'
          : 'Martian Regolith Simulant';

      store.addItem(
        {
          id: itemId,
          name: itemName,
          category: 'mineral',
          maxStack: 20,
          icon: rawType === 'ice' ? 'droplet' : rawType === 'silicon' ? 'cpu' : 'box',
          description: `Raw ore excavated from Mars surface.`,
          weight: 1.5,
        },
        1
      );

      store.incrementStat('mineralsMined');
      store.showToast(`+1 ${itemName.toUpperCase()} HARVESTED`);

      // Check Mission Progress
      if (rawType === 'regolith') {
        store.progressObjective('m1_first_contact', 'm1_obj3');
      } else if (rawType === 'ice') {
        store.progressObjective('m3_life_support', 'm3_obj1');
        store.progressObjective('m4_water_recovery', 'm4_obj1');
      } else if (rawType === 'silicon' || rawType === 'hematite') {
        store.progressObjective('m7_independent_survival', 'm7_obj1');
      }

      return;
    }

    // 2. Base Facility Interactions
    astronautTriggerFn('interact');
    audioManager.playInteract();

    switch (obj.type) {
      case 'habitat_airlock': {
        // Cycling Airlock: smoothly transitions astronaut through the airlock!
        audioManager.playAirVent();
        audioManager.playSuccessChime();

        if (astronaut) {
          if (astronaut.position.z >= 7.0) {
            // Outside -> Enter Habitat Hub
            astronaut.teleportTo(0, 0.2, 3.5, Math.PI);
            store.showToast('AIRLOCK CYCLED: PRESSURIZING TO 101.3 kPa. ENTERING HABITAT HUB.');
          } else {
            // Inside -> Exit to Mars Surface EVA
            astronaut.teleportTo(0, 0.2, 12.0, 0);
            store.showToast('AIRLOCK CYCLED: DEPRESSURIZING. ENTERING MARS SURFACE EVA.');
          }
        }
        store.progressObjective('m1_first_contact', 'm1_obj1');
        break;
      }

      case 'storage_crate': {
        store.addItem(
          {
            id: 'electronic_part',
            name: 'Thyristor Power Board',
            category: 'component',
            maxStack: 10,
            icon: 'cpu',
            description: 'Solid-state high-current electrical component for solar inverters.',
            weight: 0.5,
          },
          1
        );
        audioManager.playSuccessChime();
        store.showToast('+1 THYRISTOR POWER BOARD RETRIEVED FROM HABITAT STORAGE');
        store.progressObjective('m2_power_restoration', 'm2_obj1');
        break;
      }

      case 'habitat_console': {
        store.progressObjective('m1_first_contact', 'm1_obj1');
        store.modifyResource('crewHealth', 15);
        audioManager.playSuccessChime();
        store.showToast('ECLSS CONSOLE: 101.3 kPa O2/N2 BALANCE NOMINAL. CREW VITALS RECOVERED.');
        break;
      }

      case 'power_inverter': {
        store.progressObjective('m1_first_contact', 'm1_obj2');
        store.progressObjective('m2_power_restoration', 'm2_obj2');
        store.openRepairModal(obj.id, 'Solar Inverter Diagnostics & Calibration', 'power_inverter');
        store.showToast('INVERTER DIAGNOSTIC INTERFACE OPENED');
        break;
      }

      case 'solar_array': {
        store.progressObjective('m1_first_contact', 'm1_obj2');
        store.modifyResource('power', 15);
        audioManager.playSuccessChime();
        store.showToast('SOLAR CELLS DUST PURGED: +15kW GRID GENERATION RESTORED');
        break;
      }

      case 'oxygen_processor': {
        if (store.hasItem('ice', 1)) {
          store.removeItem('ice', 1);
          store.modifyResource('oxygen', 25);
          store.progressObjective('m3_life_support', 'm3_obj2');
          store.showToast('MOXIE PROCESSOR: 1 ICE SUBLIMATED INTO +25% PURE O2');
        } else {
          store.modifyResource('oxygen', 12);
          store.showToast('MOXIE PROCESSOR: ATMOSPHERIC CO2 ELECTROLYSIS +12% O2');
        }
        audioManager.playAirVent();
        store.openRepairModal(obj.id, 'MOXIE Oxygen Processor Maintenance', 'oxygen_processor');
        break;
      }

      case 'water_recycler': {
        if (store.hasItem('ice', 1)) {
          store.removeItem('ice', 1);
          store.modifyResource('water', 25);
          store.progressObjective('m4_water_recovery', 'm4_obj3');
          store.showToast('WATER PURIFIER: 1 ICE MELTED & FILTERED (+25% WATER)');
        } else {
          store.modifyResource('water', 15);
          store.showToast('CLOSED-LOOP PURIFIER: CATALYTIC FLUSH (+15% WATER)');
        }
        audioManager.playSuccessChime();
        store.openRepairModal(obj.id, 'Closed-Loop Water Purifier Flush', 'water_recycler');
        break;
      }

      case 'backup_generator': {
        store.progressObjective('m6_dust_storm', 'm6_obj1');
        store.modifyResource('power', 50);
        audioManager.playGeneratorLoop();
        store.showToast('BACKUP METHANE GENERATOR STARTED: +50kW TO POWER GRID');
        break;
      }

      case 'greenhouse_tray': {
        store.progressObjective('m5_greenhouse', 'm5_obj2');
        store.progressObjective('m5_greenhouse', 'm5_obj3');
        store.modifyResource('food', 25);
        store.incrementStat('cropsHarvested');
        audioManager.playSuccessChime();
        store.showToast('HYDROPONIC HARVEST COMPLETE: +25% FRESH FOOD RESERVES');
        break;
      }

      case 'lab_spectrometer':
      case 'lab_terminal': {
        store.progressObjective('m5_greenhouse', 'm5_obj1');
        store.openScienceModal();
        store.showToast('LIBS LASER SPECTROMETER TERMINAL ENGAGED');
        break;
      }

      case 'comm_dish': {
        audioManager.playSuccessChime();
        store.showToast('DSN CARRIER LOCK: TELEMETRY TRANSMITTED TO NASA CANBERRA STATION');
        break;
      }

      case 'exploration_rover': {
        if (astronaut) {
          astronaut.isRoverMounted = !astronaut.isRoverMounted;
          store.setRoverMounted(astronaut.isRoverMounted);
          if (astronaut.isRoverMounted) {
            audioManager.playSuccessChime();
            store.showToast('MPR-1 ROVER MOUNTED: 2X SPEED & LIFE-SUPPORT RECHARGE ACTIVE');
          } else {
            audioManager.playInteract();
            store.showToast('DISMOUNTED MPR-1 ROVER: EVA SUIT ACTIVE');
          }
        }
        store.progressObjective('m6_dust_storm', 'm6_obj2');
        break;
      }

      default:
        break;
    }
  }
}
