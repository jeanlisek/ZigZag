'use client';

import { logger } from '@/utils/logger';

import { useState, useRef, useCallback, useEffect } from 'react';
import Timer, { TIMER_DURATIONS } from './Timer';
import './Timer.css';

interface AudioRecorderProps {
  onRecordingComplete: (audioUrl: string) => void;
  onAutoSubmit: () => void; // Callback pour la soumission automatique
}

export default function AudioRecorder({ onRecordingComplete, onAutoSubmit }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const hasSubmittedRef = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);

  // Reset le flag quand le composant est monté
  useEffect(() => {
    hasSubmittedRef.current = false;
    
    // Cleanup au démontage
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startRecording = useCallback(async () => {
    try {
      // Vérifier que l'API est disponible
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Votre navigateur ne supporte pas l\'enregistrement audio. Veuillez utiliser un navigateur moderne (Chrome, Firefox, Safari, Edge).');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        onRecordingComplete(url);

        // Arrêter le stream
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setError(null);
    } catch (err) {
      logger.error('Erreur microphone:', err);
      
      // Gérer différents types d'erreurs
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setError('Permission refusée. Veuillez autoriser l\'accès au microphone dans les paramètres de votre navigateur et réessayer.');
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setError('Aucun microphone détecté. Vérifiez que votre microphone est connecté et fonctionne.');
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          setError('Le microphone est déjà utilisé par une autre application. Fermez les autres applications et réessayez.');
        } else {
          setError(`Impossible d'accéder au microphone : ${err.message}. Vérifiez les permissions de votre navigateur.`);
        }
      } else {
        setError('Impossible d\'accéder au microphone. Vérifiez les permissions de votre navigateur.');
      }
    }
  }, [onRecordingComplete]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, []);

  const resetRecording = useCallback(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    onRecordingComplete('');
  }, [audioUrl, onRecordingComplete]);

  const handleTimeUp = useCallback(() => {
    if (hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;
    
    logger.debug('⏰ Temps écoulé pour l\'audio! Soumission automatique...');
    
    // Arrêter l'enregistrement en cours si nécessaire
    if (mediaRecorderRef.current?.state === 'recording') {
      // Attendre que l'enregistrement s'arrête avant de soumettre
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        onRecordingComplete(url);
        
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        
        // Soumettre après l'arrêt
        onAutoSubmit();
      };
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    } else {
      // Si pas d'enregistrement en cours, soumettre directement
      onAutoSubmit();
    }
  }, [onRecordingComplete, onAutoSubmit]);

  return (
    <div className="audio-recorder-container">
      <Timer 
        duration={TIMER_DURATIONS.audio} 
        onTimeUp={handleTimeUp}
      />

      <div className="input-header">
        <h3 className="input-title">🎤 Enregistrez votre description</h3>
        <p className="input-subtitle">Vous avez 30 secondes pour enregistrer votre audio</p>
      </div>

      {error && (
        <div className="error-message" role="alert">
          <p>⚠️ {error}</p>
          <button
            onClick={() => {
              setError(null);
              startRecording();
            }}
            className="btn-retry"
          >
            🔄 Réessayer
          </button>
        </div>
      )}

      <div className="recorder-controls">
        {!isRecording && !audioUrl && (
          <button
            onClick={startRecording}
            className="btn-record"
          >
            🎤 Commencer l'enregistrement
          </button>
        )}

        {isRecording && (
          <button
            onClick={stopRecording}
            className="btn-stop-record"
          >
            ⏹️ Arrêter l'enregistrement
          </button>
        )}

        {isRecording && (
          <div className="recording-indicator">
            <span className="recording-dot"></span>
            Enregistrement en cours...
          </div>
        )}
      </div>

      {audioUrl && (
        <div className="audio-playback">
          <audio controls src={audioUrl} className="audio-player" />
          <button onClick={resetRecording} className="btn-reset">
            🔄 Nouvel enregistrement
          </button>
        </div>
      )}

      <p className="recorder-hint">
        Décrivez ce que vous voyez avec votre voix
      </p>
    </div>
  );
}
