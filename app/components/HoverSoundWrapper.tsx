"use client";
import { useEffect, useRef } from 'react';
import { useSound } from '../hooks/useSound';

export default function HoverSoundWrapper({ children }: { children: React.ReactNode }) {
  const { playSound } = useSound();
  const audioUnlocked = useRef(false);
  const lastHoverTime = useRef(0);

  useEffect(() => {
    // Unlock audio context on first click anywhere
    const unlockAudio = () => {
      if (!audioUnlocked.current) {
        audioUnlocked.current = true;
      }
    };
    
    document.addEventListener('click', unlockAudio, { once: true });

    // Handle global mouseover for hover sounds
    const handleMouseOver = (e: MouseEvent) => {
      if (!audioUnlocked.current) return;
      
      const target = e.target as HTMLElement;
      
      // Check if hovering over explicitly defined interactive elements.
      // We limit this to buttons and major cards to avoid spamming the audio.
      const isInteractive = target.closest('button') || 
                            target.closest('a') || 
                            target.closest('.game-choice') ||
                            target.closest('.quiz-option');
                            
      if (isInteractive) {
        // Prevent event bubbling firing multiple times for the same logical hover
        const related = e.relatedTarget as HTMLElement;
        if (related && target.contains(related)) return;
        
        // Cooldown mechanism: 150ms between hover sounds to prevent spam
        const now = Date.now();
        if (now - lastHoverTime.current > 150) {
          playSound('hover');
          lastHoverTime.current = now;
        }
      }
    };

    document.addEventListener('mouseover', handleMouseOver);

    return () => {
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('mouseover', handleMouseOver);
    };
  }, [playSound]);

  return <>{children}</>;
}
