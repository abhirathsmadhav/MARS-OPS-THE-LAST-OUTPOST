import * as THREE from 'three';

export interface CollisionObstacle {
  id: string;
  type: 'box' | 'cylinder';
  position: THREE.Vector3;
  bounds: { hx?: number; hz?: number; radius?: number };
}

export class CollisionSystem {
  public obstacles: CollisionObstacle[] = [];

  constructor() {
    this.initDefaultBaseObstacles();
  }

  public initDefaultBaseObstacles() {
    this.obstacles = [];

    // --- ZONE A: MAIN HABITAT HUB ---
    // Outer dome circular radius is ~7.5m, centered at [0, 0, 0].
    // Hollow airlock corridor extends South from z = 7.0 to z = 11.2, width x = [-1.6, +1.6].
    // Left & Right Airlock walls:
    this.addBox('hab_airlock_wall_left', -1.95, 9.1, 0.25, 2.1);
    this.addBox('hab_airlock_wall_right', 1.95, 9.1, 0.25, 2.1);

    // Habitat Dome Wall Segments (Skipping i = 0 which is South entrance to airlock!)
    for (let i = 1; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const x = Math.sin(angle) * 7.5;
      const z = Math.cos(angle) * 7.5;
      // Cylinder pillars around dome perimeter give smooth circular wall sliding!
      this.addCylinder(`hab_wall_post_${i}`, x, z, 1.4);
    }

    // Habitat interior equipment (solid obstacles inside dome)
    this.addBox('hab_bunk', -4.5, -3.5, 1.3, 0.8);
    this.addBox('hab_med', 4.5, -3.5, 1.0, 0.7);
    this.addBox('hab_console', 0, -4.5, 1.3, 0.7);
    this.addBox('hab_storage', -4.5, 2.0, 0.8, 0.8);
    this.addBox('hab_water', 4.5, 2.0, 0.6, 0.6);

    // --- ZONE B: POWER STATION ---
    // 4 Solar panels (post/frame footprints)
    this.addBox('solar_panel_1', -26, -7, 2.3, 1.5);
    this.addBox('solar_panel_2', -18, -7, 2.3, 1.5);
    this.addBox('solar_panel_3', -26, 7, 2.3, 1.5);
    this.addBox('solar_panel_4', -18, 7, 2.3, 1.5);

    // Battery Bank, Inverter & Backup Generator
    this.addBox('battery_bank', -25, 0, 1.8, 1.2);
    this.addBox('solar_inverter', -19, 0, 1.1, 1.0);
    this.addBox('backup_generator', -22, -8.5, 1.6, 1.2);

    // --- ZONE C: CONTROLLED-ENVIRONMENT GREENHOUSE ---
    // Greenhouse outer walls: 16m wide (x: 14 to 30) x 18m deep (z: -9 to +9), centered at [22, 0, 0]
    // East back wall:
    this.addBox('greenhouse_wall_e', 29.6, 0, 0.4, 8.8);
    // North wall:
    this.addBox('greenhouse_wall_n', 22, -8.8, 7.6, 0.4);
    // South wall:
    this.addBox('greenhouse_wall_s', 22, 8.8, 7.6, 0.4);
    // West front wall has open entrance at center (z: -2 to +2)
    this.addBox('greenhouse_wall_w1', 14.4, -5.5, 0.4, 3.2);
    this.addBox('greenhouse_wall_w2', 14.4, 5.5, 0.4, 3.2);

    // Hydroponic Trays inside greenhouse
    this.addBox('hydro_tray_1', 22, -5, 5.0, 1.2);
    this.addBox('hydro_tray_2', 22, 0, 5.0, 1.2);
    this.addBox('hydro_tray_3', 22, 5, 5.0, 1.2);
    this.addCylinder('nutrient_tank', 16, -7, 1.1);

    // --- ZONE D: SCIENCE LAB ---
    // Enclosure at [0, 0, -22], 16m wide x 12m deep (x: -8 to +8, z: -28 to -16)
    // North back wall:
    this.addBox('lab_wall_n', 0, -27.8, 7.8, 0.4);
    // West wall:
    this.addBox('lab_wall_w', -7.8, -22, 0.4, 5.6);
    // East wall:
    this.addBox('lab_wall_e', 7.8, -22, 0.4, 5.6);
    // South front wall leaves open entrance at center
    this.addBox('lab_wall_s1', -5.2, -16.2, 2.4, 0.4);
    this.addBox('lab_wall_s2', 5.2, -16.2, 2.4, 0.4);

    // Internal lab instruments
    this.addBox('spectrometer_station', -4, -22, 1.4, 1.0);
    this.addBox('moxie_processor', 4, -22, 1.3, 1.1);

    // --- ZONE E: COMMUNICATIONS & DSN ARRAY ---
    this.addCylinder('comm_tower', 0, 24, 1.3);
    this.addBox('comm_console', 3.5, 24, 1.1, 0.7);

    // --- ZONE F: EXPLORATION ROVER (MPR-1) ---
    // Chassis & Wheels footprint at [12, 0.8, 16]
    this.addBox('exploration_rover', 12, 16, 2.0, 1.4);
  }

