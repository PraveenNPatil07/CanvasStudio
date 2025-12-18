import React from "react";
import ControlPanel from "./ControlPanel";
import CanvasWorkspace from "./CanvasWorkspace";

function MainLayout({
  canvasService,
  canvasId,
  canvasDimensions,
  elements,
  onCanvasInitialized,
  onCanvasUpdated,
  onElementsUpdated,
  onError,
  isSidebarOpen,
  closeSidebar,
}) {
  return (
    <div className="main-layout">
      <div
        className={`sidebar-overlay ${isSidebarOpen ? "is-open" : ""}`}
        onClick={closeSidebar}
      />
      <div className={`control-panel ${isSidebarOpen ? "is-open" : ""}`}>
        <ControlPanel
          canvasService={canvasService}
          canvasId={canvasId}
          canvasDimensions={canvasDimensions}
          onCanvasInitialized={onCanvasInitialized}
          onCanvasUpdated={onCanvasUpdated}
          onElementsUpdated={onElementsUpdated}
          onError={onError}
        />
      </div>
      <CanvasWorkspace
        canvasService={canvasService}
        canvasId={canvasId}
        canvasDimensions={canvasDimensions}
        elements={elements}
        onElementsUpdated={onElementsUpdated}
        onError={onError}
      />
    </div>
  );
}

export default MainLayout;
