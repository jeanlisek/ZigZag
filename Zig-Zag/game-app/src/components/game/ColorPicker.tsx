'use client';

import { useState, useEffect, useCallback } from 'react';
import { HexColorPicker } from 'react-colorful';
import './ColorPicker.css';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  onClose: () => void;
  onPickFromCanvas?: () => void;
}

export default function ColorPicker({ color, onChange, onClose, onPickFromCanvas }: ColorPickerProps) {
  const [currentColor, setCurrentColor] = useState(color);
  const [recentColors, setRecentColors] = useState<string[]>([]);
  const [hexInput, setHexInput] = useState(color);
  const [rgbInput, setRgbInput] = useState({ r: 0, g: 0, b: 0 });

  // Palette de couleurs prédéfinies
  const presetColors = [
    '#000000', '#FFFFFF', '#808080', '#C0C0C0',
    '#FF0000', '#FF6B6B', '#FF1744', '#F06292',
    '#FF9800', '#FFC107', '#FFEB3B', '#FFD54F',
    '#4CAF50', '#8BC34A', '#00E676', '#69F0AE',
    '#2196F3', '#03A9F4', '#00BCD4', '#80DEEA',
    '#9C27B0', '#E91E63', '#BA68C8', '#CE93D8',
  ];

  // Charger les couleurs récentes depuis localStorage
  useEffect(() => {
    const saved = localStorage.getItem('zigzag_recent_colors');
    if (saved) {
      try {
        setRecentColors(JSON.parse(saved));
      } catch (e) {
        console.error('Erreur chargement couleurs récentes:', e);
      }
    }
  }, []);

  // Synchroniser la couleur et les valeurs RGB
  useEffect(() => {
    setCurrentColor(color);
    setHexInput(color);
    const rgb = hexToRgb(color);
    if (rgb) {
      setRgbInput(rgb);
    }
  }, [color]);

  // Convertir HEX vers RGB
  const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  // Convertir RGB vers HEX
  const rgbToHex = (r: number, g: number, b: number): string => {
    const toHex = (n: number) => {
      const hex = Math.max(0, Math.min(255, n)).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  // Ajouter une couleur aux récentes
  const addToRecentColors = useCallback((newColor: string) => {
    setRecentColors(prev => {
      const filtered = prev.filter(c => c.toLowerCase() !== newColor.toLowerCase());
      const updated = [newColor, ...filtered].slice(0, 12);
      localStorage.setItem('zigzag_recent_colors', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Gérer le changement de couleur
  const handleColorChange = (newColor: string) => {
    setCurrentColor(newColor);
    setHexInput(newColor);
    const rgb = hexToRgb(newColor);
    if (rgb) {
      setRgbInput(rgb);
    }
    onChange(newColor);
    addToRecentColors(newColor);
  };

  // Gérer l'input HEX
  const handleHexInput = (value: string) => {
    setHexInput(value);
    if (/^#[0-9A-F]{6}$/i.test(value)) {
      handleColorChange(value);
    }
  };

  // Gérer les inputs RGB
  const handleRgbChange = (channel: 'r' | 'g' | 'b', value: number) => {
    const newRgb = { ...rgbInput, [channel]: Math.max(0, Math.min(255, value)) };
    setRgbInput(newRgb);
    const hexColor = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    handleColorChange(hexColor);
  };

  return (
    <div className="color-picker-overlay" onClick={onClose}>
      <div className="color-picker-panel" onClick={(e) => e.stopPropagation()}>
        <div className="color-picker-header">
          <h3>🎨 Sélecteur de couleur</h3>
          <button className="close-btn" onClick={onClose} title="Fermer">✕</button>
        </div>

        <div className="color-picker-content">
          {/* Sélecteur principal */}
          <div className="color-picker-main">
            <HexColorPicker color={currentColor} onChange={handleColorChange} />
          </div>

          {/* Outils et inputs */}
          <div className="color-picker-tools">
            {/* Aperçu et pipette */}
            <div className="color-preview-section">
              <div className="color-preview-large" style={{ backgroundColor: currentColor }} />
              {onPickFromCanvas && (
                <button 
                  className="eyedropper-btn" 
                  onClick={onPickFromCanvas}
                  title="Prélever une couleur du dessin"
                >
                  💧 Pipette
                </button>
              )}
            </div>

            {/* Input HEX */}
            <div className="color-input-group">
              <label>HEX</label>
              <input
                type="text"
                value={hexInput}
                onChange={(e) => handleHexInput(e.target.value.toUpperCase())}
                placeholder="#000000"
                maxLength={7}
              />
            </div>

            {/* Inputs RGB */}
            <div className="rgb-inputs">
              <div className="color-input-group">
                <label>R</label>
                <input
                  type="number"
                  value={rgbInput.r}
                  onChange={(e) => handleRgbChange('r', parseInt(e.target.value) || 0)}
                  min="0"
                  max="255"
                />
              </div>
              <div className="color-input-group">
                <label>G</label>
                <input
                  type="number"
                  value={rgbInput.g}
                  onChange={(e) => handleRgbChange('g', parseInt(e.target.value) || 0)}
                  min="0"
                  max="255"
                />
              </div>
              <div className="color-input-group">
                <label>B</label>
                <input
                  type="number"
                  value={rgbInput.b}
                  onChange={(e) => handleRgbChange('b', parseInt(e.target.value) || 0)}
                  min="0"
                  max="255"
                />
              </div>
            </div>
          </div>

          {/* Couleurs prédéfinies */}
          <div className="preset-colors-section">
            <h4>Palette prédéfinie</h4>
            <div className="preset-colors-grid">
              {presetColors.map((c) => (
                <button
                  key={c}
                  className={`preset-color-btn ${currentColor.toLowerCase() === c.toLowerCase() ? 'active' : ''}`}
                  style={{ 
                    backgroundColor: c,
                    border: c === '#FFFFFF' ? '2px solid #ddd' : '2px solid transparent'
                  }}
                  onClick={() => handleColorChange(c)}
                  title={c}
                />
              ))}
            </div>
          </div>

          {/* Couleurs récentes */}
          {recentColors.length > 0 && (
            <div className="recent-colors-section">
              <h4>Récemment utilisées</h4>
              <div className="recent-colors-grid">
                {recentColors.map((c, idx) => (
                  <button
                    key={`${c}-${idx}`}
                    className={`preset-color-btn ${currentColor.toLowerCase() === c.toLowerCase() ? 'active' : ''}`}
                    style={{ 
                      backgroundColor: c,
                      border: c === '#FFFFFF' ? '2px solid #ddd' : '2px solid transparent'
                    }}
                    onClick={() => handleColorChange(c)}
                    title={c}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
