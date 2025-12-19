import React from "react";
import { Menu, Edit2 } from "lucide-react";

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
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="logo-svg"
          >
            <rect width="32" height="32" rx="8" fill="#8b3dff" />
            <path
              d="M10 10H22V22H10V10Z"
              stroke="white"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M7 7L10 10"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M22 22L25 25"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="16" cy="16" r="3" fill="white" />
          </svg>
          <span className="logo-text">CanvasStudio</span>
        </div>
        <div className="header-divider" />
        <div className="doc-info">
          <div className="doc-name-wrapper">
            <input
              type="text"
              className="doc-name-input"
              value={canvasTitle}
              onChange={handleTitleChange}
              placeholder="Untitled Design"
              maxLength={50}
              title="Rename design"
            />
            <Edit2 size={12} className="edit-icon" />
          </div>
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
