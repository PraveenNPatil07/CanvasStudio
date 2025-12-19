import React from "react";
import { Type } from "lucide-react";

function TextControls({ canvasService, canvasId, onElementsUpdated, onError }) {
  const addText = async (type) => {
    try {
      let content = "Click to add text";
      let fontSize = 24;
      const defaultColor = "#0e1318"; // Matches --text-main

      if (type === "heading") {
        content = "Add a heading";
        fontSize = 42;
      } else if (type === "subheading") {
        content = "Add a subheading";
        fontSize = 28;
      } else if (type === "body") {
        content = "Add a little bit of body text";
        fontSize = 18;
      }

      const response = await canvasService.addText(
        canvasId,
        content,
        100,
        100,
        fontSize,
        defaultColor
      );
      onElementsUpdated(response.elements);
    } catch (error) {
      onError(error.message);
    }
  };

  return (
    <div className="creation-group">
      <div className="creation-stack">
        <button
          className="btn-tertiary creation-btn text-btn heading"
          onClick={() => addText("heading")}
        >
          <Type size={24} />
          <span>Add a heading</span>
        </button>
        <button
          className="btn-tertiary creation-btn text-btn subheading"
          onClick={() => addText("subheading")}
        >
          <Type size={20} />
          <span>Add a subheading</span>
        </button>
        <button
          className="btn-tertiary creation-btn text-btn body"
          onClick={() => addText("body")}
        >
          <Type size={16} />
          <span>Add body text</span>
        </button>
      </div>
    </div>
  );
}

export default TextControls;
