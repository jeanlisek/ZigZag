'use client';

import { useRef, useCallback, useEffect, memo } from 'react';
import Timer, { TIMER_DURATIONS } from './Timer';
import './Timer.css';
import { logger } from '@/utils/logger';

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  onAutoSubmit: () => void; // Callback pour la soumission automatique
}

function TextInput({ value, onChange, onAutoSubmit }: TextInputProps) {
  const hasSubmittedRef = useRef(false);

  // Reset le flag quand le composant est monté
  useEffect(() => {
    hasSubmittedRef.current = false;
  }, []);

  const handleTimeUp = useCallback(() => {
    if (hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;
    
    logger.debug('⏰ Temps écoulé pour le texte! Soumission automatique...');
    onAutoSubmit();
  }, [onAutoSubmit]);

  return (
    <div className="text-input-container" role="region" aria-label="Saisie de texte">
      <Timer 
        duration={TIMER_DURATIONS.text} 
        onTimeUp={handleTimeUp}
      />
      
      <div className="input-header">
        <h3 className="input-title" id="text-input-title">✍️ Décrivez ce que vous voyez</h3>
        <p className="input-subtitle">Vous avez 30 secondes pour écrire votre description</p>
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Écrivez ce que vous voyez ou comprenez de l'étape précédente..."
        className="text-input"
        rows={5}
        maxLength={500}
        autoFocus
        aria-labelledby="text-input-title"
        aria-describedby="text-input-count"
        aria-required="true"
      />
      <div className="character-count" id="text-input-count" aria-live="polite">
        {value.length}/500 caractères
      </div>
    </div>
  );
}

export default memo(TextInput);
