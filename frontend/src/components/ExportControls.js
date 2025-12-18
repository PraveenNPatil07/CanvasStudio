import React, { useState } from "react";
import { Download, FileText } from "lucide-react";

function ExportControls({ canvasService, canvasId, onError }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = async () => {
    if (!canvasId) {
      onError("Canvas not initialized. Please create a canvas first.");
      return;
    }

    setIsLoading(true);
    try {
      const blob = await canvasService.exportPDF(canvasId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `canvas-export-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      onError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="action-bar">
      <button
        onClick={handleExport}
        disabled={isLoading || !canvasId}
        style={{ minWidth: "200px" }}
      >
        {isLoading ? (
          <>
            <span className="spinner" />
            Exporting...
          </>
        ) : (
          <>
            <FileText size={18} />
            Export as PDF
            <Download size={14} style={{ marginLeft: "auto", opacity: 0.7 }} />
          </>
        )}
      </button>
    </div>
  );
}

export default ExportControls;
