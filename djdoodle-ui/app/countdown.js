"use client";
import React from "react";
import styles from "./countdown.module.css";

const CountdownDisplay = ({ countdown }) => {
  return <div className={styles.countdown}>{countdown}</div>;
};

export default CountdownDisplay;
