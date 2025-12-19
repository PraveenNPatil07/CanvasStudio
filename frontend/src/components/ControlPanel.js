import React from "react";
import { Layers, Plus, Layout, Palette } from "lucide-react";
import CanvasSetup from "./CanvasSetup";
import ShapeControls from "./ShapeControls";
import TextControls from "./TextControls";
import ImageControls from "./ImageControls";
import LayersPanel from "./LayersPanel";
import PropertyPanel from "./PropertyPanel";

function ControlPanel({
  canvasService,
  canvasId,
  canvasDimensions,
  elements,
  selectedIds,
  onCanvasInitialized,
  onCanvasUpdated,
  onElementsUpdated,
  setSelectedIds,
  onError,
  onExportPNG,
  onExportPDF,
}) {
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

  const handleReorder = async (direction) => {
    if (selectedIds.length === 0) return;

    let newElements = [...elements];
    const selectedIndices = selectedIds
      .map((id) => newElements.findIndex((el) => el.id === id))
      .sort((a, b) => a - b);

    if (direction === "front") {
      const selected = selectedIndices.map((i) => newElements[i]);
      const remaining = newElements.filter(
        (_, i) => !selectedIndices.includes(i)
      );
      newElements = [...remaining, ...selected];
    } else if (direction === "back") {
      const selected = selectedIndices.map((i) => newElements[i]);
      const remaining = newElements.filter(
        (_, i) => !selectedIndices.includes(i)
      );
      newElements = [...selected, ...remaining];
    } else if (direction === "forward") {
      for (let i = selectedIndices.length - 1; i >= 0; i--) {
        const idx = selectedIndices[i];
        if (
          idx < newElements.length - 1 &&
          !selectedIndices.includes(idx + 1)
        ) {
          [newElements[idx], newElements[idx + 1]] = [
            newElements[idx + 1],
            newElements[idx],
          ];
        }
      }
    } else if (direction === "backward") {
      for (let i = 0; i < selectedIndices.length; i++) {
        const idx = selectedIndices[i];
        if (idx > 0 && !selectedIndices.includes(idx - 1)) {
          [newElements[idx], newElements[idx - 1]] = [
            newElements[idx - 1],
            newElements[idx],
          ];
        }
      }
    }

    try {
      const res = await canvasService.syncElements(canvasId, newElements);
      onElementsUpdated(res.elements);
    } catch (err) {
      onError("Reorder failed: " + err.message);
    }
  };

  const handleDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm("Delete selected elements?")) return;

    try {
      const res = await canvasService.deleteElements(canvasId, selectedIds);
      onElementsUpdated(res.elements);
      setSelectedIds([]);
    } catch (err) {
      onError("Delete failed: " + err.message);
    }
  };

  return (
    <aside className="app-sidebar">
      <div className="sidebar-content">
        <section className="sidebar-section">
          <header className="sidebar-section-title">
            <Layout size={16} />
            Design
          </header>
          <CanvasSetup
            width={canvasDimensions.width}
            height={canvasDimensions.height}
            hasCanvas={!!canvasId}
            onInitialize={handleInitialize}
            onUpdateDimensions={handleUpdateDimensions}
            onExportPNG={onExportPNG}
            onExportPDF={onExportPDF}
          />
        </section>

        {canvasId && (
          <>
            <section className="sidebar-section">
              <header className="sidebar-section-title">
                <Plus size={16} />
                Create
              </header>
              <div className="creation-stack">
                <ShapeControls
                  canvasService={canvasService}
                  canvasId={canvasId}
                  onElementsUpdated={onElementsUpdated}
                  onError={onError}
                />
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
            </section>

            <section className="sidebar-section">
              <header className="sidebar-section-title">
                <Layers size={16} />
                Layers
              </header>
              <LayersPanel
                elements={elements}
                selectedIds={selectedIds}
                onSelect={setSelectedIds}
                onReorder={handleReorder}
                onDelete={handleDelete}
              />
            </section>

            {selectedIds.length > 0 && (
              <section className="sidebar-section properties-section">
                <header className="sidebar-section-title">
                  <Palette size={16} />
                  Properties
                </header>
                <PropertyPanel
                  selectedIds={selectedIds}
                  elements={elements}
                  canvasService={canvasService}
                  canvasId={canvasId}
                  onElementsUpdated={onElementsUpdated}
                  onError={onError}
                />
              </section>
            )}
          </>
        )}
      </div>
    </aside>
  );
}

export default ControlPanel;
