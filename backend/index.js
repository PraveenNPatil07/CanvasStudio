const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const PDFDocument = require("pdfkit");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");

const path = require("path");

const app = express();
const port = process.env.PORT || 3001;

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(",")
      : "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Serve static files from the React app in production (non-Vercel environments)
if (process.env.NODE_ENV === "production" && !process.env.VERCEL) {
  app.use(express.static(path.join(__dirname, "../frontend/build")));
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// In-memory store for canvases
const canvases = new Map();

// Initialize Canvas
app.post("/api/canvas", (req, res) => {
  const { width, height } = req.body;
  const id = uuidv4();

  const canvasData = {
    id,
    width: width || 800,
    height: height || 600,
    elements: [],
  };

  canvases.set(id, canvasData);
  res.status(201).json(canvasData);
});

// Add Element to Canvas
app.post("/api/canvas/:id/elements", (req, res) => {
  const { id } = req.params;
  const element = req.body;

  const canvasData = canvases.get(id);
  if (!canvasData) {
    return res.status(404).json({ error: "Canvas not found" });
  }

  // Add unique ID to element
  const newElement = {
    ...element,
    id: uuidv4(),
  };

  canvasData.elements.push(newElement);
  res.json(canvasData);
});

// Update Element in Canvas
app.put("/api/canvas/:id/elements/:elementId", (req, res) => {
  const { id, elementId } = req.params;
  const updatedElement = req.body;

  const canvasData = canvases.get(id);
  if (!canvasData) {
    return res.status(404).json({ error: "Canvas not found" });
  }

  const elementIndex = canvasData.elements.findIndex(
    (el) => el.id === elementId
  );
  if (elementIndex === -1) {
    return res.status(404).json({ error: "Element not found" });
  }

  canvasData.elements[elementIndex] = {
    ...canvasData.elements[elementIndex],
    ...updatedElement,
  };

  res.json(canvasData);
});

// Batch Update Elements in Canvas
app.put("/api/canvas/:id/elements", (req, res) => {
  const { id } = req.params;
  const { updates } = req.body; // Array of { id, ...updates }

  const canvasData = canvases.get(id);
  if (!canvasData) {
    return res.status(404).json({ error: "Canvas not found" });
  }

  updates.forEach((update) => {
    const elementIndex = canvasData.elements.findIndex(
      (el) => el.id === update.id
    );
    if (elementIndex !== -1) {
      canvasData.elements[elementIndex] = {
        ...canvasData.elements[elementIndex],
        ...update,
      };
    }
  });

  res.json(canvasData);
});

// Replace all elements (for Undo/Redo/Sync)
app.post("/api/canvas/:id/elements/sync", (req, res) => {
  const { id } = req.params;
  const { elements } = req.body;
  const canvasData = canvases.get(id);
  if (!canvasData) return res.status(404).json({ error: "Canvas not found" });

  canvasData.elements = elements;
  res.json(canvasData);
});

// Update Canvas Dimensions
app.put("/api/canvas/:id", (req, res) => {
  const { id } = req.params;
  const { width, height } = req.body;

  const canvasData = canvases.get(id);
  if (!canvasData) {
    return res.status(404).json({ error: "Canvas not found" });
  }

  if (width) canvasData.width = width;
  if (height) canvasData.height = height;

  res.json(canvasData);
});

// Delete Element from Canvas
app.delete("/api/canvas/:id/elements/:elementId", (req, res) => {
  const { id, elementId } = req.params;
  const canvasData = canvases.get(id);
  if (!canvasData) return res.status(404).json({ error: "Canvas not found" });

  const elementIndex = canvasData.elements.findIndex(
    (el) => el.id === elementId
  );
  if (elementIndex === -1)
    return res.status(404).json({ error: "Element not found" });

  canvasData.elements.splice(elementIndex, 1);
  res.json(canvasData);
});

// Batch Delete Elements from Canvas
app.delete("/api/canvas/:id/elements", (req, res) => {
  const { id } = req.params;
  const { ids } = req.body; // Array of element IDs to delete
  const canvasData = canvases.get(id);
  if (!canvasData) return res.status(404).json({ error: "Canvas not found" });

  canvasData.elements = canvasData.elements.filter(
    (el) => !ids.includes(el.id)
  );
  res.json(canvasData);
});

// Export as PDF
app.get("/api/canvas/:id/export", async (req, res) => {
  const { id } = req.params;
  const canvasData = canvases.get(id);

  if (!canvasData) {
    return res.status(404).json({ error: "Canvas not found" });
  }

  const doc = new PDFDocument({
    size: [canvasData.width, canvasData.height],
    margin: 0,
    info: {
      Title: "Canvas Export",
      Author: "Canvas Builder",
    },
    // Optimization: Compress the PDF output
    compress: true,
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=canvas-${id}.pdf`);

  doc.pipe(res);

  for (const el of canvasData.elements) {
    if (el.type === "rectangle") {
      doc.rect(el.x, el.y, el.width, el.height).fill(el.color);
    } else if (el.type === "circle") {
      doc.circle(el.x, el.y, el.radius).fill(el.color);
    } else if (el.type === "text") {
      doc
        .fillColor(el.color || "#000000")
        .fontSize(el.fontSize || 16)
        .text(el.content, el.x, el.y);
    } else if (el.type === "image") {
      try {
        if (el.url.startsWith("http")) {
          const response = await axios.get(el.url, {
            responseType: "arraybuffer",
          });
          const buffer = Buffer.from(response.data, "binary");
          doc.image(buffer, el.x, el.y, {
            width: el.width,
            height: el.height,
          });
        } else {
          doc.image(el.url, el.x, el.y, {
            width: el.width,
            height: el.height,
          });
        }
      } catch (err) {
        console.error("Failed to add image to PDF:", err.message);
      }
    }
  }

  doc.end();
});

// For any request that doesn't match an API route, send back React's index.html file in production
if (process.env.NODE_ENV === "production") {
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
  });
}

if (require.main === module) {
  app.listen(port, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
  });
}

module.exports = app;
