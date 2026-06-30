"use client";
import { useState, useEffect, useCallback } from 'react';

export function useGlobalScore() {
  const [globalScore, setGlobalScore] = useState(0);

  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      setGlobalScore(customEvent.detail);
    };

    window.addEventListener('arcadeScoreUpdate', handleUpdate);
    return () => window.removeEventListener('arcadeScoreUpdate', handleUpdate);
  }, []);

  const addScore = useCallback((amount: number) => {
    setGlobalScore(prev => {
      const newScore = prev + amount;
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('arcadeScoreUpdate', { detail: newScore }));
      }, 0);
      return newScore;
    });
  }, []);

  return { globalScore, addScore };
}
