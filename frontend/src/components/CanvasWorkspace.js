import React, { useState, useRef, useEffect } from "react";
import CanvasPreview from "./CanvasPreview";
import ExportControls from "./ExportControls";

function CanvasWorkspace({
  canvasService,
  canvasId,
  canvasDimensions,
  elements,
  onElementsUpdated,
  onError,
}) {
  const [scale, setScale] = useState(1);
  const containerRef = useRef(null);

  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const padding = window.innerWidth < 768 ? 20 : 40;
      const containerWidth = containerRef.current.clientWidth - padding;
      const containerHeight = containerRef.current.clientHeight - padding;
      setScale(
        Math.min(
          containerWidth / canvasDimensions.width,
          containerHeight / canvasDimensions.height,
          1
        )
      );
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    const observer = new ResizeObserver(updateScale);
    if (containerRef.current) observer.observe(containerRef.current);

    return () => {
      window.removeEventListener("resize", updateScale);
      observer.disconnect();
    };
  }, [canvasDimensions.width, canvasDimensions.height]);

  return (
    <div className="canvas-workspace">
      <div style={{ position: "relative", width: "100%" }}>
        <div className="canvas-preview-container" ref={containerRef}>
          <div className="canvas-preview-wrapper">
            <CanvasPreview
              canvasService={canvasService}
              canvasId={canvasId}
              width={canvasDimensions.width}
              height={canvasDimensions.height}
              elements={elements}
              onElementsUpdated={onElementsUpdated}
              scale={scale}
            />
          </div>
        </div>
      </div>
      <ExportControls
        canvasService={canvasService}
        canvasId={canvasId}
        onError={onError}
      />
    </div>
  );
}

export default CanvasWorkspace;
