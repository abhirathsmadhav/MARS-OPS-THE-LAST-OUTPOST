import { create } from 'zustand';
import type {
  GamePhase,
  ResourceState,
  ResourceRates,
  WeatherState,
  InventoryItem,
  Mission,
  EmergencyEvent,
  EducationalDebrief,
  ConstructionRecipe,
  AudioSettings,
  ObjectType,
} from '../types';
import { INITIAL_MISSIONS } from '../game/missions/missionsData';
import { audioManager } from '../game/audio/AudioManager';

export interface RepairModalState {
  objectId: string;
  title: string;
  type: ObjectType;
  steps: {
    id: string;
    text: string;
    completed: boolean;
    requiresItem?: string;
    description: string;
  }[];
  isCompleted: boolean;
}

export interface ScienceLabState {
  isOpen: boolean;
  sampleAnalyzed: boolean;
  sampleType: string | null;
  composition: { element: string; percentage: number; description: string }[];
}

interface GameStore {
  // Game lifecycle & Commander Profile
  phase: GamePhase;
  setPhase: (phase: GamePhase) => void;
  playerName: string;
  setPlayerName: (name: string) => void;

  // Onboarding Tutorial
  tutorialStepIndex: number;
  isTutorialActive: boolean;
  startTutorial: () => void;
  nextTutorialStep: () => void;
  prevTutorialStep: () => void;
  finishTutorial: () => void;

  // Sol & Clock
  sol: number;
  solTime: number; // 0 to 24.6 (Mars hours)
  solSpeed: number; // Mars hours per real second
  advanceTime: (deltaSeconds: number) => void;

  // Resources
  resources: ResourceState;
  resourceRates: ResourceRates;
  modifyResource: (key: keyof ResourceState, amount: number) => void;
  setResource: (key: keyof ResourceState, value: number) => void;
  updateSimulationTick: (deltaSeconds: number) => void;

  // Weather & Atmosphere
  weather: WeatherState;
  setWeather: (weather: Partial<WeatherState>) => void;
  triggerDustStorm: () => void;
  clearDustStorm: () => void;

  // Inventory
  inventory: InventoryItem[];
  maxInventorySlots: number;
  activeSlot: number;
  setActiveSlot: (slot: number) => void;
  addItem: (item: Omit<InventoryItem, 'quantity'>, quantity: number) => boolean;
  removeItem: (itemId: string, quantity: number) => boolean;
  hasItem: (itemId: string, quantity?: number) => boolean;
  getItemCount: (itemId: string) => number;

  // Missions
  missions: Mission[];
  currentMissionIndex: number;
  progressObjective: (missionId: string, objectiveId: string, amount?: number) => void;
  completeMission: (missionId: string) => void;
  activeDebrief: EducationalDebrief | null;
  openDebrief: (debrief: EducationalDebrief) => void;
  closeDebrief: () => void;

  // Emergencies
  activeEmergency: EmergencyEvent | null;
  triggerEmergency: (event: EmergencyEvent) => void;
  resolveEmergency: () => void;

  // Universal Interaction
  currentInteraction: {
    objectId: string;
    name: string;
    type: ObjectType;
    promptText: string;
    actions: string[];
    canInteract: boolean;
  } | null;
  setCurrentInteraction: (interaction: GameStore['currentInteraction']) => void;

  // 3D Navigation Waypoint & Tactical Compass
  activeNavTarget: {
    name: string;
    distance: number;
    directionArrow: string;
    hint: string;
    position: [number, number, number];
  } | null;
  setActiveNavTarget: (target: GameStore['activeNavTarget']) => void;

  // Interactive Repair Modal
  repairModal: RepairModalState | null;
  openRepairModal: (objectId: string, title: string, type: ObjectType) => void;
  completeRepairStep: (stepId: string) => void;
  closeRepairModal: () => void;

  // Science Lab Terminal Modal
  scienceModal: ScienceLabState;
  openScienceModal: () => void;
  closeScienceModal: () => void;
  analyzeSample: (sampleType: string) => void;

  // Construction
  constructionMode: boolean;
  setConstructionMode: (active: boolean) => void;
  recipes: ConstructionRecipe[];
  selectedRecipeId: string | null;
  setSelectedRecipeId: (id: string | null) => void;
  constructedObjects: {
    id: string;
    type: ObjectType;
    position: [number, number, number];
    health: number;
  }[];
  addConstructedObject: (obj: { id: string; type: ObjectType; position: [number, number, number] }) => boolean;

