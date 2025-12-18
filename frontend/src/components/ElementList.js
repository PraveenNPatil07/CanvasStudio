import React from 'react';

function ElementList({ elements }) {
  if (!elements || elements.length === 0) {
    return (
      <div className="element-list empty">
        <h3>Elements</h3>
        <p>No elements added yet.</p>
      </div>
    );
  }

  return (
    <div className="element-list">
      <h3>Elements ({elements.length})</h3>
      <div className="element-items">
        {elements.map((element, index) => (
          <div key={index} className="element-item">
            <span className="element-type">{element.type}</span>
            <span className="element-details">
              {element.type === 'text' ? `"${element.content.substring(0, 20)}..."` : `(${element.x}, ${element.y})`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ElementList;
