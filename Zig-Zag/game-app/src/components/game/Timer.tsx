'use client';

import { useState, useEffect, useCallback } from 'react';

interface TimerProps {
  duration: number; // Durée en secondes
  onTimeUp: () => void; // Callback quand le temps est écoulé
  isActive?: boolean; // Pour contrôler le démarrage
}

export default function Timer({ duration, onTimeUp, isActive = true }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [hasTriggered, setHasTriggered] = useState(false);

  // Formater le temps en MM:SS
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Déterminer si on est en alerte (< 10 secondes)
  const isAlert = timeLeft <= 10;
  const isCritical = timeLeft <= 5;

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (!hasTriggered) {
            setHasTriggered(true);
            // Utiliser setTimeout pour éviter les problèmes de state pendant le render
            setTimeout(() => onTimeUp(), 0);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, onTimeUp, hasTriggered]);

  // Reset le timer si la durée change
  useEffect(() => {
    setTimeLeft(duration);
    setHasTriggered(false);
  }, [duration]);

  return (
    <div
      className={`timer-container ${isAlert ? 'timer-alert' : ''} ${isCritical ? 'timer-critical' : ''}`}
    >
      <div className="timer-icon">⏱️</div>
      <div className="timer-display">{formatTime(timeLeft)}</div>
      {isAlert && <div className="timer-pulse"></div>}
    </div>
  );
}

// Constantes pour les durées de chaque type d'étape
export const TIMER_DURATIONS = {
  text: 30,      // 30 secondes pour le texte
  drawing: 120,  // 2 minutes pour le dessin
  audio: 30,     // 30 secondes pour l'audio
} as const;

