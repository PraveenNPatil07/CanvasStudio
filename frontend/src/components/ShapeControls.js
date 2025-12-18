import React, { useState } from "react";
import { Square, Circle, Plus, Palette, Move, Maximize } from "lucide-react";

function ShapeControls({
  canvasService,
  canvasId,
  onElementsUpdated,
  onError,
}) {
  const [shapeType, setShapeType] = useState("rectangle");
  const [formData, setFormData] = useState({
    x: 50,
    y: 50,
    width: 100,
    height: 100,
    radius: 50,
    color: "#6366f1",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let response;
      if (shapeType === "rectangle") {
        response = await canvasService.addRectangle(
          canvasId,
          formData.x,
          formData.y,
          formData.width,
          formData.height,
          formData.color
        );
      } else {
        response = await canvasService.addCircle(
          canvasId,
          formData.x,
          formData.y,
          formData.radius,
          formData.color
        );
      }
      onElementsUpdated(response.elements);
    } catch (error) {
      onError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="control-section fade-in">
      <h3>
        <Square size={16} />
        Add Shape
      </h3>

      <form onSubmit={handleSubmit} className="form-section">
        <div className="form-group">
          <label>Shape Type</label>
          <div className="radio-group">
            <label className={shapeType === "rectangle" ? "active" : ""}>
              <input
                type="radio"
                value="rectangle"
                checked={shapeType === "rectangle"}
                onChange={(e) => setShapeType(e.target.value)}
              />
              <Square size={14} />
              Rectangle
            </label>
            <label className={shapeType === "circle" ? "active" : ""}>
              <input
                type="radio"
                value="circle"
                checked={shapeType === "circle"}
                onChange={(e) => setShapeType(e.target.value)}
              />
              <Circle size={14} />
              Circle
            </label>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>
              <Move size={14} />X Position
            </label>
            <input
              type="number"
              min="0"
              value={formData.x}
              onChange={(e) => handleInputChange("x", parseInt(e.target.value))}
              required
            />
          </div>
          <div className="form-group">
            <label>
              <Move size={14} />Y Position
            </label>
            <input
              type="number"
              min="0"
              value={formData.y}
              onChange={(e) => handleInputChange("y", parseInt(e.target.value))}
              required
            />
          </div>
        </div>

        {shapeType === "rectangle" ? (
          <div className="form-row">
            <div className="form-group">
              <label>
                <Maximize size={14} />
                Width
              </label>
              <input
                type="number"
                min="1"
                value={formData.width}
                onChange={(e) =>
                  handleInputChange("width", parseInt(e.target.value))
                }
                required
              />
            </div>
            <div className="form-group">
              <label>
                <Maximize size={14} />
                Height
              </label>
              <input
                type="number"
                min="1"
                value={formData.height}
                onChange={(e) =>
                  handleInputChange("height", parseInt(e.target.value))
                }
                required
              />
            </div>
          </div>
        ) : (
          <div className="form-group">
            <label>
              <Maximize size={14} />
              Radius
            </label>
            <input
              type="number"
              min="1"
              value={formData.radius}
              onChange={(e) =>
                handleInputChange("radius", parseInt(e.target.value))
              }
              required
            />
          </div>
        )}

        <div className="form-group">
          <label>
            <Palette size={14} />
            Fill Color
          </label>
          <input
            type="color"
            value={formData.color}
            onChange={(e) => handleInputChange("color", e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="btn-block"
          disabled={isLoading || !canvasId}
        >
          <Plus size={16} />
          {isLoading ? "Adding..." : "Add Shape"}
        </button>
      </form>
    </div>
  );
}

export default ShapeControls;
