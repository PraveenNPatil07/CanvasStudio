# Canvas Builder - Full-Stack Design Tool

A professional, full-stack canvas manipulation application that allows users to create, manage, and export graphic designs. This project demonstrates advanced React patterns, backend integration, and complex UI interactions like dragging, resizing, and state synchronization.

---

## 🚀 Features

### **1. Component Management**

- **Dynamic Elements**: Add and manipulate Text, Rectangles, Circles, and Images.
- **Manipulation**: Drag to reposition, use handles to resize, and delete via keyboard or UI.
- **Smart Resizing**: Implements proportional scaling logic to maintain aspect ratios where necessary (especially for images and circles).

### **2. Advanced State Control**

- **Undo/Redo System**: A robust history management system that tracks every change.
- **Backend Sync**: Every action (move, resize, add, delete) is synchronized with a Node.js backend to ensure state persistence.
- **Batch Operations**: Support for deleting multiple selected elements simultaneously.

### **3. Professional UI/UX**

- **Responsive Workspace**: The canvas automatically scales to fit different screen sizes while maintaining the internal coordinate system.
- **Mobile Optimized**: Custom touch-friendly handles and a tabbed control panel for mobile devices.
- **Visual Feedback**: Hover effects, selection outlines, and a dynamic zoom indicator.

### **4. Export Capabilities**

- **PDF Generation**: A dedicated backend service using `PDFKit` to convert the browser-based canvas into a high-quality, downloadable PDF.

---

## 🛠️ Technical Architecture

### **Frontend (React)**

- **Canvas Rendering**: Uses the HTML5 Canvas API for high-performance rendering of elements.
- **Interaction Logic**: Custom hooks and event listeners handle complex mouse/touch interactions (drag-and-drop, marquee selection).
- **Coordinate Mapping**: Implements a scaling factor logic to ensure that mouse coordinates correctly map to the canvas elements regardless of the browser's zoom or window size.
- **Focus Management**: Sophisticated focus handling to ensure keyboard shortcuts (like `Delete`) work seamlessly when interacting with the canvas.

### **Backend (Node.js & Express)**

- **RESTful API**: Clean endpoints for managing canvas state (`/api/canvas`, `/api/canvas/:id/elements`).
- **In-Memory Store**: Fast state management (can be easily swapped for a database like MongoDB).
- **PDF Engine**: Server-side rendering of canvas elements into PDF vectors.

### **Monorepo Strategy**

- **Unified Deployment**: A root-level configuration allows the entire project (Frontend + Backend) to be deployed as a single unit on Vercel.
- **Shared Scripts**: Root `package.json` contains helper scripts to install dependencies and run both servers simultaneously.

---

## 📦 Project Structure

```text
Rocketium/
├── frontend/                # React UI
│   ├── src/components/      # CanvasPreview, ControlPanel, etc.
│   ├── src/services/        # API communication logic
│   └── App.css              # Responsive styling & Animations
├── backend/                 # Node.js API
│   ├── index.js             # Express server & PDF logic
│   └── package.json         # Backend dependencies (PDFKit, etc.)
├── vercel.json              # Monorepo deployment config
└── package.json             # Root scripts & Workspaces
```

---

## ⚙️ Detailed Setup

### **Installation**

The project uses a custom installer to handle the nested dependencies:

```bash
npm run install:all
```

### **Development Workflow**

1. **Start Backend**: `npm run start:backend` (Runs on `http://localhost:5000`)
2. **Start Frontend**: `cd frontend && npm start` (Runs on `http://localhost:3000`)

The frontend is configured to proxy API requests to the backend automatically.

---

## 🌍 Deployment on Vercel

The project is pre-configured for **Vercel Serverless Functions**:

1. The `backend/index.js` is exported as a module.
2. `vercel.json` routes all `/api/*` traffic to the backend.
3. The frontend is built and served as static content.

---

## ⌨️ Keyboard Shortcuts & Interactions

| Shortcut   | Action                         |
| :--------- | :----------------------------- |
| `Delete`   | Remove selected elements       |
| `Ctrl + Z` | Undo last action               |
| `Ctrl + Y` | Redo action                    |
| `Drag`     | Move selected element          |
| `Handles`  | Resize element (Corners/Edges) |

---

## 📝 Technical Challenges Solved

- **The "containerRef" Issue**: Resolved complex React Ref dependencies between the workspace and the preview components.
- **Responsive Zoom**: Implemented a dynamic scaling system that keeps the canvas centered and interactive across all device orientations.
- **Serverless Backend**: Adapted a standard Express server to work within Vercel's 10-second execution limit and serverless architecture.
