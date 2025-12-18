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
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const handleCanvasInitialized = (id, dimensions) => {
    setCanvasId(id);
    setCanvasDimensions(dimensions);
    setError(null);
    closeSidebar();
  };

  const handleCanvasUpdated = (dimensions) => {
    setCanvasDimensions(dimensions);
  };

  const handleElementsUpdated = (updatedElements) => {
    setElements(updatedElements);
  };

  const handleError = (error) => {
    setError(error);
  };

  return (
    <div className="app">
      <Header
        canvasDimensions={canvasDimensions}
        elementCount={elements.length}
        hasCanvas={!!canvasId}
        toggleSidebar={toggleSidebar}
      />
      <MainLayout
        canvasService={canvasService}
        canvasId={canvasId}
        canvasDimensions={canvasDimensions}
        elements={elements}
        onCanvasInitialized={handleCanvasInitialized}
        onCanvasUpdated={handleCanvasUpdated}
        onElementsUpdated={handleElementsUpdated}
        onError={handleError}
        isSidebarOpen={isSidebarOpen}
        closeSidebar={closeSidebar}
      />
      {error && (
        <div className="error-toast">
          <span>{error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}
    </div>
  );
}

export default App;
