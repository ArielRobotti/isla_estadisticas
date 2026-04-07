import React, { useEffect, useState } from 'react';

interface RetentionCircleProps {
  label: string;
  subLabel: string;
  value: number | null;
  colorClass: 'd1' | 'd7';
}

const CIRC = 289;

const RetentionCircle: React.FC<RetentionCircleProps> = ({ label, subLabel, value, colorClass }) => {
  const [offset, setOffset] = useState(CIRC);

  useEffect(() => {
    if (value != null) {
      const p = value <= 1 ? value * 100 : value;
      const targetOffset = CIRC - (p / 100) * CIRC;
      const timer = setTimeout(() => setOffset(targetOffset), 120);
      return () => clearTimeout(timer);
    } else {
      setOffset(CIRC);
    }
  }, [value]);

  const displayValue = value != null ? (value <= 1 ? (value * 100).toFixed(1) : value.toFixed(1)) + '%' : '—';

  return (
    <div className="ri">
      <div className="ri-lbl">{label}</div>
      <div className="rc">
        <svg viewBox="0 0 110 110" width="110" height="110">
          <circle className="rc-bg" cx="55" cy="55" r="46"/>
          <circle 
            className={`rc-fill ${colorClass}`} 
            cx="55" cy="55" r="46"
            strokeDasharray={CIRC} 
            strokeDashoffset={offset}
          />
        </svg>
        <div className="rc-center">
          <div className="rc-val">{displayValue}</div>
          <div className="rc-sub">{subLabel}</div>
        </div>
      </div>
    </div>
  );
};

export default RetentionCircle;