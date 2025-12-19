# CanvasStudio - Full-Stack Design Tool

A professional, full-stack canvas manipulation application that allows users to create, manage, and export graphic designs. This project demonstrates advanced React patterns, backend integration, and complex UI interactions like dragging, resizing, and state synchronization.

---

## 🚀 Features

### **1. Advanced Design Canvas**

- **Infinite Possibilities**: Add and manipulate Text, Rectangles, Circles, and high-resolution Images.
- **Precision Control**: Drag, resize, and rotate elements with pixel-perfect accuracy.
- **Smart Alignment**: Integrated guides and proportional scaling to keep your designs professional.
- **Layer Management**: New **Layers Panel** for complex designs, allowing you to lock, hide, or reorder elements with ease.

### **2. Seamless User Experience**

- **Distraction-Free Workspace**: A clean, modern UI inspired by top-tier design tools like Canva.
- **Instant Feedback**: Hover states, selection overlays, and smooth animations.
- **Undo/Redo History**: Never lose a change with our robust design history system.
- **Keyboard Power-User**: Support for shortcuts like `Delete`, `Ctrl+C/V`, `Ctrl+Z/Y`, and arrow key nudging.

### **3. Professional Workflows**

- **Real-time Persistence**: Design state is synchronized with the backend instantly.
- **Adaptive Canvas**: Workspace scales beautifully from mobile to ultra-wide monitors.
- **Floating Controls**: Modern zoom controls and property panels that stay out of your way until needed.

### **4. Export Capabilities**

- **High-Quality PNG**: Client-side canvas serialization to PNG format for instant downloads.
- **Professional PDF**: A dedicated backend service using `PDFKit` to convert the browser-based canvas into a high-quality, print-ready PDF.
- **Cross-Origin Support**: Robust image handling using CORS-aware loading for reliable exports even with external assets.

---

## 🛠️ Technical Architecture

### **Frontend (React)**

- **Canvas Engine**: Custom-built rendering engine using HTML5 Canvas API with a 60FPS `requestAnimationFrame` loop.
- **State Management**: Optimized local state with `useCallback` and `useMemo` to minimize re-renders in complex designs.
- **Layering System**: Full support for element Z-indexing (bring to front, send to back).
- **Interactive Controls**:
  - Floating zoom controls with scale-aware rendering.
  - Keyboard shortcuts for productivity (Delete, Undo/Redo, Arrow nudging).
  - Responsive design that maintains aspect ratio and coordinate precision.
- **Asset Loading**: Asynchronous image pre-loading with caching to prevent flicker during canvas redraws.

### **Backend (Node.js & Express)**

- **Persistence Layer**: Lightweight, in-memory storage for rapid state synchronization.
- **PDF Generation**: Vector-based PDF creation ensuring zero quality loss.
- **CORS Configuration**: Securely configured for cross-origin resource sharing between frontend and backend.

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
