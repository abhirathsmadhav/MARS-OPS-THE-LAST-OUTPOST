export interface ObjectiveNavInfo {
  missionId: string;
  objectiveId: string;
  targetName: string;
  position: [number, number, number];
  hint: string;
  color?: number;
}

export const OBJECTIVE_NAV_TARGETS: Record<string, ObjectiveNavInfo> = {
  // Mission 1: First Contact
  'm1_obj1': {
    missionId: 'm1_first_contact',
    objectiveId: 'm1_obj1',
    targetName: 'Habitat ECLSS Console',
    position: [0, 1.2, -4.5],
    hint: 'Enter the South airlock of the Habitat Hub dome and interact with the central cyan console [E].',
    color: 0x00f5d4,
  },
  'm1_obj2': {
    missionId: 'm1_first_contact',
    objectiveId: 'm1_obj2',
    targetName: 'Zone B Solar Array & Inverter',
    position: [-19, 1.3, 0],
    hint: 'Head West to the photovoltaic farm in Zone B and inspect the solar array and inverter [E].',
    color: 0xffa500,
  },
  'm1_obj3': {
    missionId: 'm1_first_contact',
    objectiveId: 'm1_obj3',
    targetName: 'Martian Regolith Deposit',
    position: [-8, 0, 12],
    hint: 'Collect reddish Martian regolith piles on the surface using your EVA Multi-Tool [E] or click.',
    color: 0xe76f51,
  },

  // Mission 2: Power Restoration
  'm2_obj1': {
    missionId: 'm2_power_restoration',
    objectiveId: 'm2_obj1',
    targetName: 'Habitat Equipment Storage Crate',
    position: [-4.5, 1.0, 2.0],
    hint: 'Retrieve electronic replacement chips from the blue storage crate inside the Habitat [E].',
    color: 0x3182ce,
  },
  'm2_obj2': {
    missionId: 'm2_power_restoration',
    objectiveId: 'm2_obj2',
    targetName: 'Damaged Solar Inverter',
    position: [-19, 1.3, 0],
    hint: 'Approach the smoking red inverter in Zone B and press [E] to diagnose the thyristor bridge fault.',
    color: 0xe53e3e,
  },
  'm2_obj3': {
    missionId: 'm2_power_restoration',
    objectiveId: 'm2_obj3',
    targetName: 'Solar Inverter Maintenance Panel',
    position: [-19, 1.3, 0],
    hint: 'Complete the 3-step circuit calibration in the repair panel to restore solar power output.',
    color: 0x48bb78,
  },

  // Mission 3: Life Support Crisis
  'm3_obj1': {
    missionId: 'm3_life_support',
    objectiveId: 'm3_obj1',
    targetName: 'Subsurface Water Ice Deposit',
    position: [-32, 0, 22],
    hint: 'Extract blue-tinted ice deposits near the South-West crater rim using your Multi-Tool [E].',
    color: 0x90e0ef,
  },
  'm3_obj2': {
    missionId: 'm3_life_support',
    objectiveId: 'm3_obj2',
    targetName: 'MOXIE Oxygen Processor',
    position: [4, 1.5, -22],
    hint: 'Deliver collected ice to the Zone D Oxygen Processor sublimator chamber to the North [E].',
    color: 0x00f5d4,
  },
  'm3_obj3': {
    missionId: 'm3_life_support',
    objectiveId: 'm3_obj3',
    targetName: 'MOXIE Electrolyzer Calibration',
    position: [4, 1.5, -22],
    hint: 'Engage and calibrate the solid-oxide ceramic electrolyzer core in the maintenance panel.',
    color: 0x319795,
  },

  // Mission 4: Water Recovery
  'm4_obj1': {
    missionId: 'm4_water_recovery',
    objectiveId: 'm4_obj1',
    targetName: 'Glacial Ice Deposits',
    position: [-36, 0, 27],
    hint: 'Scour the crater rim to extract 3 glacial ice chunks for the water recovery buffer.',
    color: 0x90e0ef,
  },
  'm4_obj2': {
    missionId: 'm4_water_recovery',
    objectiveId: 'm4_obj2',
    targetName: 'Habitat Water Recycler',
    position: [4.5, 1.3, 2.0],
    hint: 'Flush and calibrate the closed-loop water purifier in the Habitat service bay [E].',
    color: 0x3182ce,
  },
  'm4_obj3': {
    missionId: 'm4_water_recovery',
    objectiveId: 'm4_obj3',
    targetName: 'Potable Buffer Purifier',
    position: [4.5, 1.3, 2.0],
    hint: 'Feed ice into the distillation sublimator to restore station water buffer > 70%.',
    color: 0x48bb78,
  },

  // Mission 5: The Martian Greenhouse
  'm5_obj1': {
    missionId: 'm5_greenhouse',
    objectiveId: 'm5_obj1',
    targetName: 'Science Lab Seed Storage',
    position: [-4, 1.2, -22],
    hint: 'Acquire seed cartridges and nutrient matrix from the Science Lab in Zone D [E].',
    color: 0x805ad5,
  },
  'm5_obj2': {
    missionId: 'm5_greenhouse',
    objectiveId: 'm5_obj2',
    targetName: 'Zone C Hydroponic Crop Trays',
    position: [22, 1.1, 0],
    hint: 'Head East to the Greenhouse bio-dome and plant seeds into the hydroponic beds [E].',
    color: 0x48bb78,
  },
  'm5_obj3': {
    missionId: 'm5_greenhouse',
    objectiveId: 'm5_obj3',
    targetName: 'Harvest Fresh Crops',
    position: [22, 1.1, 0],
    hint: 'Tune the red/far-red LED spectrum and harvest your first batch of Martian crops [E].',
    color: 0xe53e3e,
  },

  // Mission 6: The Great Dust Storm
  'm6_obj1': {
    missionId: 'm6_dust_storm',
    objectiveId: 'm6_obj1',
    targetName: 'Emergency Backup Generator',
    position: [-22, 1.2, -8.5],
    hint: 'Run to Zone B Power Station and start the methane backup fuel cell generator [E].',
    color: 0xd69e2e,
  },
  'm6_obj2': {
    missionId: 'm6_dust_storm',
    objectiveId: 'm6_obj2',
    targetName: 'Pressurized Exploration Rover',
    position: [12, 1.0, 16],
    hint: 'Approach the Rover vehicle at the maintenance pad and engage storm lockdown [E].',
    color: 0xdd6b20,
  },
  'm6_obj3': {
    missionId: 'm6_dust_storm',
    objectiveId: 'm6_obj3',
    targetName: 'Habitat Storm Shelter',
    position: [0, 1.2, 0],
    hint: 'Retreat inside the reinforced Habitat dome and maintain battery reserves during the storm.',
    color: 0x00f5d4,
  },

  // Mission 7: Independent Survival
  'm7_obj1': {
    missionId: 'm7_independent_survival',
    objectiveId: 'm7_obj1',
    targetName: 'Surface Mineral Veins',
    position: [15, 0, 14],
    hint: 'Mine Silicon nodules and Hematite ore deposits across the Martian terrain.',
    color: 0x2a9d8f,
  },
  'm7_obj2': {
    missionId: 'm7_independent_survival',
    objectiveId: 'm7_obj2',
    targetName: 'Open Terrain Build Site',
    position: [-10, 0, -10],
    hint: 'Press [C] to open 3D Construction Menu, select Auxiliary Solar Panel, and press [B] to fabricate.',
    color: 0x2244aa,
  },
  'm7_obj3': {
    missionId: 'm7_independent_survival',
    objectiveId: 'm7_obj3',
    targetName: 'Power Grid Expansion',
    position: [-14, 0, -10],
    hint: 'Fabricate an Auxiliary Battery Storage Bank [C] + [B] to expand energy capacity.',
    color: 0x44aa44,
  },
  'm7_obj4': {
    missionId: 'm7_independent_survival',
    objectiveId: 'm7_obj4',
    targetName: 'Outpost Life Support',
    position: [0, 1.2, 0],
    hint: 'Maintain O2, Water, Food, and Power above 60% for a full Sol cycle.',
    color: 0x00f5d4,
  },
};

