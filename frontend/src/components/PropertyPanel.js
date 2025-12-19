import React, { useEffect, useState } from "react";
import { Type, Palette, Move, Maximize } from "lucide-react";

function PropertyPanel({
  selectedIds,
  elements,
  canvasService,
  canvasId,
  onElementsUpdated,
  onError,
}) {
  const [properties, setProperties] = useState(null);
  const [isBulk, setIsBulk] = useState(false);

  useEffect(() => {
    if (selectedIds.length === 1) {
      const el = elements.find((e) => e.id === selectedIds[0]);
      if (el) {
        setProperties({ ...el });
        setIsBulk(false);
      }
    } else if (selectedIds.length > 1) {
      const selectedElements = elements.filter((e) =>
        selectedIds.includes(e.id)
      );
      // Check if all selected elements share the same type or color
      const commonType = selectedElements.every(
        (e) => e.type === selectedElements[0].type
      )
        ? selectedElements[0].type
        : "mixed";
      const commonColor = selectedElements.every(
        (e) => e.color === selectedElements[0].color
      )
        ? selectedElements[0].color
        : "";

      setProperties({ type: commonType, color: commonColor });
      setIsBulk(true);
    } else {
      setProperties(null);
    }
  }, [selectedIds, elements]);

  const handleChange = async (field, value) => {
    const newProps = { ...properties, [field]: value };
    setProperties(newProps);

    try {
      let updates = [];
      if (isBulk) {
        updates = selectedIds.map((id) => ({ id, [field]: value }));
      } else {
        updates = [{ id: properties.id, [field]: value }];
      }

      const res = await canvasService.updateElements(canvasId, updates);
      onElementsUpdated(res.elements);
    } catch (err) {
      onError("Update failed: " + err.message);
    }
  };

  if (!properties) {
    return (
      <div className="control-group empty-state">
        <p>Select an element to edit its properties.</p>
      </div>
    );
  }

  return (
    <div className="property-container fade-in">
      <div className="form-section">
        {/* Color Property (Common to all except images) */}
        {properties.type !== "image" && (
          <div className="form-group">
            <label>
              <Palette size={14} /> Color
            </label>
            <div className="color-picker-group">
              <input
                type="color"
                value={properties.color || "#0e1318"}
                onChange={(e) => handleChange("color", e.target.value)}
                className="color-input"
              />
              <input
                type="text"
                value={(properties.color || "#0e1318").toUpperCase()}
                onChange={(e) => handleChange("color", e.target.value)}
                className="color-hex"
                placeholder="#0E1318"
              />
            </div>
          </div>
        )}

        {/* Text Specific Properties */}
        {!isBulk && properties.type === "text" && (
          <div className="form-group">
            <label>
              <Type size={14} /> Text
            </label>
            <textarea
              value={properties.content}
              onChange={(e) => handleChange("content", e.target.value)}
              rows="3"
            />
          </div>
        )}

        {properties.type === "text" && (
          <div className="form-group">
            <label>
              <Type size={14} /> Font Size
            </label>
            <input
              type="number"
              value={properties.fontSize}
              onChange={(e) =>
                handleChange("fontSize", parseInt(e.target.value) || 12)
              }
              min="1"
            />
          </div>
        )}

        {/* Position & Size (Single selection only) */}
        {!isBulk && (
          <>
            <div className="form-row">
              <div className="form-group">
                <label>
                  <Move size={14} /> X
                </label>
                <input
                  type="number"
                  value={Math.round(properties.x)}
                  onChange={(e) =>
                    handleChange("x", parseInt(e.target.value) || 0)
                  }
                />
              </div>
              <div className="form-group">
                <label>
                  <Move size={14} /> Y
                </label>
                <input
                  type="number"
                  value={Math.round(properties.y)}
                  onChange={(e) =>
                    handleChange("y", parseInt(e.target.value) || 0)
                  }
                />
              </div>
            </div>

            <div className="form-row">
              {properties.type === "circle" ? (
                <div className="form-group">
                  <label>
                    <Maximize size={14} /> Radius
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={Math.round(properties.radius)}
                    onChange={(e) =>
                      handleChange(
                        "radius",
                        Math.max(1, parseInt(e.target.value) || 1)
                      )
                    }
                  />
                </div>
              ) : (
                <>
                  <div className="form-group">
                    <label>
                      <Maximize size={14} /> Width
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={Math.round(properties.width)}
                      onChange={(e) =>
                        handleChange(
                          "width",
                          Math.max(1, parseInt(e.target.value) || 1)
                        )
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      <Maximize size={14} /> Height
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={Math.round(properties.height)}
                      onChange={(e) =>
                        handleChange(
                          "height",
                          Math.max(1, parseInt(e.target.value) || 1)
                        )
                      }
                    />
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default PropertyPanel;
