import React from 'react';
import { useGameStore } from '../../store/gameStore';

export const ConstructionUI: React.FC = () => {
  const constructionMode = useGameStore((state) => state.constructionMode);
  const setConstructionMode = useGameStore((state) => state.setConstructionMode);
  const recipes = useGameStore((state) => state.recipes);
  const selectedRecipeId = useGameStore((state) => state.selectedRecipeId);
  const setSelectedRecipeId = useGameStore((state) => state.setSelectedRecipeId);
  const getItemCount = useGameStore((state) => state.getItemCount);

  if (!constructionMode) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '100px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '780px',
        maxWidth: '94vw',
        background: 'rgba(10, 18, 30, 0.92)',
        border: '2px solid #00f5d4',
        borderRadius: '10px',
        boxShadow: '0 0 30px rgba(0, 245, 212, 0.3)',
        backdropFilter: 'blur(10px)',
        padding: '16px 20px',
        color: '#e2e8f0',
        zIndex: 50,
        fontFamily: "'Courier New', monospace",
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div>
          <span style={{ color: '#00f5d4', fontWeight: 'bold', letterSpacing: '2px', fontSize: '0.85rem' }}>
            NASA IN-SITU 3D ADDITIVE FABRICATION SYSTEM
          </span>
          <div style={{ fontSize: '0.8rem', color: '#a0aec0' }}>
            Aim astronaut, preview holographic ghost, and press [B] to fabricate.
          </div>
        </div>
        <button
          onClick={() => setConstructionMode(false)}
          style={{
            background: 'transparent',
            border: '1px solid #4a5568',
            color: '#a0aec0',
            padding: '4px 10px',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          ✕ CLOSE [C]
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
        {recipes.map((recipe) => {
          const isSelected = recipe.id === selectedRecipeId;
          const canAfford = recipe.cost.every((cost) => getItemCount(cost.itemId) >= cost.quantity);

          return (
            <div
              key={recipe.id}
              onClick={() => setSelectedRecipeId(recipe.id)}
              style={{
                background: isSelected ? 'rgba(0, 245, 212, 0.15)' : 'rgba(26, 32, 44, 0.6)',
                border: `1.5px solid ${isSelected ? '#00f5d4' : '#2d3748'}`,
                borderRadius: '6px',
                padding: '10px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '0.85rem', color: isSelected ? '#00f5d4' : '#fff', marginBottom: '4px' }}>
                  {recipe.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#a0aec0', marginBottom: '8px' }}>
                  {recipe.description}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.7rem', color: '#718096', marginBottom: '2px' }}>MATERIAL COST:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {recipe.cost.map((c) => {
                    const have = getItemCount(c.itemId);
                    const satisfied = have >= c.quantity;
                    return (
                      <span
                        key={c.itemId}
                        style={{
                          fontSize: '0.7rem',
                          background: satisfied ? '#1a365d' : '#742a2a',
                          color: satisfied ? '#63b3ed' : '#feb2b2',
                          padding: '2px 6px',
                          borderRadius: '3px',
                        }}
                      >
                        {c.itemId}: {have}/{c.quantity}
                      </span>
                    );
                  })}
                </div>
                <div style={{ marginTop: '6px', fontSize: '0.75rem', fontWeight: 'bold', color: canAfford ? '#48bb78' : '#e53e3e' }}>
                  {canAfford ? '✓ READY TO PLACE [B]' : 'MISSING MATERIALS'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

