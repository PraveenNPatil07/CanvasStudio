import React from "react";
import { Layout, Maximize, Layers, Menu } from "lucide-react";

function Header({ canvasDimensions, elementCount, hasCanvas, toggleSidebar }) {
  return (
    <header className="header">
      <div className="header-content">
        <div style={{ display: "flex", alignItems: "center" }}>
          <button
            className="mobile-nav-toggle"
            onClick={toggleSidebar}
            aria-label="Toggle Sidebar"
          >
            <Menu size={24} />
          </button>
          <h1>
            <Layout className="text-primary" size={24} />
            <span>Canvas Builder</span>
          </h1>
        </div>
        {hasCanvas && (
          <div className="canvas-info fade-in">
            <span className="hidden-mobile">
              <Maximize size={14} />
              {canvasDimensions.width} × {canvasDimensions.height}px
            </span>
            <span className="visible-mobile">
              <Maximize size={14} />
              {canvasDimensions.width}×{canvasDimensions.height}
            </span>
            <span>
              <Layers size={14} />
              {elementCount} Elements
            </span>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
