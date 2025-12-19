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
  selectedIds,
  setSelectedIds,
  onError,
}) {
  const canvasRef = useRef(null);
  const imagesRef = useRef({});

  // Interaction State
  const [localElements, setLocalElements] = useState(elements);
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

  const [hoveredId, setHoveredId] = useState(null);
  const [guides, setGuides] = useState([]);
  const [clipboard, setClipboard] = useState(null);

  // Theme Colors
  const themeRef = useRef({
    primary: "#8b3dff",
    primaryAlpha: (opacity) => `rgba(139, 61, 255, ${opacity})`,
    danger: "#ff4d4f",
    bgMain: "#f0f2f5",
  });

  useEffect(() => {
    const style = getComputedStyle(document.documentElement);
    const primary = style.getPropertyValue("--primary").trim() || "#8b3dff";
    const danger = style.getPropertyValue("--danger").trim() || "#ff4d4f";
    const bgMain = style.getPropertyValue("--bg-main").trim() || "#f0f2f5";

    // Extract RGB for alpha colors
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(
            result[3],
            16
          )}`
        : "139, 61, 255";
    };

    const primaryRgb = hexToRgb(primary);

    themeRef.current = {
      primary,
      primaryAlpha: (opacity) => `rgba(${primaryRgb}, ${opacity})`,
      danger,
      bgMain,
    };
  }, []);

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
      ctx.strokeStyle = themeRef.current.primary;
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
        ctx.strokeStyle = themeRef.current.primary;
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
    // Remove explicit fillRect for white background to keep canvas transparent
    // The background is already handled by CSS in .canvas-container-wrapper

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
            ctx.fillStyle = themeRef.current.bgMain;
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
        ctx.shadowColor = themeRef.current.primaryAlpha(0.4);
        drawSelection(ctx, el);
        ctx.restore();
      }
      ctx.restore();
    });

    // Draw Hover Indicator
    if (hoveredId && !selectedIds.includes(hoveredId)) {
      const el = localElements.find((e) => e.id === hoveredId);
      if (el) {
        ctx.save();
        ctx.strokeStyle = themeRef.current.primaryAlpha(0.4);
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        if (el.type === "circle") {
          ctx.beginPath();
          ctx.arc(el.x, el.y, el.radius + 2, 0, Math.PI * 2);
          ctx.stroke();
        } else if (el.type === "text") {
          ctx.font = `${el.fontSize}px Inter, -apple-system, sans-serif`;
          const m = ctx.measureText(el.content);
          ctx.strokeRect(el.x - 2, el.y - 2, m.width + 4, el.fontSize + 4);
        } else {
          ctx.strokeRect(el.x - 2, el.y - 2, el.width + 4, el.height + 4);
        }
        ctx.setLineDash([]);
        ctx.restore();
      }
    }

    // Draw Alignment Guides
    if (guides.length > 0) {
      ctx.save();
      ctx.strokeStyle = themeRef.current.danger;
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      guides.forEach((guide) => {
        ctx.beginPath();
        if (guide.type === "h") {
          ctx.moveTo(0, guide.y);
          ctx.lineTo(width, guide.y);
        } else {
          ctx.moveTo(guide.x, 0);
          ctx.lineTo(guide.x, height);
        }
        ctx.stroke();
      });
      ctx.restore();
    }

    // Draw Marquee
    if (interaction.type === "selecting" && interaction.marquee) {
      ctx.save();
      ctx.strokeStyle = themeRef.current.primaryAlpha(0.5);
      ctx.fillStyle = themeRef.current.primaryAlpha(0.1);
      ctx.lineWidth = 1;
      const { x, y, width: w, height: h } = interaction.marquee;
      ctx.fillRect(x, y, w, h);
      ctx.strokeRect(x, y, w, h);
      ctx.restore();
    }
  }, [
    width,
    height,
    localElements,
    selectedIds,
    interaction,
    drawSelection,
    hoveredId,
    guides,
  ]);

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

  const isElementInRect = (el, rect) => {
    let elBounds;
    if (el.type === "circle") {
      elBounds = {
        x: el.x - el.radius,
        y: el.y - el.radius,
        w: el.radius * 2,
        h: el.radius * 2,
      };
    } else if (el.type === "text") {
      const ctx = canvasRef.current.getContext("2d");
      ctx.font = `${el.fontSize}px Inter, -apple-system, sans-serif`;
      const m = ctx.measureText(el.content);
      elBounds = { x: el.x, y: el.y, w: m.width, h: el.fontSize };
    } else {
      elBounds = { x: el.x, y: el.y, w: el.width, h: el.height };
    }

    return (
      elBounds.x < rect.x + rect.width &&
      elBounds.x + elBounds.w > rect.x &&
      elBounds.y < rect.y + rect.height &&
      elBounds.y + elBounds.h > rect.y
    );
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

    // Update Hover State
    if (interaction.type === "none") {
      let foundId = null;
      for (let i = localElements.length - 1; i >= 0; i--) {
        if (isPointInElement(x, y, localElements[i])) {
          foundId = localElements[i].id;
          break;
        }
      }
      setHoveredId(foundId);
    } else {
      setHoveredId(null);
    }

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

      let newGuides = [];
      const SNAP_THRESHOLD = 5;

      const newElements = localElements.map((el) => {
        if (selectedIds.includes(el.id)) {
          const initialEl = interaction.initialElements.find(
            (ie) => ie.id === el.id
          );
          let newX = initialEl.x + dx;
          let newY = initialEl.y + dy;

          // Alignment Guides & Snapping (only for single element for simplicity)
          if (selectedIds.length === 1) {
            const centerX = width / 2;
            const centerY = height / 2;

            // Snap to Canvas Center X
            if (
              Math.abs(newX + (el.width || 0) / 2 - centerX) < SNAP_THRESHOLD
            ) {
              newX = centerX - (el.width || 0) / 2;
              newGuides.push({ type: "v", x: centerX });
            }
            // Snap to Canvas Center Y
            if (
              Math.abs(newY + (el.height || 0) / 2 - centerY) < SNAP_THRESHOLD
            ) {
              newY = centerY - (el.height || 0) / 2;
              newGuides.push({ type: "h", y: centerY });
            }
          }

          // Apply Grid
          newX = Math.round(newX / GRID_SIZE) * GRID_SIZE;
          newY = Math.round(newY / GRID_SIZE) * GRID_SIZE;

          // Basic boundary check
          newX = Math.max(-50, Math.min(newX, width));
          newY = Math.max(-50, Math.min(newY, height));

          return { ...el, x: newX, y: newY };
        }
        return el;
      });

      setGuides(newGuides);
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
    setGuides([]);

    if (interaction.type === "selecting" && interaction.marquee) {
      const selected = localElements
        .filter((el) => isElementInRect(el, interaction.marquee))
        .map((el) => el.id);
      setSelectedIds(selected);
    }

    if (interaction.type !== "none" && interaction.type !== "selecting") {
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
    setSelectedIds,
  ]);

  const handleCopy = useCallback(() => {
    if (selectedIds.length === 0) return;
    const toCopy = localElements
      .filter((el) => selectedIds.includes(el.id))
      .map((el) => {
        const { id, ...rest } = el;
        return rest;
      });
    setClipboard(toCopy);
  }, [selectedIds, localElements]);

  const handlePaste = useCallback(async () => {
    if (!clipboard) return;
    try {
      // Offset pasted elements slightly
      const offset = 20;
      const toPaste = clipboard.map((el) => ({
        ...el,
        x: (el.x || 0) + offset,
        y: (el.y || 0) + offset,
      }));

      const res = await canvasService.addElements(canvasId, toPaste);
      onElementsUpdated(res.elements);
      setSelectedIds(res.newElements.map((el) => el.id));

      // History
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(res.elements);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    } catch (err) {
      console.error("Paste failed", err);
    }
  }, [
    clipboard,
    canvasId,
    canvasService,
    onElementsUpdated,
    history,
    historyIndex,
    setSelectedIds,
  ]);

  const handleReorder = useCallback(
    async (direction) => {
      if (selectedIds.length === 0) return;

      let newElements = [...localElements];
      const selectedIndices = selectedIds
        .map((id) => newElements.findIndex((el) => el.id === id))
        .sort((a, b) => a - b);

      if (direction === "front") {
        const selected = selectedIndices.map((i) => newElements[i]);
        const remaining = newElements.filter(
          (_, i) => !selectedIndices.includes(i)
        );
        newElements = [...remaining, ...selected];
      } else if (direction === "back") {
        const selected = selectedIndices.map((i) => newElements[i]);
        const remaining = newElements.filter(
          (_, i) => !selectedIndices.includes(i)
        );
        newElements = [...selected, ...remaining];
      } else if (direction === "forward") {
        for (let i = selectedIndices.length - 1; i >= 0; i--) {
          const idx = selectedIndices[i];
          if (
            idx < newElements.length - 1 &&
            !selectedIndices.includes(idx + 1)
          ) {
            [newElements[idx], newElements[idx + 1]] = [
              newElements[idx + 1],
              newElements[idx],
            ];
          }
        }
      } else if (direction === "backward") {
        for (let i = 0; i < selectedIndices.length; i++) {
          const idx = selectedIndices[i];
          if (idx > 0 && !selectedIndices.includes(idx - 1)) {
            [newElements[idx], newElements[idx - 1]] = [
              newElements[idx - 1],
              newElements[idx],
            ];
          }
        }
      }

      setLocalElements(newElements);
      try {
        const res = await canvasService.syncElements(canvasId, newElements);
        onElementsUpdated(res.elements);
        // History
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(res.elements);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
      } catch (err) {
        console.error("Reorder failed", err);
      }
    },
    [
      selectedIds,
      localElements,
      canvasId,
      canvasService,
      onElementsUpdated,
      history,
      historyIndex,
    ]
  );

  const handleNudge = useCallback(
    async (key, shiftKey) => {
      if (selectedIds.length === 0) return;

      const moveStep = shiftKey ? GRID_SIZE : 1;
      const updates = localElements
        .filter((el) => selectedIds.includes(el.id))
        .map((el) => {
          let newX = el.x;
          let newY = el.y;
          if (key === "ArrowLeft") newX -= moveStep;
          if (key === "ArrowRight") newX += moveStep;
          if (key === "ArrowUp") newY -= moveStep;
          if (key === "ArrowDown") newY += moveStep;
          return { id: el.id, x: newX, y: newY };
        });

      setLocalElements(
        localElements.map((el) => {
          const up = updates.find((u) => u.id === el.id);
          return up ? { ...el, x: up.x, y: up.y } : el;
        })
      );

      // Sync with backend after a short delay or on key up
      try {
        const res = await canvasService.updateElements(canvasId, updates);
        onElementsUpdated(res.elements);
      } catch (err) {
        console.error("Nudge sync failed", err);
      }
    },
    [selectedIds, localElements, canvasId, canvasService, onElementsUpdated]
  );

  useEffect(() => {
    const handleKeyDown = async (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "c") {
        handleCopy();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "v") {
        handlePaste();
      } else if (e.key === "[") {
        e.preventDefault();
        handleReorder(e.ctrlKey || e.metaKey ? "backward" : "back");
      } else if (e.key === "]") {
        e.preventDefault();
        handleReorder(e.ctrlKey || e.metaKey ? "forward" : "front");
      } else if ((e.ctrlKey || e.metaKey) && e.key === "z") {
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
        ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)
      ) {
        e.preventDefault();
        handleNudge(e.key, e.shiftKey);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    undo,
    redo,
    handleDelete,
    handleCopy,
    handlePaste,
    handleReorder,
    handleNudge,
  ]);

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

      {/* Selection drawn on canvas, removing DOM overlay to prevent misalignment */}
    </div>
  );
}

export default CanvasPreview;
