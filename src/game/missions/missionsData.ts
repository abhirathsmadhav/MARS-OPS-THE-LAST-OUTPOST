import type { Mission } from '../../types';

export const INITIAL_MISSIONS: Mission[] = [
  {
    id: 'm1_first_contact',
    number: 1,
    title: 'First Contact',
    subtitle: 'Base Acclimation & ECLSS Orientation',
    briefing: 'Welcome to Mars Outpost Alpha, Commander. Your primary duty is to inspect life-support infrastructure, establish situational awareness, and confirm all critical systems are operational after the recent transit.',
    objectives: [
      { id: 'm1_obj1', text: 'Enter Habitat and inspect the Environmental Control Panel', completed: false, current: 0, target: 1, hint: 'Walk to the Main Habitat dome airlock and press [E]' },
      { id: 'm1_obj2', text: 'Survey Zone B: Inspect the Main Solar Array & Inverter', completed: false, current: 0, target: 1, hint: 'Head West to the photovoltaic farm and interact with the inverter' },
      { id: 'm1_obj3', text: 'Gather a surface Martian Regolith sample for laboratory baseline', completed: false, current: 0, target: 1, hint: 'Collect reddish rock pile on the surface using [E]' }
    ],
    completed: false,
    educationalDebrief: {
      title: 'Mars Habitation & Environmental Control (ECLSS)',
      whatYouDid: 'You performed a physical baseline inspection of the habitat airlock, primary life support telemetry, and gathered native Martian regolith.',
      whyItMattered: 'Mars has an atmospheric pressure of only 0.6% of Earth (mostly CO2) and average surface temperatures of -60°C. Redundant habitat monitoring is life-critical.',
      realWorldApplication: 'NASA astronauts on the ISS and future Artemis base camps perform continuous ECLSS (Environmental Control and Life Support System) diagnostic runs to monitor pressure, partial O2, and CO2 scrubbers.',
      nasaReference: 'NASA Technical Reports: Human Integration Design Processes (HIDH) & ISS ECLSS Flight Architecture.',
      nasaLink: 'https://www.nasa.gov/centers-and-facilities/marshall/life-support-systems/',
      icon: 'shield'
    }
  },
  {
    id: 'm2_power_restoration',
    number: 2,
    title: 'Power Restoration',
    subtitle: 'Photovoltaic Array & Inverter Overhaul',
    briefing: 'A high-voltage surge damaged the Zone B Solar Inverter. Power generation has plummeted by 70%, forcing Outpost Alpha to draw upon limited battery reserves. Locate replacement electronics and repair the inverter before battery depletion.',
    objectives: [
      { id: 'm2_obj1', text: 'Retrieve Electronic Spare Components from Habitat Storage Crate', completed: false, current: 0, target: 1, hint: 'Find the blue storage container inside or near the Habitat airlock' },
      { id: 'm2_obj2', text: 'Approach Damaged Solar Inverter in Zone B', completed: false, current: 0, target: 1, hint: 'Look for the smoking unit near the solar panels' },
      { id: 'm2_obj3', text: 'Perform Diagnostic Circuit Calibration & Complete Repair', completed: false, current: 0, target: 1, hint: 'Interact with inverter [E] and complete the circuit reconnection sequence' }
    ],
    completed: false,
    educationalDebrief: {
      title: 'Solar Power Inverters & Photovoltaic Dust Mitigation',
      whatYouDid: 'You diagnosed a burned inverter thyristor bridge, collected replacement solid-state components, and restored 3-phase AC power conversion from the solar array.',
      whyItMattered: 'Mars receives less than half the solar irradiance of Earth (~590 W/m² vs ~1360 W/m²). Without efficient inverter conversion and power conditioning, life support heaters freeze in minutes.',
      realWorldApplication: 'NASA Mars Exploration Rovers (Spirit, Opportunity, InSight) relied extensively on solar arrays and solid-state inverters, constantly managing dust deposition and battery state-of-charge.',
      nasaReference: 'NASA Jet Propulsion Laboratory: Solar Array & Power System Performance on Mars.',
      nasaLink: 'https://mars.nasa.gov/mer/mission/technology/spacecraft/',
      icon: 'zap'
    }
  },
  {
    id: 'm3_life_support',
    number: 3,
    title: 'Life Support Crisis',
    subtitle: 'MOXIE Oxygen Generator Calibration',
    briefing: 'Telemetric warning: Zone D Oxygen Processor is exhibiting membrane fouling and pressure drop. Station O2 levels are degrading. Collect water ice and adjust the solid-oxide electrolysis chamber.',
    objectives: [
      { id: 'm3_obj1', text: 'Extract 2 Subsurface Ice deposits from Crater rim', completed: false, current: 0, target: 2, hint: 'Head south towards the crater and mine blue-tinted ice deposits' },
      { id: 'm3_obj2', text: 'Deliver Ice to the Zone D Oxygen Processor Sublimator', completed: false, current: 0, target: 1, hint: 'Approach the Oxygen Processor and press [E] to deposit ice' },
      { id: 'm3_obj3', text: 'Calibrate Solid-Oxide Electrolysis unit to nominal output', completed: false, current: 0, target: 1, hint: 'Engage the calibration sequence in the processor interface' }
    ],
    completed: false,
    educationalDebrief: {
      title: 'In-Situ Resource Utilization (ISRU) & MOXIE',
      whatYouDid: 'You harvested local Martian water ice and calibrated a high-temperature solid-oxide electrolysis reactor to synthesize breathable O2.',
      whyItMattered: 'Transporting oxygen from Earth costs tens of thousands of dollars per kilogram. In-Situ Resource Utilization (ISRU) makes long-term human presence feasible.',
      realWorldApplication: 'NASA\'s MOXIE (Mars Oxygen ISRU Experiment) aboard the Perseverance rover successfully demonstrated producing 122 grams of 98% pure oxygen directly from atmospheric CO2 at 800°C.',
      nasaReference: 'NASA Mars 2020 Mission: MOXIE Instrument Overview & Field Trials.',
      nasaLink: 'https://mars.nasa.gov/mars2020/spacecraft/instruments/moxie/',
      icon: 'wind'
    }
  },
  {
    id: 'm4_water_recovery',
    number: 4,
    title: 'Water Recovery',
    subtitle: 'Closed-Loop Hydrological Recycling',
    briefing: 'The Outpost Water Recovery System membrane filter has reached saturation. The base recycling rate has collapsed from 98% to 40%. Retrieve clean ice and replacement filtration media to restore closed-loop recycling.',
    objectives: [
      { id: 'm4_obj1', text: 'Collect 3 Subsurface Ice deposits from Martian terrain', completed: false, current: 0, target: 3, hint: 'Scour the rocky ridge and crater basin for glistening ice nodules' },
      { id: 'm4_obj2', text: 'Inspect and flush the Water Recycler Unit in Zone A', completed: false, current: 0, target: 1, hint: 'Interact with the water recycling station in the habitat service bay' },
      { id: 'm4_obj3', text: 'Refill primary water potable buffer to > 70%', completed: false, current: 0, target: 1, hint: 'Process the collected ice in the purification chamber' }
    ],
    completed: false,
    educationalDebrief: {
      title: 'Closed-Loop Water Recovery Systems (WRS)',
      whatYouDid: 'You flushed contaminated catalytic distillation membranes and replenished clean water buffer from glacio-lacustrine subsurface deposits.',
      whyItMattered: 'Every human consumes approximately 2.5 liters of potable water per day. A Mars crew of four requires over 3,600 kg of water per year if not recycled.',
      realWorldApplication: 'The International Space Station\'s Water Recovery System (WRS) achieves an astonishing 98% water recovery rate from crew sweat, respiration, and hygiene condensate using vacuum distillation and multi-filtration beds.',
      nasaReference: 'NASA Johnson Space Center: Exploration ECLSS Water Management Technology Roadmap.',
      nasaLink: 'https://www.nasa.gov/international-space-station/space-station-research-and-technology/water-recovery-system/',
      icon: 'droplet'
    }
  },
  {
    id: 'm5_greenhouse',
    number: 5,
    title: 'The Martian Greenhouse',
    subtitle: 'Controlled-Environment Agriculture (CEA)',
    briefing: 'Pre-packaged rations are depleting. Zone C Greenhouse must be brought online. Plant spirulina and sweet potato test cultivars, balance hydroponic nutrient circulation, and tune the LED spectrum.',
    objectives: [
      { id: 'm5_obj1', text: 'Acquire Seed Cartridges & Nutrient packets from Science Lab', completed: false, current: 0, target: 1, hint: 'Visit Zone D Science Lab storage cabinet' },
      { id: 'm5_obj2', text: 'Plant seeds into Zone C Hydroponic Growing Trays', completed: false, current: 0, target: 1, hint: 'Approach the greenhouse plant beds and press [E]' },
      { id: 'm5_obj3', text: 'Adjust Grow Lights spectrum to Red/Far-Red and harvest initial crop', completed: false, current: 0, target: 1, hint: 'Wait for crop maturation or speed up with hydroponic tune action, then harvest' }
    ],
    completed: false,
    educationalDebrief: {
      title: 'Space Agriculture & Hydroponics (Veggie / APH)',
      whatYouDid: 'You seeded hydroponic rockwool matrices, adjusted LED photo-periods, and successfully harvested microgreens in an artificial Martian bio-dome.',
      whyItMattered: 'Beyond vital caloric and micronutrient sustenance (Vitamin C, B-complex), live plants provide psychological well-being for isolated astronauts and absorb exhaled CO2.',
      realWorldApplication: 'NASA\'s Veggie and Advanced Plant Habitat (APH) payloads on the ISS have successfully cultivated red romaine lettuce, mizuna mustard, and dwarf peppers in microgravity using tuned LED light recipes.',
      nasaReference: 'NASA Kennedy Space Center: Plant Research in Space & Space Crop Production.',
      nasaLink: 'https://www.nasa.gov/mission/exploration-research/veggie-plant-growth-system/',
      icon: 'leaf'
    }
  },
  {
    id: 'm6_dust_storm',
    number: 6,
    title: 'The Great Dust Storm',
    subtitle: 'Planetary-Scale Atmospheric Defense',
    briefing: 'URGENT MARS WEATHER ALERT: A continent-spanning dust storm front is approaching Outpost Alpha. Optical opacity (tau) is projected to reach 4.5. Secure surface infrastructure, start the auxiliary generator, and protect habitat life support.',
    objectives: [
      { id: 'm6_obj1', text: 'Start Zone B Backup Fuel Cell / Generator', completed: false, current: 0, target: 1, hint: 'Head to the generator unit in Zone B and press [E] Start' },
      { id: 'm6_obj2', text: 'Stow the Exploration Rover safely in docking bay', completed: false, current: 0, target: 1, hint: 'Approach the Rover and engage storm lockdown [E]' },
      { id: 'm6_obj3', text: 'Take shelter inside Habitat Hub and maintain battery > 25% during storm peak', completed: false, current: 0, target: 1, hint: 'Enter the habitat dome and monitor electrical load until storm subsides' }
    ],
    completed: false,
    educationalDebrief: {
      title: 'Martian Global Dust Storms & Electrostatic Levitation',
      whatYouDid: 'You weathered an extreme dust tempest by load-shedding non-critical equipment, engaging fuel cell reserves, and monitoring atmospheric opacity.',
      whyItMattered: 'Dust storms on Mars can envelope the entire planet for months at a time. The ultrafine, sharp dust grains also carry strong electrostatic charges that cling to seals, radiators, and solar panels.',
      realWorldApplication: 'In 2018, a catastrophic global dust storm with tau > 10 permanently disabled NASA\'s Opportunity rover after 14 years of exploration, demonstrating the necessity of robust multi-modal power systems.',
      nasaReference: 'NASA Science Mission Directorate: The Anatomy of a Martian Dust Storm.',
      nasaLink: 'https://mars.nasa.gov/news/8348/opportunity-weathering-severe-dust-storm-on-mars/',
      icon: 'alert-triangle'
    }
  },
  {
    id: 'm7_independent_survival',
    number: 7,
    title: 'Independent Survival',
    subtitle: 'Sustainable Autonomous Colony Architecture',
    briefing: 'Earth Mission Control communication delay is 14 minutes. Outpost Alpha must prove total survival autonomy. Expand infrastructure by constructing an additional solar generator and battery unit, and sustain nominal metrics for 3 Martian Sols.',
    objectives: [
      { id: 'm7_obj1', text: 'Collect 4 Silicon and 4 Iron Hematite minerals from surface deposits', completed: false, current: 0, target: 8, hint: 'Mine mineral deposits across Zone F surface terrain' },
      { id: 'm7_obj2', text: 'Construct a New Auxiliary Solar Array using the Build Menu [C]', completed: false, current: 0, target: 1, hint: 'Open Build Menu with [C], select Auxiliary Solar, and place on open terrain' },
      { id: 'm7_obj3', text: 'Construct an Auxiliary Battery Storage Bank', completed: false, current: 0, target: 1, hint: 'Build an additional battery module to store nocturnal energy reserves' },
      { id: 'm7_obj4', text: 'Maintain all Outpost resources above 60% for a full Sol cycle', completed: false, current: 0, target: 1, hint: 'Keep O2, Water, Food, and Power stable through the day/night cycle' }
    ],
    completed: false,
    educationalDebrief: {
      title: 'Autonomous Space Architectures & In-Situ Manufacturing',
      whatYouDid: 'You mined planetary mineral feedstocks, manufactured modular energy infrastructure, and maintained long-term closed-loop ecological stability without resupply from Earth.',
      whyItMattered: 'A 2-way communication delay between Mars and Earth varies between 6 and 44 minutes depending on orbital alignment. Colonists must make autonomous engineering decisions.',
      realWorldApplication: 'NASA\'s Autonomous Systems and Operations (ASO) project and Moon-to-Mars Architecture development focus on deep space autonomous habitat operations, predictive maintenance, and robotic additive manufacturing using regolith simulant.',
      nasaReference: 'NASA Exploration Systems Development Mission Directorate: Moon to Mars Strategy & Architecture Objectives.',
      nasaLink: 'https://www.nasa.gov/moon-to-mars-architecture/',
      icon: 'award'
    }
  }
];