  // Settings & Audio
  audioSettings: AudioSettings;
  setAudioSetting: (key: keyof AudioSettings, value: number | boolean) => void;
  graphicsQuality: 'low' | 'medium' | 'high';
  setGraphicsQuality: (q: 'low' | 'medium' | 'high') => void;

  // Stats
  stats: {
    mineralsMined: number;
    repairsCompleted: number;
    stormsSurvived: number;
    cropsHarvested: number;
  };
  incrementStat: (key: keyof GameStore['stats']) => void;

  // On-screen notifications & highlights
  toastMessage: string | null;
  showToast: (msg: string, duration?: number) => void;
  isRoverMounted: boolean;
  setRoverMounted: (mounted: boolean) => void;
  showAllHighlights: boolean;
  setShowAllHighlights: (show: boolean) => void;

  // Persistence
  saveToStorage: () => void;
  loadFromStorage: () => boolean;
  resetProgress: () => void;
}

const DEFAULT_RESOURCES: ResourceState = {
  oxygen: 95,
  water: 85,
  food: 90,
  power: 120, // kW generated
  powerDemand: 75, // kW demanded
  battery: 88, // %
  batteryCapacity: 500, // kWh
  habitatTemp: 21.0, // °C
  crewHealth: 100,
  radiation: 0.08, // mSv/h
  equipmentCondition: 92,
};

const DEFAULT_WEATHER: WeatherState = {
  type: 'clear',
  intensity: 0.0,
  visibility: 1.0,
  solarMultiplier: 1.0,
  duration: 0,
  windSpeed: 8.5,
  temperature: -55.0,
};

const DEFAULT_INVENTORY: InventoryItem[] = [
  { id: 'multitool', name: 'EVA Multi-Tool', category: 'tool', quantity: 1, maxStack: 1, icon: 'tool', description: 'Standard NASA issue laser cutter and wrench', weight: 2.1 },
  { id: 'electronic_part', name: 'Thyristor Circuit', category: 'component', quantity: 1, maxStack: 10, icon: 'cpu', description: 'Replacement solid-state power conditioning chip', weight: 0.5 },
  { id: 'ration_pack', name: 'Emergency Nutrient Pack', category: 'consumable', quantity: 3, maxStack: 10, icon: 'coffee', description: 'Dehydrated calorie and electrolyte matrix', weight: 0.8 },
];

const CONSTRUCTION_RECIPES: ConstructionRecipe[] = [
  {
    id: 'recipe_solar',
    name: 'Auxiliary Photovoltaic Panel',
    category: 'power',
    description: 'Adds +25 kW peak solar generation during daytime.',
    cost: [{ itemId: 'silicon', quantity: 2 }, { itemId: 'iron', quantity: 1 }],
    modelType: 'constructed_solar',
    color: 0x2244aa,
    dimensions: [2, 1.5, 2],
  },
  {
    id: 'recipe_battery',
    name: 'Lithium-Ion Energy Bank',
    category: 'power',
    description: 'Increases outpost battery storage by +150 kWh.',
    cost: [{ itemId: 'silicon', quantity: 2 }, { itemId: 'regolith', quantity: 2 }],
    modelType: 'constructed_battery',
    color: 0x44aa44,
    dimensions: [1.5, 1.2, 1.5],
  },
  {
    id: 'recipe_tank',
    name: 'Cryogenic Water Cistern',
    category: 'life_support',
    description: 'Expands potable water reserve buffer by +200 L.',
    cost: [{ itemId: 'iron', quantity: 2 }, { itemId: 'ice', quantity: 1 }],
    modelType: 'constructed_tank',
    color: 0x4488cc,
    dimensions: [1.5, 2.0, 1.5],
  },
  {
    id: 'recipe_berm',
    name: 'Sintered Regolith Radiation Wall',
    category: 'defense',
    description: 'Vitreous 3D-printed barrier that reduces cosmic radiation by 35%.',
    cost: [{ itemId: 'regolith', quantity: 4 }],
    modelType: 'constructed_berm',
    color: 0x994422,
    dimensions: [3, 1.5, 0.8],
  },
];

