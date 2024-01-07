import React, { useState } from "react";
import styles from "./prompt.module.css";

const Prompt = ({ message, isVisible, onDismiss }) => {
  if (!isVisible) return null;

  return (
    <div className={styles.prompt}>
      <p>{message}</p>
      <button onClick={onDismiss}>OK</button>
    </div>
  );
};

export default Prompt;
