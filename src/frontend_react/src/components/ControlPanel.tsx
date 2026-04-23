
import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

type Mode = 'day' | 'hour' | 'minute';
type PresetID = typeof TIME_PRESETS[number]['id'] | 'custom';

const TIME_PRESETS = [
  { id: '1h', label: 'Última Hora', ms: 60 * 60 * 1000 },
  { id: '24h', label: '24 Horas', ms: 24 * 60 * 60 * 1000 },
  { id: '7d', label: '7 Días', ms: 7 * 24 * 60 * 60 * 1000 } // Usaremos lógica especial para este
] as const;
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
  // onFetch,
  urlPreview
}) => {

  const [activePreset, setActivePreset] = useState<PresetID>('7d');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getBtnStyles = (isActive: boolean, color: 'cyan' | 'amber' | 'purple') => {
    const base = "px-4 py-2 rounded-lg font-rajdhani text-[0.85rem] transition-all border uppercase tracking-wider font-bold";
    const inactive = "bg-transparent text-[#c8d8f073] border-border hover:border-[#c8d8f0]";

    const activeVariants = {
      cyan: "bg-blue-neon text-black border-blue-neon shadow-[0_0_12px_rgba(0,212,255,0.45)]",
      amber: "bg-[#ff9d00] text-black border-[#ff9d00] shadow-[0_0_12px_rgba(255,157,0,0.45)]",
      purple: "bg-[#bf00ff] text-white border-[#bf00ff] shadow-[0_0_12px_rgba(191,0,255,0.45)]"
    };

    return `${base} ${isActive ? activeVariants[color] : inactive}`;
  };

  useEffect(() => {
    if (activePreset === '1h' && mode === 'day') {
      setMode('hour');
    }
  }, [mode, setMode, activePreset]);

  const handlePresetClick = (preset: typeof TIME_PRESETS[number]) => {
    // Si ya está seleccionado, ignoramos el click
    if (activePreset === preset.id) return;

    const now = new Date();
    const localTo = now.toLocaleDateString('en-CA');
    const localTimeTo = now.toTimeString().slice(0, 5);

    setDateTo(localTo);
    setTimeTo(localTimeTo);

    if (preset.id === '7d') {
      // Lógica robusta para Epic (Día 8 UTC -> Día 1 UTC)
      const fromDate = new Date(now.getTime());
      fromDate.setUTCDate(now.getUTCDate() - 7);
      setDateFrom(fromDate.toISOString().slice(0, 10));
      setTimeFrom('00:01');
    } else {
      const fromDate = new Date(now.getTime() - preset.ms);
      setDateFrom(fromDate.toLocaleDateString('en-CA'));
      setTimeFrom(fromDate.toTimeString().slice(0, 5));
    }

    setActivePreset(preset.id);
  };

  return (
    <section className="bg-card border border-border wrap rounded-2xl p-6 flex flex-col gap-6">
      <div className="flex flex-wrap items-end gap-10">

        {/* GRUPO 1: RANGO TEMPORAL (Color Ámbar - "Caliente") */}
        <div className="flex flex-col gap-2">
          <label className="text-[0.65rem] tracking-[2px] text-[#c8d8f073] uppercase font-orbitron">
            Rango Temporal
          </label>
          <div className="flex gap-2">
            {TIME_PRESETS.map((preset) => (
              <button
                key={preset.id}
                className={getBtnStyles(activePreset === preset.id, 'amber')}
                onClick={() => handlePresetClick(preset)}
              >
                {preset.label}
              </button>
            ))}
            <button
              className={getBtnStyles(activePreset === 'custom', 'purple')}
              onClick={() => { setIsModalOpen(true); setActivePreset('custom'); }}
            >
              📅 Custom
            </button>
          </div>
        </div>

        {/* Separador Vertical sutil */}
        <div className="h-10 w-[1px] bg-border/40 hidden md:block"></div>

        {/* GRUPO 2: CUANTIZACIÓN (Color Cian - "Frío") */}
        <div className="flex flex-col gap-2">
          <label className="text-[0.65rem] tracking-[2px] text-[#c8d8f073] uppercase font-orbitron">
            Cuantización
          </label>
          <div className="flex gap-2">
            {(['day', 'hour', 'minute'] as const).map(m => (
              <button
                key={m}
                className={getBtnStyles(mode === m, 'cyan')}
                onClick={() => setMode(m)}
              >
                {m === 'day' ? 'Día' : m === 'hour' ? 'Hora' : 'Min'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* URL Preview */}
      <div className="text-[0.65rem] text-blue-neon/40 tracking-[1px] break-all p-3 bg-black/40 border border-white/5 rounded-lg font-mono">
        <span className="opacity-50 select-none">QUERY_STRING:</span> {urlPreview}
      </div>

      {/* Modal para Custom Range */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Contenedor del Modal */}
          <div className="relative bg-[#0b0f1a] border border-border w-full max-w-md rounded-2xl p-8 pt-10 shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in duration-200">

            {/* Botón de cerrar (X) en la esquina */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-[#c8d8f044] hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
              title="Cerrar"
            >
              <X size={18} />
            </button>

            {/* Decoración superior */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-gradient-to-r from-transparent via-[#bf00ff] to-transparent shadow-[0_0_10px_#bf00ff]" />

            <h3 className="font-orbitron text-[0.75rem] tracking-[4px] text-white mb-10 uppercase text-center flex items-center justify-center gap-3">
              <span className="text-[#bf00ff] animate-pulse text-lg">⌬</span> Configuración en Vivo
            </h3>

            <div className="space-y-8">
              {/* Bloque DESDE */}
              <div className="flex flex-col gap-3 group">
                <label className="text-[0.6rem] text-[#c8d8f073] uppercase font-orbitron tracking-widest group-focus-within:text-[#bf00ff] transition-colors">
                  Punto de Inicio (From)
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={e => {
                      setDateFrom(e.target.value);
                      setActivePreset('custom'); // Marcamos como custom al tocar
                    }}
                    className="flex-1 bg-black/40 border border-border/60 p-3 rounded-xl text-white font-rajdhani outline-none focus:border-[#bf00ff] transition-all hover:bg-black/60"
                  />
                  <input
                    type="time"
                    value={timeFrom}
                    onChange={e => {
                      setTimeFrom(e.target.value);
                      setActivePreset('custom');
                    }}
                    className="w-28 bg-black/40 border border-border/60 p-3 rounded-xl text-white font-rajdhani outline-none focus:border-[#bf00ff] transition-all hover:bg-black/60"
                  />
                </div>
              </div>

              {/* Separador decorativo */}
              <div className="flex justify-center -my-4 opacity-30 select-none">
                <div className="h-6 w-px bg-linear-to-b from-[#bf00ff] to-transparent" />
              </div>

              {/* Bloque HASTA */}
              <div className="flex flex-col gap-3 group">
                <label className="text-[0.6rem] text-[#c8d8f073] uppercase font-orbitron tracking-widest group-focus-within:text-[#bf00ff] transition-colors">
                  Punto Final (To)
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={dateTo}
                    onChange={e => {
                      setDateTo(e.target.value);
                      setActivePreset('custom');
                    }}
                    className="flex-1 bg-black/40 border border-border/60 p-3 rounded-xl text-white font-rajdhani outline-none focus:border-[#bf00ff] transition-all hover:bg-black/60"
                  />
                  <input
                    type="time"
                    value={timeTo}
                    onChange={e => {
                      setTimeTo(e.target.value);
                      setActivePreset('custom');
                    }}
                    className="w-28 bg-black/40 border border-border/60 p-3 rounded-xl text-white font-rajdhani outline-none focus:border-[#bf00ff] transition-all hover:bg-black/60"
                  />
                </div>
              </div>
            </div>

            {/* Texto informativo pie de modal */}
            <p className="mt-8 text-center text-[0.6rem] text-[#c8d8f033] font-rajdhani uppercase tracking-[2px]">
              Los datos se actualizarán automáticamente
            </p>

          </div>
        </div>
      )}
    </section>
  );

};

export default ControlPanel;