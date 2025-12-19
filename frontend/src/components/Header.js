import React from "react";
import { Menu } from "lucide-react";

function Header({
  canvasDimensions,
  elementCount,
  hasCanvas,
  toggleSidebar,
  canvasTitle,
  onTitleChange,
}) {
  const handleTitleChange = (e) => {
    const value = e.target.value;
    // Basic sanitization for the input itself (removing obvious problematic chars)
    const sanitized = value.replace(/[<>:"/\\|?*]/g, "");
    onTitleChange(sanitized);
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <button
          className="mobile-nav-toggle btn-icon-sm"
          onClick={toggleSidebar}
        >
          <Menu size={20} />
        </button>
        <div className="app-logo">
          <div className="logo-icon">R</div>
          <span className="logo-text">Rocketium</span>
        </div>
        <div className="header-divider" />
        <div className="doc-info">
          <input
            type="text"
            className="doc-name-input"
            value={canvasTitle}
            onChange={handleTitleChange}
            placeholder="Untitled Design"
            maxLength={50}
            title="Rename design"
          />
          {hasCanvas && (
            <span className="doc-meta">
              {canvasDimensions.width} × {canvasDimensions.height} px •{" "}
              {elementCount} elements
            </span>
          )}
        </div>
      </div>

      <div className="header-right">
        <div className="header-actions">{/* Header actions can go here */}</div>
      </div>
    </header>
  );
}

export default Header;
