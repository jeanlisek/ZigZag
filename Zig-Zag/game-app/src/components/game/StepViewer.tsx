'use client';

import { Step } from '@/types/game';

interface StepViewerProps {
  step: Step;
}

export default function StepViewer({ step }: StepViewerProps) {
  switch (step.step_type) {
    case 'text':
      return (
        <div className="viewer-text">
          <p>{step.content}</p>
        </div>
      );

    case 'drawing':
      return (
        <div className="viewer-drawing">
          <img
            src={step.content}
            alt={`Étape ${step.step_number}`}
            className="viewer-image"
          />
        </div>
      );

    case 'audio':
      // Déterminer le type MIME depuis l'URL (extension du fichier)
      const getAudioMimeType = (url: string): string => {
        if (url.includes('.webm')) return 'audio/webm';
        if (url.includes('.ogg')) return 'audio/ogg';
        if (url.includes('.mp4')) return 'audio/mp4';
        if (url.includes('.aac')) return 'audio/aac';
        if (url.includes('.wav')) return 'audio/wav';
        // Par défaut, laisser le navigateur détecter automatiquement
        return 'audio/*';
      };
      
      return (
        <div className="viewer-audio">
          <p>🎤 Message vocal</p>
          <audio controls className="audio-player">
            <source src={step.content} type={getAudioMimeType(step.content)} />
            Votre navigateur ne supporte pas l'élément audio.
          </audio>
        </div>
      );

    default:
      return <div>Type d'étape inconnu</div>;
  }
}