  public addBox(id: string, x: number, z: number, hx: number, hz: number) {
    this.obstacles.push({
      id,
      type: 'box',
      position: new THREE.Vector3(x, 0, z),
      bounds: { hx, hz },
    });
  }

  public addCylinder(id: string, x: number, z: number, radius: number) {
    this.obstacles.push({
      id,
      type: 'cylinder',
      position: new THREE.Vector3(x, 0, z),
      bounds: { radius },
    });
  }

  public addConstructedObstacle(id: string, type: string, x: number, z: number) {
    if (type === 'constructed_solar') {
      this.addBox(id, x, z, 1.3, 1.1);
    } else if (type === 'constructed_battery') {
      this.addBox(id, x, z, 0.9, 0.9);
    } else if (type === 'constructed_tank') {
      this.addCylinder(id, x, z, 0.9);
    } else if (type === 'constructed_berm') {
      this.addBox(id, x, z, 1.6, 0.5);
    }
  }

  public removeObstacle(id: string) {
    this.obstacles = this.obstacles.filter((o) => o.id !== id);
  }

  /**
   * Resolves collision for an entity with radius `entityRadius` moving to `pos`.
   * Standard Circle-vs-Cylinder and Circle-vs-AABB continuous separation with normal sliding.
   */
  public resolveCollision(
    pos: THREE.Vector3,
    velocity: THREE.Vector3,
    entityRadius: number = 0.4
  ): { position: THREE.Vector3; velocity: THREE.Vector3; collided: boolean } {
    let collided = false;
    const correctedPos = pos.clone();
    const correctedVel = velocity.clone();

    // Iterate through obstacles
    for (const obs of this.obstacles) {
      if (obs.type === 'cylinder') {
        const obsPos = obs.position;
        const totalRadius = (obs.bounds.radius || 1.0) + entityRadius;
        const dx = correctedPos.x - obsPos.x;
        const dz = correctedPos.z - obsPos.z;
        const distSq = dx * dx + dz * dz;

        if (distSq < totalRadius * totalRadius && distSq > 0.0001) {
          collided = true;
          const dist = Math.sqrt(distSq);
          const overlap = totalRadius - dist;
          const nx = dx / dist;
          const nz = dz / dist;

          // Push position along collision normal
          correctedPos.x += nx * overlap;
          correctedPos.z += nz * overlap;

          // Slide velocity along tangent
          const dot = correctedVel.x * nx + correctedVel.z * nz;
          if (dot < 0) {
            correctedVel.x -= dot * nx;
            correctedVel.z -= dot * nz;
          }
        }
      } else if (obs.type === 'box') {
        const obsPos = obs.position;
        const hx = obs.bounds.hx || 1.0;
        const hz = obs.bounds.hz || 1.0;

        // Closest point on box perimeter to entity center
        const closestX = Math.max(obsPos.x - hx, Math.min(obsPos.x + hx, correctedPos.x));
        const closestZ = Math.max(obsPos.z - hz, Math.min(obsPos.z + hz, correctedPos.z));

        const dx = correctedPos.x - closestX;
        const dz = correctedPos.z - closestZ;
        const distSq = dx * dx + dz * dz;

        if (distSq < entityRadius * entityRadius) {
          collided = true;

          if (distSq > 0.00001) {
            // Entity center is outside the box, but within entityRadius of an edge or corner
            const dist = Math.sqrt(distSq);
            const overlap = entityRadius - dist;
            const nx = dx / dist;
            const nz = dz / dist;

            correctedPos.x += nx * overlap;
            correctedPos.z += nz * overlap;

            const dot = correctedVel.x * nx + correctedVel.z * nz;
            if (dot < 0) {
              correctedVel.x -= dot * nx;
              correctedVel.z -= dot * nz;
            }
          } else {
            // Entity center has penetrated inside the box: find nearest face to push out
            const overlapLeft = correctedPos.x - (obsPos.x - hx);
            const overlapRight = obsPos.x + hx - correctedPos.x;
            const overlapTop = correctedPos.z - (obsPos.z - hz);
            const overlapBottom = obsPos.z + hz - correctedPos.z;

            const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

            let nx = 0;
            let nz = 0;
            if (minOverlap === overlapLeft) {
              correctedPos.x = obsPos.x - hx - entityRadius;
              nx = -1;
            } else if (minOverlap === overlapRight) {
              correctedPos.x = obsPos.x + hx + entityRadius;
              nx = 1;
            } else if (minOverlap === overlapTop) {
              correctedPos.z = obsPos.z - hz - entityRadius;
              nz = -1;
            } else {
              correctedPos.z = obsPos.z + hz + entityRadius;
              nz = 1;
            }

            const dot = correctedVel.x * nx + correctedVel.z * nz;
            if (dot < 0) {
              correctedVel.x -= dot * nx;
              correctedVel.z -= dot * nz;
            }
          }
        }
      }
    }

    return { position: correctedPos, velocity: correctedVel, collided };
  }
}

export const collisionSystem = new CollisionSystem();
