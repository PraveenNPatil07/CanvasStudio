import React, { useState, useRef, useEffect } from "react";
import { Plus, Minus } from "lucide-react";
import CanvasPreview from "./CanvasPreview";

function CanvasWorkspace({
  canvasService,
  canvasId,
  canvasDimensions,
  elements,
  selectedIds,
  onElementsUpdated,
  setSelectedIds,
  onError,
}) {
  const [scale, setScale] = useState(1);
  const containerRef = useRef(null);

  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const padding = 80; // More padding for Canva feel
      const containerWidth = containerRef.current.clientWidth - padding;
      const containerHeight = containerRef.current.clientHeight - padding;

      if (
        !canvasDimensions.width ||
        !canvasDimensions.height ||
        containerWidth <= 0 ||
        containerHeight <= 0
      ) {
        setScale(0.8);
        return;
      }

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

  const handleZoom = (delta) => {
    setScale((prev) => Math.min(Math.max(prev + delta, 0.1), 5));
  };

  return (
    <div className="canvas-workspace" ref={containerRef}>
      <div
        className="canvas-container-wrapper"
        style={{
          width: canvasDimensions.width * scale,
          height: canvasDimensions.height * scale,
        }}
      >
        <CanvasPreview
          canvasService={canvasService}
          canvasId={canvasId}
          width={canvasDimensions.width}
          height={canvasDimensions.height}
          elements={elements}
          selectedIds={selectedIds}
          onElementsUpdated={onElementsUpdated}
          setSelectedIds={setSelectedIds}
          scale={scale}
        />
      </div>

      {/* Floating Zoom Controls */}
      <div className="zoom-controls">
        <button onClick={() => handleZoom(-0.1)} title="Zoom Out">
          <Minus size={18} strokeWidth={2.5} color="currentColor" />
        </button>
        <span className="zoom-level">{Math.round(scale * 100)}%</span>
        <button onClick={() => handleZoom(0.1)} title="Zoom In">
          <Plus size={18} strokeWidth={2.5} color="currentColor" />
        </button>
      </div>
    </div>
  );
}

export default CanvasWorkspace;
