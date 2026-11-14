import React from 'react';
import { useGameStore } from '../../store/gameStore';

interface InteractionPromptProps {
  onInteract?: () => void;
}

export const InteractionPrompt: React.FC<InteractionPromptProps> = ({ onInteract }) => {
  const currentInteraction = useGameStore((state) => state.currentInteraction);

  if (!currentInteraction) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: '64%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'rgba(10, 18, 30, 0.88)',
        border: '1.5px solid #00f5d4',
        boxShadow: '0 0 24px rgba(0, 245, 212, 0.45)',
        backdropFilter: 'blur(10px)',
        padding: '12px 24px',
        borderRadius: '8px',
        color: '#fff',
        fontFamily: "'Share Tech Mono', 'Courier New', monospace",
        textAlign: 'center',
        pointerEvents: 'auto',
        zIndex: 40,
        userSelect: 'none',
      }}
    >
      <div style={{ fontSize: '0.75rem', color: '#00f5d4', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px' }}>
        🎯 Target In Proximity
      </div>
      <div style={{ fontSize: '1.15rem', fontWeight: 'bold', color: '#fff', marginBottom: '8px' }}>
        {currentInteraction.name}
      </div>
      <button
        onClick={onInteract}
        style={{
          display: 'inline-block',
          background: '#00f5d4',
          color: '#08121e',
          border: 'none',
          padding: '6px 18px',
          borderRadius: '5px',
          fontWeight: 'bold',
          fontSize: '0.92rem',
          letterSpacing: '1px',
          cursor: 'pointer',
          boxShadow: '0 0 16px rgba(0, 245, 212, 0.6)',
          transition: 'transform 0.15s ease, background 0.15s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.background = '#38b2ac';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1.0)';
          e.currentTarget.style.background = '#00f5d4';
        }}
      >
        {currentInteraction.promptText}
      </button>
    </div>
  );
};
