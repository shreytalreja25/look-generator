"use client";

import React, { useRef, useState, useCallback } from "react";

interface LayoutItem {
  id: string;
  name: string;
  category: 'top' | 'bottom' | 'shoes' | 'accessories';
  imageUrl: string;
  file: File;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface LayoutComposerProps {
  items: LayoutItem[];
  onLayoutChange: (items: LayoutItem[]) => void;
  width?: number;
  height?: number;
}

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const ITEM_SIZE = 120;

export default function LayoutComposer({
  items,
  onLayoutChange,
  width = CANVAS_WIDTH,
  height = CANVAS_HEIGHT,
}: LayoutComposerProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    setDraggedId(id);
    const item = items.find((i) => i.id === id);
    if (item && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - (rect.left + (item.x * width)),
        y: e.clientY - (rect.top + (item.y * height)),
      });
    }
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!draggedId || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - dragOffset.x) / width;
      const y = (e.clientY - rect.top - dragOffset.y) / height;
      const clampedX = Math.max(0, Math.min(x, 1));
      const clampedY = Math.max(0, Math.min(y, 1));
      const updated = items.map((item) =>
        item.id === draggedId ? { ...item, x: clampedX, y: clampedY } : item
      );
      onLayoutChange(updated);
    },
    [draggedId, dragOffset, items, onLayoutChange, width, height]
  );

  const handleMouseUp = () => {
    setDraggedId(null);
  };

  React.useEffect(() => {
    if (draggedId) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [draggedId, handleMouseMove]);

  return (
    <div
      ref={containerRef}
      data-layout-canvas
      style={{
        width,
        height,
        border: "2px dashed #e5e7eb",
        borderRadius: 16,
        position: "relative",
        background: "#fafafa",
        overflow: "hidden",
        margin: "0 auto",
      }}
    >
      {items.map((item) => (
        <div
          key={item.id}
          style={{
            position: "absolute",
            left: item.x * width,
            top: item.y * height,
            width: item.width ? item.width * width : ITEM_SIZE,
            height: item.height ? item.height * height : ITEM_SIZE,
            cursor: draggedId === item.id ? "grabbing" : "grab",
            zIndex: draggedId === item.id ? 10 : 1,
            transition: draggedId === item.id ? "none" : "box-shadow 0.2s",
            boxShadow: draggedId === item.id ? "0 0 0 2px #2563eb" : "0 1px 6px #0001",
            background: "#fff",
            borderRadius: 12,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            userSelect: "none",
          }}
          onMouseDown={(e) => handleMouseDown(e, item.id)}
        >
          <img
            src={item.imageUrl}
            alt={item.name}
            style={{
              width: "80%",
              height: "80%",
              objectFit: "contain",
              borderRadius: 8,
              pointerEvents: "none",
            }}
          />
          <div style={{ fontSize: 14, marginTop: 4 }}>{item.name}</div>
        </div>
      ))}
    </div>
  );
} 