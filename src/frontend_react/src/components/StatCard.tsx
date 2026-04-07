import React from 'react';

interface StatCardProps {
  value: string | number;
  label: string;
  icon: string;
  note: string;
  colorClass: string; // e.g., 'c-blue'
}

const StatCard: React.FC<StatCardProps> = ({ value, label, icon, note, colorClass }) => (
  <div className={`kpi ${colorClass}`}>
    <div className="text-[1.6rem] mb-2">{icon}</div>
    <div className="font-orbitron text-[1.45rem] font-bold text-white line-height-1">{value}</div>
    <div className="text-[0.7rem] tracking-[2px] text-[#c8d8f06b] uppercase mt-1">{label}</div>
    <div className="text-[0.72rem] text-[#c8d8f045] mt-0.75">{note}</div>
  </div>
);

export default StatCard;