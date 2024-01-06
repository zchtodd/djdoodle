"use client";
import React, { useRef, useState, useEffect } from "react";

const CanvasComponent = (props) => {
  const mousePosition = useRef({ x: 0, y: 0 });
  const mouseDown = useRef(false);
  const canvasRef = useRef(null);
  const ws = useRef(null);

  const drawBackground = (ctx, width, height) => {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);
  };

  const drawCircle = (ctx, x, y) => {
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI);
    ctx.fill();
  };

  const handleMouseMove = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    mousePosition.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const handleMouseDown = () => {
    mouseDown.current = true;
  };

  const handleMouseUp = () => {
    mouseDown.current = false;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    drawBackground(context, canvas.width, canvas.height);

    ws.current = new WebSocket(
      `ws://${window.location.hostname}:8000/api/ws/draw/`,
    );

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.down) {
        drawCircle(context, data.position.x, data.position.y);
      }
    };

    const interval = setInterval(() => {
      if (ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(
          JSON.stringify({
            down: mouseDown.current,
            position: mousePosition.current,
          }),
        );
      }
    }, 10);

    return () => {
      clearInterval(interval);
      if (ws.current) ws.current.close();
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mouseup", handleMouseUp);

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return <canvas ref={canvasRef} {...props} />;
};

export default CanvasComponent;
