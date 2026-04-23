import React from 'react';
import StatCard from './StatCard';
import { fmt, fmtMin } from '../utils/formatters';

interface KpiGridProps {
  totalUnique: number | null;
  totalPlays: number | null;
  totalMins: number | null;
  avgMin: number | null;
  maxCcu: number | null;
  totalFavs: number | null;
  totalRecs: number | null;
  d1: number | null;
  d7: number | null;
}

const KpiGrid: React.FC<KpiGridProps> = ({
  totalUnique, totalPlays, totalMins, avgMin, maxCcu, totalFavs, totalRecs
}) => {
  return (
    <section className="wrap grid grid-cols-[repeat(auto-fit,minmax(148px,1fr))] gap-3 mt-5">
      <StatCard value={fmt(totalUnique)} label="Jugadores Únicos" icon="👥" note="Total período" colorClass="c-blue" />
      <StatCard value={fmt(totalPlays)} label="Partidas Jugadas" icon="🎮" note="Total período" colorClass="c-gold" />
      <StatCard value={fmt(totalMins) + 'm'} label="Minutos Jugados" icon="🕐" note="Total período" colorClass="c-green" />
      <StatCard value={fmtMin(avgMin)} label="Sesión Promedio" icon="⏱️" note="Promedio período" colorClass="c-purple" />
      <StatCard value={fmt(maxCcu)} label="Peak CCU" icon="⚡" note="Máx simultáneos" colorClass="c-green" />
      <StatCard value={fmt(totalFavs)} label="Favoritos" icon="❤️" note="Total período" colorClass="c-pink" />
      <StatCard value={fmt(totalRecs)} label="Recomendaciones" icon="👍" note="Total período" colorClass="c-orange" />
      {/* <StatCard value={fmtPct(d1)} label="Retención D1" icon="📈" note="Último dato" colorClass="c-blue" />
      <StatCard value={fmtPct(d7)} label="Retención D7" icon="🔁" note="Último dato" colorClass="c-purple" /> */}
    </section>
  );
};

export default KpiGrid;