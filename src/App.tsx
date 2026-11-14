import { useEffect, useRef } from 'react';
import { GameEngine } from './game/core/GameEngine';
import { HUD } from './components/hud/HUD';
import { InteractionPrompt } from './components/hud/InteractionPrompt';
import { RepairModal } from './components/menus/RepairModal';
import { ScienceModal } from './components/menus/ScienceModal';
import { ConstructionUI } from './components/menus/ConstructionUI';
import { EducationalDebriefModal } from './components/menus/EducationalDebriefModal';
import { MainMenu } from './components/menus/MainMenu';
import { PauseMenu } from './components/menus/PauseMenu';
import { NameEntryModal } from './components/menus/NameEntryModal';
import { TutorialGuideModal } from './components/menus/TutorialGuideModal';
import { useGameStore } from './store/gameStore';

export default function App() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new GameEngine();
    engine.mount(canvasRef.current);
    engineRef.current = engine;

    // Load any existing progress from LocalStorage
    useGameStore.getState().loadFromStorage();

    // Autosave timer every 30 seconds
    const autosaveTimer = setInterval(() => {
      const state = useGameStore.getState();
      if (state.phase === 'playing') {
        state.saveToStorage();
      }
    }, 30000);

    return () => {
      clearInterval(autosaveTimer);
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#0a0a0a' }}>
      {/* 3D WebGL Canvas Layer */}
      <div
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
        }}
      />

      {/* Layered UI & Menus */}
      <HUD
        onVirtualInput={(input) => engineRef.current?.setVirtualInput(input)}
        onInteract={() => engineRef.current?.triggerMobileInteract()}
        onBuild={() => engineRef.current?.triggerMobileBuild()}
      />
      <InteractionPrompt onInteract={() => engineRef.current?.triggerMobileInteract()} />
      <RepairModal />
      <ScienceModal />
      <ConstructionUI />
      <EducationalDebriefModal />
      <MainMenu />
      <NameEntryModal />
      <TutorialGuideModal />
      <PauseMenu />
    </div>
  );
}
