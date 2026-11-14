import * as THREE from 'three';
import { VoxelTerrain } from '../world/VoxelTerrain';
import { OutpostStructures } from '../world/OutpostStructures';
import { Astronaut, type AstronautInput } from '../astronaut/Astronaut';
import { CameraController } from '../camera/CameraController';
import { InteractionSystem } from '../interaction/InteractionSystem';
import { ConstructionManager } from '../construction/ConstructionManager';
import { NavigationBeacon } from '../interaction/NavigationBeacon';
import { OutpostMarkers } from '../interaction/OutpostMarkers';
import { OBJECTIVE_NAV_TARGETS } from '../missions/missionNavTargets';
import { useGameStore } from '../../store/gameStore';

export class GameEngine {
  private container: HTMLElement | null = null;
  private scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer;
  private cameraCtrl: CameraController;

  // Subsystems
  public terrain: VoxelTerrain;
  public structures: OutpostStructures;
  public astronaut: Astronaut;
  public interaction: InteractionSystem;
  public construction: ConstructionManager;
  public beacon: NavigationBeacon;
  public markers: OutpostMarkers;

  // Lighting
  private dirLight: THREE.DirectionalLight;
  private ambientLight: THREE.AmbientLight;
  private emergencyLight: THREE.PointLight;

