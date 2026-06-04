'use client';

import { logger } from '@/utils/logger';
import { useRef, useState, useEffect, useCallback } from 'react';
import Timer, { TIMER_DURATIONS } from './Timer';
import ColorPicker from './ColorPicker';
import './Timer.css';

interface DrawingCanvasProps {
  onDrawingChange: (dataUrl: string) => void;
  onAutoSubmit: () => void;
}

type Tool = 'pen' | 'eraser' | 'fill' | 'line' | 'rectangle' | 'circle' | 'eyedropper';

interface Point {
  x: number;
  y: number;
}

export default function DrawingCanvas({ onDrawingChange, onAutoSubmit }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tempCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState<Point>({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState<Point>({ x: 0, y: 0 });
  const [tool, setTool] = useState<Tool>('pen');
  const [brushSize, setBrushSize] = useState(3);
  const [color, setColor] = useState('#000000');
  const [history, setHistory] = useState<string[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const hasSubmittedRef = useRef(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Reset le flag quand le composant est monté
  useEffect(() => {
    hasSubmittedRef.current = false;
  }, []);

  // Initialiser le canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const tempCanvas = tempCanvasRef.current;
    if (!canvas || !tempCanvas) return;

    const ctx = canvas.getContext('2d');
    const tempCtx = tempCanvas.getContext('2d');
    if (!ctx || !tempCtx) return;

    // Définir la taille du canvas
    canvas.width = canvas.offsetWidth;
    canvas.height = 400;
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;

    // Fond blanc
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Sauvegarder l'état initial
    saveToHistory();
  }, []);

  // Sauvegarder dans l'historique
  const saveToHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL();
    setHistory(prev => {
      const newHistory = prev.slice(0, historyStep + 1);
      newHistory.push(dataUrl);
      return newHistory;
    });
    setHistoryStep(prev => prev + 1);
  }, [historyStep]);

  // Annuler (Undo)
  const undo = useCallback(() => {
    if (historyStep <= 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const newStep = historyStep - 1;
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      onDrawingChange(canvas.toDataURL());
    };
    img.src = history[newStep];
    setHistoryStep(newStep);
  }, [historyStep, history, onDrawingChange]);

  // Rétablir (Redo)
  const redo = useCallback(() => {
    if (historyStep >= history.length - 1) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const newStep = historyStep + 1;
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      onDrawingChange(canvas.toDataURL());
    };
    img.src = history[newStep];
    setHistoryStep(newStep);
  }, [historyStep, history, onDrawingChange]);

  const getPosition = useCallback((e: React.MouseEvent | React.TouchEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }, []);

  // Fonction de remplissage (flood fill)
  const floodFill = useCallback((x: number, y: number, fillColor: string) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const targetColor = getPixelColor(imageData, x, y);
    const fillRgb = hexToRgb(fillColor);

    if (!fillRgb || colorsMatch(targetColor, fillRgb)) return;

    const pixelsToCheck = [{ x: Math.floor(x), y: Math.floor(y) }];
    const visited = new Set<string>();

    while (pixelsToCheck.length > 0) {
      const pixel = pixelsToCheck.pop()!;
      const key = `${pixel.x},${pixel.y}`;

      if (visited.has(key)) continue;
      if (pixel.x < 0 || pixel.x >= canvas.width || pixel.y < 0 || pixel.y >= canvas.height) continue;

      const currentColor = getPixelColor(imageData, pixel.x, pixel.y);
      if (!colorsMatch(currentColor, targetColor)) continue;

      visited.add(key);
      setPixelColor(imageData, pixel.x, pixel.y, fillRgb);

      pixelsToCheck.push(
        { x: pixel.x + 1, y: pixel.y },
        { x: pixel.x - 1, y: pixel.y },
        { x: pixel.x, y: pixel.y + 1 },
        { x: pixel.x, y: pixel.y - 1 }
      );
    }

    ctx.putImageData(imageData, 0, 0);
    onDrawingChange(canvas.toDataURL());
    saveToHistory();
  }, [onDrawingChange, saveToHistory]);

  // Fonctions utilitaires pour le remplissage
  const getPixelColor = (imageData: ImageData, x: number, y: number) => {
    const index = (y * imageData.width + x) * 4;
    return {
      r: imageData.data[index],
      g: imageData.data[index + 1],
      b: imageData.data[index + 2],
      a: imageData.data[index + 3]
    };
  };

  const setPixelColor = (imageData: ImageData, x: number, y: number, color: { r: number; g: number; b: number }) => {
    const index = (y * imageData.width + x) * 4;
    imageData.data[index] = color.r;
    imageData.data[index + 1] = color.g;
    imageData.data[index + 2] = color.b;
    imageData.data[index + 3] = 255;
  };

  const colorsMatch = (c1: any, c2: any) => {
    return c1.r === c2.r && c1.g === c2.g && c1.b === c2.b && c1.a === c2.a;
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const pos = getPosition(e);
    setStartPos(pos);
    setLastPos(pos);

    // Pour l'outil pipette (prélever une couleur)
    if (tool === 'eyedropper') {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      const imageData = ctx.getImageData(Math.floor(pos.x), Math.floor(pos.y), 1, 1);
      const [r, g, b] = imageData.data;
      const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
      setColor(hex);
      setTool('pen'); // Revenir au crayon après avoir prélevé la couleur
      return;
    }

    // Pour l'outil de remplissage
    if (tool === 'fill') {
      floodFill(pos.x, pos.y, color);
      return;
    }

    setIsDrawing(true);
  }, [getPosition, tool, color, floodFill]);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    const tempCanvas = tempCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    const tempCtx = tempCanvas?.getContext('2d');
    if (!canvas || !ctx || !tempCanvas || !tempCtx) return;

    const pos = getPosition(e);

    // Pour les formes, dessiner sur le canvas temporaire
    if (tool === 'line' || tool === 'rectangle' || tool === 'circle') {
      tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
      tempCtx.strokeStyle = color;
      tempCtx.lineWidth = brushSize;
      tempCtx.lineCap = 'round';

      if (tool === 'line') {
        tempCtx.beginPath();
        tempCtx.moveTo(startPos.x, startPos.y);
        tempCtx.lineTo(pos.x, pos.y);
        tempCtx.stroke();
      } else if (tool === 'rectangle') {
        const width = pos.x - startPos.x;
        const height = pos.y - startPos.y;
        tempCtx.strokeRect(startPos.x, startPos.y, width, height);
      } else if (tool === 'circle') {
        const radius = Math.sqrt(Math.pow(pos.x - startPos.x, 2) + Math.pow(pos.y - startPos.y, 2));
        tempCtx.beginPath();
        tempCtx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
        tempCtx.stroke();
      }
      return;
    }

    // Pour le crayon et la gomme, dessiner normalement
    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color;
    }

    ctx.stroke();
    setLastPos(pos);

    onDrawingChange(canvas.toDataURL());
  }, [isDrawing, lastPos, startPos, tool, brushSize, color, getPosition, onDrawingChange]);

  const stopDrawing = useCallback(() => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const tempCanvas = tempCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    const tempCtx = tempCanvas?.getContext('2d');

    // Pour les formes, copier le canvas temporaire sur le canvas principal
    if (canvas && ctx && tempCanvas && tempCtx && (tool === 'line' || tool === 'rectangle' || tool === 'circle')) {
      ctx.drawImage(tempCanvas, 0, 0);
      tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
      onDrawingChange(canvas.toDataURL());
    }

    saveToHistory();
    setIsDrawing(false);
  }, [isDrawing, tool, onDrawingChange, saveToHistory]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    onDrawingChange('');
    saveToHistory();
  }, [onDrawingChange, saveToHistory]);

  const handleTimeUp = useCallback(() => {
    if (hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;
    
    logger.debug('⏰ Temps écoulé pour le dessin! Soumission automatique...');
    
    const canvas = canvasRef.current;
    if (canvas) {
      onDrawingChange(canvas.toDataURL());
    }
    
    onAutoSubmit();
  }, [onDrawingChange, onAutoSubmit]);

  // Activer l'outil pipette
  const handlePickFromCanvas = useCallback(() => {
    setTool('eyedropper');
    setShowColorPicker(false);
  }, []);

  return (
    <div className="drawing-canvas-container">
      <Timer 
        duration={TIMER_DURATIONS.drawing} 
        onTimeUp={handleTimeUp}
      />

      <div className="input-header">
        <h3 className="input-title">🎨 Dessinez ce que vous comprenez</h3>
        <p className="input-subtitle">Vous avez 2 minutes pour créer votre dessin</p>
      </div>

      <div className="canvas-wrapper">
        <canvas
          ref={canvasRef}
          className={`drawing-canvas ${tool === 'eyedropper' ? 'eyedropper-cursor' : ''}`}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        <canvas
          ref={tempCanvasRef}
          className="temp-canvas"
        />
      </div>

      <div className="drawing-tools-enhanced">
        {/* Section Outils */}
        <div className="tools-section">
          <div className="section-label">Outils</div>
          <div className="tool-group">
            <button
              className={`tool-btn ${tool === 'pen' ? 'active' : ''}`}
              onClick={() => setTool('pen')}
              title="Crayon"
            >
              ✏️
            </button>
            <button
              className={`tool-btn ${tool === 'eraser' ? 'active' : ''}`}
              onClick={() => setTool('eraser')}
              title="Gomme"
            >
              🧽
            </button>
            <button
              className={`tool-btn ${tool === 'fill' ? 'active' : ''}`}
              onClick={() => setTool('fill')}
              title="Remplissage"
            >
              🪣
            </button>
            <button
              className={`tool-btn ${tool === 'eyedropper' ? 'active' : ''}`}
              onClick={() => setTool('eyedropper')}
              title="Pipette - Prélever une couleur"
            >
              💧
            </button>
            <button
              className={`tool-btn ${tool === 'line' ? 'active' : ''}`}
              onClick={() => setTool('line')}
              title="Ligne"
            >
              📏
            </button>
            <button
              className={`tool-btn ${tool === 'rectangle' ? 'active' : ''}`}
              onClick={() => setTool('rectangle')}
              title="Rectangle"
            >
              ▭
            </button>
            <button
              className={`tool-btn ${tool === 'circle' ? 'active' : ''}`}
              onClick={() => setTool('circle')}
              title="Cercle"
            >
              ⭕
            </button>
          </div>
        </div>

        {/* Section Couleurs */}
        <div className="tools-section">
          <div className="section-label">Couleur</div>
          
          <button 
            className="color-picker-button"
            onClick={() => setShowColorPicker(true)}
            title="Ouvrir le sélecteur de couleur avancé"
          >
            <div className="color-preview-circle" style={{ backgroundColor: color }} />
            <span className="color-value">{color.toUpperCase()}</span>
            <span className="color-picker-icon">🎨</span>
          </button>
        </div>

        {/* Section Taille */}
        <div className="tools-section">
          <div className="section-label">Taille du trait</div>
          <div className="brush-size-group">
            <input
              type="range"
              min="1"
              max="30"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="brush-slider"
            />
            <div className="brush-preview">
              <div 
                className="brush-dot" 
                style={{ 
                  width: `${brushSize * 2}px`, 
                  height: `${brushSize * 2}px`,
                  backgroundColor: color 
                }}
              />
              <span className="brush-size-label">{brushSize}px</span>
            </div>
          </div>
        </div>

        {/* Section Actions */}
        <div className="tools-section">
          <div className="section-label">Actions</div>
          <div className="action-group">
            <button 
              className="action-btn"
              onClick={undo}
              disabled={historyStep <= 0}
              title="Annuler (Ctrl+Z)"
            >
              ↶ Annuler
            </button>
            <button 
              className="action-btn"
              onClick={redo}
              disabled={historyStep >= history.length - 1}
              title="Rétablir (Ctrl+Y)"
            >
              ↷ Rétablir
            </button>
            <button 
              className="action-btn btn-clear"
              onClick={clearCanvas}
              title="Tout effacer"
            >
              🗑️ Effacer tout
            </button>
          </div>
        </div>
      </div>

      {/* Color Picker Modal */}
      {showColorPicker && (
        <ColorPicker
          color={color}
          onChange={setColor}
          onClose={() => setShowColorPicker(false)}
          onPickFromCanvas={handlePickFromCanvas}
        />
      )}
    </div>
  );
}
