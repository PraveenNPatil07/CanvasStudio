import React, { useState, useEffect } from "react";
import { Maximize2, Lock, Unlock, RefreshCw } from "lucide-react";

function CanvasSetup({
  width,
  height,
  hasCanvas,
  onInitialize,
  onUpdateDimensions,
}) {
  const [w, setW] = useState(width || 800);
  const [h, setH] = useState(height || 600);
  const [isLocked, setIsLocked] = useState(false);
  const [ratio, setRatio] = useState(width / height || 4 / 3);

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

  return (
    <div className="control-group fade-in">
      <h3>
        <Maximize2 size={16} />
        Canvas Dimensions
      </h3>

      <form onSubmit={handleSubmit} className="form-section">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="width">Width</label>
            <div style={{ position: "relative" }}>
              <input
                type="number"
                id="width"
                value={w}
                onChange={(e) => handleWidthChange(e.target.value)}
                min="100"
                max="2000"
                style={{ paddingRight: "2.5rem" }}
              />
              <span
                style={{
                  position: "absolute",
                  right: "0.75rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: "0.75rem",
                  color: "var(--text-muted)",
                  pointerEvents: "none",
                }}
              >
                px
              </span>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="height">Height</label>
            <div style={{ position: "relative" }}>
              <input
                type="number"
                id="height"
                value={h}
                onChange={(e) => handleHeightChange(e.target.value)}
                min="100"
                max="2000"
                style={{ paddingRight: "2.5rem" }}
              />
              <span
                style={{
                  position: "absolute",
                  right: "0.75rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: "0.75rem",
                  color: "var(--text-muted)",
                  pointerEvents: "none",
                }}
              >
                px
              </span>
            </div>
          </div>
        </div>

        <div className="resizer">
          <button
            type="button"
            className={`secondary aspect-ratio-toggle ${
              isLocked ? "active" : ""
            }`}
            onClick={toggleLock}
            title={isLocked ? "Unlock Aspect Ratio" : "Lock Aspect Ratio"}
          >
            {isLocked ? <Lock size={14} /> : <Unlock size={14} />}
            {isLocked ? "Locked" : "Unlocked"}
          </button>

          {hasCanvas ? (
            <button
              type="button"
              onClick={handleUpdate}
              className="secondary"
              style={{ flex: 1 }}
            >
              <RefreshCw size={14} />
              Update
            </button>
          ) : (
            <button type="submit" style={{ flex: 1 }}>
              Initialize Canvas
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default CanvasSetup;
