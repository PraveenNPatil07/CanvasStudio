import React, { useState } from "react";
import { Plus } from "lucide-react";

function ImageControls({
  canvasService,
  canvasId,
  onElementsUpdated,
  onError,
}) {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAddImage = async (e) => {
    e.preventDefault();
    if (!url) return;
    setIsLoading(true);

    try {
      const response = await canvasService.addImage(
        canvasId,
        url,
        150,
        150,
        200,
        200
      );
      onElementsUpdated(response.elements);
      setUrl("");
    } catch (error) {
      onError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="creation-group">
      <form onSubmit={handleAddImage} className="image-add-form">
        <div className="input-with-button">
          <input
            type="url"
            placeholder="Paste image URL..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
          <button
            type="submit"
            className="btn-primary btn-icon-sm"
            disabled={isLoading || !url}
            title="Add Image"
          >
            {isLoading ? <span className="spinner-sm" /> : <Plus size={18} />}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ImageControls;
