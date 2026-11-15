# MARS OPS: THE LAST OUTPOST
### A 3D Isometric Voxel Mars Survival & Exploration Simulator
*Designed for NASA Space Exploration & Human Survival Simulation Hackathons*

![License](https://img.shields.io/badge/License-MIT-orange.svg)
![React](https://img.shields.io/badge/React-19-blue.svg)
![Three.js](https://img.shields.io/badge/Three.js-0.187-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)

---

## 🚀 Game Overview

**MARS OPS: THE LAST OUTPOST** puts the player in command of an isolated human research station on the surface of Mars. You must explore the rugged Martian topography, operate life-critical machinery, construct modular infrastructure, extract local mineral feedstocks, repair damaged circuits, manage interconnected life-support resources, and survive sudden planetary emergencies.

Unlike static quizzes or menu dashboards, **MARS OPS** is a complete, interactive 3D voxel game where space engineering concepts are learned directly through gameplay.

---

## 🌟 Key Features

### 1. 3D Isometric Voxel Martian Landscape
- **Orthographic Isometric Camera**: True 45° perspective with smooth dampening tracking, mouse-wheel zoom, and 45° orbital rotation (`Q`/`R`).
- **Dynamic Terrain**: Red and orange sandy dunes, stepped terraces, craters with impact rims, perimeter mountain ranges, and dynamic blowing dust particle systems.
- **Atmospheric Lighting Cycle**: Dynamic Sol day/night transitions (Martian Sol = 24.6 hours), changing sun zenith, atmospheric distance fog, and emergency alarm strobes.

### 2. Living Mars Outpost Modules
- **Zone A: Main Habitat Hub**: Dual-cycle airlock, crew sleeping quarters, medical telemetry bay, ECLSS environmental control console, and roof cutaway when exploring inside.
- **Zone B: Power Station**: Quad photovoltaic arrays that physically orient and track the sun, battery storage banks with charge LEDs, emergency methane generator, and high-voltage inverter.
- **Zone C: Greenhouse**: Polycarbonate arched dome, hydroponic growing trays with growing test cultivars, purple/far-red LED grow lights, and nutrient tanks.
- **Zone D: Science Laboratory**: Laser-induced breakdown spectrometer (LIBS) for atomic mineral assays, sample containers, and MOXIE solid-oxide oxygen processor.
- **Zone E: Communications Station**: High-gain parabolic satellite antenna linking to NASA's Deep Space Network (DSN) with speed-of-light time delay modeling.
- **Zone F: Surface Vehicle Pad**: 6-wheeled pressurized exploration rover (MPR-1) with camera mast and solar deck.

### 3. Astronaut Mobility & Physics
- Fully articulated voxel astronaut in NASA EVA spacesuit with golden reflective visor, chest display module, and PLSS life-support backpack.
- Smooth WASD movement, sprint capability (`Shift`), and 0.38g floaty Martian gravity jumping (`Space`).
- Procedural joint animations for idle breathing, walking, sprinting, mining, repairing, and building.

### 4. Real ECLSS Survival Simulation
Interconnected real-time simulation running on fixed timesteps:
- **Oxygen**: Consumed by astronaut; produced by MOXIE via CO2 electrolysis and melted ice sublimation.
- **Water**: Closed-loop recovery system (98% efficiency) with membrane flush maintenance and raw ice input.
- **Power & Batteries**: Solar panels generate power during daylight; batteries supply power at night or during storms. If batteries reach 0, life-support heaters fail, plunging the habitat to -40°C.
- **Food**: Produced by hydroponic plant beds in Zone C.
- **Radiation**: Elevated during Solar Particle Events; reduced by habitat walls and sintered regolith berms.

### 5. Multi-Step Diagnostic Repair Mechanics
Repairs require hands-on technical troubleshooting rather than a single click:
- **Inverter Repair**: Isolate high-voltage bus breakers ➔ Replace burned IGBT switching module ➔ Calibrate MPPT firmware.
- **MOXIE Repair**: Vent byproduct CO lines ➔ Replace Yttria-Stabilized Zirconia (YSZ) electrolyzer core ➔ Preheat chamber to 800°C.
- **Water Recycler**: Flush saturated charcoal/ion-exchange beds ➔ Replace catalytic distillation pump seal ➔ Run purity test.

### 6. In-Situ 3D Additive Construction
Press `C` to enter construction mode. Preview holographic voxel ghosts with 2m grid snapping:
- **Auxiliary Photovoltaic Panel**: +25 kW daytime generation (requires Silicon + Iron).
- **Lithium-Ion Energy Bank**: +150 kWh storage capacity (requires Silicon + Regolith).
- **Cryogenic Water Cistern**: +200 L potable water buffer (requires Iron + Ice).
- **Sintered Regolith Radiation Wall**: Vitreous 3D-printed barrier reducing cosmic radiation by 35% (requires Regolith).

### 7. Dynamic Emergencies
- **Class-5 Global Dust Storm**: Atmospheric opacity (tau) surges, reducing solar output by 82%; wind howls, dust particles swirl, and alarms sound.
- **Oxygen Processor Electrolyzer Failure**: Rapid oxygen decline requiring immediate emergency maintenance.
- **Water Recycler Membrane Clog**: Closed-loop efficiency drops to 40%.
- **Solar Particle Event / Radiation Alert**: High proton flux requiring immediate shelter inside the reinforced habitat.

### 8. 7-Mission Structured Campaign & NASA Debriefs
1. **Mission 01: First Contact** — Outpost orientation, ECLSS baseline, and regolith harvesting.
2. **Mission 02: Power Restoration** — Inverter circuit replacement and solar array recovery.
3. **Mission 03: Life Support Crisis** — Crater ice mining and MOXIE solid-oxide electrolysis.
4. **Mission 04: Water Recovery** — Closed-loop membrane flush and potable buffer refilling.
5. **Mission 05: The Martian Greenhouse** — Hydroponic seeding, LED recipe tuning, and crop harvest.
6. **Mission 06: The Great Dust Storm** — Auxiliary generator startup, rover lockdown, and brownout survival.
7. **Mission 07: Independent Survival** — Autonomous infrastructure expansion and long-term Sol survival.

Every milestone rewards the player with an educational **NASA Flight Heritage Debrief** covering:
- **What You Did** (Mission Action)
- **Why It Mattered** (Survival Science)
- **Real-World Application** (Aerospace Engineering)
- **NASA Reference & Public Documentation Link**

---

## 🎮 Controls

| Action | Desktop Key | Mobile / Touch |
| :--- | :--- | :--- |
| **Move Astronaut** | `W`, `A`, `S`, `D` / Arrows | On-Screen D-Pad |
| **Sprint** | `Shift` (Hold) | `RUN` Toggle Button |
| **Jump (0.38g)** | `Space` | `JUMP` Button |
| **Universal Interact** | `E` | `ACT [E]` Button |
| **Toggle Build Mode** | `C` | `BUILD MODE [C]` Button |
| **Place Construction** | `B` (while in Build Mode) | `PLACE [B]` Button |
| **Rotate Camera** | `Q` (Left) / `R` (Right) | — |
| **Zoom In / Out** | Mouse Wheel | — |
| **Pause / Telemetry** | `Escape` | — |

---

## 🛠️ Technology Stack

- **Framework**: React 19 + TypeScript
- **Bundler & Build Tool**: Vite 8
- **3D Graphics Engine**: Three.js (Orthographic Camera, PCF Soft Shadows, Procedural Voxel Geometry)
- **State Management**: Zustand
- **Audio Synthesis**: Pure Web Audio API (procedural Martian wind, spacesuit breathing, footsteps, alarms, spark welders)
- **Persistence**: LocalStorage with automatic 30s telemetry autosave and manual save slots

---

## 📦 Installation & Launch

### Prerequisites
- Node.js 18+ and npm installed.

### Run in Development Mode
```bash
# Clone or navigate to the project directory
cd NASA

# Install dependencies
npm install

# Start the development server
npm run dev
```
Open your browser and navigate to `http://localhost:5173/`.

### Production Build
```bash
# Compile TypeScript and bundle assets
npm run build

# Preview production build locally
npm run preview
```

---

## 📚 Real-World NASA References & Educational Basis

- **NASA MOXIE (Mars 2020)**: [https://mars.nasa.gov/mars2020/spacecraft/instruments/moxie/](https://mars.nasa.gov/mars2020/spacecraft/instruments/moxie/)
- **ISS ECLSS & Water Recovery**: [https://www.nasa.gov/international-space-station/space-station-research-and-technology/water-recovery-system/](https://www.nasa.gov/international-space-station/space-station-research-and-technology/water-recovery-system/)
- **NASA Veggie & Advanced Plant Habitat (APH)**: [https://www.nasa.gov/mission/exploration-research/veggie-plant-growth-system/](https://www.nasa.gov/mission/exploration-research/veggie-plant-growth-system/)
- **NASA Deep Space Network (DSN)**: [https://eyes.nasa.gov/dsn/dsn.html](https://eyes.nasa.gov/dsn/dsn.html)
- **Opportunity Rover Dust Storm Analysis**: [https://mars.nasa.gov/news/8348/opportunity-weathering-severe-dust-storm-on-mars/](https://mars.nasa.gov/news/8348/opportunity-weathering-severe-dust-storm-on-mars/)

*Disclaimer: This game was created for educational purposes for a NASA themed hackathon and utilizes publicly available NASA research and technical reports. It does not imply official NASA endorsement or certification.*
