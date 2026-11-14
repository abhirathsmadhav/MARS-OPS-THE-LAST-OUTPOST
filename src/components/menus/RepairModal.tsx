import React from 'react';
import { useGameStore } from '../../store/gameStore';

export const RepairModal: React.FC = () => {
  const repairModal = useGameStore((state) => state.repairModal);
  const completeRepairStep = useGameStore((state) => state.completeRepairStep);
  const closeRepairModal = useGameStore((state) => state.closeRepairModal);
  const inventory = useGameStore((state) => state.inventory);

  if (!repairModal) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 10, 18, 0.85)',
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
          width: '680px',
          maxWidth: '92vw',
          backgroundColor: '#0c1524',
          border: '2px solid #ff6b35',
          borderRadius: '10px',
          boxShadow: '0 0 35px rgba(255, 107, 53, 0.4)',
          padding: '24px',
          color: '#e2e8f0',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #2d3748', paddingBottom: '12px', marginBottom: '16px' }}>
          <div>
            <div style={{ color: '#ff6b35', fontSize: '0.85rem', fontWeight: 'bold', letterSpacing: '2px' }}>
              NASA ECLSS DIAGNOSTIC & MAINTENANCE PROTOCOL
            </div>
            <h2 style={{ fontSize: '1.4rem', color: '#fff', marginTop: '4px' }}>
              {repairModal.title}
            </h2>
          </div>
          <button
            onClick={closeRepairModal}
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

        {/* Schematic Display */}
        <div
          style={{
            background: '#070d18',
            border: '1px solid #1a2a44',
            borderRadius: '6px',
            padding: '16px',
            marginBottom: '20px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.8rem', color: '#718096' }}>
            <span>TELEMETRY BUS: 0x4F12</span>
            <span>SYSTEM HEALTH: {repairModal.isCompleted ? '100% NOMINAL' : 'FAULT DETECTED'}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', margin: '12px 0' }}>
            <div
              style={{
                flex: 1,
                height: '10px',
                background: '#1a202c',
                borderRadius: '5px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${(repairModal.steps.filter((s) => s.completed).length / repairModal.steps.length) * 100}%`,
                  background: repairModal.isCompleted ? '#48bb78' : '#ff6b35',
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
            <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: repairModal.isCompleted ? '#48bb78' : '#ff6b35' }}>
              {repairModal.isCompleted ? 'READY' : `${repairModal.steps.filter((s) => s.completed).length}/${repairModal.steps.length} STEPS`}
            </span>
          </div>

          <p style={{ fontSize: '0.85rem', color: '#a0aec0', margin: 0 }}>
            {repairModal.isCompleted
              ? '✓ System calibrated and online. Power/Life-support harmonics restored to nominal operating parameters.'
              : 'Execute sequential engineering procedures below to rectify subsystem failure.'}
          </p>
        </div>

        {/* Step-by-Step Interactive Checklist */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          {repairModal.steps.map((step, idx) => {
            const hasRequiredItem = step.requiresItem
              ? inventory.some((i) => i.id === step.requiresItem && i.quantity > 0)
              : true;

            return (
              <div
                key={step.id}
                style={{
                  background: step.completed ? 'rgba(72, 187, 120, 0.1)' : 'rgba(26, 32, 44, 0.6)',
                  border: `1px solid ${step.completed ? '#48bb78' : '#2d3748'}`,
                  borderRadius: '6px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: step.completed ? '#48bb78' : '#718096', fontWeight: 'bold' }}>
                      0{idx + 1}.
                    </span>
                    <span style={{ fontWeight: 'bold', color: step.completed ? '#e2e8f0' : '#fff' }}>
                      {step.text}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#a0aec0', marginTop: '4px', marginLeft: '24px' }}>
                    {step.description}
                  </div>
                  {step.requiresItem && !step.completed && (
                    <div style={{ fontSize: '0.75rem', color: hasRequiredItem ? '#00f5d4' : '#e53e3e', marginTop: '4px', marginLeft: '24px' }}>
                      {hasRequiredItem ? '✓ Required component present in inventory' : `⚠️ Missing required item: ${step.requiresItem}`}
                    </div>
                  )}
                </div>

                <div>
                  {step.completed ? (
                    <span style={{ color: '#48bb78', fontWeight: 'bold', fontSize: '0.9rem' }}>
                      ✓ COMPLETED
                    </span>
                  ) : (
                    <button
                      onClick={() => completeRepairStep(step.id)}
                      disabled={!hasRequiredItem}
                      style={{
                        background: hasRequiredItem ? '#ff6b35' : '#4a5568',
                        color: '#08121e',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        cursor: hasRequiredItem ? 'pointer' : 'not-allowed',
                        fontSize: '0.85rem',
                      }}
                    >
                      EXECUTE STEP
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            onClick={closeRepairModal}
            style={{
              background: repairModal.isCompleted ? '#48bb78' : '#ff6b35',
              color: '#08121e',
              border: 'none',
              padding: '10px 24px',
              borderRadius: '4px',
              fontWeight: '900',
              cursor: 'pointer',
              letterSpacing: '1px',
            }}
          >
            {repairModal.isCompleted ? 'CONFIRM & RESTORE [DONE]' : 'EXIT PANEL'}
          </button>
        </div>
      </div>
    </div>
  );
};

