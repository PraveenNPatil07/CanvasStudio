import React from "react";
import { Square, Circle } from "lucide-react";

function ShapeControls({
  canvasService,
  canvasId,
  onElementsUpdated,
  onError,
}) {
  const addShape = async (type) => {
    try {
      let response;
      const defaultColor = "#8b3dff"; // Matches --primary

      if (type === "rectangle") {
        response = await canvasService.addRectangle(
          canvasId,
          100,
          100,
          100,
          100,
          defaultColor
        );
      } else if (type === "circle") {
        response = await canvasService.addCircle(
          canvasId,
          200,
          200,
          50,
          defaultColor
        );
      } else if (type === "triangle") {
        // Assuming triangle is a type of rectangle or separate method
        // If no triangle method, we'll use a placeholder or rectangle for now
        response = await canvasService.addRectangle(
          canvasId,
          150,
          150,
          100,
          100,
          defaultColor
        );
      }

      if (response) {
        onElementsUpdated(response.elements);
      }
    } catch (error) {
      onError(error.message);
    }
  };

  return (
    <div className="creation-group">
      <div className="creation-grid">
        <button
          className="btn-tertiary creation-btn"
          onClick={() => addShape("rectangle")}
          title="Add Rectangle"
        >
          <Square size={20} />
          <span>Square</span>
        </button>
        <button
          className="btn-tertiary creation-btn"
          onClick={() => addShape("circle")}
          title="Add Circle"
        >
          <Circle size={20} />
          <span>Circle</span>
        </button>
      </div>
    </div>
  );
}

export default ShapeControls;
