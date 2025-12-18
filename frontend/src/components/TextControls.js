import React, { useState } from "react";
import { Type, Plus, Palette, Move, Type as TypeIcon } from "lucide-react";

function TextControls({ canvasService, canvasId, onElementsUpdated, onError }) {
  const [formData, setFormData] = useState({
    content: "",
    x: 100,
    y: 100,
    fontSize: 24,
    color: "#0f172a",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await canvasService.addText(
        canvasId,
        formData.content,
        formData.x,
        formData.y,
        formData.fontSize,
        formData.color
      );
      onElementsUpdated(response.elements);
      setFormData((prev) => ({ ...prev, content: "" }));
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
        <Type size={16} />
        Add Text
      </h3>

      <form onSubmit={handleSubmit} className="form-section">
        <div className="form-group">
          <label>
            <TypeIcon size={14} />
            Text Content
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => handleInputChange("content", e.target.value)}
            placeholder="Type something..."
            rows="2"
            required
          />
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

        <div className="form-row">
          <div className="form-group">
            <label>
              <TypeIcon size={14} />
              Font Size
            </label>
            <input
              type="number"
              min="8"
              max="128"
              value={formData.fontSize}
              onChange={(e) =>
                handleInputChange("fontSize", parseInt(e.target.value))
              }
              required
            />
          </div>
          <div className="form-group">
            <label>
              <Palette size={14} />
              Color
            </label>
            <input
              type="color"
              value={formData.color}
              onChange={(e) => handleInputChange("color", e.target.value)}
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn-block"
          disabled={isLoading || !formData.content.trim() || !canvasId}
        >
          <Plus size={16} />
          {isLoading ? "Adding..." : "Add Text"}
        </button>
      </form>
    </div>
  );
}

export default TextControls;
