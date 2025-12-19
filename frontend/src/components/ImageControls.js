import React, { useState } from "react";
import { Image as ImageIcon, Plus, Move, Maximize } from "lucide-react";

function ImageControls({
  canvasService,
  canvasId,
  onElementsUpdated,
  onError,
}) {
  const [formData, setFormData] = useState({
    url: "",
    x: 150,
    y: 150,
    width: 200,
    height: 200,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await canvasService.addImage(
        canvasId,
        formData.url,
        formData.x,
        formData.y,
        formData.width,
        formData.height
      );
      onElementsUpdated(response.elements);
      setFormData((prev) => ({ ...prev, url: "" }));
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
    <div className="control-group fade-in">
      <h3>
        <ImageIcon size={16} />
        Add Image
      </h3>

      <form onSubmit={handleSubmit} className="form-section">
        <div className="form-group">
          <label>
            <ImageIcon size={14} />
            Image URL
          </label>
          <input
            type="url"
            placeholder="https://example.com/image.jpg"
            value={formData.url}
            onChange={(e) => handleInputChange("url", e.target.value)}
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
              <Maximize size={14} />
              Width
            </label>
            <input
              type="number"
              min="10"
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
              min="10"
              value={formData.height}
              onChange={(e) =>
                handleInputChange("height", parseInt(e.target.value))
              }
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !formData.url.trim() || !canvasId}
        >
          <Plus size={16} />
          {isLoading ? "Adding..." : "Add Image"}
        </button>
      </form>
    </div>
  );
}

export default ImageControls;
