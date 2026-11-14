import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { audioManager } from '../../game/audio/AudioManager';

interface HUDProps {
  onVirtualInput?: (input: { forward?: boolean; backward?: boolean; left?: boolean; right?: boolean; sprint?: boolean; jump?: boolean }) => void;
  onInteract?: () => void;
  onBuild?: () => void;
}

export const HUD: React.FC<HUDProps> = ({ onInteract }) => {
  const phase = useGameStore((state) => state.phase);
  const playerName = useGameStore((state) => state.playerName);
  const startTutorial = useGameStore((state) => state.startTutorial);
  const sol = useGameStore((state) => state.sol);
  const solTime = useGameStore((state) => state.solTime);
  const weather = useGameStore((state) => state.weather);
  const resources = useGameStore((state) => state.resources);
  const missions = useGameStore((state) => state.missions);
  const currentMissionIndex = useGameStore((state) => state.currentMissionIndex);
  const activeEmergency = useGameStore((state) => state.activeEmergency);
  const currentInteraction = useGameStore((state) => state.currentInteraction);
  const activeNavTarget = useGameStore((state) => state.activeNavTarget);
  const inventory = useGameStore((state) => state.inventory);
  const activeSlot = useGameStore((state) => state.activeSlot);
  const setActiveSlot = useGameStore((state) => state.setActiveSlot);
  const constructionMode = useGameStore((state) => state.constructionMode);
  const setConstructionMode = useGameStore((state) => state.setConstructionMode);
  const triggerDustStorm = useGameStore((state) => state.triggerDustStorm);
  const clearDustStorm = useGameStore((state) => state.clearDustStorm);
  const toastMessage = useGameStore((state) => state.toastMessage);
  const showAllHighlights = useGameStore((state) => state.showAllHighlights);
  const setShowAllHighlights = useGameStore((state) => state.setShowAllHighlights);
  const isRoverMounted = useGameStore((state) => state.isRoverMounted);

  if (phase !== 'playing') return null;

  const currentMission = missions[currentMissionIndex] || missions[0];

  // Format Mars Time (e.g. 14.5 -> 14:30 MT)
  const hours = Math.floor(solTime);
  const minutes = Math.floor((solTime - hours) * 60);
  const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} MT`;

  // Dynamic status color helper
  const getResourceColor = (val: number) => {
    if (val < 25) return '#e53e3e';
    if (val < 50) return '#dd6b20';
    return '#48bb78';
  };

  const activeObjective = currentMission.objectives.find((o) => !o.completed);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 30,
        fontFamily: "'Share Tech Mono', 'Courier New', monospace",
        color: '#e2e8f0',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '16px',
        boxSizing: 'border-box',
      }}
    >
      {/* ================= TOAST NOTIFICATION POPUP ================= */}
      {toastMessage && (
        <div
          style={{
            position: 'absolute',
            top: '72px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(8, 20, 32, 0.92)',
            backdropFilter: 'blur(12px)',
            border: '1.5px solid #00f5d4',
            borderRadius: '8px',
            padding: '10px 24px',
            color: '#00f5d4',
            fontSize: '0.88rem',
            fontWeight: 'bold',
            letterSpacing: '1px',
            boxShadow: '0 0 35px rgba(0, 245, 212, 0.5)',
            zIndex: 100,
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ fontSize: '1.1rem' }}>⚡</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ================= TOP STATUS BAR (TRANSPARENT GLASS) ================= */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(10, 16, 26, 0.35)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(0, 245, 212, 0.22)',
          borderRadius: '10px',
          padding: '8px 18px',
          pointerEvents: 'auto',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.25)',
        }}
      >
        {/* Sol & Time & Mission Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#ff6b35', fontWeight: 'bold', letterSpacing: '2px' }}>
              MARTIAN SOL {sol.toString().padStart(2, '0')} • {formattedTime} • <span style={{ color: '#00f5d4' }}>CDR. {playerName.toUpperCase()}</span>
            </div>
            <div style={{ fontSize: '0.98rem', fontWeight: 'bold', color: '#fff', letterSpacing: '0.5px' }}>
              MISSION 0{currentMission.number}: {currentMission.title}
            </div>
          </div>

          {/* Tutorial Guide Button */}
          <button
            onClick={() => startTutorial()}
            style={{
              background: 'rgba(0, 245, 212, 0.1)',
              border: '1px solid rgba(0, 245, 212, 0.4)',
              color: '#00f5d4',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '0.72rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              letterSpacing: '1px',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0, 245, 212, 0.25)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(0, 245, 212, 0.1)')}
          >
            📖 TUTORIAL
          </button>

          {/* Toggle All Highlights Button */}
          <button
            onClick={() => setShowAllHighlights(!showAllHighlights)}
            style={{
              background: showAllHighlights ? 'rgba(0, 245, 212, 0.22)' : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${showAllHighlights ? '#00f5d4' : 'rgba(255, 255, 255, 0.2)'}`,
              color: showAllHighlights ? '#00f5d4' : '#a0aec0',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '0.72rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              letterSpacing: '1px',
              transition: 'all 0.2s',
            }}
            title="Toggle 3D Holographic Facility & Mineral Badges [H]"
          >
            🔦 HIGHLIGHTS: {showAllHighlights ? 'ON' : 'OFF'} [H]
          </button>

          {/* Rover Mode Indicator Badge */}
          {isRoverMounted && (
            <div
              style={{
                background: 'rgba(236, 201, 75, 0.2)',
                border: '1px solid #ecc94b',
                color: '#ecc94b',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 'bold',
                letterSpacing: '1px',
              }}
            >
              🚜 ROVER DRIVING ACTIVE (2X SPEED)
            </div>
          )}

          {/* Weather & DSN Badge */}
          <div
            style={{
              background: weather.type === 'dust_storm' ? 'rgba(229, 62, 62, 0.2)' : 'rgba(0, 245, 212, 0.08)',
              border: `1px solid ${weather.type === 'dust_storm' ? 'rgba(229, 62, 62, 0.5)' : 'rgba(0, 245, 212, 0.3)'}`,
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '0.72rem',
              fontWeight: 'bold',
              color: weather.type === 'dust_storm' ? '#feb2b2' : '#00f5d4',
            }}
          >
            {weather.type === 'dust_storm' ? '⚠️ CLASS-5 DUST STORM' : '☀️ CLEAR SKY • TAU 0.4'}
          </div>

          <div style={{ fontSize: '0.72rem', color: 'rgba(203, 213, 225, 0.75)' }}>
            EARTH LINK: <span style={{ color: '#63b3ed' }}>14m 22s LAG (DSN)</span>
          </div>
        </div>

        {/* Core Resource Gauges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          {/* Oxygen */}
          <div style={{ minWidth: '85px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '2px', color: 'rgba(255,255,255,0.85)' }}>
              <span>OXYGEN</span>
              <span style={{ fontWeight: 'bold', color: getResourceColor(resources.oxygen) }}>
                {resources.oxygen}%
              </span>
            </div>
            <div style={{ height: '5px', background: 'rgba(255, 255, 255, 0.12)', borderRadius: '3px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${resources.oxygen}%`,
                  background: getResourceColor(resources.oxygen),
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>

          {/* Water */}
          <div style={{ minWidth: '85px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '2px', color: 'rgba(255,255,255,0.85)' }}>
              <span>WATER</span>
              <span style={{ fontWeight: 'bold', color: getResourceColor(resources.water) }}>
                {resources.water}%
              </span>
            </div>
            <div style={{ height: '5px', background: 'rgba(255, 255, 255, 0.12)', borderRadius: '3px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${resources.water}%`,
                  background: '#3182ce',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>

          {/* Food */}
          <div style={{ minWidth: '85px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '2px', color: 'rgba(255,255,255,0.85)' }}>
              <span>FOOD</span>
              <span style={{ fontWeight: 'bold', color: getResourceColor(resources.food) }}>
                {resources.food}%
              </span>
            </div>
            <div style={{ height: '5px', background: 'rgba(255, 255, 255, 0.12)', borderRadius: '3px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${resources.food}%`,
                  background: '#38a169',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>

          {/* Solar Power & Demand */}
          <div style={{ minWidth: '95px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '2px', color: 'rgba(255,255,255,0.85)' }}>
              <span>SOLAR/LOAD</span>
              <span style={{ fontWeight: 'bold', color: resources.power >= resources.powerDemand ? '#48bb78' : '#e53e3e' }}>
                {resources.power}/{resources.powerDemand}kW
              </span>
            </div>
            <div style={{ height: '5px', background: 'rgba(255, 255, 255, 0.12)', borderRadius: '3px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${Math.min(100, (resources.power / Math.max(1, resources.powerDemand)) * 100)}%`,
                  background: resources.power >= resources.powerDemand ? '#ecc94b' : '#e53e3e',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>

          {/* Battery */}
          <div style={{ minWidth: '90px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '2px', color: 'rgba(255,255,255,0.85)' }}>
              <span>BATTERY</span>
              <span style={{ fontWeight: 'bold', color: getResourceColor(resources.battery) }}>
                {resources.battery}%
              </span>
            </div>
            <div style={{ height: '5px', background: 'rgba(255, 255, 255, 0.12)', borderRadius: '3px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${resources.battery}%`,
                  background: getResourceColor(resources.battery),
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>

          {/* Habitat Temp & Health */}
          <div style={{ borderLeft: '1px solid rgba(255,255,255,0.12)', paddingLeft: '12px', fontSize: '0.72rem' }}>
            <div>
              HAB: <strong style={{ color: resources.habitatTemp > 0 ? '#48bb78' : '#63b3ed' }}>{resources.habitatTemp}°C</strong>
            </div>
            <div>
              VITALS: <strong style={{ color: getResourceColor(resources.crewHealth) }}>{resources.crewHealth}%</strong>
            </div>
          </div>

          {/* Storm Simulation Trigger */}
          <button
            onClick={() => {
              if (weather.type === 'dust_storm') clearDustStorm();
              else triggerDustStorm();
            }}
            style={{
              background: weather.type === 'dust_storm' ? 'rgba(72, 187, 120, 0.25)' : 'rgba(229, 62, 62, 0.25)',
              border: `1px solid ${weather.type === 'dust_storm' ? '#48bb78' : '#e53e3e'}`,
              color: weather.type === 'dust_storm' ? '#48bb78' : '#feb2b2',
              padding: '5px 10px',
              borderRadius: '4px',
              fontWeight: 'bold',
              fontSize: '0.72rem',
              cursor: 'pointer',
            }}
          >
            {weather.type === 'dust_storm' ? 'CLEAR STORM' : 'SIMULATE STORM'}
          </button>
        </div>
      </div>

      {/* ================= REAL-TIME TACTICAL NAVIGATION BAR ================= */}
      {activeNavTarget && (
        <div
          style={{
            alignSelf: 'center',
            background: 'rgba(10, 16, 26, 0.55)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1.5px solid rgba(0, 245, 212, 0.6)',
            borderRadius: '8px',
            padding: '8px 22px',
            display: 'flex',
            alignItems: 'center',
            gap: '18px',
            marginTop: '8px',
            boxShadow: '0 0 30px rgba(0, 245, 212, 0.35)',
            pointerEvents: 'auto',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.8rem', color: '#00f5d4', fontWeight: 'bold' }}>
              {activeNavTarget.directionArrow}
            </span>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#ff6b35', fontWeight: 'bold', letterSpacing: '1.5px' }}>
                ACTIVE WAYPOINT [{activeNavTarget.distance}m]
              </div>
              <div style={{ fontSize: '0.96rem', color: '#fff', fontWeight: 'bold' }}>
                {activeNavTarget.name}
              </div>
            </div>
          </div>
          <div style={{ borderLeft: '1.5px solid rgba(0, 245, 212, 0.3)', paddingLeft: '16px', fontSize: '0.8rem', color: '#e2e8f0', maxWidth: '520px', lineHeight: '1.4' }}>
            💡 <strong style={{ color: '#00f5d4' }}>TACTICAL GUIDANCE:</strong> {activeNavTarget.hint}
          </div>
        </div>
      )}

      {/* ================= MIDDLE SECTION ================= */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flex: 1, margin: '14px 0' }}>
        {/* LEFT PANEL: MISSION DIRECTIVES & WHAT TO DO (TRANSPARENT GLASS) */}
        <div
          style={{
            width: '340px',
            maxWidth: '44vw',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          {/* Emergency Alert Banner */}
          {activeEmergency && (
            <div
              style={{
                background: 'rgba(155, 44, 44, 0.45)',
                backdropFilter: 'blur(8px)',
                border: '1.5px solid #e53e3e',
                borderRadius: '8px',
                padding: '12px',
                color: '#fff',
                boxShadow: '0 0 25px rgba(229, 62, 62, 0.35)',
                pointerEvents: 'auto',
                animation: 'pulse 1.5s infinite',
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '2px', color: '#feb2b2' }}>
                🚨 EMERGENCY ALERT ({Math.ceil(activeEmergency.timeRemaining)}s)
              </div>
              <div style={{ fontWeight: 'bold', fontSize: '0.9rem', margin: '4px 0' }}>
                {activeEmergency.title}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#fed7d7' }}>
                {activeEmergency.description}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#ecc94b', marginTop: '6px', fontWeight: 'bold' }}>
                ACTION: {activeEmergency.solutionHint}
              </div>
            </div>
          )}

          {/* Objectives Card (Transparent Glassmorphic) */}
          <div
            style={{
              background: 'rgba(10, 16, 26, 0.32)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              padding: '14px',
              pointerEvents: 'auto',
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2)',
            }}
          >
            <div style={{ color: '#ff6b35', fontSize: '0.72rem', fontWeight: 'bold', letterSpacing: '2px', marginBottom: '3px' }}>
              CURRENT MISSION DIRECTIVES
            </div>
            <div style={{ fontSize: '0.98rem', fontWeight: 'bold', color: '#fff', marginBottom: '6px' }}>
              {currentMission.title}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'rgba(203, 213, 225, 0.82)', marginBottom: '10px', lineHeight: '1.4' }}>
              {currentMission.briefing}
            </div>

            {/* WHAT TO DO NOW CALLOUT */}
            {activeObjective && (
              <div
                style={{
                  background: 'rgba(0, 245, 212, 0.12)',
                  border: '1.5px solid #00f5d4',
                  borderRadius: '6px',
                  padding: '9px 12px',
                  marginBottom: '10px',
                  boxShadow: '0 0 16px rgba(0, 245, 212, 0.2)',
                }}
              >
                <div style={{ fontSize: '0.7rem', color: '#00f5d4', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '2px' }}>
                  🎯 WHAT TO DO NOW:
                </div>
                <div style={{ fontSize: '0.84rem', color: '#ffffff', fontWeight: 'bold', lineHeight: '1.35' }}>
                  {activeObjective.text}
                </div>
                {activeObjective.hint && (
                  <div style={{ fontSize: '0.72rem', color: '#81e6d9', marginTop: '4px' }}>
                    💡 {activeObjective.hint}
                  </div>
                )}
                <div style={{ fontSize: '0.68rem', color: 'rgba(203, 213, 225, 0.65)', marginTop: '4px' }}>
                  Follow the glowing cyan light trail and sky beacon on the ground.
                </div>
              </div>
            )}

            {/* Step List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {currentMission.objectives.map((obj) => {
                const isActiveTarget = !obj.completed && activeObjective?.id === obj.id;

                return (
                  <div
                    key={obj.id}
                    style={{
                      background: obj.completed
                        ? 'rgba(72, 187, 120, 0.1)'
                        : isActiveTarget
                        ? 'rgba(0, 245, 212, 0.15)'
                        : 'rgba(255, 255, 255, 0.04)',
                      border: `1.5px solid ${
                        obj.completed
                          ? 'rgba(72, 187, 120, 0.4)'
                          : isActiveTarget
                          ? '#00f5d4'
                          : 'rgba(255, 255, 255, 0.08)'
                      }`,
                      borderRadius: '5px',
                      padding: '8px 10px',
                      fontSize: '0.78rem',
                      boxShadow: isActiveTarget ? '0 0 16px rgba(0, 245, 212, 0.25)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: obj.completed ? '#48bb78' : isActiveTarget ? '#00f5d4' : 'rgba(255,255,255,0.4)', fontWeight: 'bold' }}>
                        {obj.completed ? '✓' : isActiveTarget ? '🎯' : '○'}
                      </span>
                      <span style={{ flex: 1, color: obj.completed ? 'rgba(203, 213, 225, 0.7)' : '#fff', fontWeight: obj.completed ? 'normal' : 'bold' }}>
                        {obj.text}
                      </span>
                      {obj.target > 1 && (
                        <span style={{ fontSize: '0.72rem', color: '#00f5d4', fontWeight: 'bold' }}>
                          {obj.current}/{obj.target}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: CONTEXTUAL INSPECTION CARD (TRANSPARENT GLASS) */}
        {currentInteraction && (
          <div
            style={{
              width: '320px',
              maxWidth: '40vw',
              background: 'rgba(10, 16, 26, 0.4)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1.5px solid rgba(0, 245, 212, 0.4)',
              borderRadius: '8px',
              padding: '14px',
              pointerEvents: 'auto',
              boxShadow: '0 4px 24px rgba(0, 245, 212, 0.2)',
            }}
          >
            <div style={{ color: '#00f5d4', fontSize: '0.72rem', fontWeight: 'bold', letterSpacing: '2px', marginBottom: '2px' }}>
              TARGET IN RANGE
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 'bold', color: '#fff', marginBottom: '4px' }}>
              {currentInteraction.name}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'rgba(203, 213, 225, 0.8)', marginBottom: '10px' }}>
              Subsystem ready. Press [E] or click action below to interact.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {currentInteraction.actions.map((act) => (
                <button
                  key={act}
                  onClick={() => {
                    audioManager.playUiClick();
                    onInteract?.();
                  }}
                  style={{
                    background: 'rgba(0, 245, 212, 0.15)',
                    border: '1.5px solid #00f5d4',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '0.82rem',
                    color: '#00f5d4',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    letterSpacing: '0.5px',
                    boxShadow: '0 0 12px rgba(0, 245, 212, 0.25)',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#00f5d4';
                    e.currentTarget.style.color = '#08121e';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(0, 245, 212, 0.15)';
                    e.currentTarget.style.color = '#00f5d4';
                  }}
                >
                  <span>▶ {act}</span>
                  <span style={{ fontSize: '0.7rem', padding: '2px 6px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px' }}>[E]</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ================= BOTTOM HOTBAR (TRANSPARENT GLASS - NO MOVEMENT BUTTONS) ================= */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          pointerEvents: 'auto',
        }}
      >
        {/* Quick Inventory Hotbar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(10, 16, 26, 0.35)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
            padding: '6px 12px',
            boxShadow: '0 4px 25px rgba(0, 0, 0, 0.25)',
          }}
        >
          {Array.from({ length: 8 }).map((_, slotIdx) => {
            const item = inventory[slotIdx];
            const isActive = slotIdx === activeSlot;

            return (
              <div
                key={slotIdx}
                onClick={() => {
                  audioManager.playUiClick();
                  setActiveSlot(slotIdx);
                }}
                style={{
                  width: '52px',
                  height: '52px',
                  background: isActive ? 'rgba(0, 245, 212, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                  border: `1.5px solid ${isActive ? '#00f5d4' : 'rgba(255, 255, 255, 0.1)'}`,
                  borderRadius: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  padding: '2px',
                  transition: 'border-color 0.2s, background 0.2s',
                }}
              >
                <span style={{ position: 'absolute', top: '2px', left: '4px', fontSize: '0.62rem', color: 'rgba(255,255,255,0.45)' }}>
                  {slotIdx + 1}
                </span>

                {item ? (
                  <>
                    <div style={{ fontSize: '0.95rem', marginTop: '2px' }}>
                      {item.icon === 'tool' ? '🔧' : item.icon === 'droplet' ? '💧' : item.icon === 'cpu' ? '⚡' : '📦'}
                    </div>
                    <div style={{ fontSize: '0.62rem', color: '#e2e8f0', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '90%' }}>
                      {item.name.split(' ')[0]}
                    </div>
                    {item.quantity > 1 && (
                      <span style={{ position: 'absolute', bottom: '2px', right: '4px', fontSize: '0.68rem', fontWeight: 'bold', color: '#00f5d4' }}>
                        x{item.quantity}
                      </span>
                    )}
                  </>
                ) : (
                  <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.8rem' }}>—</span>
                )}
              </div>
            );
          })}

          {/* Toggle Construction Mode Button */}
          <button
            onClick={() => setConstructionMode(!constructionMode)}
            style={{
              background: constructionMode ? '#00f5d4' : 'rgba(43, 108, 176, 0.65)',
              color: constructionMode ? '#08121e' : '#fff',
              border: `1px solid ${constructionMode ? '#00f5d4' : 'rgba(99, 179, 237, 0.5)'}`,
              padding: '9px 15px',
              borderRadius: '6px',
              fontWeight: 'bold',
              fontSize: '0.75rem',
              letterSpacing: '1px',
              cursor: 'pointer',
              marginLeft: '6px',
              backdropFilter: 'blur(6px)',
              transition: 'all 0.2s',
            }}
          >
            {constructionMode ? 'EXIT BUILD [C]' : 'BUILD MODE [C]'}
          </button>
        </div>

        {/* Clean Minimal Controls Legend */}
        <div
          style={{
            background: 'rgba(10, 16, 26, 0.28)',
            backdropFilter: 'blur(8px)',
            padding: '4px 16px',
            borderRadius: '6px',
            fontSize: '0.72rem',
            color: 'rgba(203, 213, 225, 0.8)',
            display: 'flex',
            gap: '14px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <span><strong>WASD</strong> Move</span>
          <span><strong>SHIFT</strong> Sprint</span>
          <span><strong>SPACE</strong> Jump</span>
          <span><strong>E / Click</strong> Interact</span>
          <span><strong>H</strong> Toggle Highlights</span>
          <span><strong>C</strong> Build Mode</span>
          <span><strong>Q/R</strong> Rotate Cam</span>
          <span><strong>Wheel</strong> Zoom</span>
          <span><strong>ESC</strong> Pause</span>
        </div>
      </div>
    </div>
  );
};
