import React from "react";
import ControlPanel from "./ControlPanel";
import CanvasWorkspace from "./CanvasWorkspace";

function MainLayout({
  canvasService,
  canvasId,
  canvasDimensions,
  canvasTitle,
  elements,
  selectedIds,
  onCanvasInitialized,
  onCanvasUpdated,
  onElementsUpdated,
  setSelectedIds,
  onError,
  isSidebarOpen,
  closeSidebar,
}) {
  const sanitizeFilename = (title) => {
    return title.trim().replace(/[<>:"/\\|?*]/g, "") || "untitled-design";
  };

  const handleExportPNG = () => {
    const canvas = document.querySelector(".canvas-preview canvas");
    if (!canvas) {
      onError("Canvas not found for export.");
      return;
    }

    try {
      const link = document.createElement("a");
      const filename = sanitizeFilename(canvasTitle);
      link.download = `${filename}-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Export failed:", err);
      onError(
        "Export failed. This might be due to external images without proper cross-origin settings."
      );
    }
  };

  const handleExportPDF = async () => {
    if (!canvasId) return;
    try {
      const blob = await canvasService.exportPDF(canvasId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      const filename = sanitizeFilename(canvasTitle);
      a.href = url;
      a.download = `${filename}-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      console.error("PDF Export failed:", err);
      onError("Failed to export PDF: " + err.message);
    }
  };

  return (
    <div className={`main-layout ${isSidebarOpen ? "sidebar-open" : ""}`}>
      <ControlPanel
        canvasService={canvasService}
        canvasId={canvasId}
        canvasDimensions={canvasDimensions}
        elements={elements}
        selectedIds={selectedIds}
        onCanvasInitialized={onCanvasInitialized}
        onCanvasUpdated={onCanvasUpdated}
        onElementsUpdated={onElementsUpdated}
        setSelectedIds={setSelectedIds}
        onError={onError}
        onExportPNG={handleExportPNG}
        onExportPDF={handleExportPDF}
      />
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar} />
      )}
      <CanvasWorkspace
        canvasService={canvasService}
        canvasId={canvasId}
        canvasDimensions={canvasDimensions}
        elements={elements}
        selectedIds={selectedIds}
        onElementsUpdated={onElementsUpdated}
        setSelectedIds={setSelectedIds}
        onError={onError}
      />
    </div>
  );
}

export default MainLayout;
