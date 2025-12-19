import React from "react";
import {
  Maximize2,
  Minimize2,
  Trash2,
  Square,
  Circle,
  Type,
  Image as ImageIcon,
} from "lucide-react";

function LayersPanel({ elements, selectedIds, onSelect, onReorder, onDelete }) {
  const getElementName = (el) => {
    switch (el.type) {
      case "rectangle":
        return "Rectangle";
      case "circle":
        return "Circle";
      case "text":
        return `Text: ${el.content.substring(0, 15)}${
          el.content.length > 15 ? "..." : ""
        }`;
      case "image":
        return "Image";
      default:
        return "Element";
    }
  };

  return (
    <div className="layers-container">
      <div className="layers-toolbar">
        <button
          className="btn-tertiary btn-icon-sm"
          onClick={() => onReorder("front")}
          disabled={selectedIds.length === 0}
          title="Bring to Front"
        >
          <Maximize2 size={14} />
        </button>
        <button
          className="btn-tertiary btn-icon-sm"
          onClick={() => onReorder("back")}
          disabled={selectedIds.length === 0}
          title="Send to Back"
        >
          <Minimize2 size={14} />
        </button>
        <div className="flex-1" />
        <button
          className="btn-tertiary btn-icon-sm delete-btn"
          onClick={() => onDelete()}
          disabled={selectedIds.length === 0}
          title="Delete Selected"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="layers-list">
        {elements.length === 0 ? (
          <div className="empty-state-small">
            <p>No layers yet</p>
          </div>
        ) : (
          [...elements].reverse().map((el) => (
            <div
              key={el.id}
              className={`layer-item ${
                selectedIds.includes(el.id) ? "active" : ""
              }`}
              onClick={(e) => {
                if (e.shiftKey) {
                  onSelect(
                    selectedIds.includes(el.id)
                      ? selectedIds.filter((id) => id !== el.id)
                      : [...selectedIds, el.id]
                  );
                } else {
                  onSelect([el.id]);
                }
              }}
            >
              <span className="layer-icon">
                {el.type === "rectangle" && <Square size={12} />}
                {el.type === "circle" && <Circle size={12} />}
                {el.type === "text" && <Type size={12} />}
                {el.type === "image" && <ImageIcon size={12} />}
              </span>
              <span className="layer-name">{getElementName(el)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default LayersPanel;
