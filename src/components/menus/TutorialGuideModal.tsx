import React from 'react';
import { useGameStore } from '../../store/gameStore';

export const TutorialGuideModal: React.FC = () => {
  const isTutorialActive = useGameStore((state) => state.isTutorialActive);
  const tutorialStepIndex = useGameStore((state) => state.tutorialStepIndex);
  const nextTutorialStep = useGameStore((state) => state.nextTutorialStep);
  const prevTutorialStep = useGameStore((state) => state.prevTutorialStep);
  const finishTutorial = useGameStore((state) => state.finishTutorial);
  const playerName = useGameStore((state) => state.playerName);

  if (!isTutorialActive) return null;

  const TUTORIAL_STEPS = [
    {
      title: 'WELCOME TO MARS, COMMANDER',
      subtitle: `Outpost Alpha Briefing for Commander ${playerName}`,
      icon: '🚀',
      content: (
        <div>
          <p style={{ marginBottom: '10px' }}>
            Welcome to the remote human research outpost on Mars. As Commander, you are responsible for maintaining life-support, generating power, operating heavy machinery, and surviving unpredictable planetary emergencies.
          </p>
          <p style={{ color: '#00f5d4', fontWeight: 'bold' }}>
            This quick tutorial will introduce you to your spacesuit mobility, camera controls, universal interaction, survival telemetry, and 3D base construction.
          </p>
        </div>
      ),
      tip: 'You can review controls anytime or pause with [ESC].',
    },
    {
      title: 'ASTRONAUT MOBILITY & MARS GRAVITY',
      subtitle: 'Locomotion in 0.38g Surface Gravity',
      icon: '🧑‍🚀',
      content: (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '12px' }}>
            <div style={{ background: '#1a202c', padding: '10px', borderRadius: '6px', textAlign: 'center' }}>
              <div style={{ color: '#00f5d4', fontWeight: 'bold', fontSize: '1.1rem' }}>W A S D</div>
              <div style={{ fontSize: '0.75rem', color: '#a0aec0', marginTop: '4px' }}>Move in 4 directions</div>
            </div>
            <div style={{ background: '#1a202c', padding: '10px', borderRadius: '6px', textAlign: 'center' }}>
              <div style={{ color: '#ff6b35', fontWeight: 'bold', fontSize: '1.1rem' }}>SHIFT</div>
              <div style={{ fontSize: '0.75rem', color: '#a0aec0', marginTop: '4px' }}>Sprint (Higher O2)</div>
            </div>
            <div style={{ background: '#1a202c', padding: '10px', borderRadius: '6px', textAlign: 'center' }}>
              <div style={{ color: '#63b3ed', fontWeight: 'bold', fontSize: '1.1rem' }}>SPACE</div>
              <div style={{ fontSize: '0.75rem', color: '#a0aec0', marginTop: '4px' }}>0.38g Floaty Jump</div>
            </div>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#cbd5e0' }}>
            Notice the red dust kicking up beneath your EVA boots and the headlight beam shining from your helmet visor at night.
          </p>
        </div>
      ),
      tip: 'Movement direction is always intuitive and aligned relative to your camera angle!',
    },
    {
      title: 'ISOMETRIC CAMERA NAVIGATION',
      subtitle: 'True 45-Degree Orthographic Viewport',
      icon: '🎥',
      content: (
        <div>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
            <div style={{ flex: 1, background: '#1a202c', padding: '12px', borderRadius: '6px' }}>
              <div style={{ color: '#00f5d4', fontWeight: 'bold', fontSize: '1rem', marginBottom: '4px' }}>
                [Q] & [R] KEYS
              </div>
              <div style={{ fontSize: '0.8rem', color: '#a0aec0' }}>
                Orbit the isometric camera 45° around the astronaut to view hidden equipment and base walls.
              </div>
            </div>
            <div style={{ flex: 1, background: '#1a202c', padding: '12px', borderRadius: '6px' }}>
              <div style={{ color: '#ff6b35', fontWeight: 'bold', fontSize: '1rem', marginBottom: '4px' }}>
                MOUSE WHEEL
              </div>
              <div style={{ fontSize: '0.8rem', color: '#a0aec0' }}>
                Smoothly zoom in for close-up maintenance or zoom out for a tactical landscape overview.
              </div>
            </div>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#cbd5e0' }}>
            The camera smoothly tracks your astronaut with built-in boundary dampening.
          </p>
        </div>
      ),
      tip: 'Try pressing Q or R now to inspect Outpost Alpha from different angles!',
    },
    {
      title: 'UNIVERSAL INTERACTION & MINING',
      subtitle: 'Proximity Detection & Contextual Actions',
      icon: '⚡',
      content: (
        <div>
          <p style={{ marginBottom: '10px' }}>
            Whenever you approach an interactive facility (Airlock, Inverter, MOXIE, Water Recycler, Rover) or native mineral rock (Hematite, Silicon, Ice, Regolith), a <strong>glowing ground marker and 3D floating indicator</strong> will activate.
          </p>
          <div style={{ background: '#1a202c', borderLeft: '4px solid #00f5d4', padding: '10px 14px', borderRadius: '0 6px 6px 0', marginBottom: '10px' }}>
            <div style={{ color: '#00f5d4', fontWeight: 'bold', fontSize: '0.9rem' }}>
              PRESS [E] OR CLICK TARGET TO INTERACT
            </div>
            <div style={{ fontSize: '0.8rem', color: '#a0aec0', marginTop: '2px' }}>
              Harvest raw minerals, diagnose broken circuits, flush water filters, or access the science lab!
            </div>
          </div>
        </div>
      ),
      tip: 'Look for glistening blue nodules near the crater rim to extract cryogenic water ice!',
    },
    {
      title: 'LIFE SUPPORT TELEMETRY (ECLSS)',
      subtitle: 'Energy Budgeting & Atmospheric Vitals',
      icon: '📊',
      content: (
        <div>
          <p style={{ marginBottom: '10px' }}>
            Inspect the <strong>Top Status Bar</strong>:
          </p>
          <ul style={{ paddingLeft: '20px', fontSize: '0.85rem', color: '#cbd5e0', lineHeight: '1.6' }}>
            <li><strong>Oxygen & Water</strong>: Essential astronaut life-support buffers. Water is recycled at 98% efficiency.</li>
            <li><strong>Solar vs Load</strong>: Solar arrays generate power during daylight (6:00 to 18:36 MT).</li>
            <li><strong>Battery Storage</strong>: Stores surplus energy to heat the habitat overnight or during dust storms.</li>
            <li><strong>Vitals & Temp</strong>: If batteries reach 0, life-support heaters shut down, plunging the base to -40°C!</li>
          </ul>
        </div>
      ),
      tip: 'Watch the Sol clock — day and night cycles affect solar output in real-time.',
    },
    {
      title: 'IN-SITU 3D ADDITIVE CONSTRUCTION',
      subtitle: 'Fabricating Modular Infrastructure',
      icon: '🏗️',
      content: (
        <div>
          <div style={{ background: '#1a202c', border: '1px solid #00f5d4', borderRadius: '6px', padding: '12px', marginBottom: '12px' }}>
            <div style={{ color: '#00f5d4', fontWeight: 'bold', marginBottom: '6px' }}>
              1. PRESS [C] TO TOGGLE BUILD MODE
            </div>
            <div style={{ fontSize: '0.85rem', color: '#cbd5e0' }}>
              Select a blueprint (Auxiliary Solar Panel, Battery Bank, Water Cistern, or Sintered Regolith Wall).
            </div>
            <div style={{ color: '#ff6b35', fontWeight: 'bold', marginTop: '8px' }}>
              2. AIM HOLOGRAPHIC GHOST PREVIEW & PRESS [B]
            </div>
            <div style={{ fontSize: '0.85rem', color: '#cbd5e0' }}>
              Snaps to the 2m voxel grid. Constructs the real 3D building and boosts your colony capacity!
            </div>
          </div>
        </div>
      ),
      tip: 'Mine Silicon and Hematite on the surface to gather materials for new solar panels.',
    },
    {
      title: 'CAMPAIGN DIRECTIVES & NASA SCIENCE',
      subtitle: 'Your First Mission Awaits',
      icon: '🏆',
      content: (
        <div>
          <p style={{ marginBottom: '10px' }}>
            Follow the <strong>Left Mission Panel</strong> for step-by-step engineering directives. Outpost Alpha features a complete 7-mission campaign:
          </p>
          <p style={{ fontSize: '0.85rem', color: '#cbd5e0', marginBottom: '8px' }}>
            1. <em>First Contact</em> ➔ 2. <em>Power Restoration</em> ➔ 3. <em>Life Support Crisis</em> ➔ 4. <em>Water Recovery</em> ➔ 5. <em>The Greenhouse</em> ➔ 6. <em>The Great Dust Storm</em> ➔ 7. <em>Independent Survival</em>.
          </p>
          <p style={{ color: '#00f5d4', fontSize: '0.85rem', fontWeight: 'bold' }}>
            Completing major operations unlocks educational NASA Debriefs with authentic flight heritage references (MOXIE, ISS ECLSS, Veggie, and Deep Space Network).
          </p>
        </div>
      ),
      tip: 'Ready to take command? Press COMPLETE TUTORIAL to begin Sol 01!',
    },
  ];

  const currentStep = TUTORIAL_STEPS[tutorialStepIndex];
  const isLast = tutorialStepIndex === TUTORIAL_STEPS.length - 1;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 10, 18, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 140,
        fontFamily: "'Courier New', monospace",
        color: '#e2e8f0',
        pointerEvents: 'auto',
      }}
    >
      <div
        style={{
          width: '680px',
          maxWidth: '92vw',
          backgroundColor: '#0c1524',
          border: '2px solid #00f5d4',
          borderRadius: '12px',
          boxShadow: '0 0 45px rgba(0, 245, 212, 0.35)',
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '88vh',
        }}
      >
        {/* Step Indicator & Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1a2a44', paddingBottom: '14px', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.8rem' }}>{currentStep.icon}</span>
            <div>
              <div style={{ color: '#00f5d4', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '2px' }}>
                ASTRONAUT ORIENTATION PROTOCOL • STEP 0{tutorialStepIndex + 1}/0{TUTORIAL_STEPS.length}
              </div>
              <h2 style={{ fontSize: '1.3rem', color: '#fff', margin: '2px 0 0 0' }}>
                {currentStep.title}
              </h2>
            </div>
          </div>

          <button
            onClick={finishTutorial}
            style={{
              background: 'transparent',
              border: '1px solid #4a5568',
              color: '#a0aec0',
              padding: '6px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.8rem',
            }}
          >
            SKIP [ESC]
          </button>
        </div>

        {/* Step Content */}
        <div style={{ flex: 1, overflowY: 'auto', marginBottom: '18px', paddingRight: '6px' }}>
          <div style={{ fontSize: '0.9rem', color: '#ff6b35', fontWeight: 'bold', marginBottom: '12px' }}>
            {currentStep.subtitle}
          </div>
          {currentStep.content}

          {currentStep.tip && (
            <div style={{ marginTop: '16px', background: 'rgba(0, 245, 212, 0.1)', border: '1px solid #00f5d4', borderRadius: '6px', padding: '8px 12px', fontSize: '0.8rem', color: '#00f5d4' }}>
              💡 PRO TIP: {currentStep.tip}
            </div>
          )}
        </div>

        {/* Step Dots & Navigation Footer */}
        <div style={{ borderTop: '1px solid #1a2a44', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Progress dots */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {TUTORIAL_STEPS.map((_, idx) => (
              <div
                key={idx}
                style={{
                  width: idx === tutorialStepIndex ? '20px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  background: idx === tutorialStepIndex ? '#00f5d4' : idx < tutorialStepIndex ? '#48bb78' : '#2d3748',
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            {tutorialStepIndex > 0 && (
              <button
                onClick={prevTutorialStep}
                style={{
                  background: '#1a202c',
                  border: '1px solid #4a5568',
                  color: '#cbd5e0',
                  padding: '10px 18px',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                ← BACK
              </button>
            )}

            <button
              onClick={isLast ? finishTutorial : nextTutorialStep}
              style={{
                background: isLast ? '#48bb78' : '#00f5d4',
                color: '#08121e',
                border: 'none',
                padding: '10px 24px',
                borderRadius: '6px',
                fontWeight: '900',
                letterSpacing: '1px',
                cursor: 'pointer',
                boxShadow: `0 0 20px ${isLast ? 'rgba(72, 187, 120, 0.4)' : 'rgba(0, 245, 212, 0.4)'}`,
              }}
            >
              {isLast ? 'START SOL 01 MISSION →' : 'NEXT STEP →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

