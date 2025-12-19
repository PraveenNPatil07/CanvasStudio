import React, { useState, useEffect } from "react";
import {
  Maximize2,
  Lock,
  Unlock,
  RefreshCw,
  Download,
  FileText,
  ChevronDown,
} from "lucide-react";

function CanvasSetup({
  width,
  height,
  hasCanvas,
  onInitialize,
  onUpdateDimensions,
  onExportPNG,
  onExportPDF,
}) {
  const [w, setW] = useState(width || 800);
  const [h, setH] = useState(height || 600);
  const [isLocked, setIsLocked] = useState(false);
  const [ratio, setRatio] = useState(width / height || 4 / 3);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  useEffect(() => {
    if (width && height) {
      setW(width);
      setH(height);
      setRatio(width / height);
    }
  }, [width, height]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onInitialize(parseInt(w), parseInt(h));
  };

  const handleWidthChange = (val) => {
    const newW = parseInt(val) || 0;
    setW(newW);
    if (isLocked) {
      setH(Math.round(newW / ratio));
    }
  };

  const handleHeightChange = (val) => {
    const newH = parseInt(val) || 0;
    setH(newH);
    if (isLocked) {
      setW(Math.round(newH * ratio));
    }
  };

  const toggleLock = () => {
    if (!isLocked) {
      setRatio(w / h);
    }
    setIsLocked(!isLocked);
  };

  const handleUpdate = () => {
    onUpdateDimensions(parseInt(w), parseInt(h));
  };

  const handlePDFExport = async () => {
    setIsExportingPDF(true);
    setShowExportMenu(false);
    try {
      await onExportPDF();
    } finally {
      setIsExportingPDF(false);
    }
  };

  return (
    <div className="control-group fade-in">
      <div className="setup-header">
        <h3>
          <Maximize2 size={16} />
          Dimensions
        </h3>
        {hasCanvas && (
          <div className="export-dropdown-wrapper">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="btn-primary"
              title="Export Canvas"
              disabled={isExportingPDF}
            >
              {isExportingPDF ? (
                <span className="spinner" />
              ) : (
                <Download size={14} />
              )}
              Export
              <ChevronDown size={14} />
            </button>
            {showExportMenu && (
              <div className="export-menu fade-in">
                <button
                  onClick={() => {
                    onExportPNG();
                    setShowExportMenu(false);
                  }}
                  className="export-item"
                >
                  <Download size={16} />
                  <div className="export-item-text">
                    <span>Download PNG</span>
                    <small>High quality image</small>
                  </div>
                </button>
                <button onClick={handlePDFExport} className="export-item">
                  <FileText size={16} />
                  <div className="export-item-text">
                    <span>Download PDF</span>
                    <small>Best for printing</small>
                  </div>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="form-section">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="canvas-width">Width</label>
            <input
              id="canvas-width"
              type="number"
              value={w}
              onChange={(e) => handleWidthChange(e.target.value)}
              min="100"
              max="2000"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="canvas-height">Height</label>
            <input
              id="canvas-height"
              type="number"
              value={h}
              onChange={(e) => handleHeightChange(e.target.value)}
              min="100"
              max="2000"
              required
            />
          </div>
          <button
            type="button"
            className={`btn-tertiary lock-btn ${isLocked ? "active" : ""}`}
            onClick={toggleLock}
            title={isLocked ? "Unlock Aspect Ratio" : "Lock Aspect Ratio"}
          >
            {isLocked ? <Lock size={16} /> : <Unlock size={16} />}
          </button>
        </div>

        <div className="setup-actions">
          {!hasCanvas ? (
            <button type="submit" className="btn-primary w-full">
              Create Canvas
            </button>
          ) : (
            <div className="form-row">
              <button
                type="button"
                className="btn-secondary flex-1"
                onClick={handleUpdate}
              >
                <RefreshCw size={14} />
                Resize
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

export default CanvasSetup;
