"use client";
import React, { useState, useRef, useEffect } from "react";

const CanvasComponent = ({ drawData, color, onMouseEvent }) => {
  const [isMouseDown, setIsMouseDown] = useState(false);
  const canvasRef = useRef(null);

  const drawBackground = (ctx, width, height) => {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);
  };

  const drawCircle = (ctx, x, y, color) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 12, 0, 2 * Math.PI);
    ctx.fill();
  };

  const handleMouseEvent = (event) => {
    if (isMouseDown) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const position = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
      onMouseEvent(event.type, { color: color, ...position });
    }

    if (event.type === "mousedown") {
      setIsMouseDown(true);
    } else if (event.type === "mouseup") {
      setIsMouseDown(false);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    drawBackground(context, canvas.width, canvas.height);

    drawData.forEach(({ x, y, color }) => {
      drawCircle(context, x, y, color);
    });
  }, [drawData]);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.addEventListener("mousemove", handleMouseEvent);
    canvas.addEventListener("mousedown", handleMouseEvent);
    canvas.addEventListener("mouseup", handleMouseEvent);

    return () => {
      canvas.removeEventListener("mousemove", handleMouseEvent);
      canvas.removeEventListener("mousedown", handleMouseEvent);
      canvas.removeEventListener("mouseup", handleMouseEvent);
    };
  }, [isMouseDown]);

  return <canvas ref={canvasRef} />;
};

export default CanvasComponent;
