import * as THREE from 'three';
import type { InteractiveObject } from '../../types';

export class OutpostStructures {
  public group: THREE.Group;
  public interactiveObjects: InteractiveObject[] = [];
  public habitatRoofMesh: THREE.Mesh | null = null;
  public solarPanels: THREE.Group[] = [];
  public commDish: THREE.Group | null = null;
  public sparkingParticles: THREE.Points | null = null;
  public greenhousePlants: THREE.Group[] = [];

  constructor() {
    this.group = new THREE.Group();
    this.buildZoneA_Habitat();
    this.buildZoneB_PowerStation();
    this.buildZoneC_Greenhouse();
    this.buildZoneD_ScienceLab();
    this.buildZoneE_Communications();
    this.buildZoneF_Rover();
    this.createInverterSparkParticles();
  }

  // --- ZONE A: MAIN HABITAT DOME & INTERIOR ---
  private buildZoneA_Habitat() {
    // Habitat Base Floor (Octagonal / Round Voxel Slab)
    const floorGeo = new THREE.CylinderGeometry(8, 8, 0.4, 8);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x333b47, // Dark tech grey
      roughness: 0.5,
      metalness: 0.3,
      flatShading: true,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.set(0, 0.2, 0);
    floor.receiveShadow = true;
    this.group.add(floor);

    // Habitat Outer Wall Structure (Cutaway front for visibility & interior exploration)
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0xd8e2ec, // NASA white thermal coating
      roughness: 0.4,
      metalness: 0.2,
      flatShading: true,
    });

    // Hexagonal ring walls (8 sides, skipping i = 0 for South airlock entrance!)
    for (let i = 0; i < 8; i++) {
      // Leave entrance opening on South side (i === 0 is angle = 0, x = 0, z = +7.5)
      if (i === 0) continue;
      const angle = (i / 8) * Math.PI * 2;
      const wallGeo = new THREE.BoxGeometry(5.8, 3.5, 0.6);
      const wall = new THREE.Mesh(wallGeo, wallMat);
      wall.position.set(Math.sin(angle) * 7.5, 1.8, Math.cos(angle) * 7.5);
      wall.rotation.y = angle;
      wall.castShadow = true;
      wall.receiveShadow = true;
      this.group.add(wall);
    }

    // HOLLOW Airlock Tunnel on South side (Spacious walkable interior corridor from z = 7 to z = 11)
    const airlockMat = new THREE.MeshStandardMaterial({ color: 0x242d38, roughness: 0.6, flatShading: true });

    // Left wall
    const airlockWallL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 2.8, 4.0), airlockMat);
    airlockWallL.position.set(-1.8, 1.4, 9.0);
    airlockWallL.castShadow = true;
    airlockWallL.receiveShadow = true;
    this.group.add(airlockWallL);

    // Right wall
    const airlockWallR = new THREE.Mesh(new THREE.BoxGeometry(0.3, 2.8, 4.0), airlockMat);
    airlockWallR.position.set(1.8, 1.4, 9.0);
    airlockWallR.castShadow = true;
    airlockWallR.receiveShadow = true;
    this.group.add(airlockWallR);

    // Ceiling / Roof
    const airlockRoof = new THREE.Mesh(new THREE.BoxGeometry(3.9, 0.3, 4.0), airlockMat);
    airlockRoof.position.set(0, 2.8, 9.0);
    airlockRoof.castShadow = true;
    this.group.add(airlockRoof);

    // Airlock Floor Ramp (Flat with ground)
    const airlockFloor = new THREE.Mesh(
      new THREE.BoxGeometry(3.3, 0.1, 4.0),
      new THREE.MeshStandardMaterial({ color: 0x333b47, roughness: 0.7 })
    );
    airlockFloor.position.set(0, 0.05, 9.0);
    airlockFloor.receiveShadow = true;
    this.group.add(airlockFloor);

    // Airlock Outer Archway Frame (Left & Right posts with wide open walk-through portal)
    const frameMat = new THREE.MeshStandardMaterial({ color: 0xff6b35, roughness: 0.5 });
    const postL = new THREE.Mesh(new THREE.BoxGeometry(0.4, 2.5, 0.3), frameMat);
    postL.position.set(-1.6, 1.25, 11.0);
    const postR = new THREE.Mesh(new THREE.BoxGeometry(0.4, 2.5, 0.3), frameMat);
    postR.position.set(1.6, 1.25, 11.0);
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.4, 0.3), frameMat);
    lintel.position.set(0, 2.6, 11.0);
    this.group.add(postL);
    this.group.add(postR);
    this.group.add(lintel);

    // Airlock Pressure Status Indicator LED (Digital Cyan Glow)
    const airlockLed = new THREE.Mesh(
      new THREE.BoxGeometry(1.0, 0.18, 0.08),
      new THREE.MeshBasicMaterial({ color: 0x00f5d4 })
    );
    airlockLed.position.set(0, 2.7, 11.16);
    this.group.add(airlockLed);

    // Yellow & Black Hazard Caution Sill
    const sill = new THREE.Mesh(
      new THREE.BoxGeometry(3.0, 0.04, 0.4),
      new THREE.MeshStandardMaterial({ color: 0xd69e2e, roughness: 0.6 })
    );
    sill.position.set(0, 0.06, 11.0);
    this.group.add(sill);

    // Interior Module 1: Crew Sleeping Bunks
    const bunkGroup = new THREE.Group();
    const bunkGeo = new THREE.BoxGeometry(2.4, 1.4, 1.4);
    const bunkMat = new THREE.MeshStandardMaterial({ color: 0x4a5568, roughness: 0.6 });
    const bunk = new THREE.Mesh(bunkGeo, bunkMat);
    bunk.position.set(-4.5, 0.9, -3.5);
    bunkGroup.add(bunk);
    this.group.add(bunkGroup);

    // Interior Module 2: Medical Life-Support Diagnostics
    const medStation = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 1.8, 1.2),
      new THREE.MeshStandardMaterial({ color: 0x2b6cb0, roughness: 0.4 })
    );
    medStation.position.set(4.5, 1.0, -3.5);
    this.group.add(medStation);

    // Interior Module 3: Environmental Control Console (Central ECLSS Hub)
    const consoleGroup = new THREE.Group();
    const consoleBase = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 1.2, 1.2),
      new THREE.MeshStandardMaterial({ color: 0x1a202c, roughness: 0.5 })
    );
    const consoleScreen = new THREE.Mesh(
      new THREE.BoxGeometry(2.0, 0.8, 0.1),
      new THREE.MeshBasicMaterial({ color: 0x00ffff })
    );
    consoleScreen.position.set(0, 0.8, 0.5);
    consoleScreen.rotation.x = -Math.PI / 6;
    consoleGroup.add(consoleBase);
    consoleGroup.add(consoleScreen);
    consoleGroup.position.set(0, 0.8, -4.5);
    this.group.add(consoleGroup);

    // Interior Module 4: Habitat Blue Storage Crate (Mission 2 Item)
    const storageCrate = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 1.2, 1.4),
      new THREE.MeshStandardMaterial({ color: 0x3182ce, roughness: 0.4 })
    );
    storageCrate.position.set(-4.5, 0.8, 2);
    this.group.add(storageCrate);

    // Interior Module 5: Water Recycling Unit
    const waterUnit = new THREE.Mesh(
      new THREE.CylinderGeometry(0.9, 0.9, 2.2, 8),
      new THREE.MeshStandardMaterial({ color: 0x63b3ed, roughness: 0.3, metalness: 0.4 })
    );
    waterUnit.position.set(4.5, 1.3, 2);
    this.group.add(waterUnit);

    // Warm Interior Habitat Light
    const habInteriorLight = new THREE.PointLight(0xffecd1, 2.0, 16);
    habInteriorLight.position.set(0, 3.2, 0);
    this.group.add(habInteriorLight);

    // Habitat Cutaway Roof Dome (Semi-transparent / stylized canopy)
    const domeGeo = new THREE.CylinderGeometry(1.5, 8.2, 2.4, 8);
    const domeMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.3,
      transparent: true,
      opacity: 0.65, // Allows player to see inside while giving structure silhouette!
      flatShading: true,
    });
    this.habitatRoofMesh = new THREE.Mesh(domeGeo, domeMat);
    this.habitatRoofMesh.position.set(0, 4.4, 0);
    this.group.add(this.habitatRoofMesh);

    // Register interactive objects
    this.interactiveObjects.push(
      {
        id: 'hab_airlock',
        name: 'Habitat Main Airlock',
        type: 'habitat_airlock',
        position: [0, 1.2, 10.5],
        zone: 'Zone A: Main Habitat',
        actions: ['Enter Habitat', 'Depressurize Airlock'],
        status: 'nominal',
        health: 100,
        infoText: 'High-pressure dual cycle airlock. Regulates 101.3 kPa habitat pressure.',
      },
      {
        id: 'hab_console',
        name: 'ECLSS Environmental Console',
        type: 'habitat_console',
        position: [0, 1.2, -4.5],
        zone: 'Zone A: Main Habitat',
        actions: ['Inspect Diagnostics', 'Run ECLSS Self-Test'],
        status: 'nominal',
        health: 100,
        infoText: 'Controls atmospheric scrubbers, O2 partial pressure, and internal heating.',
      },
      {
        id: 'hab_storage',
        name: 'Habitat Equipment Storage Crate',
        type: 'storage_crate',
        position: [-4.5, 1.0, 2],
        zone: 'Zone A: Main Habitat',
        actions: ['Retrieve Spare Parts', 'Inspect Inventory'],
        status: 'nominal',
        health: 100,
        infoText: 'Secure storage container with electronic modules and multi-tool attachments.',
      },
      {
        id: 'water_recycler',
        name: 'Zone A Closed-Loop Water Recycler',
        type: 'water_recycler',
        position: [4.5, 1.3, 2],
        zone: 'Zone A: Main Habitat',
        actions: ['Inspect Membrane', 'Flush Filtration Beds'],
        status: 'nominal',
        health: 85,
        infoText: 'Recovers potable water using catalytic distillation and vacuum vapor compression.',
      }
    );
  }

  // --- ZONE B: POWER STATION & SOLAR FARM ---
  private buildZoneB_PowerStation() {
    // Power Station Foundation Pad
    const pad = new THREE.Mesh(
      new THREE.BoxGeometry(16, 0.4, 22),
      new THREE.MeshStandardMaterial({ color: 0x2d3748, roughness: 0.8, flatShading: true })
    );
    pad.position.set(-22, 0.2, 0);
    pad.receiveShadow = true;
    this.group.add(pad);

    // 4 Large Voxel Photovoltaic Solar Panels
    const panelCoords = [
      { x: -26, z: -7 },
      { x: -18, z: -7 },
      { x: -26, z: 7 },
      { x: -18, z: 7 },
    ];

    panelCoords.forEach((coord) => {
      const panelGroup = new THREE.Group();
      panelGroup.position.set(coord.x, 0, coord.z);

      // Support Pillar
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.2, 2.6, 6),
        new THREE.MeshStandardMaterial({ color: 0x718096, metalness: 0.6 })
      );
      post.position.set(0, 1.3, 0);
      post.castShadow = true;
      panelGroup.add(post);

      // Solar Array Face (Voxel grid of dark blue photovoltaic cells)
      const arrayFace = new THREE.Group();
      arrayFace.position.set(0, 2.6, 0);

      const arrayFrame = new THREE.Mesh(
        new THREE.BoxGeometry(4.8, 0.2, 3.2),
        new THREE.MeshStandardMaterial({ color: 0x4a5568 })
      );
      arrayFace.add(arrayFrame);

      // Hydraulic Tilt Actuator Piston
      const piston = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 1.4, 6),
        new THREE.MeshStandardMaterial({ color: 0xa0aec0, metalness: 0.8 })
      );
      piston.position.set(0, 1.8, -0.6);
      piston.rotateX(Math.PI / 6);
      panelGroup.add(piston);

      // Blue PV wafers with Silver Busbar Strips
      const waferMat = new THREE.MeshStandardMaterial({
        color: 0x1a365d,
        metalness: 0.8,
        roughness: 0.2,
      });
      for (let rx = -1.8; rx <= 1.8; rx += 1.2) {
        for (let rz = -1.0; rz <= 1.0; rz += 1.0) {
          const wafer = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.05, 0.8), waferMat);
          wafer.position.set(rx, 0.12, rz);
          arrayFace.add(wafer);
        }
      }

      arrayFace.rotation.x = -Math.PI / 6; // Angled to sun
      panelGroup.add(arrayFace);

      this.group.add(panelGroup);
      this.solarPanels.push(panelGroup);
    });

    // High-Voltage Ground Power Conduits between solar panels and inverter
    const conduitMat = new THREE.MeshStandardMaterial({ color: 0x1a202c, roughness: 0.8 });
    const cable1 = new THREE.Mesh(new THREE.BoxGeometry(9, 0.15, 0.18), conduitMat);
    cable1.position.set(-22, 0.35, 0);
    this.group.add(cable1);

    const cable2 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.15, 14), conduitMat);
    cable2.position.set(-22, 0.35, 0);
    this.group.add(cable2);

    // Battery Bank Storage Unit (Zone B)
    const batteryGroup = new THREE.Group();
    const batteryHousing = new THREE.Mesh(
      new THREE.BoxGeometry(3.5, 2.4, 2.2),
      new THREE.MeshStandardMaterial({ color: 0x2b6cb0, roughness: 0.4, flatShading: true })
    );
    batteryHousing.position.set(-25, 1.4, 0);
    batteryHousing.castShadow = true;
    batteryGroup.add(batteryHousing);

    // Battery LED indicators
    for (let k = 0; k < 4; k++) {
      const led = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.3, 0.1),
        new THREE.MeshBasicMaterial({ color: 0x48bb78 })
      );
      led.position.set(-25, 2.0 - k * 0.4, 1.15);
      batteryGroup.add(led);
    }
    this.group.add(batteryGroup);

    // Damaged Solar Inverter (Mission 2 Repair Target)
    const inverterGroup = new THREE.Group();
    const inverterMesh = new THREE.Mesh(
      new THREE.BoxGeometry(2.0, 2.2, 1.8),
      new THREE.MeshStandardMaterial({ color: 0xc53030, roughness: 0.5, flatShading: true }) // Red emergency casing
    );
    inverterMesh.position.set(-19, 1.3, 0);
    inverterMesh.castShadow = true;
    inverterGroup.add(inverterMesh);

    // Heat-sink aluminum cooling fins on inverter flanks
    const finMat = new THREE.MeshStandardMaterial({ color: 0x2d3748, metalness: 0.8 });
    for (let f = -0.5; f <= 0.5; f += 0.25) {
      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.6, 0.12), finMat);
      fin.position.set(-19 - 1.04, 1.3, f);
      inverterGroup.add(fin);
    }

    // High Voltage Warning Emblem (Yellow Triangle)
    const warningEmblem = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.35, 0.05),
      new THREE.MeshBasicMaterial({ color: 0xffd166 })
    );
    warningEmblem.position.set(-19, 1.9, 0.95);
    inverterGroup.add(warningEmblem);

    // Inverter digital LCD status display
    const inverterScreen = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.6, 0.08),
      new THREE.MeshBasicMaterial({ color: 0xff7b00 })
    );
    inverterScreen.position.set(-19, 1.4, 0.95);
    inverterGroup.add(inverterScreen);
    this.group.add(inverterGroup);

    // Backup Generator (Mission 6 Emergency Start)
    const generator = new THREE.Mesh(
      new THREE.BoxGeometry(3.0, 2.0, 2.2),
      new THREE.MeshStandardMaterial({ color: 0xd69e2e, roughness: 0.5, metalness: 0.4 })
    );
    generator.position.set(-22, 1.2, -8.5);
    generator.castShadow = true;
    this.group.add(generator);

    // Register Zone B interactive objects
    this.interactiveObjects.push(
      {
        id: 'solar_inverter',
        name: 'Zone B Solar Power Inverter',
        type: 'power_inverter',
        position: [-19, 1.3, 0],
        zone: 'Zone B: Power Station',
        actions: ['Inspect Fault', 'Replace IGBT Circuit', 'Rebalance Grid'],
        status: 'fault',
        health: 30,
        infoText: 'High-voltage DC to AC power inverter. Fault detected in thyristor bridge.',
      },
      {
        id: 'battery_bank',
        name: 'Station Battery Storage Bank',
        type: 'battery_bank',
        position: [-25, 1.4, 0],
        zone: 'Zone B: Power Station',
        actions: ['Inspect Charge State', 'Optimize Bus Distribution'],
        status: 'nominal',
        health: 90,
        infoText: 'Lithium-ion energy storage system with 500 kWh nominal capacity.',
      },
      {
        id: 'backup_generator',
        name: 'Emergency Auxiliary Generator',
        type: 'backup_generator',
        position: [-22, 1.2, -8.5],
        zone: 'Zone B: Power Station',
        actions: ['Start Generator', 'Check Methane Fuel Buffer'],
        status: 'nominal',
        health: 100,
        infoText: 'Methane-oxygen fueled combustion engine providing 80 kW emergency power.',
      }
    );
  }

  // --- ZONE C: CONTROLLED-ENVIRONMENT GREENHOUSE ---
  private buildZoneC_Greenhouse() {
    // Greenhouse Base Platform
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(16, 0.4, 18),
      new THREE.MeshStandardMaterial({ color: 0x2d3748, roughness: 0.7 })
    );
    base.position.set(22, 0.2, 0);
    this.group.add(base);

    // Transparent Greenhouse Polycarbonate Arched Roof
    const archGeo = new THREE.CylinderGeometry(7, 7, 16, 12, 1, false, 0, Math.PI);
    archGeo.rotateZ(Math.PI / 2);
    const archMat = new THREE.MeshStandardMaterial({
      color: 0x9ae6b4,
      roughness: 0.2,
      transparent: true,
      opacity: 0.4,
      metalness: 0.1,
    });
    const arch = new THREE.Mesh(archGeo, archMat);
    arch.position.set(22, 1.2, 0);
    this.group.add(arch);

    // Spaceframe structural support ribs over arch
    const ribMat = new THREE.MeshStandardMaterial({ color: 0x4a5568, metalness: 0.6 });
    for (let rx = -7; rx <= 7; rx += 3.5) {
      const rib = new THREE.Mesh(new THREE.TorusGeometry(7.05, 0.12, 6, 16, Math.PI), ribMat);
      rib.position.set(22 + rx, 1.2, 0);
      rib.rotateZ(Math.PI / 2);
      rib.rotateY(Math.PI / 2);
      this.group.add(rib);
    }

    // Hydroponic Growing Trays (Left & Right aisles)
    const trayZPositions = [-5, 0, 5];
    trayZPositions.forEach((tz) => {
      const tray = new THREE.Mesh(
        new THREE.BoxGeometry(10, 0.8, 2.5),
        new THREE.MeshStandardMaterial({ color: 0x4a5568, roughness: 0.6 })
      );
      tray.position.set(22, 0.6, tz);
      this.group.add(tray);

      // Growing plants inside trays
      const plantGroup = new THREE.Group();
      plantGroup.position.set(22, 1.1, tz);

      // Procedural crops (lush leafy foliage + fruit clusters)
      const leafMat1 = new THREE.MeshStandardMaterial({ color: 0x38a169, roughness: 0.7, flatShading: true });
      const leafMat2 = new THREE.MeshStandardMaterial({ color: 0x48bb78, roughness: 0.6, flatShading: true });
      const fruitMat = new THREE.MeshStandardMaterial({ color: 0xe53e3e, roughness: 0.3 }); // Martian cherry tomatoes

      for (let px = -4.2; px <= 4.2; px += 1.0) {
        // Main crop stem & foliage cluster
        const bush = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.85, 0.75), Math.random() > 0.5 ? leafMat1 : leafMat2);
        bush.position.set(px, 0.25, (Math.random() - 0.5) * 0.7);
        bush.rotation.y = Math.random() * Math.PI;
        plantGroup.add(bush);

        // Small top leaves
        const topLeaf = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.3, 0.4), leafMat2);
        topLeaf.position.set(px, 0.75, (Math.random() - 0.5) * 0.5);
        plantGroup.add(topLeaf);

        // Ripe crop fruit
        if (Math.random() > 0.4) {
          const fruit = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), fruitMat);
          fruit.position.set(px + (Math.random() - 0.5) * 0.4, 0.4, (Math.random() - 0.5) * 0.5);
          plantGroup.add(fruit);
        }
      }
      this.group.add(plantGroup);
      this.greenhousePlants.push(plantGroup);
    });

    // Overhead Purple / Red Grow Light Racks
    const lightRack = new THREE.Mesh(
      new THREE.BoxGeometry(11, 0.2, 12),
      new THREE.MeshStandardMaterial({ color: 0x1a202c })
    );
    lightRack.position.set(22, 4.8, 0);
    this.group.add(lightRack);

    const pinkGlow = new THREE.PointLight(0xff007f, 1.5, 12);
    pinkGlow.position.set(22, 4.2, 0);
    this.group.add(pinkGlow);

    // Nutrient & Water Injection Tanks
    const nutrientTank = new THREE.Mesh(
      new THREE.CylinderGeometry(1.0, 1.0, 2.8, 8),
      new THREE.MeshStandardMaterial({ color: 0x48bb78, metalness: 0.3 })
    );
    nutrientTank.position.set(16, 1.6, -7);
    this.group.add(nutrientTank);

    // Register Zone C interactive objects
    this.interactiveObjects.push({
      id: 'greenhouse_hydroponics',
      name: 'Zone C Hydroponic Crop Trays',
      type: 'greenhouse_tray',
      position: [22, 1.1, 0],
      zone: 'Zone C: Greenhouse',
      actions: ['Inspect Crops', 'Plant Seeds', 'Tune LED Spectrum', 'Harvest'],
      status: 'nominal',
      health: 80,
      infoText: 'Cultivates spirulina microalgae and sweet potato tubers using closed-loop nutrient film.',
    });
  }

  // --- ZONE D: SCIENCE LABORATORY ---
  private buildZoneD_ScienceLab() {
    // Lab Structure Foundation
    const labBase = new THREE.Mesh(
      new THREE.BoxGeometry(18, 0.4, 14),
      new THREE.MeshStandardMaterial({ color: 0x2d3748, roughness: 0.7 })
    );
    labBase.position.set(0, 0.2, -22);
    this.group.add(labBase);

    // Lab Enclosure with large observation windows
    const labWallMat = new THREE.MeshStandardMaterial({
      color: 0xedf2f7,
      roughness: 0.3,
      flatShading: true,
    });
    const labWalls = new THREE.Mesh(new THREE.BoxGeometry(16, 3.2, 12), labWallMat);
    labWalls.position.set(0, 1.8, -22);
    labWalls.castShadow = true;
    this.group.add(labWalls);

    // Science Terminal (Holographic Geological Spectrometer)
    const spectrometer = new THREE.Mesh(
      new THREE.BoxGeometry(2.5, 1.8, 1.8),
      new THREE.MeshStandardMaterial({ color: 0x805ad5, roughness: 0.4 })
    );
    spectrometer.position.set(-4, 1.2, -22);
    this.group.add(spectrometer);

    // MOXIE Oxygen Processor Station (Mission 3 Repair Target)
    const o2ProcessorGroup = new THREE.Group();
    const processorBody = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 2.6, 2.0),
      new THREE.MeshStandardMaterial({ color: 0x319795, roughness: 0.4 })
    );
    processorBody.position.set(4, 1.5, -22);
    processorBody.castShadow = true;
    o2ProcessorGroup.add(processorBody);

    // Processor high-temperature exhaust stack
    const stack = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.3, 1.5, 6),
      new THREE.MeshStandardMaterial({ color: 0x718096, metalness: 0.8 })
    );
    stack.position.set(4, 3.4, -22);
    o2ProcessorGroup.add(stack);
    this.group.add(o2ProcessorGroup);

    // Register Zone D interactive objects
    this.interactiveObjects.push(
      {
        id: 'lab_terminal',
        name: 'Geological Analysis Spectrometer',
        type: 'lab_spectrometer',
        position: [-4, 1.2, -22],
        zone: 'Zone D: Science Lab',
        actions: ['Analyze Regolith Sample', 'Inspect Mineral Composition'],
        status: 'nominal',
        health: 100,
        infoText: 'Laser-induced breakdown spectrometer (LIBS) for automated mineral assays.',
      },
      {
        id: 'oxygen_processor',
        name: 'Zone D MOXIE Oxygen Processor',
        type: 'oxygen_processor',
        position: [4, 1.5, -22],
        zone: 'Zone D: Science Lab',
        actions: ['Inspect Electrolyzer', 'Load Ice Sublimator', 'Calibrate Output'],
        status: 'nominal',
        health: 75,
        infoText: 'Solid-oxide electrolysis reactor extracting oxygen directly from CO2 and water ice.',
      }
    );
  }

  // --- ZONE E: COMMUNICATIONS & DSN ARRAY ---
  private buildZoneE_Communications() {
    // Comm Station Foundation
    const commPad = new THREE.Mesh(
      new THREE.CylinderGeometry(6, 6, 0.5, 10),
      new THREE.MeshStandardMaterial({ color: 0x2d3748, roughness: 0.8 })
    );
    commPad.position.set(0, 0.25, 24);
    this.group.add(commPad);

    // Large Parabolic Satellite Antenna Dish
    this.commDish = new THREE.Group();
    this.commDish.position.set(0, 3.8, 24);

    // Dish Base Tower
    const tower = new THREE.Mesh(
      new THREE.CylinderGeometry(0.8, 1.2, 3.5, 6),
      new THREE.MeshStandardMaterial({ color: 0x4a5568, metalness: 0.5 })
    );
    tower.position.set(0, 1.8, 24);
    this.group.add(tower);

    // Parabolic Dish Body (Cylinder / Bowl shape)
    const dishGeo = new THREE.CylinderGeometry(4.2, 0.8, 1.2, 12, 1, true);
    dishGeo.rotateX(Math.PI / 2);
    const dishMat = new THREE.MeshStandardMaterial({
      color: 0xedf2f7,
      metalness: 0.6,
      roughness: 0.3,
      side: THREE.DoubleSide,
    });
    const dish = new THREE.Mesh(dishGeo, dishMat);
    this.commDish.add(dish);

    // Sub-reflector feed horn
    const feed = new THREE.Mesh(
      new THREE.ConeGeometry(0.4, 1.8, 6),
      new THREE.MeshStandardMaterial({ color: 0xe53e3e })
    );
    feed.position.set(0, 0, 1.6);
    feed.rotateX(Math.PI / 2);
    this.commDish.add(feed);

    // Top Warning Navigation Beacon
    const beacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xff3333 })
    );
    beacon.position.set(0, 0, 2.2);
    this.commDish.add(beacon);

    // Initial tilt towards Earth orbital position
    this.commDish.rotation.x = -Math.PI / 5;
    this.group.add(this.commDish);

    // Comm Control Station Console
    const consoleMesh = new THREE.Mesh(
      new THREE.BoxGeometry(2.0, 1.4, 1.2),
      new THREE.MeshStandardMaterial({ color: 0x2b6cb0, roughness: 0.5 })
    );
    consoleMesh.position.set(3.5, 1.0, 24);
    this.group.add(consoleMesh);

    // Register Zone E interactive objects
    this.interactiveObjects.push({
      id: 'comm_dish',
      name: 'Deep Space Network Antenna Dish',
      type: 'comm_dish',
      position: [0, 2.0, 24],
      zone: 'Zone E: Communications',
      actions: ['Calibrate Earth Alignment', 'Transmit Telemetry', 'Check Earth Delay'],
      status: 'nominal',
      health: 95,
      infoText: 'X-band / Ka-band high-gain transceiver linked to NASA Deep Space Network stations.',
    });
  }

  // --- ZONE F: EXPLORATION ROVER ---
  private buildZoneF_Rover() {
    const roverGroup = new THREE.Group();
    roverGroup.position.set(12, 0.8, 16);

    // Rover Main Body (Pressurized Cabin & Equipment Bay)
    const cabinMat = new THREE.MeshStandardMaterial({
      color: 0xeeeeee, // Clean white composite
      roughness: 0.3,
      metalness: 0.2,
      flatShading: true,
    });
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.4, 2.2), cabinMat);
    cabin.castShadow = true;
    roverGroup.add(cabin);

    // Front Cockpit Windshield (Gold-reflective pressurized glass)
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0xffb703,
      metalness: 0.85,
      roughness: 0.1,
    });
    const windshield = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 1.8), glassMat);
    windshield.position.set(1.5, 0.3, 0);
    roverGroup.add(windshield);

    // Gold Multi-Layer Insulation (MLI) Thermal Foil Accents
    const mliMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.9,
      roughness: 0.2,
    });
    const mliPanel = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.6, 2.24), mliMat);
    mliPanel.position.set(-0.6, 0.2, 0);
    roverGroup.add(mliPanel);

    // Solar Deck on roof
    const deck = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 0.15, 2.0),
      new THREE.MeshStandardMaterial({ color: 0x1a365d, metalness: 0.85, roughness: 0.2 })
    );
    deck.position.set(0, 0.78, 0);
    roverGroup.add(deck);

    // Front Bumper with Tow Hooks
    const bumper = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.4, 2.4),
      new THREE.MeshStandardMaterial({ color: 0x2d3748, roughness: 0.8 })
    );
    bumper.position.set(1.95, -0.3, 0);
    roverGroup.add(bumper);

    // Dual Front Headlights (Real illuminating lights!)
    const lightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const lampL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.2, 0.3), lightMat);
    lampL.position.set(1.95, 0.1, -0.7);
    const lampR = lampL.clone();
    lampR.position.set(1.95, 0.1, 0.7);
    roverGroup.add(lampL);
    roverGroup.add(lampR);

    // Real Rover Headlight Beam projecting on Mars terrain
    const roverHeadlight = new THREE.SpotLight(0xffecd1, 2.2, 22, Math.PI / 4, 0.5, 1.2);
    roverHeadlight.position.set(2.0, 0.2, 0);
    const headlightTarget = new THREE.Object3D();
    headlightTarget.position.set(10.0, -0.5, 0);
    roverGroup.add(headlightTarget);
    roverHeadlight.target = headlightTarget;
    roverGroup.add(roverHeadlight);

    // Front Robotic Sample Arm (with drill & scoop)
    const armBase = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.3, 0.3),
      new THREE.MeshStandardMaterial({ color: 0x718096, metalness: 0.6 })
    );
    armBase.position.set(1.8, -0.1, -0.9);
    const armFore = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 0.9, 6),
      new THREE.MeshStandardMaterial({ color: 0x4a5568, metalness: 0.7 })
    );
    armFore.position.set(2.1, -0.4, -0.9);
    armFore.rotateZ(-Math.PI / 4);
    roverGroup.add(armBase);
    roverGroup.add(armFore);

    // Camera Mast (Mastcam-Z & Navcam)
    const mast = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.1, 1.9, 6),
      new THREE.MeshStandardMaterial({ color: 0x718096, metalness: 0.5 })
    );
    mast.position.set(1.2, 1.6, 0);
    roverGroup.add(mast);

    const camHead = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.3, 0.6),
      new THREE.MeshStandardMaterial({ color: 0x2d3748 })
    );
    camHead.position.set(1.2, 2.5, 0);
    // Dual lenses
    const lensL = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.1, 8), glassMat);
    lensL.rotateZ(Math.PI / 2);
    lensL.position.set(0.26, 0, -0.15);
    const lensR = lensL.clone();
    lensR.position.set(0.26, 0, 0.15);
    camHead.add(lensL);
    camHead.add(lensR);
    roverGroup.add(camHead);

    // Rear MMRTG Power Source with Black Cooling Fins
    const rtgBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.35, 1.1, 8),
      new THREE.MeshStandardMaterial({ color: 0x1a202c, metalness: 0.8, roughness: 0.4 })
    );
    rtgBody.rotateZ(Math.PI / 2);
    rtgBody.position.set(-1.9, 0.3, 0);
    roverGroup.add(rtgBody);

    // Rear High-Gain Parabolic Comm Dish
    const roverDish = new THREE.Mesh(
      new THREE.CylinderGeometry(0.6, 0.1, 0.2, 10),
      new THREE.MeshStandardMaterial({ color: 0xedf2f7, metalness: 0.4 })
    );
    roverDish.rotateZ(Math.PI / 3);
    roverDish.position.set(-1.2, 1.1, 0.6);
    roverGroup.add(roverDish);

    // Rocker-Bogie Suspension & 6 Articulated Voxel Wheels
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x171923, roughness: 0.95, flatShading: true });
    const spokeMat = new THREE.MeshStandardMaterial({ color: 0x718096, metalness: 0.7 });

    const wheelCoordinates = [
      [-1.4, -0.4, -1.5],
      [0, -0.4, -1.5],
      [1.4, -0.4, -1.5],
      [-1.4, -0.4, 1.5],
      [0, -0.4, 1.5],
      [1.4, -0.4, 1.5],
    ];

    wheelCoordinates.forEach((coord) => {
      const wheelGroup = new THREE.Group();
      wheelGroup.position.set(coord[0], coord[1], coord[2]);

      // Outer rugged tire with deep treads
      const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.45, 10), tireMat);
      tire.rotateX(Math.PI / 2);
      tire.castShadow = true;
      wheelGroup.add(tire);

      // Metallic hub / rim
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.48, 8), spokeMat);
      hub.rotateX(Math.PI / 2);
      wheelGroup.add(hub);

      // Suspension Arm connecting to chassis
      const strut = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 0.7, 6),
        new THREE.MeshStandardMaterial({ color: 0x4a5568, metalness: 0.6 })
      );
      strut.position.set(0, 0.3, coord[2] > 0 ? -0.2 : 0.2);
      wheelGroup.add(strut);

      roverGroup.add(wheelGroup);
    });

    this.group.add(roverGroup);

    // Register Zone F interactive objects
    this.interactiveObjects.push({
      id: 'exploration_rover',
      name: 'Manned Pressurized Rover (MPR-1)',
      type: 'exploration_rover',
      position: [12, 1.0, 16],
      zone: 'Zone F: Surface Vehicle Pad',
      actions: ['Inspect Systems', 'Recharge Rover Battery', 'Engage Storm Lockdown'],
      status: 'nominal',
      health: 100,
      infoText: '6-wheeled all-terrain exploration vehicle with redundant life support and sample arm.',
    });
  }

  // --- SPARKING PARTICLES FOR DAMAGED INVERTER ---
  private createInverterSparkParticles() {
    const sparkCount = 40;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(sparkCount * 3);

    for (let i = 0; i < sparkCount; i++) {
      positions[i * 3] = -19 + (Math.random() - 0.5) * 1.5;
      positions[i * 3 + 1] = 1.3 + Math.random() * 1.2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: 0xffcc00,
      size: 0.15,
      transparent: true,
      opacity: 0.8,
    });

    this.sparkingParticles = new THREE.Points(geometry, material);
    this.group.add(this.sparkingParticles);
  }

  public update(delta: number, solTime: number, inverterRepaired: boolean) {
    // Solar Panel Sun Tracking
    // Panels slowly rotate towards the simulated sun direction
    if (this.solarPanels.length > 0) {
      const sunAngle = ((solTime - 6.0) / 12.6) * Math.PI - Math.PI / 2;
      this.solarPanels.forEach((panel) => {
        const face = panel.children[1];
        if (face) {
          face.rotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, sunAngle * 0.6));
        }
      });
    }

    // Communication dish slow search rotation
    if (this.commDish) {
      this.commDish.rotation.y += 0.05 * delta;
    }

    // Inverter sparks active until repaired
    if (this.sparkingParticles) {
      if (inverterRepaired) {
        this.sparkingParticles.visible = false;
      } else {
        this.sparkingParticles.visible = true;
        const pos = this.sparkingParticles.geometry.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          let y = pos.getY(i) + (Math.random() - 0.3) * 0.2;
          if (y > 2.5) y = 1.2;
          pos.setY(i, y);
        }
        pos.needsUpdate = true;
      }
    }
  }

  // Roof cutaway when astronaut is inside Habitat
  public setHabitatInteriorMode(isInside: boolean) {
    if (this.habitatRoofMesh) {
      const mat = this.habitatRoofMesh.material as THREE.MeshStandardMaterial;
      mat.opacity = isInside ? 0.05 : 0.65;
    }
  }
}