export const useGameStore = create<GameStore>((set, get) => ({
  phase: 'menu',
  setPhase: (phase) => {
    set({ phase });
    if (phase === 'playing' || phase === 'tutorial') {
      audioManager.init();
      audioManager.resume();
    }
  },

  playerName: 'Ares Specialist',
  setPlayerName: (name) => set({ playerName: name.trim() || 'Ares Specialist' }),

  tutorialStepIndex: 0,
  isTutorialActive: false,
  startTutorial: () => {
    audioManager.init();
    audioManager.resume();
    audioManager.playUiClick();
    set({ isTutorialActive: true, tutorialStepIndex: 0, phase: 'playing' });
  },
  nextTutorialStep: () => {
    audioManager.playUiClick();
    const current = get().tutorialStepIndex;
    if (current < 6) {
      set({ tutorialStepIndex: current + 1 });
    } else {
      get().finishTutorial();
    }
  },
  prevTutorialStep: () => {
    audioManager.playUiClick();
    const current = get().tutorialStepIndex;
    if (current > 0) {
      set({ tutorialStepIndex: current - 1 });
    }
  },
  finishTutorial: () => {
    audioManager.playSuccessChime();
    set({ isTutorialActive: false, tutorialStepIndex: 0 });
  },

  sol: 1,
  solTime: 9.5, // 9:30 AM Mars Time
  solSpeed: 0.05, // Mars hours per real second (a full sol is ~8 minutes real time)

  advanceTime: (deltaSeconds) => {
    const { solTime, sol, solSpeed } = get();
    let newTime = solTime + deltaSeconds * solSpeed;
    let newSol = sol;
    if (newTime >= 24.6) {
      newTime -= 24.6;
      newSol += 1;
    }
    set({ solTime: newTime, sol: newSol });
  },

  resources: { ...DEFAULT_RESOURCES },
  resourceRates: {
    oxygenDelta: 0,
    waterDelta: 0,
    foodDelta: 0,
    batteryDelta: 0,
    healthDelta: 0,
  },

  modifyResource: (key, amount) => {
    set((state) => {
      const current = state.resources[key];
      const max = (key === 'battery' || key === 'crewHealth' || key === 'equipmentCondition' || key === 'oxygen' || key === 'water' || key === 'food') ? 100 : 9999;
      const val = Math.max(0, Math.min(max, current + amount));
      return {
        resources: {
          ...state.resources,
          [key]: Number(val.toFixed(1)),
        },
      };
    });
  },

  setResource: (key, value) => {
    set((state) => ({
      resources: {
        ...state.resources,
        [key]: Number(value.toFixed(1)),
      },
    }));
  },

  updateSimulationTick: (deltaSeconds) => {
    const { solTime, weather, resources, activeEmergency, constructedObjects } = get();

    // Mars Day/Night Solar Calculation
    // Daylight is roughly 6.0 to 18.6 Mars hours (12.6 hr day, 12.0 hr night)
    const isDaylight = solTime >= 6.0 && solTime <= 18.6;
    let solarZenithFactor = 0;
    if (isDaylight) {
      // Sine wave peak at solTime 12.3
      const progress = (solTime - 6.0) / 12.6;
      solarZenithFactor = Math.sin(progress * Math.PI);
    }

    // Additional solar from constructed panels
    const extraSolarPanels = constructedObjects.filter((o) => o.type === 'constructed_solar').length;
    const baseSolarOutput = 140 + extraSolarPanels * 30; // kW
    const currentSolarPower = isDaylight ? baseSolarOutput * solarZenithFactor * weather.solarMultiplier : 0;

    // Power demands
    const baseDemand = 70; // Life support, heating, lights
    const extraDemand = weather.type === 'dust_storm' ? 35 : 0; // Heavy air scrubbers
    const totalDemand = baseDemand + extraDemand;

    // Net power
    const netPower = currentSolarPower - totalDemand; // kW
    
    // Battery capacity calculation (extra batteries add +150 kWh)
    const extraBatteries = constructedObjects.filter((o) => o.type === 'constructed_battery').length;
    const effectiveBatteryCapacity = 500 + extraBatteries * 150;

    // Battery charge delta (% per second)
    // 1 kWh = 1 kW * (1/3600 h)
    const batteryKWhDelta = netPower * (deltaSeconds / 3600) * 12; // Scaled simulation rate
    const batteryPctDelta = (batteryKWhDelta / effectiveBatteryCapacity) * 100;

    let newBattery = Math.max(0, Math.min(100, resources.battery + batteryPctDelta));

    // Oxygen consumption & generation
    let o2Delta = -0.015 * deltaSeconds; // Astronaut & crew baseline consumption
    if (newBattery > 5 && (!activeEmergency || activeEmergency.type !== 'oxygen_leak')) {
      o2Delta += 0.025 * deltaSeconds; // MOXIE generator running
    }
    const newO2 = Math.max(0, Math.min(100, resources.oxygen + o2Delta));

    // Water consumption & recycling
    let waterDelta = -0.01 * deltaSeconds;
    if (newBattery > 5 && (!activeEmergency || activeEmergency.type !== 'water_contamination')) {
      waterDelta += 0.008 * deltaSeconds; // Closed loop 80-98% recovery
    }
    const newWater = Math.max(0, Math.min(100, resources.water + waterDelta));

    // Food consumption
    const foodDelta = -0.005 * deltaSeconds;
    const newFood = Math.max(0, Math.min(100, resources.food + foodDelta));

    // Habitat temperature
    let targetTemp = 21.0;
    if (newBattery < 5) {
      targetTemp = -40.0; // Freezing without heaters!
    }
    const newTemp = resources.habitatTemp + (targetTemp - resources.habitatTemp) * (deltaSeconds * 0.05);

    // Radiation exposure
    let baseRad = 0.08; // normal mSv/h inside base
    if (weather.type === 'solar_radiation') {
      baseRad = 1.8;
    }
    const berms = constructedObjects.filter((o) => o.type === 'constructed_berm').length;
    const shieldedRad = Math.max(0.04, baseRad * Math.pow(0.75, berms));

    // Crew Health consequences
    let healthDelta = 0;
    if (newO2 < 20) healthDelta -= 0.5 * deltaSeconds;
    if (newWater < 10) healthDelta -= 0.2 * deltaSeconds;
    if (newFood < 5) healthDelta -= 0.1 * deltaSeconds;
    if (newTemp < 0) healthDelta -= 0.3 * deltaSeconds;
    if (shieldedRad > 1.0) healthDelta -= 0.1 * deltaSeconds;
    if (newO2 > 80 && newWater > 50 && newFood > 50 && newTemp > 18) {
      healthDelta += 0.1 * deltaSeconds; // Natural healing
    }
    const newHealth = Math.max(0, Math.min(100, resources.crewHealth + healthDelta));

    // Emergency timer countdown
    if (activeEmergency && activeEmergency.timeRemaining > 0) {
      const remaining = activeEmergency.timeRemaining - deltaSeconds;
      if (remaining <= 0) {
        // Emergency timer expired!
        get().resolveEmergency();
      } else {
        set({
          activeEmergency: {
            ...activeEmergency,
            timeRemaining: remaining,
          },
        });
      }
    }

    set({
      resources: {
        oxygen: Number(newO2.toFixed(1)),
        water: Number(newWater.toFixed(1)),
        food: Number(newFood.toFixed(1)),
        power: Math.round(currentSolarPower),
        powerDemand: Math.round(totalDemand),
        battery: Number(newBattery.toFixed(1)),
        batteryCapacity: effectiveBatteryCapacity,
        habitatTemp: Number(newTemp.toFixed(1)),
        crewHealth: Number(newHealth.toFixed(1)),
        radiation: Number(shieldedRad.toFixed(2)),
        equipmentCondition: resources.equipmentCondition,
      },
      resourceRates: {
        oxygenDelta: Number((o2Delta * 60).toFixed(2)),
        waterDelta: Number((waterDelta * 60).toFixed(2)),
        foodDelta: Number((foodDelta * 60).toFixed(2)),
        batteryDelta: Number((batteryPctDelta * 60).toFixed(2)),
        healthDelta: Number((healthDelta * 60).toFixed(2)),
      },
    });

    // Advance sol time
    get().advanceTime(deltaSeconds);
  },

  weather: { ...DEFAULT_WEATHER },
  setWeather: (w) => set((s) => ({ weather: { ...s.weather, ...w } })),

  triggerDustStorm: () => {
    audioManager.setStormWindIntensity(1.0);
    audioManager.playAlarm(true);
    set({
      weather: {
        type: 'dust_storm',
        intensity: 0.9,
        visibility: 0.25,
        solarMultiplier: 0.18,
        duration: 120, // 2 minutes
        windSpeed: 28.0,
        temperature: -68.0,
      },
      activeEmergency: {
        id: 'storm_emergency',
        type: 'dust_storm',
        title: 'CLASS-5 GLOBAL DUST STORM',
        description: 'Atmospheric opacity tau > 4.0. Photovoltaic yield degraded by 82%. Engage auxiliary fuel cell and take shelter!',
        severity: 'critical',
        timeRemaining: 120,
        resolved: false,
        solutionHint: 'Start Zone B Generator or conserve battery inside Habitat.',
      },
    });
  },

  clearDustStorm: () => {
    audioManager.setStormWindIntensity(0.0);
    audioManager.playAlarm(false);
    set({
      weather: { ...DEFAULT_WEATHER },
      activeEmergency: null,
    });
  },

  inventory: [...DEFAULT_INVENTORY],
  maxInventorySlots: 8,
  activeSlot: 0,
  setActiveSlot: (slot) => set({ activeSlot: slot }),

  addItem: (item, quantity) => {
    const { inventory, maxInventorySlots } = get();
    const existingIndex = inventory.findIndex((i) => i.id === item.id);

    if (existingIndex !== -1) {
      const existing = inventory[existingIndex];
      const newQty = existing.quantity + quantity;
      const updated = [...inventory];
      updated[existingIndex] = { ...existing, quantity: Math.min(existing.maxStack, newQty) };
      set({ inventory: updated });
      return true;
    }

    if (inventory.length < maxInventorySlots) {
      set({
        inventory: [...inventory, { ...item, quantity: Math.min(item.maxStack, quantity) }],
      });
      return true;
    }

    return false; // Inventory full
  },

  removeItem: (itemId, quantity) => {
    const { inventory } = get();
    const existingIndex = inventory.findIndex((i) => i.id === itemId);
    if (existingIndex === -1) return false;

    const existing = inventory[existingIndex];
    if (existing.quantity < quantity) return false;

    const updated = [...inventory];
    if (existing.quantity === quantity) {
      updated.splice(existingIndex, 1);
    } else {
      updated[existingIndex] = { ...existing, quantity: existing.quantity - quantity };
    }
    set({ inventory: updated });
    return true;
  },

  hasItem: (itemId, quantity = 1) => {
    const { inventory } = get();
    const item = inventory.find((i) => i.id === itemId);
    return item ? item.quantity >= quantity : false;
  },

  getItemCount: (itemId) => {
    const { inventory } = get();
    const item = inventory.find((i) => i.id === itemId);
    return item ? item.quantity : 0;
  },

  missions: [...INITIAL_MISSIONS],
  currentMissionIndex: 0,

  progressObjective: (missionId, objectiveId, amount = 1) => {
    const { missions, currentMissionIndex } = get();
    const mission = missions.find((m) => m.id === missionId);
    if (!mission) return;

    const objIndex = mission.objectives.findIndex((o) => o.id === objectiveId);
    if (objIndex === -1) return;

    const obj = mission.objectives[objIndex];
    if (obj.completed) return;

    const newCurrent = Math.min(obj.target, obj.current + amount);
    const isCompleted = newCurrent >= obj.target;

    const updatedObjectives = [...mission.objectives];
    updatedObjectives[objIndex] = {
      ...obj,
      current: newCurrent,
      completed: isCompleted,
    };

    if (isCompleted) {
      audioManager.playSuccessChime();
    }

    const allDone = updatedObjectives.every((o) => o.completed);
    const updatedMissions = missions.map((m) =>
      m.id === missionId ? { ...m, objectives: updatedObjectives, completed: allDone } : m
    );

    set({ missions: updatedMissions });

    if (allDone) {
      // Trigger educational debrief modal
      get().openDebrief(mission.educationalDebrief);
      // Advance to next mission if available
      if (currentMissionIndex < missions.length - 1) {
        set({ currentMissionIndex: currentMissionIndex + 1 });
      }
    }
  },

  completeMission: (missionId) => {
    const { missions, currentMissionIndex } = get();
    const mission = missions.find((m) => m.id === missionId);
    if (!mission) return;

    const updated = missions.map((m) => (m.id === missionId ? { ...m, completed: true } : m));
    set({ missions: updated });
    get().openDebrief(mission.educationalDebrief);

    if (currentMissionIndex < missions.length - 1) {
      set({ currentMissionIndex: currentMissionIndex + 1 });
    }
  },

  activeDebrief: null,
  openDebrief: (debrief) => {
    audioManager.playSuccessChime();
    set({ activeDebrief: debrief });
  },
  closeDebrief: () => set({ activeDebrief: null }),

  activeEmergency: null,
  triggerEmergency: (event) => {
    audioManager.playAlarm(true);
    set({ activeEmergency: event });
  },
  resolveEmergency: () => {
    audioManager.playAlarm(false);
    audioManager.playSuccessChime();
    set({ activeEmergency: null });
  },

  currentInteraction: null,
  setCurrentInteraction: (interaction) => set({ currentInteraction: interaction }),

  activeNavTarget: null,
  setActiveNavTarget: (target) => set({ activeNavTarget: target }),

  repairModal: null,
  openRepairModal: (objectId, title, type) => {
    audioManager.playInteract();
    let steps: RepairModalState['steps'] = [];

    if (type === 'power_inverter' || type === 'solar_array') {
      steps = [
        { id: 'step_1', text: 'Isolate High-Voltage Bus Breakers', completed: false, description: 'Safely disconnect 600V DC input from the photovoltaic string.' },
        { id: 'step_2', text: 'Replace Burned Silicon Carbide IGBT Module', completed: false, requiresItem: 'electronic_part', description: 'Install new high-efficiency power switching transistor.' },
        { id: 'step_3', text: 'Calibrate Maximum Power Point Tracking (MPPT) firmware', completed: false, description: 'Align inverter resonant frequency to match solar array impedance.' },
      ];
    } else if (type === 'oxygen_processor') {
      steps = [
        { id: 'step_1', text: 'Vent Carbon Monoxide Byproduct Chamber', completed: false, description: 'Purge lethal CO exhaust lines safely outside habitat envelope.' },
        { id: 'step_2', text: 'Replace Yttria-Stabilized Zirconia (YSZ) Electrolyzer Core', completed: false, requiresItem: 'electronic_part', description: 'Swap fractured solid-oxide oxygen separation ceramic membrane.' },
        { id: 'step_3', text: 'Preheat MOXIE catalytic chamber to 800°C', completed: false, description: 'Initialize ceramic thermal elements for optimal oxygen cracking.' },
      ];
    } else if (type === 'water_recycler') {
      steps = [
        { id: 'step_1', text: 'Flush Saturated Charcoal & Ion-Exchange Beds', completed: false, description: 'Clear organic contaminants and heavy urea particulates.' },
        { id: 'step_2', text: 'Replace Catalytic Oxidation Distillation Seal', completed: false, requiresItem: 'electronic_part', description: 'Re-seat high-vacuum rotary distillation pump gasket.' },
        { id: 'step_3', text: 'Run Spectrometric Purity Verification (TOC < 100 ppb)', completed: false, description: 'Confirm zero pathogen and heavy metal presence in potable water.' },
      ];
    } else {
      steps = [
        { id: 'step_1', text: 'Inspect Structural and Electrical Couplings', completed: false, description: 'Check for micrometeoroid pitting and thermal expansion cracks.' },
        { id: 'step_2', text: 'Perform Diagnostic Firmware Re-flash', completed: false, description: 'Clear system error codes and sync telemetry with mission control.' },
      ];
    }

    set({
      repairModal: {
        objectId,
        title,
        type,
        steps,
        isCompleted: false,
      },
    });
  },

  completeRepairStep: (stepId) => {
    const { repairModal, inventory } = get();
    if (!repairModal) return;

    const stepIndex = repairModal.steps.findIndex((s) => s.id === stepId);
    if (stepIndex === -1) return;

    const step = repairModal.steps[stepIndex];
    if (step.requiresItem) {
      const hasReq = inventory.some((i) => i.id === step.requiresItem && i.quantity > 0);
      if (!hasReq) {
        audioManager.playAlarm(false);
        return;
      }
      get().removeItem(step.requiresItem, 1);
    }

    audioManager.playRepairSpark();

    const updatedSteps = [...repairModal.steps];
    updatedSteps[stepIndex] = { ...step, completed: true };

    const allCompleted = updatedSteps.every((s) => s.completed);

    set({
      repairModal: {
        ...repairModal,
        steps: updatedSteps,
        isCompleted: allCompleted,
      },
    });

    if (allCompleted) {
      audioManager.playSuccessChime();
      get().incrementStat('repairsCompleted');
      get().modifyResource('equipmentCondition', 15);

      // Check mission progression
      if (repairModal.type === 'power_inverter') {
        get().progressObjective('m2_power_restoration', 'm2_obj3');
        get().modifyResource('power', 50);
      } else if (repairModal.type === 'oxygen_processor') {
        get().progressObjective('m3_life_support', 'm3_obj3');
        get().modifyResource('oxygen', 20);
      } else if (repairModal.type === 'water_recycler') {
        get().progressObjective('m4_water_recovery', 'm4_obj2');
        get().modifyResource('water', 25);
      }
    }
  },

  closeRepairModal: () => set({ repairModal: null }),

  scienceModal: {
    isOpen: false,
    sampleAnalyzed: false,
    sampleType: null,
    composition: [],
  },

  openScienceModal: () => {
    audioManager.playInteract();
    set({
      scienceModal: {
        isOpen: true,
        sampleAnalyzed: false,
        sampleType: null,
        composition: [],
      },
    });
  },

  closeScienceModal: () => {
    set((s) => ({ scienceModal: { ...s.scienceModal, isOpen: false } }));
  },

  analyzeSample: (sampleType) => {
    audioManager.playUiClick();
    let comp: ScienceLabState['composition'] = [];
    if (sampleType === 'regolith' || sampleType === 'mineral_regolith') {
      comp = [
        { element: 'Silicon Dioxide (SiO2)', percentage: 43.8, description: 'Primary component of basaltic crust; ideal feedstock for glass & solar PV wafer manufacturing.' },
        { element: 'Iron Oxide (Fe2O3 Hematite)', percentage: 21.2, description: 'Gives Mars its iconic crimson color. Can be reduced using hydrogen to yield structural metallic iron.' },
        { element: 'Aluminum Oxide (Al2O3)', percentage: 7.1, description: 'High-strength lightweight aerospace alloy precursor.' },
        { element: 'Magnesium Oxide (MgO)', percentage: 8.5, description: 'Refractory ceramics and habitat thermal mass insulator.' },
        { element: 'Calcium Oxide (CaO)', percentage: 6.2, description: 'Essential flux for geopolitical regolith-based 3D printed concrete.' },
        { element: 'Toxic Perchlorates (ClO4-)', percentage: 0.8, description: 'Hazardous oxidizer that must be thermally decomposed before agricultural utilization.' },
      ];
    } else if (sampleType === 'ice' || sampleType === 'mineral_ice') {
      comp = [
        { element: 'Hydrogen Dioxide (H2O)', percentage: 94.6, description: 'Cryogenic water ice excavated from Utopia Planitia subsurface glacio-lacustrine sheets.' },
        { element: 'Carbon Dioxide (CO2 Dry Ice)', percentage: 3.8, description: 'Co-deposited seasonal atmospheric ice sublimating at -78.5°C.' },
        { element: 'Dissolved Sulfates & Salts', percentage: 1.6, description: 'Magnesium and sodium sulfates lowering eutectic freezing point.' },
      ];
    }

    set({
      scienceModal: {
        isOpen: true,
        sampleAnalyzed: true,
        sampleType,
        composition: comp,
      },
    });
  },

  constructionMode: false,
  setConstructionMode: (active) => {
    audioManager.playUiClick();
    set({ constructionMode: active });
  },

  recipes: CONSTRUCTION_RECIPES,
  selectedRecipeId: CONSTRUCTION_RECIPES[0].id,
  setSelectedRecipeId: (id) => set({ selectedRecipeId: id }),

  constructedObjects: [],
  addConstructedObject: (obj) => {
    const { recipes } = get();
    const recipe = recipes.find((r) => r.modelType === obj.type);
    if (!recipe) return false;

    // Check resource costs
    for (const cost of recipe.cost) {
      const current = get().getItemCount(cost.itemId);
      if (current < cost.quantity) {
        return false; // Not enough materials
      }
    }

    // Deduct resources
    for (const cost of recipe.cost) {
      get().removeItem(cost.itemId, cost.quantity);
    }

    audioManager.playConstruct();

    set((state) => ({
      constructedObjects: [
        ...state.constructedObjects,
        {
          id: obj.id,
          type: obj.type,
          position: obj.position,
          health: 100,
        },
      ],
    }));

    // Mission 7 progress checking
    if (obj.type === 'constructed_solar') {
      get().progressObjective('m7_independent_survival', 'm7_obj2');
    } else if (obj.type === 'constructed_battery') {
      get().progressObjective('m7_independent_survival', 'm7_obj3');
    }

    return true;
  },

  audioSettings: {
    masterVolume: 0.8,
    ambientVolume: 0.5,
    sfxVolume: 0.7,
    musicVolume: 0.6,
    muted: false,
  },
  setAudioSetting: (key, value) => {
    set((state) => {
      const updated = { ...state.audioSettings, [key]: value };
      if (key === 'muted') audioManager.setMuted(value as boolean);
      if (key === 'masterVolume') audioManager.setMasterVolume(value as number);
      if (key === 'ambientVolume') audioManager.setAmbientVolume(value as number);
      if (key === 'sfxVolume') audioManager.setSfxVolume(value as number);
      return { audioSettings: updated };
    });
  },

  graphicsQuality: 'high',
  setGraphicsQuality: (q) => set({ graphicsQuality: q }),

  stats: {
    mineralsMined: 0,
    repairsCompleted: 0,
    stormsSurvived: 0,
    cropsHarvested: 0,
  },
  incrementStat: (key) =>
    set((state) => ({
      stats: {
        ...state.stats,
        [key]: state.stats[key] + 1,
      },
    })),

  toastMessage: null,
  showToast: (msg, duration = 3000) => {
    set({ toastMessage: msg });
    setTimeout(() => {
      if (get().toastMessage === msg) {
        set({ toastMessage: null });
      }
    }, duration);
  },
  isRoverMounted: false,
  setRoverMounted: (isRoverMounted) => set({ isRoverMounted }),
  showAllHighlights: true,
  setShowAllHighlights: (showAllHighlights) => set({ showAllHighlights }),

  saveToStorage: () => {
    try {
      const state = get();
      const saveData = {
        playerName: state.playerName,
        sol: state.sol,
        solTime: state.solTime,
        resources: state.resources,
        inventory: state.inventory,
        missions: state.missions,
        currentMissionIndex: state.currentMissionIndex,
        constructedObjects: state.constructedObjects,
        stats: state.stats,
      };
      localStorage.setItem('MARS_OPS_SAVE_DATA', JSON.stringify(saveData));
      audioManager.playSuccessChime();
    } catch (e) {
      console.warn('Save failed:', e);
    }
  },

  loadFromStorage: () => {
    try {
      const dataStr = localStorage.getItem('MARS_OPS_SAVE_DATA');
      if (!dataStr) return false;
      const data = JSON.parse(dataStr);
      set({
        playerName: data.playerName || 'Ares Specialist',
        sol: data.sol || 1,
        solTime: data.solTime || 9.5,
        resources: { ...DEFAULT_RESOURCES, ...(data.resources || {}) },
        inventory: data.inventory || DEFAULT_INVENTORY,
        missions: data.missions || INITIAL_MISSIONS,
        currentMissionIndex: data.currentMissionIndex || 0,
        constructedObjects: data.constructedObjects || [],
        stats: { ...get().stats, ...(data.stats || {}) },
      });
      return true;
    } catch (e) {
      console.warn('Load failed:', e);
      return false;
    }
  },

  resetProgress: () => {
    localStorage.removeItem('MARS_OPS_SAVE_DATA');
    set({
      sol: 1,
      solTime: 9.5,
      resources: { ...DEFAULT_RESOURCES },
      inventory: [...DEFAULT_INVENTORY],
      missions: [...INITIAL_MISSIONS],
      currentMissionIndex: 0,
      constructedObjects: [],
      activeEmergency: null,
      activeDebrief: null,
      repairModal: null,
    });
  },
}));
