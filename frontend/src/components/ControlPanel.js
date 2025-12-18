import React, { useState } from "react";
import { Settings, Square, Type, Image as ImageIcon } from "lucide-react";
import CanvasSetup from "./CanvasSetup";
import ShapeControls from "./ShapeControls";
import TextControls from "./TextControls";
import ImageControls from "./ImageControls";

function ControlPanel({
  canvasService,
  canvasId,
  canvasDimensions,
  onCanvasInitialized,
  onCanvasUpdated,
  onElementsUpdated,
  onError,
}) {
  const [activeTab, setActiveTab] = useState("setup");

  const handleInitialize = async (width, height) => {
    try {
      const canvas = await canvasService.createCanvas(width, height);
      onCanvasInitialized(canvas.id, { width, height });
    } catch (err) {
      onError(err.message);
    }
  };

  const handleUpdateDimensions = async (width, height) => {
    try {
      await canvasService.updateCanvas(canvasId, width, height);
      onCanvasUpdated({ width, height });
    } catch (err) {
      onError(err.message);
    }
  };

  return (
    <div className="control-panel-content">
      <h2>Controls</h2>
      
      {canvasId && (
        <div className="mobile-tabs">
          <button 
            className={`tab-btn ${activeTab === "setup" ? "active" : ""}`}
            onClick={() => setActiveTab("setup")}
          >
            <Settings size={18} />
            Setup
          </button>
          <button 
            className={`tab-btn ${activeTab === "shapes" ? "active" : ""}`}
            onClick={() => setActiveTab("shapes")}
          >
            <Square size={18} />
            Shapes
          </button>
          <button 
            className={`tab-btn ${activeTab === "content" ? "active" : ""}`}
            onClick={() => setActiveTab("content")}
          >
            <Type size={18} />
            Content
          </button>
        </div>
      )}

      <div className={`control-section ${activeTab === "setup" ? "active" : ""}`}>
        <CanvasSetup
          width={canvasDimensions.width}
          height={canvasDimensions.height}
          hasCanvas={!!canvasId}
          onInitialize={handleInitialize}
          onUpdateDimensions={handleUpdateDimensions}
        />
      </div>

      {canvasId && (
        <>
          <div className={`control-section ${activeTab === "shapes" ? "active" : ""}`}>
            <ShapeControls
              canvasService={canvasService}
              canvasId={canvasId}
              onElementsUpdated={onElementsUpdated}
              onError={onError}
            />
          </div>
          <div className={`control-section ${activeTab === "content" ? "active" : ""}`}>
            <TextControls
              canvasService={canvasService}
              canvasId={canvasId}
              onElementsUpdated={onElementsUpdated}
              onError={onError}
            />
            <ImageControls
              canvasService={canvasService}
              canvasId={canvasId}
              onElementsUpdated={onElementsUpdated}
              onError={onError}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default ControlPanel;
