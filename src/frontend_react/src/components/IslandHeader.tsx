import React from 'react';

interface IslandHeaderProps {
  islandCode: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: any;
  mode: string;
  dateFrom: string;
  dateTo: string;
  maxCcu: number | null;
  fmt: (n: number | null | undefined) => string;
}

const IslandHeader: React.FC<IslandHeaderProps> = ({
  islandCode, metadata, mode, dateFrom, dateTo, maxCcu, fmt
}) => {
  return (
    <section className="island-hdr grid grid-cols-[auto_1fr_auto] gap-6 items-center bg-card border border-border rounded-2xl p-[26px] mt-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-neon via-gold via-blue-neon to-transparent"></div>
      <div className="w-[110px] h-[80px] rounded-xl bg-gradient-to-br from-[#0A1628] to-[#0F2040] border-2 border-[rgba(0,212,255,0.3)] flex items-center justify-center text-[36px]">🗺️</div>
      <div>
        <div className="font-orbitron text-[1.3rem] font-bold text-white tracking-[2px]">Código de isla · {islandCode}</div>
        <div className="font-orbitron text-[1.3rem] font-bold text-white tracking-[2px]">Nombre de isla · {metadata.title}</div>
        {/* <div className="font-orbitron text-[0.75rem] text-[#c8d8f052] tracking-[3px] mt-[4px]">{islandCode}</div> */}
        <div className="inline-flex items-center gap-[6px] bg-[rgba(0,212,255,0.08)] border border-[rgba(0,212,255,0.18)] rounded-[20px] px-3 py-[3px] text-[0.73rem] tracking-wide text-blue-neon mt-[10px]">
          📅 {mode === 'lifetime' ? 'LIFETIME' : `${dateFrom} → ${dateTo} · ${mode.toUpperCase()}`}
        </div>
      </div>
      <div className="flex flex-col items-center gap-[6px] text-center">
        <div className="live-dot"></div>
        <div className="font-orbitron text-[2rem] font-bold text-[#4ECDC4]">{fmt(maxCcu)}</div>
        <div className="text-[0.68rem] tracking-[2px] text-[#c8d8f066]">PEAK CCU</div>
      </div>
    </section>
  );
};

export default IslandHeader;