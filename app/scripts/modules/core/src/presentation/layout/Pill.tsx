import React from 'react';
import styles from './Pill.module.css';

export function Pill({ text, bgColor = '#666666', textColor = '#ffffff' }) {
  return (
    <div className={styles.Pill} style={{ backgroundColor: bgColor, color: textColor }}>
      {text}
    </div>
  );
}
