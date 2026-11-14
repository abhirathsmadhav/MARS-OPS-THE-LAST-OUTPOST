import React from 'react';
import { useGameStore } from '../../store/gameStore';

export const EducationalDebriefModal: React.FC = () => {
  const activeDebrief = useGameStore((state) => state.activeDebrief);
  const closeDebrief = useGameStore((state) => state.closeDebrief);

  if (!activeDebrief) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 10, 18, 0.9)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 120,
        fontFamily: "'Courier New', monospace",
      }}
    >
      <div
        style={{
          width: '720px',
          maxWidth: '92vw',
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: '#0c1524',
          border: '2px solid #00f5d4',
          borderRadius: '12px',
          boxShadow: '0 0 40px rgba(0, 245, 212, 0.35)',
          padding: '28px',
          color: '#e2e8f0',
        }}
      >
        {/* Banner */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #1a2a44', paddingBottom: '16px', marginBottom: '20px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '8px',
              background: '#00f5d4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
              color: '#08121e',
              fontWeight: '900',
            }}
          >
            ★
          </div>
          <div>
            <div style={{ color: '#00f5d4', fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '2px' }}>
              NASA EXPLORATION ENGINEERING DEBRIEF
            </div>
            <h2 style={{ fontSize: '1.4rem', color: '#fff', margin: '2px 0 0 0' }}>
              {activeDebrief.title}
            </h2>
          </div>
        </div>

        {/* 4 Core Pillars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
          {/* 1. What You Did */}
          <div style={{ background: 'rgba(26, 32, 44, 0.6)', borderLeft: '4px solid #00f5d4', padding: '12px 16px', borderRadius: '0 6px 6px 0' }}>
            <div style={{ color: '#00f5d4', fontWeight: 'bold', fontSize: '0.8rem', letterSpacing: '1px', marginBottom: '4px' }}>
              1. WHAT YOU DID (MISSION ACTION)
            </div>
            <div style={{ fontSize: '0.9rem', color: '#e2e8f0', lineHeight: '1.5' }}>
              {activeDebrief.whatYouDid}
            </div>
          </div>

          {/* 2. Why It Mattered */}
          <div style={{ background: 'rgba(26, 32, 44, 0.6)', borderLeft: '4px solid #ff6b35', padding: '12px 16px', borderRadius: '0 6px 6px 0' }}>
            <div style={{ color: '#ff6b35', fontWeight: 'bold', fontSize: '0.8rem', letterSpacing: '1px', marginBottom: '4px' }}>
              2. WHY IT MATTERED (SURVIVAL SCIENCE)
            </div>
            <div style={{ fontSize: '0.9rem', color: '#e2e8f0', lineHeight: '1.5' }}>
              {activeDebrief.whyItMattered}
            </div>
          </div>

          {/* 3. Real-World Application */}
          <div style={{ background: 'rgba(26, 32, 44, 0.6)', borderLeft: '4px solid #63b3ed', padding: '12px 16px', borderRadius: '0 6px 6px 0' }}>
            <div style={{ color: '#63b3ed', fontWeight: 'bold', fontSize: '0.8rem', letterSpacing: '1px', marginBottom: '4px' }}>
              3. REAL-WORLD APPLICATION (AEROSPACE ENGINEERING)
            </div>
            <div style={{ fontSize: '0.9rem', color: '#e2e8f0', lineHeight: '1.5' }}>
              {activeDebrief.realWorldApplication}
            </div>
          </div>

          {/* 4. NASA Reference */}
          <div style={{ background: 'rgba(26, 32, 44, 0.6)', borderLeft: '4px solid #b794f4', padding: '12px 16px', borderRadius: '0 6px 6px 0' }}>
            <div style={{ color: '#b794f4', fontWeight: 'bold', fontSize: '0.8rem', letterSpacing: '1px', marginBottom: '4px' }}>
              4. NASA REFERENCE & FLIGHT HERITAGE
            </div>
            <div style={{ fontSize: '0.85rem', color: '#cbd5e0', lineHeight: '1.5', marginBottom: '6px' }}>
              {activeDebrief.nasaReference}
            </div>
            <a
              href={activeDebrief.nasaLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#00f5d4',
                fontSize: '0.8rem',
                textDecoration: 'underline',
                wordBreak: 'break-all',
              }}
            >
              🔗 {activeDebrief.nasaLink}
            </a>
          </div>
        </div>

        {/* Disclaimer Note */}
        <div style={{ fontSize: '0.75rem', color: '#718096', fontStyle: 'italic', marginBottom: '20px' }}>
          * Educational simulation developed for space exploration hackathon. Models NASA engineering concepts using publicly documented research. Does not imply official NASA endorsement or certification.
        </div>

        {/* Action Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={closeDebrief}
            style={{
              background: '#00f5d4',
              color: '#08121e',
              border: 'none',
              padding: '12px 28px',
              borderRadius: '6px',
              fontWeight: '900',
              fontSize: '0.95rem',
              letterSpacing: '1px',
              cursor: 'pointer',
              boxShadow: '0 0 15px rgba(0, 245, 212, 0.4)',
            }}
          >
            ACKNOWLEDGE & RESUME EXPEDITION [ENTER]
          </button>
        </div>
      </div>
    </div>
  );
};

