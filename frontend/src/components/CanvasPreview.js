import React, { useRef, useEffect, useState, useCallback } from "react";

const GRID_SIZE = 10;
const HANDLE_SIZE = 12; // Increased for better touch targets on mobile

function CanvasPreview({
  canvasService,
  canvasId,
  width,
  height,
  elements,
  onElementsUpdated,
  scale,
}) {
  const canvasRef = useRef(null);
  const imagesRef = useRef({});

  // Interaction State
  const [localElements, setLocalElements] = useState(elements);
  const [selectedIds, setSelectedIds] = useState([]);
  const [interaction, setInteraction] = useState({
    type: "none", // 'none', 'moving', 'resizing', 'selecting'
    handle: null, // for resizing
    startPos: { x: 0, y: 0 },
    lastPos: { x: 0, y: 0 },
    marquee: null, // { x, y, width, height }
    initialElements: [], // State before interaction for undo/redo
  });

  // Undo/Redo State
  const [history, setHistory] = useState([elements]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Sync with prop elements
  useEffect(() => {
    if (interaction.type === "none") {
      setLocalElements(elements);
    }
  }, [elements, interaction.type]);

  // Drawing Logic using requestAnimationFrame
  const getHandles = useCallback(
    (x, y, w, h) => ({
      tl: { x, y },
      tr: { x: x + w, y },
      bl: { x, y: y + h },
      br: { x: x + w, y: y + h },
      t: { x: x + w / 2, y },
      b: { x: x + w / 2, y: y + h },
      l: { x, y: y + h / 2 },
      r: { x: x + w, y: y + h / 2 },
    }),
    []
  );

  const drawSelection = useCallback(
    (ctx, el) => {
      ctx.strokeStyle = "#6366f1";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);

      let x, y, w, h;
      if (el.type === "circle") {
        x = el.x - el.radius;
        y = el.y - el.radius;
        w = h = el.radius * 2;
      } else if (el.type === "text") {
        const metrics = ctx.measureText(el.content);
        x = el.x - 4;
        y = el.y - 4;
        w = metrics.width + 8;
        h = el.fontSize + 8;
      } else {
        x = el.x;
        y = el.y;
        w = el.width;
        h = el.height;
      }

      ctx.strokeRect(x, y, w, h);

      // Draw Handles
      if (selectedIds.length === 1) {
        ctx.setLineDash([]);
        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = "#6366f1";
        ctx.lineWidth = 2;

        const handles = getHandles(x, y, w, h);
        Object.values(handles).forEach((pos) => {
          ctx.fillRect(
            pos.x - HANDLE_SIZE / 2,
            pos.y - HANDLE_SIZE / 2,
            HANDLE_SIZE,
            HANDLE_SIZE
          );
          ctx.strokeRect(
            pos.x - HANDLE_SIZE / 2,
            pos.y - HANDLE_SIZE / 2,
            HANDLE_SIZE,
            HANDLE_SIZE
          );
        });
      }
    },
    [selectedIds, getHandles]
  );

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    // Draw Elements
    localElements.forEach((el) => {
      ctx.save();
      const isSelected = selectedIds.includes(el.id);

      switch (el.type) {
        case "rectangle":
          ctx.fillStyle = el.color;
          ctx.fillRect(el.x, el.y, el.width, el.height);
          break;
        case "circle":
          ctx.fillStyle = el.color;
          ctx.beginPath();
          ctx.arc(el.x, el.y, el.radius, 0, 2 * Math.PI);
          ctx.fill();
          break;
        case "text":
          ctx.font = `${el.fontSize}px Inter, -apple-system, sans-serif`;
          ctx.fillStyle = el.color;
          ctx.textBaseline = "top";
          ctx.fillText(el.content, el.x, el.y);
          break;
        case "image":
          if (imagesRef.current[el.url]) {
            ctx.drawImage(
              imagesRef.current[el.url],
              el.x,
              el.y,
              el.width,
              el.height
            );
          } else {
            ctx.fillStyle = "#f1f5f9";
            ctx.fillRect(el.x, el.y, el.width, el.height);
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.src = el.url;
            img.onload = () => {
              imagesRef.current[el.url] = img;
            };
          }
          break;
        default:
          break;
      }

      if (isSelected) {
        ctx.save();
        ctx.shadowBlur = 10;
        ctx.shadowColor = "rgba(99, 102, 241, 0.4)";
        drawSelection(ctx, el);
        ctx.restore();
      }
      ctx.restore();
    });

    // Draw Marquee
    if (interaction.type === "selecting" && interaction.marquee) {
      ctx.save();
      ctx.strokeStyle = "rgba(99, 102, 241, 0.5)";
      ctx.fillStyle = "rgba(99, 102, 241, 0.1)";
      ctx.lineWidth = 1;
      const { x, y, width: w, height: h } = interaction.marquee;
      ctx.fillRect(x, y, w, h);
      ctx.strokeRect(x, y, w, h);
      ctx.restore();
    }
  }, [width, height, localElements, selectedIds, interaction, drawSelection]);

  // Animation Loop
  useEffect(() => {
    let animationId;
    const render = () => {
      draw();
      animationId = requestAnimationFrame(render);
    };
    animationId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationId);
  }, [draw]);

  const getMousePos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) / scale,
      y: (clientY - rect.top) / scale,
    };
  };

  const [hoveredHandle, setHoveredHandle] = useState(null);

  const getCursor = () => {
    if (interaction.type === "moving") return "move";
    const h =
      interaction.type === "resizing" ? interaction.handle : hoveredHandle;
    if (h) {
      if (h === "tl" || h === "br") return "nwse-resize";
      if (h === "tr" || h === "bl") return "nesw-resize";
      if (h === "t" || h === "b") return "ns-resize";
      if (h === "l" || h === "r") return "ew-resize";
    }
    return "default";
  };

  const isPointInElement = (x, y, el) => {
    if (el.type === "rectangle" || el.type === "image") {
      return (
        x >= el.x && x <= el.x + el.width && y >= el.y && y <= el.y + el.height
      );
    } else if (el.type === "circle") {
      return (
        Math.sqrt(Math.pow(x - el.x, 2) + Math.pow(y - el.y, 2)) <= el.radius
      );
    } else if (el.type === "text") {
      const ctx = canvasRef.current.getContext("2d");
      ctx.font = `${el.fontSize}px Inter, -apple-system, sans-serif`;
      const metrics = ctx.measureText(el.content);
      return (
        x >= el.x &&
        x <= el.x + metrics.width &&
        y >= el.y &&
        y <= el.y + el.fontSize
      );
    }
    return false;
  };

  const handleMouseDown = (e) => {
    // Focus the container to receive keyboard events
    e.currentTarget.parentElement.focus();

    const { x, y } = getMousePos(e);

    // Check Handles first (only if 1 element selected)
    if (selectedIds.length === 1) {
      const el = localElements.find((el) => el.id === selectedIds[0]);
      if (el) {
        let bounds;
        if (el.type === "circle") {
          bounds = {
            x: el.x - el.radius,
            y: el.y - el.radius,
            w: el.radius * 2,
            h: el.radius * 2,
          };
        } else if (el.type === "text") {
          const ctx = canvasRef.current.getContext("2d");
          ctx.font = `${el.fontSize}px Inter, -apple-system, sans-serif`;
          const metrics = ctx.measureText(el.content);
          bounds = { x: el.x, y: el.y, w: metrics.width, h: el.fontSize };
        } else {
          bounds = { x: el.x, y: el.y, w: el.width, h: el.height };
        }

        const handles = getHandles(bounds.x, bounds.y, bounds.w, bounds.h);
        for (const [name, pos] of Object.entries(handles)) {
          if (
            Math.abs(x - pos.x) < HANDLE_SIZE &&
            Math.abs(y - pos.y) < HANDLE_SIZE
          ) {
            setInteraction({
              type: "resizing",
              handle: name,
              startPos: { x, y },
              lastPos: { x, y },
              initialElements: [...localElements],
            });
            return;
          }
        }
      }
    }

    // Check Elements
    let targetId = null;
    for (let i = localElements.length - 1; i >= 0; i--) {
      if (isPointInElement(x, y, localElements[i])) {
        targetId = localElements[i].id;
        break;
      }
    }

    if (targetId) {
      let newSelection = [...selectedIds];
      if (e.shiftKey) {
        newSelection = selectedIds.includes(targetId)
          ? selectedIds.filter((id) => id !== targetId)
          : [...selectedIds, targetId];
      } else if (!selectedIds.includes(targetId)) {
        newSelection = [targetId];
      }
      setSelectedIds(newSelection);
      setInteraction({
        type: "moving",
        startPos: { x, y },
        lastPos: { x, y },
        initialElements: [...localElements],
      });
    } else {
      if (!e.shiftKey) setSelectedIds([]);
      setInteraction({
        type: "selecting",
        startPos: { x, y },
        lastPos: { x, y },
        marquee: { x, y, width: 0, height: 0 },
        initialElements: [...localElements],
      });
    }
  };

  const handleMouseMove = (e) => {
    const { x, y } = getMousePos(e);

    // Update Hover State for handles
    if (interaction.type === "none" && selectedIds.length === 1) {
      const el = localElements.find((el) => el.id === selectedIds[0]);
      if (el) {
        let bounds;
        if (el.type === "circle") {
          bounds = {
            x: el.x - el.radius,
            y: el.y - el.radius,
            w: el.radius * 2,
            h: el.radius * 2,
          };
        } else if (el.type === "text") {
          const ctx = canvasRef.current.getContext("2d");
          ctx.font = `${el.fontSize}px Inter, -apple-system, sans-serif`;
          const metrics = ctx.measureText(el.content);
          bounds = { x: el.x, y: el.y, w: metrics.width, h: el.fontSize };
        } else {
          bounds = { x: el.x, y: el.y, w: el.width, h: el.height };
        }

        const handles = getHandles(bounds.x, bounds.y, bounds.w, bounds.h);
        let foundHandle = null;
        for (const [name, pos] of Object.entries(handles)) {
          if (
            Math.abs(x - pos.x) < HANDLE_SIZE &&
            Math.abs(y - pos.y) < HANDLE_SIZE
          ) {
            foundHandle = name;
            break;
          }
        }
        setHoveredHandle(foundHandle);
      } else {
        setHoveredHandle(null);
      }
    }

    if (interaction.type === "moving") {
      const dx = x - interaction.startPos.x;
      const dy = y - interaction.startPos.y;

      const newElements = localElements.map((el) => {
        if (selectedIds.includes(el.id)) {
          const initialEl = interaction.initialElements.find(
            (ie) => ie.id === el.id
          );
          let newX = Math.round((initialEl.x + dx) / GRID_SIZE) * GRID_SIZE;
          let newY = Math.round((initialEl.y + dy) / GRID_SIZE) * GRID_SIZE;

          // Basic boundary check
          newX = Math.max(-50, Math.min(newX, width));
          newY = Math.max(-50, Math.min(newY, height));

          return { ...el, x: newX, y: newY };
        }
        return el;
      });
      setLocalElements(newElements);
    } else if (interaction.type === "resizing") {
      const el = localElements.find((e) => e.id === selectedIds[0]);
      const initialEl = interaction.initialElements.find(
        (ie) => ie.id === el.id
      );
      const dx = x - interaction.startPos.x;
      const dy = y - interaction.startPos.y;

      let newEl = { ...initialEl };
      const { handle } = interaction;
      const preserveAspect =
        e.shiftKey || el.type === "circle" || el.type === "image";
      const ratio = initialEl.width / initialEl.height || 1;

      if (el.type === "circle") {
        const delta = Math.abs(dx) > Math.abs(dy) ? dx : dy;
        newEl.radius = Math.max(
          10,
          Math.min(
            400,
            Math.round((initialEl.radius + delta / 2) / (GRID_SIZE / 2)) *
              (GRID_SIZE / 2)
          )
        );
      } else {
        // Horizontal Resize
        if (handle.includes("r")) {
          newEl.width = Math.max(
            10,
            Math.min(
              800,
              Math.round((initialEl.width + dx) / GRID_SIZE) * GRID_SIZE
            )
          );
        } else if (handle.includes("l")) {
          const delta = Math.min(initialEl.width - 10, dx);
          const potentialX =
            Math.round((initialEl.x + delta) / GRID_SIZE) * GRID_SIZE;
          const potentialWidth = initialEl.width + (initialEl.x - potentialX);
          if (potentialWidth >= 10 && potentialWidth <= 800) {
            newEl.x = potentialX;
            newEl.width = potentialWidth;
          }
        }

        // Vertical Resize
        if (handle.includes("b")) {
          newEl.height = Math.max(
            10,
            Math.min(
              800,
              Math.round((initialEl.height + dy) / GRID_SIZE) * GRID_SIZE
            )
          );
        } else if (handle.includes("t")) {
          const delta = Math.min(initialEl.height - 10, dy);
          const potentialY =
            Math.round((initialEl.y + delta) / GRID_SIZE) * GRID_SIZE;
          const potentialHeight = initialEl.height + (initialEl.y - potentialY);
          if (potentialHeight >= 10 && potentialHeight <= 800) {
            newEl.y = potentialY;
            newEl.height = potentialHeight;
          }
        }

        // Aspect Ratio Preservation
        if (preserveAspect) {
          if (
            handle === "br" ||
            handle === "tr" ||
            handle === "tl" ||
            handle === "bl"
          ) {
            if (Math.abs(dx) > Math.abs(dy)) {
              newEl.height = newEl.width / ratio;
              if (handle.includes("t"))
                newEl.y = initialEl.y + (initialEl.height - newEl.height);
            } else {
              newEl.width = newEl.height * ratio;
              if (handle.includes("l"))
                newEl.x = initialEl.x + (initialEl.width - newEl.width);
            }
          }
        }
      }

      setLocalElements(localElements.map((e) => (e.id === el.id ? newEl : e)));
    } else if (interaction.type === "selecting") {
      const marquee = {
        x: Math.min(x, interaction.startPos.x),
        y: Math.min(y, interaction.startPos.y),
        width: Math.abs(x - interaction.startPos.x),
        height: Math.abs(y - interaction.startPos.y),
      };
      setInteraction({ ...interaction, marquee });

      const newSelected = localElements
        .filter((el) => {
          const bounds =
            el.type === "circle"
              ? {
                  x: el.x - el.radius,
                  y: el.y - el.radius,
                  w: el.radius * 2,
                  h: el.radius * 2,
                }
              : { x: el.x, y: el.y, w: el.width || 50, h: el.height || 20 };
          return (
            bounds.x >= marquee.x &&
            bounds.x + bounds.w <= marquee.x + marquee.width &&
            bounds.y >= marquee.y &&
            bounds.y + bounds.h <= marquee.y + marquee.height
          );
        })
        .map((el) => el.id);

      if (e.shiftKey) {
        setSelectedIds(Array.from(new Set([...selectedIds, ...newSelected])));
      } else {
        setSelectedIds(newSelected);
      }
    }
  };

  const handleMouseUp = async () => {
    if (interaction.type !== "none") {
      const updates = localElements
        .filter(
          (el, i) =>
            JSON.stringify(el) !==
            JSON.stringify(interaction.initialElements[i])
        )
        .map(({ id, x, y, width, height, radius }) => ({
          id,
          x,
          y,
          width,
          height,
          radius,
        }));

      if (updates.length > 0) {
        try {
          const res = await canvasService.updateElements(canvasId, updates);
          onElementsUpdated(res.elements);

          // History Management
          const newHistory = history.slice(0, historyIndex + 1);
          newHistory.push(res.elements);
          if (newHistory.length > 50) newHistory.shift();
          setHistory(newHistory);
          setHistoryIndex(newHistory.length - 1);
        } catch (err) {
          setLocalElements(interaction.initialElements);
        }
      }
    }
    setInteraction({
      type: "none",
      handle: null,
      startPos: { x: 0, y: 0 },
      lastPos: { x: 0, y: 0 },
      marquee: null,
      initialElements: [],
    });
  };

  // Undo/Redo Handlers
  const undo = useCallback(async () => {
    if (historyIndex > 0) {
      const prevElements = history[historyIndex - 1];
      try {
        const res = await canvasService.syncElements(canvasId, prevElements);
        onElementsUpdated(res.elements);
        setHistoryIndex(historyIndex - 1);
      } catch (err) {
        console.error("Undo failed", err);
      }
    }
  }, [history, historyIndex, canvasId, canvasService, onElementsUpdated]);

  const redo = useCallback(async () => {
    if (historyIndex < history.length - 1) {
      const nextElements = history[historyIndex + 1];
      try {
        const res = await canvasService.syncElements(canvasId, nextElements);
        onElementsUpdated(res.elements);
        setHistoryIndex(historyIndex + 1);
      } catch (err) {
        console.error("Redo failed", err);
      }
    }
  }, [history, historyIndex, canvasId, canvasService, onElementsUpdated]);

  const handleDelete = useCallback(async () => {
    if (selectedIds.length === 0) return;

    // Accessibility: announce deletion start
    const count = selectedIds.length;
    const confirmMessage = `Are you sure you want to delete ${count} selected component${
      count > 1 ? "s" : ""
    }? This action can be undone with Ctrl+Z.`;

    if (!window.confirm(confirmMessage)) return;

    try {
      // Audit Log
      console.log(`[Audit] Deleting ${count} elements:`, selectedIds);

      const res = await canvasService.deleteElements(canvasId, selectedIds);
      onElementsUpdated(res.elements);

      // Accessibility: announce successful deletion
      const statusMessage = `${count} component${
        count > 1 ? "s" : ""
      } deleted successfully.`;
      console.log(`[Audit] ${statusMessage}`);

      setSelectedIds([]);

      // History Management for Undo/Redo
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(res.elements);
      if (newHistory.length > 50) newHistory.shift();
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    } catch (err) {
      console.error("[Audit] Delete failed:", err);
      alert("Failed to delete components. Please try again.");
    }
  }, [
    selectedIds,
    canvasId,
    canvasService,
    onElementsUpdated,
    history,
    historyIndex,
  ]);

  useEffect(() => {
    const handleKeyDown = async (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        e.preventDefault();
        redo();
      } else if (e.key === "Delete" || e.key === "Backspace") {
        // Only delete if not typing in an input (though we don't have text inputs in canvas yet)
        if (
          document.activeElement.tagName !== "INPUT" &&
          document.activeElement.tagName !== "TEXTAREA"
        ) {
          handleDelete();
        }
      } else if (
        ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key) &&
        selectedIds.length > 0
      ) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        const dx =
          e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0;
        const dy =
          e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0;

        const updates = localElements
          .filter((el) => selectedIds.includes(el.id))
          .map((el) => ({ id: el.id, x: el.x + dx, y: el.y + dy }));

        try {
          const res = await canvasService.updateElements(canvasId, updates);
          onElementsUpdated(res.elements);
        } catch (err) {
          console.error("Keyboard move failed", err);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    undo,
    redo,
    handleDelete,
    selectedIds,
    localElements,
    canvasId,
    canvasService,
    onElementsUpdated,
  ]);

  const [selectionBounds, setSelectionBounds] = useState(null);

  useEffect(() => {
    if (selectedIds.length === 0) {
      setSelectionBounds(null);
      return;
    }
    const selected = localElements.filter((el) => selectedIds.includes(el.id));
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    selected.forEach((el) => {
      let x, y, w, h;
      if (el.type === "circle") {
        x = el.x - el.radius;
        y = el.y - el.radius;
        w = h = el.radius * 2;
      } else if (el.type === "text") {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext("2d");
          ctx.font = `${el.fontSize}px Inter, -apple-system, sans-serif`;
          const metrics = ctx.measureText(el.content);
          x = el.x;
          y = el.y;
          w = metrics.width;
          h = el.fontSize;
        } else {
          x = el.x;
          y = el.y;
          w = 0;
          h = 0;
        }
      } else {
        x = el.x;
        y = el.y;
        w = el.width;
        h = el.height;
      }
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + w);
      maxY = Math.max(maxY, y + h);
    });
    setSelectionBounds({
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    });
  }, [selectedIds, localElements]);

  return (
    <div
      className="canvas-preview"
      tabIndex="0"
      role="application"
      aria-label="Design Canvas"
      onKeyDown={(e) => {
        // Ensure the canvas container can receive focus and handle key events
        // The window listener already handles most, but this is better for accessibility
      }}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        transform: `scale(${scale})`,
        cursor: getCursor(),
        outline: "none", // Managed by selection-overlay or focus ring
      }}
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="preview-canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
        aria-hidden="true" // Drawing is decorative for screen readers; selection-overlay handles interactive parts
      />

      {selectionBounds && interaction.type === "none" && (
        <div
          className="selection-overlay"
          role="region"
          aria-label={`${selectedIds.length} component${
            selectedIds.length > 1 ? "s" : ""
          } selected. Press Delete to remove.`}
          style={{
            left: selectionBounds.x,
            top: selectionBounds.y,
            width: selectionBounds.width,
            height: selectionBounds.height,
          }}
        />
      )}
    </div>
  );
}

export default CanvasPreview;
