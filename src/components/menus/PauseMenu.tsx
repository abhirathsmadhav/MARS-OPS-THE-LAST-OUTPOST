import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { audioManager } from '../../game/audio/AudioManager';

export const PauseMenu: React.FC = () => {
  const phase = useGameStore((state) => state.phase);
  const setPhase = useGameStore((state) => state.setPhase);
  const saveToStorage = useGameStore((state) => state.saveToStorage);

  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  if (phase !== 'paused') return null;

  const handleResume = () => {
    audioManager.playUiClick();
    setPhase('playing');
  };

  const handleSave = () => {
    saveToStorage();
    setSaveMsg('✓ Outpost telemetry successfully saved to LocalStorage');
    setTimeout(() => setSaveMsg(null), 3000);
  };

  const handleQuit = () => {
    audioManager.playUiClick();
    setPhase('menu');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 10, 18, 0.88)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 150,
        fontFamily: "'Courier New', monospace",
        color: '#e2e8f0',
      }}
    >
      <div
        style={{
          width: '460px',
          maxWidth: '90vw',
          backgroundColor: '#0c1524',
          border: '2px solid #ff6b35',
          borderRadius: '12px',
          boxShadow: '0 0 40px rgba(255, 107, 53, 0.4)',
          padding: '28px',
          textAlign: 'center',
        }}
      >
        <div style={{ color: '#00f5d4', fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '3px', marginBottom: '4px' }}>
          OUTPOST TELEMETRY PAUSED
        </div>
        <h2 style={{ fontSize: '2rem', color: '#fff', margin: '0 0 24px 0' }}>
          MISSION SUSPENDED
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={handleResume}
            style={{
              background: '#ff6b35',
              color: '#08121e',
              border: 'none',
              padding: '12px',
              borderRadius: '6px',
              fontWeight: '900',
              fontSize: '1rem',
              letterSpacing: '1px',
              cursor: 'pointer',
            }}
          >
            RESUME MISSION [ESC]
          </button>

          <button
            onClick={handleSave}
            style={{
              background: '#1a2a44',
              color: '#00f5d4',
              border: '1px solid #00f5d4',
              padding: '12px',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            💾 SAVE TELEMETRY (MANUAL SAVE)
          </button>

          {saveMsg && (
            <div style={{ color: '#48bb78', fontSize: '0.8rem', fontWeight: 'bold' }}>
              {saveMsg}
            </div>
          )}

          <button
            onClick={handleQuit}
            style={{
              background: 'transparent',
              border: '1px solid #4a5568',
              color: '#a0aec0',
              padding: '10px',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            RETURN TO MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
};
