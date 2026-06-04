'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import './DoodleCanvas.css';

export default function DoodleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const [brushSize, setBrushSize] = useState(3);
  const [color, setColor] = useState('#667eea');

  // Palette de couleurs rapide
  const quickColors = [
    '#667eea', '#764ba2', '#FF6B6B', '#4CAF50', 
    '#FFC107', '#00BCD4', '#FF9800', '#E91E63',
    '#000000', '#FFFFFF'
  ];

  // Initialiser le canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Définir la taille du canvas
    canvas.width = canvas.offsetWidth;
    canvas.height = 300;

    // Fond blanc
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getPosition = useCallback((e: React.MouseEvent | React.TouchEvent) => {
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

  const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const pos = getPosition(e);
    setLastPos(pos);
    setIsDrawing(true);
  }, [getPosition]);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const pos = getPosition(e);

    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = color;
    ctx.stroke();

    setLastPos(pos);
  }, [isDrawing, lastPos, brushSize, color, getPosition]);

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  return (
    <div className="doodle-canvas-container">
      <div className="doodle-header">
        <h4>✏️ Gribouillage Libre</h4>
        <p className="doodle-subtitle">Dessinez pendant que vous attendez !</p>
      </div>

      <div className="doodle-canvas-wrapper">
        <canvas
          ref={canvasRef}
          className="doodle-canvas"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>

      <div className="doodle-controls">
        {/* Couleurs rapides */}
        <div className="doodle-colors">
          {quickColors.map((c) => (
            <button
              key={c}
              className={`doodle-color-btn ${color === c ? 'active' : ''}`}
              style={{ 
                backgroundColor: c,
                border: c === '#FFFFFF' ? '2px solid #ddd' : '2px solid transparent'
              }}
              onClick={() => setColor(c)}
              title={c}
            />
          ))}
        </div>

        {/* Taille du pinceau */}
        <div className="doodle-brush-size">
          <label>Taille</label>
          <input
            type="range"
            min="1"
            max="15"
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            className="doodle-slider"
          />
          <span className="brush-size-value">{brushSize}px</span>
        </div>

        {/* Bouton effacer */}
        <button 
          className="doodle-clear-btn"
          onClick={clearCanvas}
          title="Effacer tout"
        >
          🗑️ Effacer
        </button>
      </div>

      <div className="doodle-note">
        💡 <em>Ce dessin ne sera pas soumis, c'est juste pour patienter !</em>
      </div>
    </div>
  );
}
