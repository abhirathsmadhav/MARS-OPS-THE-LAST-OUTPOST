import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { audioManager } from '../../game/audio/AudioManager';

export const MainMenu: React.FC = () => {
  const phase = useGameStore((state) => state.phase);
  const setPhase = useGameStore((state) => state.setPhase);
  const loadFromStorage = useGameStore((state) => state.loadFromStorage);
  const resetProgress = useGameStore((state) => state.resetProgress);
  const audioSettings = useGameStore((state) => state.audioSettings);
  const setAudioSetting = useGameStore((state) => state.setAudioSetting);
  const graphicsQuality = useGameStore((state) => state.graphicsQuality);
  const setGraphicsQuality = useGameStore((state) => state.setGraphicsQuality);

  const [activeTab, setActiveTab] = useState<'main' | 'training' | 'settings' | 'about'>('main');
  const [loadError, setLoadError] = useState<string | null>(null);

  if (phase !== 'menu') return null;

  const handleStartGame = () => {
    audioManager.init();
    audioManager.resume();
    audioManager.playUiClick();
    setPhase('name_entry');
  };

  const handleContinue = () => {
    audioManager.init();
    audioManager.resume();
    const ok = loadFromStorage();
    if (ok) {
      audioManager.playSuccessChime();
      setPhase('playing');
    } else {
      setLoadError('No previous mission telemetry saved on local terminal.');
      setTimeout(() => setLoadError(null), 3500);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(8, 14, 24, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        fontFamily: "'Courier New', monospace",
        color: '#e2e8f0',
      }}
    >
      <div
        style={{
          width: '840px',
          maxWidth: '92vw',
          backgroundColor: 'rgba(12, 21, 36, 0.94)',
          border: '2px solid #ff6b35',
          borderRadius: '14px',
          boxShadow: '0 0 50px rgba(255, 107, 53, 0.35)',
          padding: '36px',
        }}
      >
        {/* Title Block */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ color: '#00f5d4', fontSize: '0.9rem', fontWeight: 'bold', letterSpacing: '4px', marginBottom: '6px' }}>
            NASA SPACE APPS / EXPLORATION HACKATHON
          </div>
          <h1
            style={{
              fontSize: '3rem',
              fontWeight: '900',
              color: '#fff',
              letterSpacing: '6px',
              margin: '0 0 8px 0',
              textShadow: '0 0 25px rgba(255, 107, 53, 0.8)',
            }}
          >
            MARS OPS
          </h1>
          <div
            style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              color: '#ff6b35',
              letterSpacing: '8px',
              textTransform: 'uppercase',
            }}
          >
            THE LAST OUTPOST
          </div>
          <p style={{ color: '#a0aec0', fontSize: '0.85rem', marginTop: '10px' }}>
            A 3D Isometric Voxel Survival & Deep-Space Engineering Simulator
          </p>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', borderBottom: '1px solid #2d3748', marginBottom: '24px', gap: '8px' }}>
          <button
            onClick={() => { audioManager.playUiClick(); setActiveTab('main'); }}
            style={{
              background: activeTab === 'main' ? '#ff6b35' : 'transparent',
              color: activeTab === 'main' ? '#08121e' : '#a0aec0',
              border: 'none',
              padding: '8px 20px',
              borderRadius: '6px 6px 0 0',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            MISSION CONTROL
          </button>
          <button
            onClick={() => { audioManager.playUiClick(); setActiveTab('training'); }}
            style={{
              background: activeTab === 'training' ? '#ff6b35' : 'transparent',
              color: activeTab === 'training' ? '#08121e' : '#a0aec0',
              border: 'none',
              padding: '8px 20px',
              borderRadius: '6px 6px 0 0',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            ASTRONAUT MANUAL
          </button>
          <button
            onClick={() => { audioManager.playUiClick(); setActiveTab('settings'); }}
            style={{
              background: activeTab === 'settings' ? '#ff6b35' : 'transparent',
              color: activeTab === 'settings' ? '#08121e' : '#a0aec0',
              border: 'none',
              padding: '8px 20px',
              borderRadius: '6px 6px 0 0',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            SETTINGS
          </button>
          <button
            onClick={() => { audioManager.playUiClick(); setActiveTab('about'); }}
            style={{
              background: activeTab === 'about' ? '#ff6b35' : 'transparent',
              color: activeTab === 'about' ? '#08121e' : '#a0aec0',
              border: 'none',
              padding: '8px 20px',
              borderRadius: '6px 6px 0 0',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            NASA HERITAGE
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === 'main' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <button
              onClick={handleStartGame}
              style={{
                background: '#ff6b35',
                color: '#08121e',
                border: 'none',
                padding: '16px 28px',
                borderRadius: '8px',
                fontSize: '1.15rem',
                fontWeight: '900',
                letterSpacing: '2px',
                cursor: 'pointer',
                boxShadow: '0 0 25px rgba(255, 107, 53, 0.45)',
                transition: 'all 0.2s ease',
              }}
            >
              LAUNCH EXPEDITION (SOL 01)
            </button>

            <button
              onClick={handleContinue}
              style={{
                background: '#1a2a44',
                color: '#00f5d4',
                border: '1px solid #00f5d4',
                padding: '14px 28px',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 'bold',
                letterSpacing: '1px',
                cursor: 'pointer',
              }}
            >
              RESUME SAVED TELEMETRY
            </button>

            {loadError && (
              <div style={{ color: '#feb2b2', background: '#742a2a', padding: '10px', borderRadius: '6px', textAlign: 'center', fontSize: '0.85rem' }}>
                {loadError}
              </div>
            )}
          </div>
        )}

        {activeTab === 'training' && (
          <div style={{ maxHeight: '340px', overflowY: 'auto', paddingRight: '8px', fontSize: '0.85rem', lineHeight: '1.6' }}>
            <h3 style={{ color: '#00f5d4', marginBottom: '8px' }}>EVA CONTROLS & MOBILITY:</h3>
            <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
              <li><strong>WASD / Arrow Keys</strong>: Move astronaut through Martian terrain.</li>
              <li><strong>Shift</strong>: Sprint (consumes additional O2).</li>
              <li><strong>Space</strong>: Jump (low Mars 0.38g gravity float).</li>
              <li><strong>E</strong>: Universal Interaction (Mine ores, inspect machines, repair circuits).</li>
              <li><strong>C</strong>: Toggle Additive 3D Construction System.</li>
              <li><strong>B</strong>: Place chosen structure while in Construction Mode.</li>
              <li><strong>Q / R</strong>: Orbit Isometric Camera 45° left or right.</li>
              <li><strong>Mouse Wheel</strong>: Isometric Zoom in/out.</li>
              <li><strong>ESC</strong>: Pause Menu / System diagnostics.</li>
            </ul>

            <h3 style={{ color: '#ff6b35', marginBottom: '8px' }}>LIFE SUPPORT BALANCING:</h3>
            <p style={{ color: '#cbd5e0' }}>
              Your Outpost requires constant energy budgeting. Solar arrays generate power during daylight (6.0 - 18.6 Mars hours). At night or during dust storms, the base draws upon battery reserves. If batteries deplete to zero, life-support heating turns off and crew health drops rapidly.
            </p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span>Master Sound Volume:</span>
                <span>{Math.round(audioSettings.masterVolume * 100)}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={audioSettings.masterVolume}
                onChange={(e) => setAudioSetting('masterVolume', parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#ff6b35' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Mute All Audio:</span>
              <button
                onClick={() => setAudioSetting('muted', !audioSettings.muted)}
                style={{
                  background: audioSettings.muted ? '#e53e3e' : '#2d3748',
                  color: '#fff',
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                {audioSettings.muted ? 'MUTED' : 'ENABLED'}
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Graphics Fidelity:</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                {(['low', 'medium', 'high'] as const).map((q) => (
                  <button
                    key={q}
                    onClick={() => setGraphicsQuality(q)}
                    style={{
                      background: graphicsQuality === q ? '#00f5d4' : '#1a202c',
                      color: graphicsQuality === q ? '#08121e' : '#a0aec0',
                      border: '1px solid #4a5568',
                      padding: '4px 12px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                      fontWeight: 'bold',
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ borderTop: '1px solid #2d3748', paddingTop: '12px' }}>
              <button
                onClick={() => {
                  if (window.confirm('Reset all saved mission telemetry and restart campaign?')) {
                    resetProgress();
                  }
                }}
                style={{
                  background: 'transparent',
                  border: '1px solid #e53e3e',
                  color: '#e53e3e',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                }}
              >
                CLEAR LOCAL STORAGE SAVE DATA
              </button>
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div style={{ maxHeight: '340px', overflowY: 'auto', fontSize: '0.85rem', lineHeight: '1.6', color: '#cbd5e0' }}>
            <h3 style={{ color: '#00f5d4', marginBottom: '8px' }}>NASA FLIGHT HERITAGE & SCIENCE BASIS:</h3>
            <p style={{ marginBottom: '10px' }}>
              <strong>MARS OPS: THE LAST OUTPOST</strong> integrates real NASA engineering specifications derived from:
            </p>
            <ul style={{ paddingLeft: '20px', marginBottom: '14px' }}>
              <li><strong>MOXIE (Mars 2020)</strong>: Direct atmospheric CO2 cracking to produce breathable O2 at 800°C.</li>
              <li><strong>ISS ECLSS</strong>: Closed-loop water recovery using vacuum distillation and catalytic oxidation (achieving 98% water recovery).</li>
              <li><strong>Veggie & APH</strong>: Controlled-environment space agriculture with tailored narrow-band LED light recipes.</li>
              <li><strong>Deep Space Network (DSN)</strong>: Radio interplanetary links with 6 to 44 minute two-way speed-of-light delays.</li>
              <li><strong>Planetary Dust Mitigation</strong>: Modeling solar photovoltaic degradation from dust deposition and electrostatic levitation.</li>
            </ul>
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.75rem', color: '#718096' }}>
          MARS OPS: THE LAST OUTPOST • NASA Space Exploration Simulator
        </div>
      </div>
    </div>
  );
};

