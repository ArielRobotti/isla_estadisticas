import React from 'react';

type Mode = 'day' | 'hour' | 'minute' ;

interface ControlPanelProps {
  mode: Mode;
  setMode: (val: Mode) => void;
  dateFrom: string;
  setDateFrom: (val: string) => void;
  timeFrom: string;
  setTimeFrom: (val: string) => void;
  dateTo: string;
  setDateTo: (val: string) => void;
  timeTo: string;
  setTimeTo: (val: string) => void;
  onFetch: () => void;
  loading: boolean;
  urlPreview: string;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  mode, setMode,
  dateFrom, setDateFrom,
  timeFrom, setTimeFrom,
  dateTo, setDateTo,
  timeTo, setTimeTo,
  urlPreview
}) => {
  return (
    <section className="bg-card border border-border rounded-2xl p-5 mt-7 flex flex-col gap-[14px]">
      {/* Row 1: Island Code
      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-[220px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base z-1">🗺️</span>
          <input 
            type="text" 
            className="w-full bg-[#050810cc] border border-border rounded-lg py-[11px] pl-10 pr-3 text-white font-rajdhani text-[0.93rem] tracking-wide outline-none transition-all focus:border-blue-neon focus:shadow-glow-blue"
            placeholder="Código de isla: XXXX-XXXX-XXXX"
            value={islandCode}
            onChange={(e) => setIslandCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onFetch()}
          />
        </div>
      </div> */}

      {/* Row 2: Modes and Time Range */}
      <div className="flex gap-4 flex-wrap items-center">
        {/* Mode Selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[0.65rem] tracking-[2px] text-[#c8d8f073] uppercase font-orbitron">Período de Cuantización</label>
          <div className="flex gap-4">
            {(['day', 'hour', 'minute'] as const).map(m => (
              <button 
                key={m}
                className={`w-25 mode-tab ${mode === m ? 'active' : ''}`}
                onClick={() => setMode(m)}
              >
                {m === 'day' ? 'Día' : m === 'hour' ? 'Hora' :  'Min' }
              </button>
            ))}
          </div>
        </div>

        {/* Time Range Selectors (Hidden only for lifetime) */}

            <div className="flex flex-col gap-1.5">
              <label className="text-[0.65rem] tracking-[2px] text-[#c8d8f073] uppercase font-orbitron">Desde</label>
              <div className="flex gap-2 items-center">
                <input 
                  type="date" 
                  className="bg-[#050810cc] border border-border rounded-lg p-2.5 text-white font-rajdhani text-[0.85rem] outline-none cursor-pointer focus:border-blue-neon" 
                  value={dateFrom} 
                  onChange={(e) => setDateFrom(e.target.value)} 
                />
                <input 
                  type="time" 
                  className="bg-[#050810cc] border border-border rounded-lg p-2.5 text-white font-rajdhani text-[0.85rem] outline-none cursor-pointer focus:border-blue-neon" 
                  value={timeFrom} 
                  onChange={(e) => setTimeFrom(e.target.value)} 
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[0.65rem] tracking-[2px] text-[#c8d8f073] uppercase font-orbitron">Hasta</label>
              <div className="flex gap-2 items-center">
                <input 
                  type="date" 
                  className="bg-[#050810cc] border border-border rounded-lg p-2.5 text-white font-rajdhani text-[0.85rem] outline-none cursor-pointer focus:border-blue-neon" 
                  value={dateTo} 
                  onChange={(e) => setDateTo(e.target.value)} 
                />
                <input 
                  type="time" 
                  className="bg-[#050810cc] border border-border rounded-lg p-2.5 text-white font-rajdhani text-[0.85rem] outline-none cursor-pointer focus:border-blue-neon" 
                  value={timeTo} 
                  onChange={(e) => setTimeTo(e.target.value)} 
                />
              </div>
            </div>

        {/* <div className="ml-auto self-end pb-0.5">
          <button 
            className="go-btn px-10 py-3" 
            onClick={onFetch} 
            disabled={loading}
          >
            {loading ? 'Cargando...' : 'Analizar →'}
          </button>
        </div> */}
      </div>

      {/* URL preview (debug) */}
      <div className="text-[0.65rem] text-[#00d4ff44] tracking-[0.5px] break-all p-2 bg-[#00d4ff05] border border-[#00d4ff0a] rounded-md font-mono mt-1">
        {urlPreview}
      </div>
    </section>
  );
};

export default ControlPanel;