  // Loop & Input
  private isRunning: boolean = false;
  private animFrameId: number | null = null;
  private lastTime: number = 0;
  private input: AstronautInput = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    sprint: false,
    jump: false,
    interact: false,
  };

  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xd06c3b); // Warm Martian atmospheric sky
    this.scene.fog = new THREE.FogExp2(0xd06c3b, 0.008); // Martian distance dust fog

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    // Isometric Camera
    this.cameraCtrl = new CameraController(window.innerWidth / window.innerHeight);

    // Lights
    this.ambientLight = new THREE.AmbientLight(0xffbe98, 0.65);
    this.scene.add(this.ambientLight);

    this.dirLight = new THREE.DirectionalLight(0xfff0dd, 1.6);
    this.dirLight.position.set(40, 50, 30);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.camera.far = 150;
    const d = 50;
    this.dirLight.shadow.camera.left = -d;
    this.dirLight.shadow.camera.right = d;
    this.dirLight.shadow.camera.top = d;
    this.dirLight.shadow.camera.bottom = -d;
    this.scene.add(this.dirLight);

    // Emergency Red Flashing Strobe
    this.emergencyLight = new THREE.PointLight(0xff0000, 0, 35);
    this.emergencyLight.position.set(0, 4, 0);
    this.scene.add(this.emergencyLight);

    // Subsystems
    this.terrain = new VoxelTerrain();
    this.scene.add(this.terrain.group);

    this.structures = new OutpostStructures();
    this.scene.add(this.structures.group);

    this.astronaut = new Astronaut();
    this.scene.add(this.astronaut.mesh);
    this.scene.add(this.astronaut.dustParticles);

    this.interaction = new InteractionSystem();
    this.scene.add(this.interaction.group);

    this.construction = new ConstructionManager();
    this.scene.add(this.construction.group);

    this.beacon = new NavigationBeacon();
    this.scene.add(this.beacon.group);

    this.markers = new OutpostMarkers();
    this.markers.initMarkers(this.structures.interactiveObjects, this.terrain.rocks);
    this.scene.add(this.markers.group);

    this.bindEvents();
  }

  public mount(container: HTMLElement) {
    this.container = container;
    container.innerHTML = '';
    container.appendChild(this.renderer.domElement);
    this.handleResize();

    this.isRunning = true;
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  public destroy() {
    this.isRunning = false;
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    this.unbindEvents();
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }

  private loop = (currentTime: number) => {
    if (!this.isRunning) return;
    this.animFrameId = requestAnimationFrame(this.loop);

    const delta = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    const store = useGameStore.getState();

    if (store.phase === 'playing') {
      // 1. Simulation loop tick
      store.updateSimulationTick(delta);

      // 2. Update Dynamic Lighting & Sky (Sol Day/Night Cycle)
      this.updateDayNightCycle(store.solTime, store.weather.visibility, store.weather.type === 'dust_storm');

      // 3. Update Astronaut with Camera-Relative Direction
      this.astronaut.update(delta, this.input, (x, z) => this.terrain.getTerrainHeight(x, z), this.cameraCtrl.rotationAngle);

      // 4. Update Habitat Roof Opacity when player is inside
      this.structures.setHabitatInteriorMode(this.astronaut.isInsideHabitat);

      // 5. Update Camera
      this.cameraCtrl.follow(this.astronaut.position, delta);

      // 6. Update Terrain Dust & Wind
      this.terrain.update(delta, store.weather.intensity);

      // 7. Update Outpost Animations (Solar tracking, sparks)
      const inverterHealthy = store.missions[1]?.completed || false;
      this.structures.update(delta, store.solTime, inverterHealthy);

      // 8. Update Universal Interaction Proximity
      this.interaction.update(
        this.astronaut.position,
        this.structures.interactiveObjects,
        this.terrain.rocks,
        delta
      );

      // 9. Update Construction Ghost Preview
      const activeRecipe = store.recipes.find((r) => r.id === store.selectedRecipeId) || null;
      this.construction.update(
        this.astronaut.position,
        this.astronaut.mesh.rotation.y,
        activeRecipe,
        store.constructionMode
      );

      // 10. Update Active Mission Navigation Target & 3D Sky Beacon
      const currentMission = store.missions[store.currentMissionIndex];
      const activeObj = currentMission?.objectives.find((o) => !o.completed);
      const navTarget = activeObj && OBJECTIVE_NAV_TARGETS[activeObj.id] ? OBJECTIVE_NAV_TARGETS[activeObj.id] : null;

      if (navTarget) {
        // Distance from astronaut to target
        const targetVec = new THREE.Vector3(navTarget.position[0], navTarget.position[1], navTarget.position[2]);
        const dist = Math.round(this.astronaut.position.distanceTo(targetVec));

        this.beacon.group.visible = true;
        this.beacon.setTarget(navTarget.position, navTarget.color || 0x00f5d4, navTarget.targetName, dist);
        this.beacon.update(delta, this.astronaut.position);

        // Exact 2D screen-relative compass bearing
        const dx = targetVec.x - this.astronaut.position.x;
        const dz = targetVec.z - this.astronaut.position.z;
        const camAngle = this.cameraCtrl.rotationAngle;

        // Camera axes projected onto ground
        const camUpX = -Math.cos(camAngle);
        const camUpZ = -Math.sin(camAngle);
        const camRightX = Math.sin(camAngle);
        const camRightZ = -Math.cos(camAngle);

        const forward = dx * camUpX + dz * camUpZ;
        const right = dx * camRightX + dz * camRightZ;
        let deg = Math.atan2(right, forward) * (180 / Math.PI);
        if (deg < 0) deg += 360;

        let arrow = '⬆';
        if (deg >= 22.5 && deg < 67.5) arrow = '↗';
        else if (deg >= 67.5 && deg < 112.5) arrow = '➡';
        else if (deg >= 112.5 && deg < 157.5) arrow = '↘';
        else if (deg >= 157.5 && deg < 202.5) arrow = '⬇';
        else if (deg >= 202.5 && deg < 247.5) arrow = '↙';
        else if (deg >= 247.5 && deg < 292.5) arrow = '⬅';
        else if (deg >= 292.5 && deg < 337.5) arrow = '↖';

        store.setActiveNavTarget({
          name: navTarget.targetName,
          distance: dist,
          directionArrow: arrow,
          hint: navTarget.hint,
          position: navTarget.position,
        });
      } else {
        this.beacon.group.visible = false;
        store.setActiveNavTarget(null);
      }

      // 11. Update Holographic Outpost Station Highlights
      this.markers.update(
        delta,
        this.astronaut.position,
        navTarget ? navTarget.position : null,
        store.showAllHighlights
      );
    }

    // Render Scene
    this.renderer.render(this.scene, this.cameraCtrl.camera);
  };

  private updateDayNightCycle(solTime: number, visibility: number, isStorm: boolean) {
    // solTime 0 to 24.6h (Day is 6.0 to 18.6)
    const isDay = solTime >= 6.0 && solTime <= 18.6;
    let sunFactor = 0;
    if (isDay) {
      const dayProgress = (solTime - 6.0) / 12.6;
      sunFactor = Math.sin(dayProgress * Math.PI);
    }

    // Sky colors
    let skyR = 0.82 * sunFactor * visibility;
    let skyG = 0.42 * sunFactor * visibility;
    let skyB = 0.23 * sunFactor * visibility;

    if (isStorm) {
      skyR = 0.45 * visibility;
      skyG = 0.22 * visibility;
      skyB = 0.12 * visibility;
    } else if (!isDay) {
      // Martian night (deep navy indigo)
      skyR = 0.04;
      skyG = 0.05;
      skyB = 0.12;
    }

    const skyColor = new THREE.Color(skyR, skyG, skyB);
    this.scene.background = skyColor;
    (this.scene.fog as THREE.FogExp2).color = skyColor;

    // Light Intensity
    const lightMultiplier = isStorm ? 0.25 : 1.0;
    this.dirLight.intensity = Math.max(0.05, sunFactor * 1.6 * lightMultiplier);
    this.ambientLight.intensity = Math.max(0.12, (0.35 + sunFactor * 0.4) * lightMultiplier);

    // Move directional light to track sun arc
    const sunAngle = ((solTime - 6.0) / 12.6) * Math.PI;
    this.dirLight.position.set(Math.cos(sunAngle) * 50, Math.sin(sunAngle) * 55 + 5, 30);

    // Emergency strobe if alarm active
    const store = useGameStore.getState();
    if (store.activeEmergency) {
      const pulse = (Math.sin(performance.now() * 0.01) + 1) * 0.5;
      this.emergencyLight.intensity = pulse * 3.5;
    } else {
      this.emergencyLight.intensity = 0;
    }
  }

  // --- INPUT HANDLING ---
  private onKeyDown = (e: KeyboardEvent) => {
    const store = useGameStore.getState();
    if (store.phase !== 'playing') return;

    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.input.forward = true;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.input.backward = true;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.input.left = true;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.input.right = true;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.input.sprint = true;
        break;
      case 'Space':
        this.input.jump = true;
        break;
      case 'KeyE':
        // Universal Interaction Trigger
        this.interaction.executeCurrentInteraction((type) => {
          this.astronaut.triggerActionAnimation(type);
        }, this.astronaut);
        break;
      case 'KeyH':
      case 'KeyN':
        // Toggle 3D Outpost Holographic Highlights
        store.setShowAllHighlights(!store.showAllHighlights);
        store.showToast(
          store.showAllHighlights
            ? 'TACTICAL HUD: ALL BASE FACILITIES HIGHLIGHTED'
            : 'TACTICAL HUD: HIGHLIGHTS CONCEALED'
        );
        break;
      case 'KeyC':
        // Toggle Construction Mode
        store.setConstructionMode(!store.constructionMode);
        break;
      case 'KeyQ':
        // Rotate Camera Left
        this.cameraCtrl.rotateLeft();
        break;
      case 'KeyR':
        // Rotate Camera Right
        this.cameraCtrl.rotateRight();
        break;
      case 'KeyB':
        // If in construction mode, place object!
        if (store.constructionMode && store.selectedRecipeId) {
          const recipe = store.recipes.find((r) => r.id === store.selectedRecipeId);
          if (recipe) {
            this.construction.placeObject(recipe);
          }
        }
        break;
      case 'Escape':
        store.setPhase('paused');
        break;
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.input.forward = false;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.input.backward = false;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.input.left = false;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.input.right = false;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.input.sprint = false;
        break;
      case 'Space':
        this.input.jump = false;
        break;
    }
  };

  private onWheel = (e: WheelEvent) => {
    this.cameraCtrl.handleWheel(e.deltaY);
  };

  private handleResize = () => {
    if (!this.container) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.renderer.setSize(w, h);
    this.cameraCtrl.setAspect(w / h);
  };

  public setVirtualInput(partial: Partial<AstronautInput>) {
    this.input = { ...this.input, ...partial };
  }

  public triggerMobileInteract() {
    this.interaction.executeCurrentInteraction((type) => {
      this.astronaut.triggerActionAnimation(type);
    }, this.astronaut);
  }

  public triggerMobileBuild() {
    const store = useGameStore.getState();
    if (store.constructionMode && store.selectedRecipeId) {
      const recipe = store.recipes.find((r) => r.id === store.selectedRecipeId);
      if (recipe) {
        this.construction.placeObject(recipe);
      }
    }
  }

  private onPointerDown = () => {
    const store = useGameStore.getState();
    if (store.phase !== 'playing') return;

    // Direct click interaction
    if (this.interaction.activeObject) {
      this.interaction.executeCurrentInteraction((type) => {
        this.astronaut.triggerActionAnimation(type);
      }, this.astronaut);
    }
  };

  private bindEvents() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('wheel', this.onWheel, { passive: true });
    window.addEventListener('resize', this.handleResize);
    this.renderer.domElement.addEventListener('pointerdown', this.onPointerDown);
  }

  private unbindEvents() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('wheel', this.onWheel);
    window.removeEventListener('resize', this.handleResize);
    this.renderer.domElement.removeEventListener('pointerdown', this.onPointerDown);
  }
}

