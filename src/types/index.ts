// Types for MARS OPS: THE LAST OUTPOST

export type GamePhase = 'menu' | 'name_entry' | 'tutorial' | 'playing' | 'paused' | 'gameover' | 'victory';

export interface TutorialStep {
  id: string;
  title: string;
  subtitle: string;
  instruction: string;
  taskHint: string;
  targetKey?: string;
  icon: string;
}

export interface ResourceState {
  oxygen: number;         // 0 - 100%
  water: number;          // 0 - 100%
  food: number;           // 0 - 100%
  power: number;          // Current power output (kW)
  powerDemand: number;    // Current consumption (kW)
  battery: number;        // 0 - 100% charge
  batteryCapacity: number; // kWh
  habitatTemp: number;    // Celsius (-60 to +25)
  crewHealth: number;     // 0 - 100%
  radiation: number;      // mSv/h (0.05 normal to 2.5 during storms)
  equipmentCondition: number; // 0 - 100% average
}

export interface ResourceRates {
  oxygenDelta: number;
  waterDelta: number;
  foodDelta: number;
  batteryDelta: number;
  healthDelta: number;
}

export type WeatherType = 'clear' | 'dust_devil' | 'dust_storm' | 'solar_radiation';

export interface WeatherState {
  type: WeatherType;
  intensity: number;      // 0 to 1
  visibility: number;     // 0 to 1 (1 = clear, 0.2 = dust storm)
  solarMultiplier: number;// 1.0 down to 0.15 during storms
  duration: number;       // seconds remaining
  windSpeed: number;      // m/s (5 to 35 m/s)
  temperature: number;    // ambient Mars surface temp (-80 to -20 C)
}

export type ObjectType = 
  | 'habitat_airlock'
  | 'habitat_console'
  | 'habitat_bunk'
  | 'medical_unit'
  | 'solar_array'
  | 'battery_bank'
  | 'backup_generator'
  | 'power_inverter'
  | 'oxygen_processor'
  | 'water_recycler'
  | 'greenhouse_tray'
  | 'lab_spectrometer'
  | 'lab_terminal'
  | 'comm_dish'
  | 'exploration_rover'
  | 'mineral_hematite'
  | 'mineral_silicon'
  | 'mineral_ice'
  | 'mineral_regolith'
  | 'storage_crate'
  | 'constructed_solar'
  | 'constructed_battery'
  | 'constructed_tank'
  | 'constructed_berm';

export interface InteractiveObject {
  id: string;
  name: string;
  type: ObjectType;
  position: [number, number, number];
  zone: string;
  actions: string[];
  status: 'nominal' | 'degraded' | 'fault' | 'offline' | 'growing' | 'ready';
  health: number; // 0 - 100
  infoText: string;
  requiresItem?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'mineral' | 'component' | 'tool' | 'consumable';
  quantity: number;
  maxStack: number;
  icon: string;
  description: string;
  weight: number; // kg
}

export interface MissionObjective {
  id: string;
  text: string;
  completed: boolean;
  current: number;
  target: number;
  hint?: string;
}

export interface EducationalDebrief {
  title: string;
  whatYouDid: string;
  whyItMattered: string;
  realWorldApplication: string;
  nasaReference: string;
  nasaLink: string;
  icon?: string;
}

export interface Mission {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  briefing: string;
  objectives: MissionObjective[];
  completed: boolean;
  educationalDebrief: EducationalDebrief;
}

export interface EmergencyEvent {
  id: string;
  type: WeatherType | 'oxygen_leak' | 'water_contamination' | 'power_grid_fault' | 'comm_blackout';
  title: string;
  description: string;
  severity: 'warning' | 'critical';
  timeRemaining: number;
  resolved: boolean;
  targetObjectId?: string;
  solutionHint: string;
}

export interface ConstructionRecipe {
  id: string;
  name: string;
  category: 'power' | 'life_support' | 'defense';
  description: string;
  cost: { itemId: string; quantity: number }[];
  modelType: ObjectType;
  color: number;
  dimensions: [number, number, number];
}

export interface AudioSettings {
  masterVolume: number;
  ambientVolume: number;
  sfxVolume: number;
  musicVolume: number;
  muted: boolean;
}

export interface SaveGameData {
  version: string;
  timestamp: number;
  sol: number;
  solTime: number;
  astronautPos: [number, number, number];
  resources: ResourceState;
  inventory: InventoryItem[];
  activeMissionIndex: number;
  missions: Mission[];
  weather: WeatherState;
  constructedObjects: {
    id: string;
    type: ObjectType;
    position: [number, number, number];
    health: number;
  }[];
  stats: {
    mineralsMined: number;
    repairsCompleted: number;
    stormsSurviving: number;
    distanceWalked: number;
  };
}
