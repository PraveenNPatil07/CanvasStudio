import React, { useState } from "react";
import Header from "./components/Header";
import MainLayout from "./components/MainLayout";
import CanvasService from "./services/canvasService";
import "./App.css";

function App() {
  const [canvasService] = useState(() => new CanvasService());
  const [canvasId, setCanvasId] = useState(null);
  const [canvasDimensions, setCanvasDimensions] = useState({
    width: 800,
    height: 600,
  });
  const [elements, setElements] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [canvasTitle, setCanvasTitle] = useState("Untitled Design");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const handleCanvasInitialized = (id, dimensions) => {
    setCanvasId(id);
    setCanvasDimensions(dimensions);
    setErrorMessage("");
    closeSidebar();
  };

  const handleCanvasUpdated = (dimensions) => {
    setCanvasDimensions(dimensions);
  };

  const handleElementsUpdated = (updatedElements) => {
    setElements(updatedElements);
  };

  return (
    <div className="app">
      <Header
        canvasDimensions={canvasDimensions}
        elementCount={elements.length}
        hasCanvas={!!canvasId}
        toggleSidebar={toggleSidebar}
        canvasTitle={canvasTitle}
        onTitleChange={setCanvasTitle}
      />
      <MainLayout
        canvasService={canvasService}
        canvasId={canvasId}
        canvasDimensions={canvasDimensions}
        canvasTitle={canvasTitle}
        elements={elements}
        selectedIds={selectedIds}
        onCanvasInitialized={handleCanvasInitialized}
        onCanvasUpdated={handleCanvasUpdated}
        onElementsUpdated={handleElementsUpdated}
        setSelectedIds={setSelectedIds}
        onError={setErrorMessage}
        isSidebarOpen={isSidebarOpen}
        closeSidebar={() => setIsSidebarOpen(false)}
      />
      {errorMessage && (
        <div className="error-toast">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage("")}>×</button>
        </div>
      )}
    </div>
  );
}

export default App;
