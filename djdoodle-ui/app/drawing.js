"use client";
import React, { useState, useEffect, useRef } from "react";
import CanvasComponent from "./canvas";
import CountdownDisplay from "./countdown";
import ColorPicker from "./picker";
import Prompt from "./prompt";
import styles from "./drawing.module.css";

const startCountdown = 30;

const DrawingApp = () => {
  const [drawData, setDrawData] = useState([]);
  const [isPromptVisible, setIsPromptVisible] = useState(false);
  const [countdown, setCountdown] = useState(startCountdown);
  const [prompts, setPrompts] = useState([]);
  const [promptMessage, setPromptMessage] = useState("");
  const [color, setColor] = useState("#00ff00");
  const ws = useRef(null);

  useEffect(() => {
    if (countdown == 30 && prompts.length) {
      setPromptMessage(prompts.shift());
      setIsPromptVisible(true);
    }
  }, [prompts, countdown]);

  useEffect(() => {
    if (!ws.current) {
      ws.current = new WebSocket(
        `ws://${window.location.hostname}:8000/api/ws/draw/`,
      );

      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === "prompts") {
          setPrompts(data.prompts);
        } else if (data.type === "countdown") {
          setCountdown(data.countdown);
        } else {
          setDrawData((prevDrawData) => [...prevDrawData, data]);
        }
      };
    }

    return () => {
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
    };
  }, []);

  const handleMouseEvent = (eventType, position) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(position));
    }
  };

  return (
    <div>
      <CanvasComponent
        drawData={drawData}
        color={color}
        onMouseEvent={handleMouseEvent}
      />
      <div className={styles.picker}>
        <ColorPicker
          color={color}
          onColorChange={(newColor) => setColor(newColor)}
        />
      </div>
      <div className={styles.countdown}>
        <CountdownDisplay countdown={countdown} />
      </div>
      <div className={styles.prompt}>
        <Prompt
          message={promptMessage}
          isVisible={isPromptVisible}
          onDismiss={() => setIsPromptVisible(false)}
        />
      </div>
    </div>
  );
};

export default DrawingApp;
