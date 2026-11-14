import React from 'react';
import { useGameStore } from '../../store/gameStore';

export const ScienceModal: React.FC = () => {
  const scienceModal = useGameStore((state) => state.scienceModal);
  const closeScienceModal = useGameStore((state) => state.closeScienceModal);
  const analyzeSample = useGameStore((state) => state.analyzeSample);
  const inventory = useGameStore((state) => state.inventory);

  if (!scienceModal.isOpen) return null;

  const hasRegolith = inventory.some((i) => i.id === 'regolith' || i.id === 'mineral_regolith');
  const hasIce = inventory.some((i) => i.id === 'ice' || i.id === 'mineral_ice');

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
        zIndex: 100,
        fontFamily: "'Courier New', monospace",
      }}
    >
      <div
        style={{
          width: '740px',
          maxWidth: '92vw',
          backgroundColor: '#0c1524',
          border: '2px solid #805ad5',
          borderRadius: '10px',
          boxShadow: '0 0 35px rgba(128, 90, 213, 0.4)',
          padding: '24px',
          color: '#e2e8f0',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #2d3748', paddingBottom: '12px', marginBottom: '16px' }}>
          <div>
            <div style={{ color: '#b794f4', fontSize: '0.85rem', fontWeight: 'bold', letterSpacing: '2px' }}>
              NASA GEOLOGICAL & SPECTROSCOPIC ANALYSIS STATION
            </div>
            <h2 style={{ fontSize: '1.4rem', color: '#fff', marginTop: '4px' }}>
              Laser-Induced Breakdown Spectrometer (LIBS)
            </h2>
          </div>
          <button
            onClick={closeScienceModal}
            style={{
              background: 'transparent',
              border: '1px solid #4a5568',
              color: '#a0aec0',
              padding: '6px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            ✕ ESC
          </button>
        </div>

        {/* Sample Selection */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          <button
            onClick={() => analyzeSample('regolith')}
            disabled={!hasRegolith}
            style={{
              flex: 1,
              background: scienceModal.sampleType === 'regolith' ? '#805ad5' : '#1a202c',
              border: '1px solid #805ad5',
              color: '#fff',
              padding: '12px',
              borderRadius: '6px',
              cursor: hasRegolith ? 'pointer' : 'not-allowed',
              opacity: hasRegolith ? 1 : 0.5,
              fontWeight: 'bold',
            }}
          >
            {hasRegolith ? '🔬 ANALYZE MARTIAN REGOLITH' : '⚠️ NO REGOLITH IN PACK'}
          </button>
          <button
            onClick={() => analyzeSample('ice')}
            disabled={!hasIce}
            style={{
              flex: 1,
              background: scienceModal.sampleType === 'ice' ? '#319795' : '#1a202c',
              border: '1px solid #319795',
              color: '#fff',
              padding: '12px',
              borderRadius: '6px',
              cursor: hasIce ? 'pointer' : 'not-allowed',
              opacity: hasIce ? 1 : 0.5,
              fontWeight: 'bold',
            }}
          >
            {hasIce ? '❄️ ANALYZE SUBSURFACE ICE' : '⚠️ NO ICE IN PACK'}
          </button>
        </div>

        {/* Composition Results */}
        {scienceModal.sampleAnalyzed ? (
          <div style={{ background: '#070d18', border: '1px solid #1a2a44', borderRadius: '6px', padding: '16px', marginBottom: '20px' }}>
            <div style={{ color: '#00f5d4', fontWeight: 'bold', marginBottom: '12px', fontSize: '0.9rem' }}>
              SPECTRAL PEAK DECONVOLUTION RESULTS:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {scienceModal.composition.map((comp) => (
                <div key={comp.element}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 'bold', color: '#fff' }}>{comp.element}</span>
                    <span style={{ color: '#00f5d4', fontWeight: 'bold' }}>{comp.percentage}%</span>
                  </div>
                  <div style={{ height: '6px', background: '#1a202c', borderRadius: '3px', overflow: 'hidden', marginBottom: '4px' }}>
                    <div style={{ width: `${comp.percentage * 2}%`, height: '100%', background: '#805ad5' }} />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#a0aec0' }}>{comp.description}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ padding: '36px', textAlign: 'center', color: '#718096', border: '1px dashed #2d3748', borderRadius: '6px', marginBottom: '20px' }}>
            Select an excavated specimen above to pulse the ablation laser and obtain atomic emission spectrometry.
          </div>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={closeScienceModal}
            style={{
              background: '#805ad5',
              color: '#fff',
              border: 'none',
              padding: '10px 24px',
              borderRadius: '4px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            CLOSE TERMINAL
          </button>
        </div>
      </div>
    </div>
  );
};

