import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { audioManager } from '../../game/audio/AudioManager';

export const NameEntryModal: React.FC = () => {
  const phase = useGameStore((state) => state.phase);
  const setPhase = useGameStore((state) => state.setPhase);
  const playerName = useGameStore((state) => state.playerName);
  const setPlayerName = useGameStore((state) => state.setPlayerName);
  const startTutorial = useGameStore((state) => state.startTutorial);

  const [inputName, setInputName] = useState(playerName || 'Ares Specialist');
  const [selectedRole, setSelectedRole] = useState('Chief Systems Engineer');

  if (phase !== 'name_entry') return null;

  const handleStartTutorial = (e: React.FormEvent) => {
    e.preventDefault();
    setPlayerName(inputName);
    audioManager.init();
    audioManager.resume();
    audioManager.playSuccessChime();
    startTutorial();
  };

  const handleSkipDirectToPlay = () => {
    setPlayerName(inputName);
    audioManager.init();
    audioManager.resume();
    audioManager.playUiClick();
    setPhase('playing');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 10, 18, 0.92)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 210,
        fontFamily: "'Courier New', monospace",
        color: '#e2e8f0',
      }}
    >
      <div
        style={{
          width: '640px',
          maxWidth: '92vw',
          backgroundColor: '#0c1524',
          border: '2px solid #00f5d4',
          borderRadius: '12px',
          boxShadow: '0 0 50px rgba(0, 245, 212, 0.4)',
          padding: '32px',
        }}
      >
        {/* Terminal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', borderBottom: '1px solid #1a2a44', paddingBottom: '16px', marginBottom: '24px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '8px',
              background: '#00f5d4',
              color: '#08121e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
              fontWeight: '900',
            }}
          >
            NASA
          </div>
          <div>
            <div style={{ color: '#00f5d4', fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '3px' }}>
              HUMAN SPACEFLIGHT CLEARANCE PROTOCOL
            </div>
            <h2 style={{ fontSize: '1.5rem', color: '#fff', margin: '2px 0 0 0' }}>
              Astronaut Credential Dossier
            </h2>
          </div>
        </div>

        <form onSubmit={handleStartTutorial}>
          {/* Astronaut Name Input */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#ff6b35', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '8px' }}>
              ENTER ASTRONAUT FULL NAME / CALLSIGN:
            </label>
            <input
              type="text"
              required
              maxLength={26}
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              placeholder="e.g. Commander Shepherd, Mark Watney"
              style={{
                width: '100%',
                background: '#070d18',
                border: '2px solid #2d3748',
                color: '#fff',
                fontSize: '1.15rem',
                padding: '12px 16px',
                borderRadius: '6px',
                fontFamily: "'Courier New', monospace",
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#00f5d4')}
              onBlur={(e) => (e.target.style.borderColor = '#2d3748')}
            />
          </div>

          {/* Operational Specialization */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#a0aec0', marginBottom: '8px' }}>
              SELECT OPERATIONAL SPECIALTY:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {[
                'Chief Systems Engineer',
                'ECLSS Specialist',
                'ISRU Geologist',
              ].map((role) => (
                <button
                  type="button"
                  key={role}
                  onClick={() => {
                    audioManager.playUiClick();
                    setSelectedRole(role);
                  }}
                  style={{
                    background: selectedRole === role ? 'rgba(0, 245, 212, 0.2)' : '#1a202c',
                    border: `1.5px solid ${selectedRole === role ? '#00f5d4' : '#2d3748'}`,
                    color: selectedRole === role ? '#00f5d4' : '#a0aec0',
                    padding: '8px 6px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                  }}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Outpost Summary Card */}
          <div
            style={{
              background: '#070d18',
              border: '1px solid #1a2a44',
              borderRadius: '8px',
              padding: '14px 18px',
              marginBottom: '28px',
              fontSize: '0.85rem',
              color: '#cbd5e0',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span>STATION ASSIGNMENT:</span>
              <strong style={{ color: '#fff' }}>MARS OUTPOST ALPHA (UTOPIA PLANITIA)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span>COMMANDER CALLSIGN:</span>
              <strong style={{ color: '#00f5d4' }}>CDR. {inputName.toUpperCase() || 'SPECIALIST'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>ATMOSPHERIC STATUS:</span>
              <span style={{ color: '#feb2b2' }}>610 Pa • 95% CO2 • -60°C</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              type="submit"
              style={{
                background: '#00f5d4',
                color: '#08121e',
                border: 'none',
                padding: '14px',
                borderRadius: '8px',
                fontSize: '1.05rem',
                fontWeight: '900',
                letterSpacing: '1px',
                cursor: 'pointer',
                boxShadow: '0 0 25px rgba(0, 245, 212, 0.4)',
              }}
            >
              INITIALIZE MISSION & LAUNCH TUTORIAL GUIDE →
            </button>

            <button
              type="button"
              onClick={handleSkipDirectToPlay}
              style={{
                background: 'transparent',
                color: '#a0aec0',
                border: '1px solid #2d3748',
                padding: '10px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              SKIP TUTORIAL (VETERAN ASTRONAUTS)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

